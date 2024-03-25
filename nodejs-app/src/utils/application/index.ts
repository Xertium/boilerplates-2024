import chalk from "chalk";
import cors from "cors";
import helmet from "helmet";
import express, {
	Express,
	NextFunction,
	Request,
	Response
} from "express";
import { Options } from "sequelize";
import { Database } from "utils";
import { v4 } from "uuid";

// Application class
interface IApplicationProps {
	/** The name of the application. */
	appName: string;
	/** The port number of the application. */
	port?: number;
	/** The database options. */
	dbOptions?: Options;
	/** The JWT secret for the authentication. */
	jwtSecret?: string;
}

/**
 * Application class.
 * Handles the Express application, database connection and session management
 * over the entire application.
 */
export class Application {
	// Config
	private _appName: string;
	private _port: number;
	private _jwtSecret: string;

	// Express instance
	private _app: Express;

	// Database instance
	private _db: Database | null = null;

	constructor(config: IApplicationProps) {
		this._appName = config.appName;
		this._port = config.port || 8080;

		this._app = express();

		this._app.use(cors({
			origin: "*",
			methods: "GET,HEAD,OPTIONS,POST,PUT",
			allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization",
			exposedHeaders: "Authorization",
		}));
		this._app.use(helmet());
		this._app.use(express.json());
		this._app.use(express.urlencoded({ extended: true }));
		this._app.use(this.handleExpressErrors);

		if (config.dbOptions) {
			this._db = new Database(config.dbOptions);
		}

		this._jwtSecret = config.jwtSecret || v4();
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

	public get jwtSecret(): string {
		return this._jwtSecret;
	};

	public get database(): Database | null {
		return this._db;
	};

	// Public methods
	/**
	 * Start the application then listen on the given port.
	 */
	public start = (): void => {
		this._app.listen(this._port, async () => {
			console.log(chalk.whiteBright.bold(`
				🚀 ${this._appName} is running on port ${this._port} 🚀
			`));

			if (this._db) {
				await this._db.connect();
			}
		});
	};

	private handleExpressErrors = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
		if (!res.headersSent) {
			res.status(500).json({ error: error.message });
		}
	};
}
