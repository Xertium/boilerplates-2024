import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { ribbonSidebarWidth, ribbonHeight } from "@/styles";

export const useLocalStyles = makeStyles({
	dropdownButton: {
		cursor: "pointer",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: tokens.colorNeutralBackground2,
		...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
		"> *": {
			marginRight: tokens.spacingHorizontalM,
		},
		"> *:last-child": {
			marginRight: 0,
		},
		"&:hover": {
			backgroundColor: tokens.colorNeutralBackground2Hover,
		},
	},
	dropdownButtonOpen: {
		backgroundColor: tokens.colorNeutralBackground2Selected,
		...shorthands.border("0", "none"),
	},
	dropdownButtonDescriptionContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		flexGrow: 1,
	},
	dropdownButtonDescription: {
		fontSize: tokens.fontSizeBase100,
		fontWeight: "100",
		lineHeight: "initial",
		marginBottom: tokens.spacingVerticalXS,
	},
	dropdownButtonLabel: {
		fontSize: tokens.fontSizeBase200,
		fontWeight: tokens.fontWeightSemibold,
		lineHeight: "initial",
	},
	dropdownButtonDisabled: {

	},
	dropdownBackdrop: {
		position: "fixed",
		zIndex: 1000,
		top: `calc(${ribbonHeight} - 1px)`,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: tokens.colorBackgroundOverlay,
	},
	dropdownContainer: {
		position: "absolute",
		width: ribbonSidebarWidth,
		height: "100%",
		backgroundColor: tokens.colorNeutralBackground2Selected,
	},
});
