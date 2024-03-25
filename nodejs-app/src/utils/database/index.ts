import chalk from "chalk";
import { Sequelize, Options } from "sequelize";

export class Database {
	private _authenticated: boolean = false;
	private _connection: Sequelize;
	private _schema: string = "public";

	constructor(dbOptions: Options) {
		this._connection = new Sequelize(dbOptions);
	}

	public get connection(): Sequelize {
		if (!this._authenticated) {
			throw new Error("Database connection has not been established yet");
		}
		return this._connection;
	};

	public get schema(): string {
		return this._schema;
	};

	public async connect(): Promise<void> {
		try {
			await this._connection.authenticate();
			this._authenticated = true;
			console.log(chalk.greenBright.bold("Database connection has been established successfully"));
		} catch (error) {
			console.error(chalk.redBright.bold(`Unable to connect to the database: ${error}`));
			throw error;
		}
	};

}
