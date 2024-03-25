import {
	borderAll,
	borderLeft,
	borderRight,
	ribbonHeight,
	ribbonSidebarWidth
} from "@/styles";
import { makeStyles, shorthands, tokens } from "@fluentui/react-components";

export const useLocalStyles = makeStyles({
	ribbonContainer: {
		display: "flex",
		flexDirection: "column",
	},
	ribbonHeader: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		height: ribbonHeight,
		backgroundColor: tokens.colorNeutralBackground2,
		boxShadow: tokens.shadow2,
		...shorthands.borderTop("0px"),
		...shorthands.borderLeft("0px"),
		...shorthands.borderRight("0px"),
		...shorthands.borderBottom(tokens.strokeWidthThin),
		...shorthands.borderStyle("solid"),
		...shorthands.borderColor(tokens.colorNeutralBackground3),
	},
	ribbonHeaderDropdownContainer: {
		display: "flex",
	},
	ribbonContent: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		...shorthands.flex(1),
	},
	ribbonSidebar: {
		display: "flex",
		minWidth: ribbonSidebarWidth,
		backgroundColor: tokens.colorNeutralBackground2,
		...borderRight,
		...shorthands.borderStyle("solid"),
		...shorthands.borderColor(tokens.colorNeutralBackground3),
		"> i": {
			color: tokens.colorNeutralStrokeInvertedDisabled,
			alignSelf: "center",
			...shorthands.margin("auto"),
		}
	},
	ribbonUi: {
		flexGrow: 1,
	},
	ribbonDropdownButton: {
		width: ribbonSidebarWidth,
		...borderRight,
		...shorthands.borderStyle("solid"),
		...shorthands.borderColor(tokens.colorNeutralBackground3),
	},
	ribbonDropdownButtonRight: {
		width: ribbonSidebarWidth,
		...borderLeft,
		...shorthands.borderStyle("solid"),
		...shorthands.borderColor(tokens.colorNeutralBackground3),
	},
	ribbonAccountDropdownButtonImage: {
		...borderAll,
		backgroundColor: tokens.colorNeutralBackground1,
		width: "32px",
		height: "32px",
		...shorthands.borderColor(tokens.colorBrandBackground),
		...shorthands.borderRadius("50%"),
	},
});
