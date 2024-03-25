import md5 from "md5";
import {
	createContext,
	useContext,
	useEffect,
	useState
} from "react";
import {
	FluentProvider,
	Theme,
	webDarkTheme,
	webLightTheme
} from "@fluentui/react-components";

interface IThemeProvider {
	/** The children components. */
	children: React.ReactNode;
}

interface IThemeContext {
	/** The theme. */
	theme: "light" | "dark";
	/** The function to set the theme. */
	setTheme: (theme: "light" | "dark") => void;
}

/** The theme context. */
const ThemeContext = createContext<IThemeContext>({
	theme: "light",
	setTheme: () => {}
});

/** The useTheme hook. */
export const useTheme = (): IThemeContext => useContext(ThemeContext);

/** Store the hash of the light theme. It will be used to compare the current theme. */
const lightThemeHash = md5(JSON.stringify(webLightTheme));

/** The theme provider component. */
export const ThemeProvider: React.FunctionComponent<IThemeProvider> = ({ children }) => {
	/** State for storing the theme. */
	const [stTheme, setTheme] = useState<Theme>(webLightTheme);
	/** State for storing the theme hash. */
	const [stThemeHash, setThemeHash] = useState<string>(md5(JSON.stringify(stTheme)));

	/**
	 * Function to change the theme.
	 * @param theme The theme to change to.
	 */
	const changeTheme = (theme: "light" | "dark"): void => {
		if (theme === "dark") {
			setTheme(webDarkTheme);
			document.body.setAttribute("data-theme", "dark");
		} else if (theme === "light") {
			setTheme(webLightTheme);
			document.body.setAttribute("data-theme", "light");
		}
	};

	/** Effect to update the theme hash. */
	useEffect(() => {
		setThemeHash(md5(JSON.stringify(stTheme)));
	}, [stTheme]);

	/** Effect to set the theme based on the system preference. */
	useEffect(() => {
		const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
		if (prefersDarkMode) {
			document.body.setAttribute("data-theme", "dark");
			setTheme(webDarkTheme);
		} else {
			document.body.setAttribute("data-theme", "light");
		}
	}, []);

	return (
		<ThemeContext.Provider
			value={{
				theme: stThemeHash === lightThemeHash ? "light" : "dark",
				setTheme: changeTheme,
			}}
		>
			<FluentProvider theme={stTheme}>
				{children}
			</FluentProvider>
		</ThemeContext.Provider>
	);
};
