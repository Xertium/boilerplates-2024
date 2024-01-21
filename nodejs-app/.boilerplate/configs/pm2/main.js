module.exports = {
	apps: [
		{
			name: "sample-app",
			script: "./dist/apps/main.js",
			watch: false,
			time: true,
			// Remove the following comments to enable running the app with specific interpreter
			// interpreter: "",
			// interpreter_args: "",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			env: {
				NODE_ENV: "production",
				PORT: 8080,
			},
		},
	],
};
