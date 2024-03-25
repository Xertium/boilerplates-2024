import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const useLocalStyles = makeStyles({
	root: {
		display: "flex",
		justifyContent: "space-between",
		...shorthands.gap("8px"),
	},
	codeInput: {
		height: tokens.fontSizeHero1000,
		fontSize: tokens.fontSizeBase600,
		width: tokens.fontSizeHero900,
		"> input": {
			color: tokens.colorBrandForeground1 + "!important",
		},
	},
});
