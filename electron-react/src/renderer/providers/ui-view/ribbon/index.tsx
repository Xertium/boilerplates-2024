import { mergeClasses } from "@fluentui/react-components";
import { FolderOpen16Regular } from "@fluentui/react-icons";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DropdownButton } from "@/components/dropdown-button";
import { useAccount } from "@/providers";
import { useStyles } from "@/styles";
import { AccountDropdownContent } from "../account-dropdown-content";
import { useLocalStyles } from "./styles";

interface IRibbonProps {
	children: React.ReactNode;
	actionbarRef: Dispatch<SetStateAction<HTMLDivElement | null>>;
	sidebarRef: Dispatch<SetStateAction<HTMLDivElement | null>>;
}

export const Ribbon = ({ children, actionbarRef, sidebarRef }: IRibbonProps): React.ReactElement => {
	const { account } = useAccount();
	const classes = {
		...useStyles(),
		...useLocalStyles(),
	};
	const { t } = useTranslation();

	return (
		<div className={mergeClasses(classes.ribbonContainer)}>
			<div className={mergeClasses(classes.ribbonHeader)}>
				<div className={mergeClasses(classes.ribbonHeaderDropdownContainer)}>
					<DropdownButton
						className={mergeClasses(classes.ribbonDropdownButton)}
						description={t("DropdownDescription")}
						dropdownContent={<></>}
						icon={<FolderOpen16Regular />}
						label={t("DropdownLabel")}
					/>
					<div className={mergeClasses(classes.ribbonHeaderDropdownContainer)} ref={actionbarRef} />
				</div>
				<DropdownButton
					className={mergeClasses(classes.ribbonDropdownButtonRight)}
					description={account!.nickname}
					dropdownContent={<AccountDropdownContent />}
					dropdownContentClassName={mergeClasses(classes.dropdownMenu)}
					hideCaret
					icon={
						<img
							className={mergeClasses(classes.ribbonAccountDropdownButtonImage)}
							src={account!.avatar_url}
						/>
					}
					label={account!.name}
				/>
			</div>
			<div className={mergeClasses(classes.ribbonContent)}>
				<div ref={sidebarRef} className={mergeClasses(classes.ribbonSidebar)} />
				<div className={mergeClasses(classes.ribbonUi)}>
					{children}
				</div>
			</div>
		</div>
	);
};
