import { MigrateCLI } from "./migrate-cli";

const migrateCLI = new MigrateCLI({
	options: {
		database: process.env.DB_DATABASE,
		dialect: "postgres",
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT as string),
		logging: false,
	},
	path: "src/utils/sql",
	schemas: {
		local: process.env.DB_LOCAL_SCHEMA as string,
		development: process.env.DB_DEVELOPMENT_SCHEMA as string,
		test: process.env.DB_TEST_SCHEMA as string,
		production: process.env.DB_PRODUCTION_SCHEMA as string,
	},
	/*
	 * Comment out the following property if you want to run the migrations really,
	 * otherwise the transaction will be rolled back.
	 */
	isInDebugMode: false,
});
migrateCLI.start();
