import { Button, MenuItem, MenuList } from "@fluentui/react-components";
import { FolderAdd24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { IProject } from "@src/types";

/**
 * The project list properties interface.
 */
interface IProjectListProps {
	/** The class name is applied to the root element. */
	className?: string;
	/** The project list items. */
	items: IProject[];
	/** The message to display when no data is available. */
	noDataMessage?: string;
	/** The create project dialog function. */
	createProjectDialog?: () => Promise<void>;
}

/**
 * Component for rendering a project list.
 */
export const ProjectList = ({
	className,
	items,
	noDataMessage,
	createProjectDialog
}: IProjectListProps): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<>
			{items.length === 0 ? (
				<div  className={className}>
					<i style={{ textAlign: "center" }}>{noDataMessage ? noDataMessage : t("NoData")}</i>
					{createProjectDialog && (
						<Button
							appearance="primary"
							icon={<FolderAdd24Regular />}
							onClick={createProjectDialog}
						>
							{t("AddProject")}
						</Button>
					)}
				</div>
			) : (
				<MenuList className={className}>
					{items.map((project) => (
						<MenuItem key={project.id}>{project.project_name}</MenuItem>
					))}
				</MenuList>
			)}
		</>
	);
};
