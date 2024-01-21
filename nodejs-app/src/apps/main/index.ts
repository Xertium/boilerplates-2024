import { Application } from "utils/application";

// Create the application
const mainApplication = new Application({
	appName: "Sample Application",
	port: 8080,
});

// Add the handlers to the application

mainApplication.start();

export { mainApplication };
