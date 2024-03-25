import {
	createContext,
	useContext,
	useState,
	useEffect,
} from "react";
import { SpinnerWrapper } from "@/components";
import { LoginForm } from "./login";

/**
 * @todo This is only an account interface placeholder, replace with actual account interface
 * in `@/types` when implmeneting the login functionality.
 *
 * This cannot be done now because we don't know which way will be used
 * when implementing the login functionality
 * (eg. over IPC or HTTP request based on this will be a web or desktop app).
 *
 * ```
 * const ipcRenderer = window.electron.ipcRenderer;
 * // or
 * const axiosInstance = axios.create();
 * ```
 */
interface IAccount {
	nickname: string;
	name: string;
	avatar_url: string;
}

interface IAccountProvider {
	/** The children to render */
	children: React.ReactNode;
}

interface IAccountContext {
	/** Whether the user is logged in */
	isLoggedIn: boolean;
	/** The account of the user or null if not logged in */
	account: IAccount | null;
	/** Set the account and jwt */
	setAccount: (account: IAccount | null, jwt: string | null) => Promise<void>;
	/** Check if the account has the required permission */
	hasPermission: (permission: number, required: number) => boolean;
	/** Check if the account has one of the required permissions */
	hasOneOfPermissions: (permission: number, required: number[]) => boolean;
}

/** The context for the account */
const AccountContext = createContext<IAccountContext>({
	isLoggedIn: false,
	account: null,
	setAccount: () => Promise.resolve(),
	hasPermission: () => false,
	hasOneOfPermissions: () => false
});

/** Hook to use the account context */
export const useAccount = (): IAccountContext => useContext(AccountContext);

/** The provider for the account context */
export const AccountProvider: React.FunctionComponent<IAccountProvider> = ({ children }) => {
	const [stAccount, setAccount] = useState<IAccount | null>(null);
	const [stLoading, setLoading] = useState<boolean>(false);
	const [stLoggedIn, setLoggedIn] = useState<boolean>(false);

	/**
	 * Check if the account has the required permission
	 * @param permission The permission of the account
	 * @param required The required permission
	 * @returns Whether the account has the required permission
	 */
	const hasPermission = (permission: number, required: number): boolean => {
		return (permission & required) === required;
	};

	/**
	 * Check if the account has one of the required permissions
	 * @param permission The permission of the account
	 * @param required The required permissions
	 * @returns Whether the account has one of the required permissions
	 */
	const hasOneOfPermissions = (permission: number, required: number[]): boolean => {
		return required.some((r) => hasPermission(permission, r));
	};

	/**
	 * Event handler for account change.
	 * @param account The account to set
	 * @param jwt The jwt to set
	 */
	const onAccountChange = async (account: IAccount | null, jwt: string | null): Promise<void> => {
		/** Code goes here. */
	};

	/**
	 * Effect to set the account and jwt from local storage
	 * and trigger the login event
	 */
	useEffect(() => {
		const jwt = localStorage.getItem("jwt");
		const account = localStorage.getItem("account");
		onAccountChange(
			account ? JSON.parse(account) : null,
			jwt
		);
	}, []);

	return (
		<AccountContext.Provider
			value={{
				isLoggedIn: stLoggedIn,
				account: stAccount,
				setAccount: onAccountChange,
				hasPermission,
				hasOneOfPermissions,
			}}
		>
			<SpinnerWrapper isLoading={stLoading}>
				{!stLoggedIn ? (
					<LoginForm />
				) : (
					<>{children}</>
				)}
			</SpinnerWrapper>
		</AccountContext.Provider>
	);
};
