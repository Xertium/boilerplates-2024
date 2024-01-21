import chalk from "chalk";
import detectPort from "detect-port";

const port = process.env.PORT || "1212";

if (isNaN(parseInt(port))) {
	throw new Error(
		chalk.whiteBright.bgRed.bold(
			`Port "${port}" is not a number. Please use a number as a port. ex: PORT=4343 npm start`,
		),
	);
}

detectPort(parseInt(port), (_err, availablePort) => {
	if (port !== String(availablePort)) {
		throw new Error(
			chalk.whiteBright.bgRed.bold(
				`Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 npm start`,
			),
		);
	} else {
		process.exit(0);
	}
});
