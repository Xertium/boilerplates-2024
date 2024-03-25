import { createContext, useContext, useState } from "react";
import { ERoute } from "@/pages";
import { Ribbon } from "./ribbon";

interface IUiViewProvider {
	children: React.ReactNode;
}

interface IUiViewContext {
	actionbar: HTMLDivElement | null;
	sidebar: HTMLDivElement | null;
	setView: (view: ERoute) => void;
}

const UiViewContext = createContext<IUiViewContext>({
	actionbar: null,
	sidebar: null,
	setView: () => {},
});

export const useUiView = (): IUiViewContext => useContext(UiViewContext);

export const UiViewProvider: React.FunctionComponent<IUiViewProvider> = ({ children }) => {
	const [stActionbarRef, setActionbarRef] = useState<HTMLDivElement | null>(null);
	const [stSidebarRef, setSidebarRef] = useState<HTMLDivElement | null>(null);
	const [stView, setView] = useState<ERoute>(ERoute.Home);

	return (
		<UiViewContext.Provider
			value={{
				actionbar: stActionbarRef,
				sidebar: stSidebarRef,
				setView,
			}}
		>
			<Ribbon
				sidebarRef={setSidebarRef}
				actionbarRef={setActionbarRef}
			>
				{children}
			</Ribbon>
		</UiViewContext.Provider>
	);
};
