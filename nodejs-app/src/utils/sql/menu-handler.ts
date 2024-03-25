import { terminal } from "terminal-kit";
import { MigrateCLI } from "./migrate-cli";
import { EMigrationProperties, ETerminalColor } from "./types";
import { Migrate } from "./migrate";

interface IMenuHandlerProps {
	parent: MigrateCLI;
}

interface IDataFormFieldProps {
	key: string;
	label: string;
	default?: string;
}

interface IMigrateOption {
	label: string;
	value: Migrate | boolean;
}

enum EMainMenuItem {
	LocalDatabase = "Local database",
	DevelopmentDatabase = "Development database",
	TestDatabase = "Test database",
	ProductionDatabase = "Production database",
	Exit = "Exit",
}

enum ELocalDbMenuItem {
	GenerateMigrateFiles = "Generate migrate files",
	MarkMigrateFileAsBackup = "Mark migrate file as backup",
	MigrateLocalDatabaseUp = "Migrate up",
	MigrateLocalDatabaseDown = "Migrate down",
	PushToDevelopment = "Push to development",
	PullFromDevelopment = "Pull from development",
	Back = "Back",
}

enum EDevelopmentDbMenuItem {
	MigrateDevelopmentDatabaseUp = "Migrate up",
	MigrateDevelopmentDatabaseDown = "Migrate down",
	PushToTest = "Push to test",
	Back = "Back",
}

enum ETestDbMenuItem {
	MigrateTestDatabaseUp = "Migrate up",
	MigrateTestDatabaseDown = "Migrate down",
	PushToProduction = "Push to production",
	Back = "Back",
}

enum EProductionDbMenuItem {
	MigrateProductionDatabaseUp = "Migrate up",
	MigrateProductionDatabaseDown = "Migrate down",
	Back = "Back",
}

export class MenuHandler {
	private _parent: MigrateCLI;

	constructor(props: IMenuHandlerProps) {
		this._parent = props.parent;
	}

	/**
	 * Create a separator string with the character repeated the length times.
	 * @param {string} char The character to repeat
	 * @param {number} length The length of the string
	 * @returns {string} A string with the character repeated the length times
	 */
	private separator = (char: string, length: number): string => {
		return char.repeat(length);
	};

	private renderInput = async (field: IDataFormFieldProps): Promise<string | undefined> => {
		return new Promise((resolve) => {
			terminal.inputField({ cancelable: false },
				(_error, input) => {
					if (input) {
						resolve(input);
					} else {
						resolve(field.default || undefined);
					}
				});
		});
	};

	private showDataForm = async <IDataFormResult>(data: IDataFormFieldProps[]): Promise<IDataFormResult> => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		terminal.clear();
		const result: any = {};
		for (const field of data) {
			if (Object.keys(result).length === 0) {
				terminal.white(`${field.label}`);
			} else {
				terminal.white(`\n${field.label}`);
			}
			terminal.white(field.default ? `(${field.default}): ` : ": ");
			const value = await this.renderInput(field);
			result[field.key] = value;
		}
		return result as IDataFormResult;
	};

	private showMigrationSelection = async (
		migrates: Migrate[],
		renderInit?: boolean
	): Promise<Migrate | boolean> => {
		terminal.clear();
		const options: IMigrateOption[] = [];
		for (let i = 0; i < migrates.length; i++) {
			const migrate = migrates[i];
			options.push({
				label: `┣ ${(migrate.name || migrate.fileName).toString()}`,
				value: migrate,
			});
		}

		if (renderInit) {
			options.push({
				label: "┣ Init...",
				// Return true to indicate that the user wants to run down to the initial state
				value: true,
			});
		}

		options.push({
			label: "Cancel",
			value: false,
		});
		return new Promise((resolve) => {
			terminal.singleColumnMenu(options.map((o) => o.label), async (_error, response) => {
				if (response.selectedIndex === options.length - 1) {
					resolve(false);
				}
				resolve(options[response.selectedIndex].value);
			});
		});
	};

	/**
	 * Display the local database menu
	 * @param {boolean | undefined} avoidClear If true, the terminal will not be cleared
	 */
	private localDbMenu = async (avoidClear?: boolean): Promise<void> => {
		// We need to check that the local database is in sync with the files
		await this._parent.localStore.checkLocalAndSyncMigrations();

		if (!avoidClear) {
			terminal.clear();
		}
		terminal.white("Local database\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please select an action:\n");

		const menuItems = Object.values(ELocalDbMenuItem);

		const currentState = this._parent.localStore.getCurrentState();

		terminal.singleColumnMenu(menuItems, async (_error, response) => {
			switch (response.selectedText) {
				case ELocalDbMenuItem.GenerateMigrateFiles:
					const migrate = await this.showDataForm<{ name: string, description: string }>([
						{ key: "name", label: "Name", default: new Date().getTime().toString() },
						{ key: "description", label: "Description" },
					]);
					await this._parent.localStore.newMigrate(migrate);
					this.localDbMenu(true);
					break;
				case ELocalDbMenuItem.MarkMigrateFileAsBackup:
					const backupMigrate = await this.showDataForm<{ name: string, description: string }>([
						{ key: "description", label: "Description" },
					]);
					await this._parent.localStore.newMigrate({ ...backupMigrate, isBackup: true });
					this.localDbMenu(true);
					break;
				case ELocalDbMenuItem.MigrateLocalDatabaseUp:
					const migrateToUp = await this.showMigrationSelection(currentState.pending);
					if (migrateToUp instanceof Migrate) {
						await this._parent.localStore.migrateUp(migrateToUp);
					}
					this.localDbMenu(migrateToUp ? true : false);
					break;
				case ELocalDbMenuItem.MigrateLocalDatabaseDown:
					const migratesToDown = [...currentState.migrated].reverse();
					const migrateToDown = await this.showMigrationSelection(
						migratesToDown,
						true
					);
					if (migrateToDown instanceof Migrate) {
						await this._parent.localStore.migrateDown(migrateToDown);
					} else if (migrateToDown === true) {
						// The user wants to migrate down to the initial state
						await this._parent.localStore.migrateDown();
					}
					this.localDbMenu(migrateToDown ? true : false);
					break;
				case ELocalDbMenuItem.PullFromDevelopment:
					await this._parent.localStore.mergeMigrates(this._parent.developmentStore);
					this.localDbMenu(true);
					break;
				case ELocalDbMenuItem.PushToDevelopment:
					await this._parent.developmentStore.mergeMigrates(this._parent.localStore);
					this.localDbMenu(true);
					break;
				case ELocalDbMenuItem.Back:
					this.mainMenu();
				default:
					break;
			}
		});
	};

	/**
	 * Display the development database menu
	 * @param {boolean | undefined} avoidClear If true, the terminal will not be cleared
	 */
	private developmentDbMenu = (avoidClear?: boolean): void => {
		if (!avoidClear) {
			terminal.clear();
		}
		terminal.white("Development database\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please select an action:\n");

		const menuItems = Object.values(EDevelopmentDbMenuItem);

		const currentState = this._parent.developmentStore.getCurrentState();

		terminal.singleColumnMenu(menuItems, async (_error, response) => {
			switch (response.selectedText) {
				case EDevelopmentDbMenuItem.MigrateDevelopmentDatabaseUp:
					const migrateToUp = await this.showMigrationSelection(currentState.pending);
					if (migrateToUp instanceof Migrate) {
						await this._parent.developmentStore.migrateUp(migrateToUp);
					}
					this.developmentDbMenu(migrateToUp ? true : false);
					break;
				case EDevelopmentDbMenuItem.MigrateDevelopmentDatabaseDown:
					const migratesToDown = [...currentState.migrated].reverse();
					const migrateToDown = await this.showMigrationSelection(
						migratesToDown,
						true
					);
					if (migrateToDown instanceof Migrate) {
						await this._parent.developmentStore.migrateDown(migrateToDown);
					} else if (migrateToDown === true) {
						// The user wants to migrate down to the initial state
						await this._parent.developmentStore.migrateDown();
					}
					this.developmentDbMenu(migrateToDown ? true : false);
					break;
				case EDevelopmentDbMenuItem.PushToTest:
					await this._parent.testStore.mergeMigrates(this._parent.developmentStore);
					this.developmentDbMenu(true);
					break;
				case EDevelopmentDbMenuItem.Back:
					this.mainMenu();
				default:
					break;
			}
		});
	};

	/**
	 * Display the test database menu
	 * @param {boolean | undefined} avoidClear If true, the terminal will not be cleared
	 */
	private testDbMenu = async (avoidClear?: boolean): Promise<void> => {
		if (!avoidClear) {
			terminal.clear();
			const confirmed = await this.protectedHandler("test-db");
			if (!confirmed) {
				this.mainMenu();
				return;
			}
		}
		terminal.white("Test database\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please select an action:\n");

		const menuItems = Object.values(ETestDbMenuItem);

		const currentState = await this._parent.testStore.getCurrentState();

		terminal.singleColumnMenu(menuItems, async (_error, response) => {
			switch (response.selectedText) {
				case ETestDbMenuItem.MigrateTestDatabaseUp:
					const migrateToUp = await this.showMigrationSelection(currentState.pending);
					if (migrateToUp instanceof Migrate) {
						await this._parent.testStore.migrateUp(migrateToUp);
					}
					if (!migrateToUp) {
						terminal.clear();
					}
					this.testDbMenu(true);
					break;
				case ETestDbMenuItem.MigrateTestDatabaseDown:
					const migratesToDown = [...currentState.migrated].reverse();
					const migrateToDown = await this.showMigrationSelection(
						migratesToDown,
						true
					);
					if (migrateToDown instanceof Migrate) {
						await this._parent.testStore.migrateDown(migrateToDown);
					} else if (migrateToDown === true) {
						// The user wants to migrate down to the initial state
						await this._parent.testStore.migrateDown();
					}
					if (!migrateToDown) {
						terminal.clear();
					}
					this.testDbMenu(true);
					break;
				case ETestDbMenuItem.PushToProduction:
					await this._parent.productionStore.mergeMigrates(this._parent.testStore);
					this.testDbMenu(true);
					break;
				case ETestDbMenuItem.Back:
					this.mainMenu();
				default:
					break;
			}
		});
	};

	/**
	 * Display the production database menu
	 * @param {boolean | undefined} avoidClear If true, the terminal will not be cleared
	 */
	private productionDbMenu = async (avoidClear?: boolean): Promise<void> => {
		if (!avoidClear) {
			terminal.clear();
			const confirmed = await this.protectedHandler("production-db");
			if (!confirmed) {
				this.mainMenu();
				return;
			}
		}
		terminal.white("Production database\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please select an action:\n");

		const menuItems = Object.values(EProductionDbMenuItem);

		const currentState = this._parent.productionStore.getCurrentState();

		terminal.singleColumnMenu(menuItems, async (_error, response) => {
			switch (response.selectedText) {
				case EProductionDbMenuItem.MigrateProductionDatabaseUp:
					const migrateToUp = await this.showMigrationSelection(currentState.pending);
					if (migrateToUp instanceof Migrate) {
						await this._parent.productionStore.migrateUp(migrateToUp);
					}
					if (!migrateToUp) {
						terminal.clear();
					}
					this.productionDbMenu(true);
					break;
				case EProductionDbMenuItem.MigrateProductionDatabaseDown:
					const migratesToDown = [...currentState.migrated].reverse();
					const migrateToDown = await this.showMigrationSelection(
						migratesToDown,
						true
					);
					if (migrateToDown instanceof Migrate) {
						await this._parent.productionStore.migrateDown(migrateToDown);
					} else if (migrateToDown === true) {
						// The user wants to migrate down to the initial state
						await this._parent.productionStore.migrateDown();
					}
					if (!migrateToDown) {
						terminal.clear();
					}
					this.productionDbMenu(true);
					break;
				case EProductionDbMenuItem.Back:
					this.mainMenu();
				default:
					break;
			}
		});
	};

	/**
	 * This function is used to handle the protected database actions.
	 * @param {string} database The name of the database
	 * @returns {Promise<boolean>} Confirmation
	 */
	private protectedHandler = async (database: string): Promise<boolean> => {
		terminal.clear();
		terminal.white("Protected action\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please confirm it by typing the database name (");
		terminal.yellow(database);
		terminal.white("): ");
		return new Promise((resolve) => {
			terminal.inputField(
				{ cancelable: true },
				(_error, input) => {
					terminal.clear();
					if (input === database) {
						resolve(true);
					} else {
						resolve(false);
					}
				}
			);
		});
	};

	/**
	 * Display the main menu
	 */
	public mainMenu(): void {
		terminal.clear();
		terminal.white("Database migration\n");
		terminal.white(this.separator("-", 50) + "\n");
		terminal.white("Please select a database to migrate:\n");

		const menuItems = Object.values(EMainMenuItem);

		terminal.singleColumnMenu(menuItems, (_error, response) => {
			switch (response.selectedText) {
				case EMainMenuItem.LocalDatabase:
					this.localDbMenu();
					break;
				case EMainMenuItem.DevelopmentDatabase:
					this.developmentDbMenu();
					break;
				case EMainMenuItem.TestDatabase:
					this.testDbMenu();
					break;
				case EMainMenuItem.ProductionDatabase:
					this.productionDbMenu();
					break;
				case EMainMenuItem.Exit:
					this._parent.exit();
				default:
					break;
			}
		});
	};

	/**
	 * Ask a yes/no question and return a boolean
	 * @param {string} question The question to ask
	 * @returns {Promise<boolean>} Confirmation
	 */
	public yesOrNo = async (question: string): Promise<boolean> => {
		terminal.white(question + " (y/n): ");
		return new Promise((resolve) => {
			terminal.yesOrNo({ yes: ["y", "ENTER"], no: ["n"] }, (_error, result) => {
				resolve(result);
			});
		});
	};
}
