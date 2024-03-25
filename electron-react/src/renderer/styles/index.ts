import { makeStyles, tokens, shorthands } from "@fluentui/react-components";

export const ribbonHeight = "50px";
export const ribbonSidebarWidth = "280px";

export const markdownPreviewHeight = "400px";

export const borderAll = {
	...shorthands.border(tokens.strokeWidthThin),
	...shorthands.borderStyle("solid"),
	...shorthands.borderColor(tokens.colorNeutralBackground3),
};

export const borderBottom = {
	...shorthands.borderTop("0px"),
	...shorthands.borderLeft("0px"),
	...shorthands.borderRight("0px"),
	...shorthands.borderBottom(tokens.strokeWidthThin),
};

export const borderTop = {
	...shorthands.borderTop(tokens.strokeWidthThin),
	...shorthands.borderLeft("0px"),
	...shorthands.borderRight("0px"),
	...shorthands.borderBottom("0px"),
};

export const borderRight = {
	...shorthands.borderTop("0px"),
	...shorthands.borderLeft("0px"),
	...shorthands.borderRight(tokens.strokeWidthThin),
	...shorthands.borderBottom("0px"),
};

export const borderLeft = {
	...shorthands.borderTop("0px"),
	...shorthands.borderLeft(tokens.strokeWidthThin),
	...shorthands.borderRight("0px"),
	...shorthands.borderBottom("0px"),
};

export const useStyles = makeStyles({
	container: {
		display: "flex",
		backgroundColor: tokens.colorNeutralBackground1,
	},
	successText: {
		color: tokens.colorStatusSuccessBackground3,
	},
	warningText: {
		color: tokens.colorPaletteMarigoldBackground3,
	},
	errorText: {
		color: tokens.colorPaletteRedBackground3,
	},
	preLineText: {
		whiteSpace: "pre-line",
	},
	card: {
		backgroundColor: tokens.colorNeutralBackground2,
	},
	cardSmallWidth: {
		maxWidth: "320px",
	},
	label: {
		...shorthands.gap("2px"),
	},
	logoContainer: {
		display: "flex",
		justifyContent: "center",
		position: "relative",
	},
	labelBrand: {
		left: 0,
		top: `calc(0px - ${tokens.spacingVerticalM})`,
		position: "absolute",
		color: tokens.colorBrandForeground1,
	},
	dialogTitle: {
		display: "flex",
		alignItems: "center",
		color: tokens.colorBrandForeground1,
		fontWeight: tokens.fontWeightBold + "!important",
		"> *:first-child": {
			marginRight: tokens.spacingHorizontalXS,
		},
	},
	dialogBody: {
		display: "flex",
		flexDirection: "column",
	},
	dialogFooter: {
		display: "flex",
		justifyContent: "flex-end",
		marginTop: tokens.spacingVerticalM,
	},
	spinnerBtn: {
		cursor: "not-allowed",
		width: "96px",
		backgroundColor: tokens.colorNeutralBackground1,
		color: tokens.colorNeutralForeground1,
		...shorthands.borderColor(tokens.colorNeutralStroke1),
		...shorthands.borderWidth(tokens.strokeWidthThin),
		...shorthands.borderStyle("solid"),
		...shorthands.borderRadius(tokens.borderRadiusMedium),
	},
	dropdownMenu: {
		height: "unset",
		backgroundColor: tokens.colorNeutralBackground1,
		...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
	},
	dropdownMenuItem: {
		"> span": {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			"> *:first-child": {
				marginRight: tokens.spacingHorizontalM,
			},
			"> *": {
				fontWeight: tokens.fontWeightRegular + "!important",
			},
		},
	},
	dropdownMenuDivider: {
		marginTop: tokens.spacingVerticalM,
		marginBottom: tokens.spacingVerticalM,
	},
	editorPageContainer: {
		display: "flex",
		flexDirection: "column",
		...shorthands.flex(1),
		...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
		"> *:not(:last-child)": {
			marginBottom: tokens.spacingVerticalM,
		},
		"> h2": {
			...shorthands.padding(0, 0, tokens.spacingVerticalM, 0),
			...shorthands.borderStyle("solid"),
			...shorthands.borderColor(tokens.colorNeutralStroke2),
			...borderBottom,
		},
	},
	editorMarkdownPreview: {
		height: markdownPreviewHeight,
		overflowY: "auto",
	},
	editorFlexFillContainer: {
		display: "flex",
		flexDirection: "column",
		...shorthands.flex(1),
	},
});
