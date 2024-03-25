import { Card, mergeClasses } from "@fluentui/react-components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SpinnerWrapper } from "@/components";
import { useAccount } from ".";
import { useStyles } from "@/styles";

// const ipcRenderer = window.electron.ipcRenderer;

/**
 * @todo We need to implement the login form and the login functionality.
 * After we decide this will be a web or desktop application.
 */

/** The login form */
export const LoginForm = (): React.ReactElement => {
	const { setAccount } = useAccount();
	const { t } = useTranslation();
	const classes = useStyles();

	/** The loading state */
	const [stLoading, setLoading] = useState(false);

	return (
		<div className={mergeClasses(classes.container, "app")}>
			<SpinnerWrapper
				isLoading={stLoading}
				spinnerProps={{}}
			>
				<Card className={mergeClasses(classes.card, classes.cardSmallWidth)} size="large">
					<h2>{t("appName")}</h2>
				</Card>
			</SpinnerWrapper>
		</div>
	);
};
