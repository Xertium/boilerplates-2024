import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const useLocalStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		minWidth: "550px",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	tablist: {
		marginBottom: tokens.spacingVerticalS,
	},
	buttonList: {
		display: "flex",
		justifyContent: "center",
		height: "32px",
		marginBottom: tokens.spacingVerticalS,
		"> *": {
			...shorthands.margin(0, tokens.spacingHorizontalS, 0, 0),
		},
		"> *:last-child": {
			...shorthands.margin(0),
		},
	},
	panel: {
		...shorthands.flex(1),
		...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
		...shorthands.border(tokens.strokeWidthThin),
		...shorthands.borderStyle("solid"),
		...shorthands.borderColor(tokens.colorPaletteAnchorBorderActive),
		...shorthands.borderRadius(tokens.borderRadiusMedium),
		display: "flex",
		flexDirection: "column",
		overflowX: "auto",
		overflowY: "auto",
		"> span": {
			...shorthands.flex(1),
			...shorthands.borderColor("transparent"),
			":focus-within": {
				...shorthands.borderColor("transparent"),
			},
			"> textarea": {
				maxHeight: "unset!important",
			},
		},
	},
	panelWithTextarea: {
		...shorthands.padding(0),
	},
	textarea: {
		width: "100%",
	},
});
