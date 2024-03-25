import fs from "fs/promises";
import {
	QueryOptions,
	QueryTypes,
	Sequelize,
	Transaction
} from "sequelize";
import { IDbMigrate, Migrate } from "./migrate";
import { MigrateCLI } from "./migrate-cli";
import { EMigrationProperties, IQueryOptions, createMigrationTableQuery } from "./types";
import { terminal } from "terminal-kit";
import { NoValue } from "types";

interface IMigrateStoreProps {
	parent: MigrateCLI;
	schema: string;
}

interface INewMigrateProps {
	description: string;
	isBackup?: boolean;
	name?: string;
}

export class MigrateStore {
	private _migrates: Migrate[] = [];
	private _parent: MigrateCLI;
	private _schema: string;

	constructor(props: IMigrateStoreProps) {
		this._parent = props.parent;
		this._schema = props.schema;
	}

	/** Type guards */
	/**
	 * @returns Return true if the instance of the class uses local schema
	 */
	public isLocal(): boolean {
		return this._schema === this._parent.schemas.local;
	};

	/**
	 * @returns Return true if the instance of the class uses development schema
	 */
	public isDevelopment(): boolean {
		return this._schema === this._parent.schemas.development;
	};

	/**
	 * @returns Return true if the instance of the class uses test schema
	 */
	public isTest(): boolean {
		return this._schema === this._parent.schemas.test;
	};

	/**
	 * @returns Return true if the instance of the class uses production schema
	 */
	public isProduction(): boolean {
		return this._schema === this._parent.schemas.production;
	};

	/** Getters */
	public get migrates(): Migrate[] {
		return this._migrates;
	}

	/** Private methods */
	/**
	 * Execute a query on the database and modify the result with the rowCallback function.
	 *
	 * @param {Sequelize} db Instance of the Sequelize database
	 * @param {string} query Query to execute
	 * @param {IQueryOptions} options Query options
	 * @returns {Promise<T[]>} The result of the query as an array of T objects.
	 */
	private selectDb = async <T extends object>(
		db: Sequelize,
		query: string,
		options: IQueryOptions<T>
	): Promise<T[]> => {
		const result: T[] = await db.query<T>(query, {
			...options as QueryOptions,
			raw: true,
			type: QueryTypes.SELECT,
		});
		return result.map((row, index) => {
			if (options.rowCallback) {
				return options.rowCallback(row, index);
			}
			return row;
		});
	};

	/**
	 * Create the migration table in the database if it does not exist.
	 */
	private createMigrateTable = async (): Promise<void> => {
		await this._parent.db.query(createMigrationTableQuery(this._schema));
	};

	/**
	 * Read the remote migrates from the database.
	 */
	private readRemoteMigrates = async (): Promise<void> => {
		try {
			const migrates = await this.selectDb<IDbMigrate>(
				this._parent.db,
				`SELECT * FROM "migrates".migrations_${this._schema}`,
				{
					type: QueryTypes.SELECT,
					rowCallback: (row: IDbMigrate) => {
						row.file_name = Number(row.file_name);
						row.properties = Number(row.properties);
						return row;
					},
				}
			);
			this._migrates = migrates.map((migrate) => new Migrate({ parent: this._parent, migrate }));
		} catch (error) {
			throw new Error(`Error reading remote migrates:\n${(error as Error).message}`);
		}
	};

	/**
	 * Read the local migrates from the file system or the database based on the schema.
	 */
	private readLocalMigrates = async (): Promise<void> => {
		const files = await fs.readdir(`${this._parent.path}/up`);
		for (const file of files) {
			if (file.endsWith(".sql")) {
				// Push if not exists by name
				const name = Number(file.split(".")[0]);
				if (!this._migrates.find((migrate) => migrate.fileName === name)) {
					this._migrates.push(
						new Migrate({
							parent: this._parent,
							fileName: name,
						})
					);
				}
			}
		}
	};

	/**
	 * Sort the migrates by file name.
	 * @param {"asc" | "desc"} direction The direction to sort the migrates. Default is "asc".
	 */
	private sortMigrates = (direction: "asc" | "desc" = "asc"): void => {
		if (direction === "asc") {
			this._migrates.sort((a, b) => {
				// If id is -1 then use the file name
				if (a.id === NoValue || b.id === NoValue) {
					return a.fileName - b.fileName;
				}
				return a.id - b.id;
			});
		} else {
			this._migrates.sort((a, b) => {
				// If id is NoValue then use the file name
				if (a.id === NoValue || b.id === NoValue) {
					return b.fileName - a.fileName;
				}
				return b.id - a.id;
			});
		}
	};

	/**
	 * Sync the fs migrations between the local (fs) and the remote database if needed.
	 * @param {Migrate | undefined} from The migration to start syncing from
	 * @param {Migrate} to The migration to sync to
	 */
	private syncLocal = async (from: Migrate | undefined, to: Migrate): Promise<void> => {
		const fromIndex = this._migrates.findIndex((m) => m === from);
		// Rollback the database to the last local migration
		const migratesToRollback = fromIndex !== -1
			? this._migrates.slice(fromIndex)
			: this._migrates;
		if (!from) {
			// If there is no local migration save migrates to fs
			for (const migrate of migratesToRollback) {
				if (migrate.isDbMigrate()) {
					await migrate.saveToFile();
				}
			}
		} else {
			const t = await this._parent.db.transaction({
				isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
			});
			try {
				for (const migrate of migratesToRollback) {
					if (migrate.isDbMigrate()) {
						await migrate.rollback(
							t,
							this._schema,
							EMigrationProperties.SYNC
						);
					}
				}
				// Then commit the missing and the rollbacked migrations
				for (const migrate of migratesToRollback) {
					if (migrate.fileName <= to.fileName) {
						await migrate.commit(
							t,
							this._schema,
							EMigrationProperties.SYNC
						);
					}
				}
				if (this._parent.isInDebugMode) {
					await t.rollback();
				} else {
					await t.commit();
				}
			} catch (error) {
				await t.rollback();
				throw new Error(`Error syncing local migrations:\n${(error as Error).message}`);
			}
		}
	};

	/**
	 * Sync the missing migrations between this store and the source store.
	 * @param {MigrateStore} source The source store
	 * @returns {Promise<boolean>} Return true if the sync was successful
	 */
	private syncRemote = async (source: MigrateStore): Promise<boolean> => {
		const sourceState = source.getCurrentState();
		const sourceMigrations = [...sourceState.migrated];
		const sourceLastMigrated = sourceMigrations.length > 0
			? sourceMigrations[sourceMigrations.length - 1]
			: undefined;
		const targetState = this.getCurrentState();
		const targetMigrations = [...targetState.migrated];
		// Find missing migrations in the target that are in the source and behind the last migration in the target
		const targetLastMigrated = targetMigrations.length > 0
			? targetMigrations[targetMigrations.length - 1]
			: undefined;
		const missingMigrations = sourceMigrations.filter(
			(m) => (// Not exists in target
				!targetMigrations.find(
					(tm) => tm.fileName === m.fileName &&
					// Behind the last migration in the source
					targetLastMigrated ? tm.fileName < targetLastMigrated.fileName : true
				)
			)
		);

		if (targetMigrations.length > missingMigrations.length) {
			// Warn the user about the possible data loss
			terminal.clear();
			terminal.yellow(`There are missing migrations in the ${this._schema} schema.\n`);
			terminal.yellow(
				"The sync process will rollback the database to the last synced migration. This can cause data loss!\n"
			);
			const confirm = await this._parent.menuHandler.yesOrNo("Do you want to sync them?");
			if (!confirm) {
				return false;
			}

			// If there are missing migrations we have to sync them
			const t = await this._parent.db.transaction({
				isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
			});
			try {
				// First we have to find the last migration where the target and the source are in sync
				let lastSyncedMigrationIndex = -1;
				if (sourceLastMigrated) {
					for (let i = 0; i < targetMigrations.length; i++) {
						if (targetMigrations[i].fileName === sourceLastMigrated.fileName) {
							lastSyncedMigrationIndex = i;
						}
					}
				}
				// Then we have to rollback the target to the last synced migration or to the initial state
				const migratesToRollback = [...targetMigrations.slice(lastSyncedMigrationIndex + 1)].reverse();
				for (const migrate of migratesToRollback) {
					if (migrate.isDbMigrate()) {
						terminal.white(`⏳ Syncing down: ${migrate.name || migrate.fileName}`);
						await migrate.rollback(
							t,
							this._schema,
							EMigrationProperties.SYNC
						);
						terminal.eraseLine().column(0);
						terminal.white(`✅ Synced down: ${migrate.name || migrate.fileName}\n`);
					}
				}
				// We have to exec the missing migrations and the rollbacked migrations in order
				const migratesToExec = missingMigrations;
				migratesToExec.sort((a, b) => a.fileName - b.fileName);
				for (const migrate of migratesToExec) {
					if (migrate.isDbMigrate()) {
						terminal.white(`⏳ Syncing up: ${migrate.name || migrate.fileName}`);
						await migrate.commit(
							t,
							this._schema,
							EMigrationProperties.SYNC
						);
						terminal.eraseLine().column(0);
						terminal.white(`✅ Synced up: ${migrate.name || migrate.fileName}\n`);
					}
				}
				if (this._parent.isInDebugMode) {
					await t.rollback();
				} else {
					await t.commit();
				}
				// Then refresh the migrates
				terminal.white("⏳ Refreshing remote migrations...");
				await this.readRemoteMigrates();
				terminal.eraseLine().column(0);
				terminal.white("✅ Remote migrations refreshed\n");
				if (this.isLocal()) {
					terminal.white("⏳ Refreshing local migrations...\n");
					await this.readLocalMigrates();
					terminal.eraseLine().column(0);
					terminal.white("✅ Local migrations refreshed\n");
				}
			} catch (error) {
				await t.rollback();
				throw new Error(`Error syncing remote migrations:\n${(error as Error).message}`);
			}
		}
		return true;
	};

	/** Public methods */
	/**
	 * Initialize the migration store.
	 */
	public init = async (): Promise<void> => {
		await this.createMigrateTable();
		await this.readRemoteMigrates();
		if (this.isLocal()) {
			await this.readLocalMigrates();
		}
		this.sortMigrates();
	};

	/**
	 * Check and sync the migrations if needed.
	 */
	public checkLocalAndSyncMigrations = async (): Promise<void> => {
		if (this._migrates.length > 0) {
			let lastDbMigrationIndex = -1;
			for (let i = 0; i < this._migrates.length; i++) {
				if (this._migrates[i].isDbMigrate()) {
					lastDbMigrationIndex = i;
				}
			}
			if (lastDbMigrationIndex !== -1) {
				const lastDbMigration = this._migrates[lastDbMigrationIndex];
				const firstLocalMigration = this._migrates.find((m) => !m.isDbMigrate());
				if (firstLocalMigration) {
					if (lastDbMigration.fileName > firstLocalMigration.fileName) {
						// There is a question about rolling back the database to the last local migration
						terminal.clear();
						terminal.yellow("There are local migrations that are not in the database.\n");
						const confirmSync = await this._parent.menuHandler.yesOrNo(
							"Do you want to sync the database with the local migrations?"
						);
						if (confirmSync) {
							await this.syncLocal(firstLocalMigration, lastDbMigration);
						} else {
							throw new Error("The local migrations are not in sync with the database.");
						}
					}
				} else {
					// We have to check if the database migrations are in sync with the local migrations
					let thereIsMissingMigrate = false;
					for (let i = 0; i < this._migrates.length; i++) {
						if (!this._migrates[i].isExistsInFs()) {
							thereIsMissingMigrate = true;
							break;
						}
					}
					if (thereIsMissingMigrate) {
						terminal.clear();
						terminal.yellow("There are no local migrations.\n");
						const confirmSync = await this._parent.menuHandler.yesOrNo(
							"Do you want to pull down migrations from database?"
						);
						if (confirmSync) {
							await this.syncLocal(firstLocalMigration, lastDbMigration);
						} else {
							throw new Error("The local migrations are not in sync with the database.");
						}
					}
				}
			}
		}
	};

	/**
	 * Create a new migration. Only available for the local schema.
	 * @param {INewMigrateProps} props The properties of the new migration
	 */
	public newMigrate = async ({ name, description, isBackup }: INewMigrateProps): Promise<void> => {
		const newMigrate = new Migrate({
			parent: this._parent,
			name: !isBackup ? name : undefined,
			description,
			isBackup,
		});
		this._migrates.push(newMigrate);
	};

	/**
	 * The method to get the migrates from the store separated to groups.
	 * One group is for the migrates that are already in the database and
	 * the other group is for the migrates that are not in the database.
	 * One migrate can't be in both groups, so the method will only return
	 * the migrates' last state.
	 */
	public getCurrentState = (): { migrated: Migrate[]; pending: Migrate[] } => {
		const result = {
			migrated: [] as Migrate[],
			pending: [] as Migrate[],
		};

		// Create a map of the migrates by the file name
		const migratesMap = new Map<number, Migrate>();
		for (const migrate of this._migrates) {
			migratesMap.set(migrate.fileName, migrate);
		}

		// Check the last state of the migrates and push them to the result
		for (const migrate of this._migrates) {
			const lastMigrate = migratesMap.get(migrate.fileName);
			if (lastMigrate) {
				// Migrate with properties contains UP state mean that the migrate is already in the database
				if (
					(lastMigrate.properties & EMigrationProperties.UP) === EMigrationProperties.UP
				) {
					result.migrated.push(lastMigrate);
				} else {
					result.pending.push(lastMigrate);
				}
				migratesMap.delete(migrate.fileName);
			}
		}

		// Set migrates in the result order by file name
		result.migrated.sort((a, b) => a.fileName - b.fileName);
		result.pending.sort((a, b) => a.fileName - b.fileName);

		return result;
	};

	/**
	 * Migrate up from current state to target
	 * @param {Migrate} target The target migration
	 */
	public migrateUp = async (target: Migrate): Promise<void> => {
		terminal.clear();
		terminal.white(`Running migrations on ${this._schema} schema...\n`);
		const currentState = this.getCurrentState();
		const migratesToExec = currentState.pending.filter(
			(m) => m.fileName <= target.fileName
		);
		const t = await this._parent.db.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
		});

		try {
			for (const migrate of migratesToExec) {
				terminal.white(`⏳ Migrating up: ${migrate.name || migrate.fileName}`);
				await migrate.commit(
					t,
					this._schema,
					EMigrationProperties.MIGRATE
				);
				terminal.eraseLine().column(0);
				terminal.white(`✅ Migrated up: ${migrate.name || migrate.fileName}\n`);
			}
			if (this._parent.isInDebugMode) {
				await t.rollback();
			} else {
				await t.commit();
			}
		} catch (error) {
			await t.rollback();
			throw new Error(`Error migrating up:\n${(error as Error).message}`);
		}
		this.readRemoteMigrates();
		if (this.isLocal()) {
			this.readLocalMigrates();
		}
		terminal.green("Migrations successful.\n\n");
	};

	/**
	 * Migrate down from current state to target. If target is not provided, rollback to the initial state.
	 * @param {Migrate | undefined} target The target migration to rollback
	 */
	public migrateDown = async (target?: Migrate): Promise<void> => {
		terminal.clear();
		terminal.white(`Running migrations on ${this._schema} schema...\n`);
		const currentState = this.getCurrentState();
		const currentMigrates = [...currentState.migrated].reverse();
		const migratesToRollback = target
			? currentMigrates.filter((m) => m.fileName > target.fileName)
			: currentMigrates;

		const t = await this._parent.db.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
		});
		try {
			for (const migrate of migratesToRollback) {
				terminal.white(`⏳ Migrating down: ${migrate.name || migrate.fileName}`);
				await migrate.rollback(
					t,
					this._schema,
					EMigrationProperties.MIGRATE
				);
				terminal.eraseLine().column(0);
				terminal.white(`✅ Migrated down: ${migrate.name || migrate.fileName}\n`);
			}
			if (this._parent.isInDebugMode) {
				await t.rollback();
			} else {
				await t.commit();
			}
		} catch (error) {
			await t.rollback();
			throw new Error(`Error migrating down:\n${(error as Error).message}`);
		}
		this.readRemoteMigrates();
		if (this.isLocal()) {
			this.readLocalMigrates();
		}
		terminal.green("Migrations successful.\n\n");
	};

	/**
	 * Merge the migrations from a source store to this store.
	 * This method is used to push or pull migrations between schemas.
	 * @param {MigrateStore} source The source store
	 */
	public mergeMigrates = async (source: MigrateStore): Promise<boolean> => {
		terminal.clear();
		terminal.white(`Merging migrations from ${source._schema} to ${this._schema} schema...\n`);
		// First of all we have to check which Store is behind the other
		const sourceCurrentState = source.getCurrentState();
		const sourceLastMigrated = sourceCurrentState.migrated.length > 0
			? sourceCurrentState.migrated[sourceCurrentState.migrated.length - 1]
			: undefined;
		const targetCurrentState = this.getCurrentState();
		const targetLastMigrated = targetCurrentState.migrated.length > 0
			? targetCurrentState.migrated[targetCurrentState.migrated.length - 1]
			: undefined;
		// There are a few cases
		if (sourceLastMigrated && targetLastMigrated && sourceLastMigrated.id === targetLastMigrated.id) {
			// 1. Both are in the same state
			terminal.yellow("The schemas are in sync.\n\n");
			return false;
		} else if (
			(sourceLastMigrated && targetLastMigrated && sourceLastMigrated.id > targetLastMigrated.id) ||
			(sourceLastMigrated && !targetLastMigrated)
		) {
			terminal.white("The source is ahead of the target\n");
			// 2.1. The source is ahead of the target
			// We will migrate up the target (this) to the last migration of the source
			const synced = await this.syncRemote(source);
			if (!synced) {
				terminal.yellow("Merge canceled.\n\n");
				return false;
			}
			// 2.2. Then we have to migrate up the target to the last migration of the source
			// Find the migrations in source that are not in target and that are behind the last migration in the source
			const currentStateAfterSync = this.getCurrentState();
			const t = await this._parent.db.transaction({
				isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
			});
			const missingMigrations = sourceCurrentState.migrated.filter(
				(m) => (!currentStateAfterSync.migrated.find((tm) => tm.fileName === m.fileName))
			);
			try {
				for (const migrate of missingMigrations) {
					if (migrate.isDbMigrate()) {
						terminal.white(`⏳ Merging up: ${migrate.name || migrate.fileName}`);
						await migrate.commit(
							t,
							this._schema,
							EMigrationProperties.MERGE
						);
						terminal.eraseLine().column(0);
						terminal.white(`✅ Merged up: ${migrate.name || migrate.fileName}\n`);
					}
				}
				if (this._parent.isInDebugMode) {
					await t.rollback();
				} else {
					await t.commit();
				}
			} catch (error) {
				await t.rollback();
				throw new Error(`Error merging migrations:\n${(error as Error).message}`);
			}
		} else if (
			(sourceLastMigrated && targetLastMigrated && sourceLastMigrated.id < targetLastMigrated.id) ||
			(!sourceLastMigrated && targetLastMigrated)
		) {
			// 3.1. The target is ahead of the source
			// We will migrate down the target (this) to the last migration of the source
			const synced = await this.syncRemote(source);
			if (!synced) {
				terminal.yellow("Merge canceled.\n\n");
				return false;
			}
			// 3.2. Then we have to rollback the target to the last migration of the source
			const currentStateAfterSync = this.getCurrentState();
			const t = await this._parent.db.transaction({
				isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
			});
			try {
				// Find the migration in target where we have to rollback
				const migratesToRollback = sourceLastMigrated
					? currentStateAfterSync.migrated.slice(
						currentStateAfterSync.migrated.findIndex(
							(m) => m.fileName === sourceLastMigrated.fileName
						) + 1
					).reverse()
					: [...currentStateAfterSync.migrated].reverse();
				for (const migrate of migratesToRollback) {
					if (migrate.isDbMigrate()) {
						terminal.white(`⏳ Merging down: ${migrate.name || migrate.fileName}`);
						await migrate.rollback(
							t,
							this._schema,
							EMigrationProperties.MERGE
						);
						terminal.eraseLine().column(0);
						terminal.white(`✅ Merged down: ${migrate.name || migrate.fileName}\n`);
					}
				}
				if (this._parent.isInDebugMode) {
					await t.rollback();
				} else {
					await t.commit();
				}
			} catch (error) {
				await t.rollback();
				throw new Error(`Error merging migrations:\n${(error as Error).message}`);
			}
		} else if (!sourceLastMigrated && !targetLastMigrated) {
			// 4. Both are empty
			terminal.yellow("Both schemas are empty.\n\n");
			return false;
		}
		await this.readRemoteMigrates();
		if (this.isLocal()) {
			await this.readLocalMigrates();
		}
		terminal.green("Merge successful.\n\n");
		return true;
	};

}
