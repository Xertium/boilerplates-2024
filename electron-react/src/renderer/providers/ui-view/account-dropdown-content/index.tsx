import {
	Divider,
	Menu,
	MenuItem,
	MenuList,
	MenuPopover,
	MenuTrigger,
	mergeClasses,
} from "@fluentui/react-components";
import {
	ChatHelpRegular,
	Settings16Regular,
	PersonArrowBack16Regular,
	WeatherSunny16Regular,
	WeatherMoon16Regular,
	TextFont16Regular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useAccount, useTheme } from "@/providers";
import { useStyles } from "@/styles";
import { useLocalStyles } from "../ribbon/styles";

/**
 * Dropdown content for the account menu
 */
export const AccountDropdownContent = (): React.ReactElement => {
	const { setAccount } = useAccount();
	const classes = {
		...useStyles(),
		...useLocalStyles(),
	};
	const { theme, setTheme } = useTheme();
	const { t, i18n } = useTranslation();

	const onLogout = (): void => {
		setAccount(null, null);
	};

	/** Event handler for changing the language */
	const onChangeLanguage = (lang: string): void => {
		i18n.changeLanguage(lang);
	};

	/** Get the corrent flag for a language */
	const getLangFlag = (lang: string): string => {
		switch (lang) {
			case "en":
				return "gb";
			default:
				return lang;
		}
	};

	return (
		<div>
			<MenuList>
				<MenuItem className={mergeClasses(classes.dropdownMenuItem)}>
					<Settings16Regular />
					<p>{t("Settings")}</p>
				</MenuItem>
				<MenuItem className={mergeClasses(classes.dropdownMenuItem)}>
					<ChatHelpRegular />
					<p>{t("Help")}</p>
				</MenuItem>
				<Divider className={mergeClasses(classes.dropdownMenuDivider)} />
				<Menu>
					<MenuTrigger disableButtonEnhancement>
						<MenuItem className={mergeClasses(classes.dropdownMenuItem)}>
							<TextFont16Regular />
							{t("Language")}
						</MenuItem>
					</MenuTrigger>
					<MenuPopover>
						<MenuList>
							{Object.keys(i18n.options.resources as any).map((lang) => (
								<MenuItem
									key={lang}
									className={mergeClasses(classes.dropdownMenuItem)}
									onClick={() => onChangeLanguage(lang)}
								>
									<img
										src={`https://flagcdn.com/16x12/${getLangFlag(lang)}.png`}
										width="16"
										height="12"
										alt={t(`${lang}`)}
									/>
									<p>{t(`${lang}`)}</p>
								</MenuItem>
							))}
						</MenuList>
					</MenuPopover>
				</Menu>
				{theme === "light"
					? (
						<MenuItem className={mergeClasses(classes.dropdownMenuItem)} onClick={() => setTheme("dark")}>
							<WeatherMoon16Regular/>
							<p>{t("DarkMode")}</p>
						</MenuItem>
					)
					: (
						<MenuItem className={mergeClasses(classes.dropdownMenuItem)} onClick={() => setTheme("light")}>
							<WeatherSunny16Regular/>
							<p>{t("LightMode")}</p>
						</MenuItem>
					)
				}
				<Divider className={mergeClasses(classes.dropdownMenuDivider)} />
				<MenuItem className={mergeClasses(classes.dropdownMenuItem)} onClick={onLogout}>
					<PersonArrowBack16Regular />
					<p>{t("Logout")}</p>
				</MenuItem>
			</MenuList>
		</div>
	);
};
