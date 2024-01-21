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
		// React-specific rules
		"react/react-in-jsx-scope": "off",
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
	},
	settings: {
		"import/resolver": {
			// See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
			node: {},
			webpack: {
				config: require.resolve("./.boilerplate/configs/webpack.eslint.ts"),
			},
			typescript: {},
		},
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
	},
};