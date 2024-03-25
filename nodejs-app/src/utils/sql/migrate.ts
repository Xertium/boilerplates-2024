import fs from "fs";
import { terminal } from "terminal-kit";
import { MigrateCLI } from "./migrate-cli";
import { EMigrationProperties, migrationHeader } from "./types";
import { createHash } from "crypto";
import { Transaction } from "sequelize";
import { NoValue } from "types";

interface IMigrateProps {
	parent: MigrateCLI;
	name?: string;
	description?: string;
	isBackup?: boolean;
}

interface ILocalMigrateProps extends IMigrateProps { fileName: number };
interface IDbMigrateProps extends IMigrateProps { migrate: IDbMigrate };

export interface IDbMigrate {
	id: number;
	uuid: string;
	file_name: number;
	content_up: string;
	content_down: string;
	checksum_up: string;
	checksum_down: string;
	properties: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

export class Migrate {
	private _parent: MigrateCLI;
	private _name: string = "";
	private _description: string = "";
	private _isBackup: boolean;

	private _id: number = NoValue;
	private _uuid: string = "";
	private _fileName: number = NoValue;
	private _contentUp: string = "";
	private _contentDown: string = "";
	private _checksumUp: string = "";
	private _checksumDown: string = "";
	private _properties: number = EMigrationProperties.LOCAL;
	private _createdAt?: Date;
	private _updatedAt?: Date;
	private _deletedAt?: Date | null;

	constructor(props: IMigrateProps | ILocalMigrateProps | IDbMigrateProps) {
		this._parent = props.parent;
		this._isBackup = props.isBackup || false;
		this._description = props.description || "";
		if (this.isLocalMigrateProps(props)) {
			// This means that the migration file already exists in fs
			this._fileName = props.fileName as number;
			this.read();
		} else if (this.isDbMigrateProps(props)) {
			// This means that the migration file already exists
			this._id = props.migrate.id;
			this._uuid = props.migrate.uuid;
			this._fileName = props.migrate.file_name;
			this._contentUp = props.migrate.content_up;
			this._contentDown = props.migrate.content_down;
			this._checksumUp = props.migrate.checksum_up;
			this._checksumDown = props.migrate.checksum_down;
			this._properties = props.migrate.properties;
			this._createdAt = props.migrate.created_at;
			this._updatedAt = props.migrate.updated_at;
			this._deletedAt = props.migrate.deleted_at;
			this._name = (this._contentUp
				.split("-- Name: " )[1] || "") // Handle the case when the name is not set on not set in some reason
				.split("\n")[0]
				.trim();
			this._description = (this._contentUp
				.split("-- Description: ")[1] || "") // Handle the case when the description on not set in some reason
				.split("\n")[0]
				.trim();
		} else {
			// This means that the migration files does not exist yet
			this._name = props.name || "";
			this._fileName = this.generateMigrateFilePair();
		}
	}

	/** Type guards */
	/** @returns Return true if the instance of the class is a database migration */
	public isDbMigrate = (): boolean => this._id !== NoValue;
	/** @returns Return true if the props object is an instance of IDbMigrateProps */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private isDbMigrateProps = (props: any): props is IDbMigrateProps => "migrate" in props;
	/** @returns Return true if the props object is an instance of ILocalMigrateProps */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private isLocalMigrateProps = (props: any): props is ILocalMigrateProps => "fileName" in props;
	/** @returns Return true if the instance of the class is for backup */
	public isBackup = (): boolean => this._isBackup;

	/** Getters */
	public get id(): number {
		return this._id;
	};

	public get uuid(): string {
		return this._uuid;
	};

	public get fileName(): number {
		return this._fileName;
	};

	public get name(): string {
		return this._name;
	};

	public get contentUp(): string {
		return this._contentUp;
	};

	public get contentDown(): string {
		return this._contentDown;
	};

	public get checksumUp(): string {
		return this._checksumUp;
	};

	public get checksumDown(): string {
		return this._checksumDown;
	};

	public get properties(): number {
		return this._properties;
	};

	public get createdAt(): Date | undefined {
		return this._createdAt;
	};

	public get updatedAt(): Date | undefined {
		return this._updatedAt;
	};

	public get deletedAt(): Date | null | undefined {
		return this._deletedAt;
	};

	/** Private methods */
	/**
	 * This method is used to read the migration files from the file system.
	 * It will read the content of the up and down migration files and
	 * calculate the checksums for both.
	 * @returns Promise<void>
	 * @throws Error - If the migration file content cannot be read
	 */
	private read = async (): Promise<void> => {
		// Load migration file content
		try {
			this._contentUp = await fs.promises.readFile(`${this._parent.path}/up/${this._fileName}.sql`, "utf-8");
			// Calculate the checksum without the header
			const contentUpWithoutHeader = this._contentUp.split("-- -- --")[1];
			this._checksumUp = createHash("sha1")
				.update(contentUpWithoutHeader)
				.digest("hex");

			this._name = (this._contentUp
				.split("-- Name: " )[1] || "") // Handle the case when the name is not set on not set in some reason
				.split("\n")[0]
				.trim();
			this._description = (this._contentUp
				.split("-- Description: ")[1] || "") // Handle the case when the description on not set in some reason
				.split("\n")[0]
				.trim();
		} catch (error) {
			throw new Error(`Error reading the up migration file:\n${(error as Error).message}`);
		}

		try {
			this._contentDown = await fs.promises.readFile(`${this._parent.path}/down/${this._fileName}.sql`, "utf-8");
			// Calculate the checksum without the header
			const contentDownWithoutHeader = this._contentDown.split("-- -- --")[1];
			this._checksumDown = createHash("sha1")
				.update(contentDownWithoutHeader)
				.digest("hex");
		} catch (error) {
			throw new Error(`Error reading the down migration file:\n${(error as Error).message}`);
		}
		this.watchUpContent();
		this.watchDownContent();
	};

	/**
	 * This method is used to generate a new pair of migration files.
	 * It will create a new file in the up and down folders with the
	 * current timestamp as the file name.
	 * @returns File name of the up migration file
	 * @throws Error - If the migration files cannot be created
	 */
	private generateMigrateFilePair = (): number => {
		terminal.clear();
		const now = new Date();
		const timestamp = now.getTime();
		if (this._isBackup && this._name === "") {
			this._name = `backup-${timestamp}`;
		} else if (this._name === "") {
			this._name = timestamp.toString();
		}
		this._id = NoValue;

		try {
			fs.writeFileSync(
				`${this._parent.path}/up/${timestamp}.sql`,
				migrationHeader
					.replace("#name", this._name)
					.replace("#timestamp", now.toLocaleString("hu-HU"))
					.replace("#direction", "up")
					.replace("#backup", this._isBackup ? "true" : "false")
					.replace("#description", this._description)
			);
		} catch (error) {
			throw new Error(`Error creating the up migration file:\n${(error as Error).message}`);
		}

		try {
			fs.writeFileSync(
				`${this._parent.path}/down/${timestamp}.sql`,
				migrationHeader
					.replace("#name", this._name)
					.replace("#timestamp", now.toLocaleString("hu-HU"))
					.replace("#direction", "down")
					.replace("#backup", this._isBackup ? "true" : "false")
					.replace("#description", this._description)
			);
		} catch (error) {
			// Remove the up migration file to clean up
			fs.unlinkSync(`${this._parent.path}/up/${timestamp}.sql`);
			throw new Error(`Error creating the down migration file:\n${(error as Error).message}`);
		}

		terminal.green("Migration files created successfully:\n");
		terminal.white(`
		- ${this._parent.path}/up/${timestamp}.sql \n
		- ${this._parent.path}/down/${timestamp}.sql \n`);

		this._fileName = timestamp;
		this.read();
		return timestamp;
	};

	private watchUpContent = (): void => {
		fs.watchFile(
			`${this._parent.path}/up/${this._fileName}.sql`,
			{ interval: 1000, persistent: true, },
			(curr, prev) => {
				if (curr.mtime.getTime() !== prev.mtime.getTime()) {
					this.read();
				}
			}
		);
	};

	private watchDownContent = (): void => {
		fs.watchFile(
			`${this._parent.path}/down/${this._fileName}.sql`,
			{ interval: 1000, persistent: true, },
			(curr, prev) => {
				if (curr.mtime.getTime() !== prev.mtime.getTime()) {
					this.read();
				}
			}
		);
	};

	private unwatchUpContent = (): void => {
		fs.unwatchFile(`${this._parent.path}/up/${this._fileName}.sql`);
	};

	private unwatchDownContent = (): void => {
		fs.unwatchFile(`${this._parent.path}/down/${this._fileName}.sql`);
	};

	/** Public methods */
	/**
	 * This method is used to save the migration files to the file system.
	 */
	public saveToFile = async (): Promise<void> => {
		try {
			fs.writeFileSync(
				`${this._parent.path}/up/${this._fileName}.sql`,
				this._contentUp
			);
		} catch (error) {
			throw new Error(`Error saving the up migration file:\n${(error as Error).message}`);
		}

		try {
			fs.writeFileSync(
				`${this._parent.path}/down/${this._fileName}.sql`,
				this._contentDown
			);
		} catch (error) {
			throw new Error(`Error saving the down migration file:\n${(error as Error).message}`);
		}
	};

	public isExistsInFs = (): boolean => {
		const upExists = fs.existsSync(`${this._parent.path}/up/${this._fileName}.sql`);
		const downExists = fs.existsSync(`${this._parent.path}/down/${this._fileName}.sql`);
		return upExists && downExists;
	};

	/**
	 * This method is used to commit the migration to the database.
	 * The migration properties will be set to UP | MIGRATE by default,
	 * but it can be overridden by the properties parameter.
	 * @param {Transaction} t Database transaction
	 * @param {string} schema Database schema where the migration will be executed
	 * @param {EMigrationProperties} properties Optional properties to set for the migration
	 */
	public commit = async (
		t: Transaction,
		schema: string,
		properties: number = EMigrationProperties.MIGRATE
	): Promise<void> => {
		try {
			// Run the migration up in the target schema
			await this._parent.db.query(
				`SET search_path TO ${schema};
					${this._contentUp}
				`,
				{ transaction: t }
			);
			// Save the migration to the database if it is not a backup
			if (!this.isBackup()) {
				await this._parent.db.query(
					`INSERT INTO "migrates".migrations_${schema} (
						file_name,
						content_up,
						content_down,
						checksum_up,
						checksum_down,
						properties
					) VALUES (
						:file_name,
						:content_up,
						:content_down,
						:checksum_up,
						:checksum_down,
						:properties
					)`,
					{
						transaction: t,
						replacements: {
							file_name: this._fileName,
							content_up: this._contentUp,
							content_down: this._contentDown,
							checksum_up: this._checksumUp,
							checksum_down: this._checksumDown,
							properties: properties | EMigrationProperties.UP,
						},
					}
				);
			}
		} catch (error) {
			throw new Error(`[${this._fileName}]:\n${(error as Error).message}`);
		}
		// Set the properties to UP and optionally properties
		this._properties = properties | EMigrationProperties.UP;
		this.unwatchUpContent();
		this.unwatchDownContent();
	};

	/**
	 * This method is used to rollback the migration from the database.
	 * The migration properties will be set to DOWN | MIGRATE by default,
	 * but it can be overridden by the properties parameter.
	 * @param {Transaction} t Database transaction
	 * @param {string} schema Database schema where the migration will be executed
	 * @param {EMigrationProperties} properties Optional properties to set for the migration
	 */
	public rollback = async (
		t: Transaction,
		schema: string,
		properties: number = EMigrationProperties.MIGRATE
	): Promise<void> => {
		try {
			// Run the migration down in the target schema
			await this._parent.db.query(
				`SET search_path TO ${schema};
					${this._contentDown}
				`,
				{ transaction: t }
			);
			// Save the migration to the database
			await this._parent.db.query(
				`INSERT INTO "migrates".migrations_${schema} (
					file_name,
					content_up,
					content_down,
					checksum_up,
					checksum_down,
					properties
				) VALUES (
					:file_name,
					:content_up,
					:content_down,
					:checksum_up,
					:checksum_down,
					:properties
				)`,
				{
					transaction: t,
					replacements: {
						file_name: this._fileName,
						content_up: this._contentUp,
						content_down: this._contentDown,
						checksum_up: this._checksumUp,
						checksum_down: this._checksumDown,
						properties: properties | EMigrationProperties.DOWN,
					},
				}
			);
		} catch (error) {
			throw new Error(`[${this._fileName}]:\n${(error as Error).message}`);
		}
		// Set the properties to DOWN and optionally properties
		this._properties = properties | EMigrationProperties.DOWN;
	};

}
