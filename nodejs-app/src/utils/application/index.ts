import chalk from "chalk";
import cors from "cors";
import helmet from "helmet";
import express, { Express } from "express";

// Application class
interface IApplicationProps {
	appName: string;
	port?: number;
}

export class Application {
	// Config
	private _appName: string;
	private _port: number;

	// Express instance
	private _app: Express;

	constructor(config: IApplicationProps) {
		this._appName = config.appName;
		this._port = config.port || 8080;

		this._app = express();

		this._app.use(cors());
		this._app.use(helmet());
		this._app.use(express.json());
		this._app.use(express.urlencoded({ extended: true }));
	}

	// Getters
	public get app(): Express {
		return this._app;
	};

	public get appName(): string {
		return this._appName;
	};

	public get port(): number {
		return this._port;
	};

	// Public methods
	public start(): void {
		this._app.listen(this._port, () => {
			console.log(chalk.whiteBright.bold(`
				🚀 ${this._appName} is running on port ${this._port} 🚀
			`));
		});
	};
}
