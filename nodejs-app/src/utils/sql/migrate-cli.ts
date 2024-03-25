import fs from "fs/promises";
import { Options, Sequelize } from "sequelize";
import { terminal } from "terminal-kit";
import { MenuHandler } from "./menu-handler";
import { MigrateStore } from "./migrate-store";

enum ESetupEnvironmentStep {
	"Checking migration paths",
	"Connecting to the database",
	"Creating migration schemas if they do not exist",
	"Creating migrations stores",
}

interface IMigrateCLIProps {
	options: Options;
	path: string;
	schemas: {
		local: string;
		development: string;
		test: string;
		production: string;
	};
	isInDebugMode?: boolean;
}

export class MigrateCLI {
	private _db?: Sequelize = undefined;
	private _menuHandler: MenuHandler;
	private _options: Options;
	private _path: string;
	private _schemas: {
		local: string;
		development: string;
		test: string;
		production: string;
	};

	public migrateStores: {
		local?: MigrateStore;
		development?: MigrateStore;
		test?: MigrateStore;
		production?: MigrateStore;
	} = {};

	public isInDebugMode: boolean = false;

	constructor(props: IMigrateCLIProps) {
		this._options = props.options;
		this._path = props.path;
		this._schemas = props.schemas;
		this._menuHandler = new MenuHandler({
			parent: this,
		});

		if (props.isInDebugMode === true) {
			this.isInDebugMode = true;
		}

		// Bind methods
		this.start = this.start.bind(this);
		this.exit = this.exit.bind(this);
	}

	/** Getters */
	public get db(): Sequelize {
		if (!this._db) {
			throw new Error("The database instance has not been initialized.");
		}
		return this._db;
	};

	public get path(): string {
		return this._path;
	};

	public get localStore(): MigrateStore {
		if (!this.migrateStores.local) {
			throw new Error("The migrate stores have not been initialized.");
		}
		return this.migrateStores.local;
	};

	public get developmentStore(): MigrateStore {
		if (!this.migrateStores.development) {
			throw new Error("The migrate stores have not been initialized.");
		}
		return this.migrateStores.development;
	};

	public get testStore(): MigrateStore {
		if (!this.migrateStores.test) {
			throw new Error("The migrate stores have not been initialized.");
		}
		return this.migrateStores.test;
	};

	public get productionStore(): MigrateStore {
		if (!this.migrateStores.production) {
			throw new Error("The migrate stores have not been initialized.");
		}
		return this.migrateStores.production;
	};

	public get schemas(): typeof MigrateCLI.prototype._schemas {
		return this._schemas;
	};

	public get schemaNames(): string[] {
		return Object.values(this._schemas);
	};

	public get menuHandler(): MenuHandler {
		return this._menuHandler;
	};

	/** Private methods */
	/**
	 * Setup the environment for the migrations.
	 * It checks if the migration paths exist, connects to the database,
	 * creates the migration schemas if they do not exist and creates the migration stores.
	 * @param {Options} options Database options
	 * @returns Instance of the Sequelize database
	 * @throws Error - If the migration paths do not exist
	 * @throws Error - If the database cannot be authenticated
	 * @throws Error - If the migration environment cannot be setup (unknown error)
	 */
	private setupEnvironment = async (options: Options): Promise<void> => {
		terminal.clear();

		const items = Object.values(ESetupEnvironmentStep);
		let currentStep = 0;
		const progressBar = terminal.progressBar({
			title: "Setting up...",
			width: 100,
			eta: true,
			percent: true,
			items: items.length,
		});

		progressBar.startItem(items[currentStep] as string);
		// Check if the migration paths exist
		try {
			await fs.access(`${this._path}/up`);
		} catch (error) {
			throw new Error("The migration paths for the up migrations do not exist.");
		}

		try {
			await fs.access(`${this._path}/down`);
		} catch (error) {
			throw new Error("The migration paths for the down migrations do not exist.");
		}
		progressBar.itemDone(items[currentStep] as string);
		currentStep++;
		progressBar.startItem(items[currentStep] as string);
		// Database instance
		const db = new Sequelize(options);
		// Authenticate the database
		try {
			await db.authenticate();
		} catch (error) {
			throw new Error(`Error authenticating the database:\n${(error as Error).message}`);
		}
		this._db = db;
		progressBar.itemDone(items[currentStep] as string);
		currentStep++;
		// Setup the migration environment if it does not exist
		// First we have to create the schemas, add uuid extension and create the migrations table
		try {
			// Create the migration schema
			progressBar.startItem(items[currentStep] as string);
			await db.query("CREATE SCHEMA IF NOT EXISTS \"migrates\"");
			await db.query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"");

			progressBar.itemDone(items[currentStep] as string);
			currentStep++;
			// Create migration stores
			progressBar.startItem(items[currentStep] as string);
			progressBar.stop();
			// Turn off the progressbar temporarily
			this.migrateStores.local = new MigrateStore({
				parent: this,
				schema: this._schemas.local,
			});
			await this.migrateStores.local.init();
			this.migrateStores.development = new MigrateStore({
				parent: this,
				schema: this._schemas.development,
			});
			await this.migrateStores.development.init();
			this.migrateStores.test = new MigrateStore({
				parent: this,
				schema: this._schemas.test,
			});
			await this.migrateStores.test.init();
			this.migrateStores.production = new MigrateStore({
				parent: this,
				schema: this._schemas.production,
			});
			await this.migrateStores.production.init();
			progressBar.resume();

			progressBar.itemDone(items[currentStep] as string);
		} catch (error) {
			throw new Error(`Error setting up the migration environment:\n${(error as Error).message}`);
		}
		progressBar.stop();
		terminal.clear();
	};

	/** Public methods */
	/**
	 * Start the migration CLI tool.
	 */
	public start = async (): Promise<void> => {
		await this.setupEnvironment(this._options);
		this._menuHandler.mainMenu();
	};

	public exit = (): void => {
		terminal.clear();
		process.exit(0);
	};
}
