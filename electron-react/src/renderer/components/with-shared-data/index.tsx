import {
	createContext,
	useContext,
	useEffect,
	useState
} from "react";
import ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";
import { ERoute } from "@/pages";
import { useUiView } from "@/providers/ui-view";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SharedDataContext = createContext<any>({} as any);

type SharedDataProviderProps<T> = {
	/** The children to render. */
	children: React.ReactNode;
	/** The initial data to set. */
	initialData: T;
};

/**
 * A hook that returns the shared data and its setter.
 */
export const useSharedData = <T,>(): {
	sharedData: T;
	setSharedData: React.Dispatch<React.SetStateAction<T>>;
} => {
	const context = useContext<T>(SharedDataContext);
	if (context === undefined) {
		throw new Error("useSharedData must be used within a SharedDataProvider");
	}
	return context as {
		sharedData: T;
		setSharedData: React.Dispatch<React.SetStateAction<T>>;
	};
};

/**
 * A provider that provides a shared data and its setter.
 * @param children The children to render.
 * @param initialData The initial data to set.
 */
const SharedDataProvider = <T,>(
	{ children, initialData }: SharedDataProviderProps<T>
): React.ReactElement => {
	const [stSharedData, setSharedData] = useState(initialData);

	return (
		<SharedDataContext.Provider
			value={{
				sharedData: stSharedData,
				setSharedData,
			}}
		>
			{children}
		</SharedDataContext.Provider>
	);
};


/**
 * It's a HOC that wraps a component with the withSharedData HOC.
 * This will be used to wrap the pages to automatically set the ui-view's elements.
 * @param Content The component to wrap.
 * @param Sidebar The sidebar component to render.
 * @param Actionbar The actionbar component to render.
 */
export const withSharedData = <T extends {}, TSharedData>(
	Content: React.ComponentType<T>,
	Sidebar: React.ComponentType,
	Actionbar?: React.ComponentType,
): React.FunctionComponent<T> => {
	return function WithSharedData(props) {
		const { actionbar, sidebar, setView } = useUiView();
		const location = useLocation();

		useEffect(() => {
			setView(location.pathname as ERoute);
		}, [location.pathname]);

		return (
			<SharedDataProvider initialData={{} as TSharedData} >
				{actionbar && Actionbar && ReactDOM.createPortal(
					<Actionbar />,
					actionbar as Element,
				)}
				{sidebar && ReactDOM.createPortal(
					<Sidebar />,
					sidebar as Element,
				)}
				<Content {...props} />
			</SharedDataProvider>
		);
	};
};
