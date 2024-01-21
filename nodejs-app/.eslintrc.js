module.exports = {
	// Allow ESLint to watch for hidden files and folders
	ignorePatterns: ["!.*"],
	plugins: ["@typescript-eslint"],
	rules: {
		// TypeScript-specific rules
		indent: ["error", "tab"],
		semi: ["error", "always"],
		quotes: ["error", "double"],
		"no-shadow": "warn",
		"@typescript-eslint/explicit-function-return-type": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": "warn",
		"@typescript-eslint/interface-name-prefix": "off",
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
	},
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts"]
		},
	},
};
