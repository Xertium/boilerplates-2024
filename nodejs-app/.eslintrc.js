module.exports = {
	// Allow ESLint to watch for hidden files and folders
	ignorePatterns: ["!.*"],
	plugins: ["@typescript-eslint", "import-newlines"],
	rules: {
		// TypeScript-specific rules
		"max-len": ["warn", { "code": 120 }],
		indent: ["error", "tab", { "SwitchCase": 1 }],
		semi: ["error", "always"],
		quotes: ["error", "double"],
		// Disable no-shadow because it says sometimes that a variable is shadowed when it is not
		// "no-shadow": "warn",
		"@typescript-eslint/explicit-function-return-type": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
		"@typescript-eslint/interface-name-prefix": "off",
		// General rules
		"import-newlines/enforce": ["warn", { "items": 3, "max-len": 120 }],
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
