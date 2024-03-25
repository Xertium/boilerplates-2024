/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from "react";

interface IDialogProviderProps {
	/** The children components. */
	children: React.ReactNode;
}

export interface IDialogComponentProps<
	IDialogComponentReturn,
	IDialogComponentCancel
> {
	/** The dialog ID. */
	id: string;
	/** The event handler for the return button. */
	onHandleReturn?: (data: IDialogComponentReturn) => void;
	/** The event handler for the cancel button. */
	onHandleCancel?: (data: IDialogComponentCancel) => void;
	/** The rest of the props. */
	[key: string]: any;
}

interface IDialogProps<IDialogComponentReturn, IDialogComponentCancel> {
	/** The dialog component. */
	component: React.FC<IDialogComponentProps<IDialogComponentReturn, IDialogComponentCancel>>;
	/** The dialog props. */
	props: IDialogComponentProps<IDialogComponentReturn, IDialogComponentCancel>;
	/** The dialog promise. */
	promise?: {
		resolve: (value: IDialogComponentReturn) => void;
		reject: (value: IDialogComponentCancel) => void;
	};
}

/** The open dialog function. */
type TOpenDialog = <TReturn, TCancel>(dialog: IDialogProps<TReturn, TCancel>) => Promise<TReturn | TCancel>

interface IDialogContext<TReturn, TResult> {
	/** The dialog stack. */
	dialogStack: IDialogProps<TReturn, TResult>[];
	/** The open dialog function. */
	openDialog: TOpenDialog;
	/** The close dialog function. */
	closeDialog: (id: string) => void;
}

/** The dialog context. */
const DialogContext = createContext<IDialogContext<any, any>>({
	dialogStack: [],
	openDialog: () => Promise.resolve(),
	closeDialog: () => {},
} as {
	dialogStack: IDialogProps<any, any>[];
	openDialog: TOpenDialog;
	closeDialog: (id: string) => void;
});

/** The useDialog hook. */
export const useDialog = (): IDialogContext<any, any> => useContext(DialogContext);

/** The dialog provider component. */
export const DialogProvider: React.FunctionComponent<IDialogProviderProps> = ({ children }) => {
	const [stDialogStack, setDialogStack] = useState<IDialogProps<any, any>[]>(
		[]
	);

	/**
	 * The open dialog function.
	 * @param dialog The dialog props.
	 * @returns The promise for the dialog.
	 */
	const openDialog = <TReturn, TCancel>(dialog: IDialogProps<TReturn, TCancel>): Promise<TReturn | TCancel> => {
		const promise = new Promise<TReturn | TCancel>((resolve, reject) => {
			dialog.promise = {
				resolve,
				reject,
			};
		});

		setDialogStack([...stDialogStack, dialog]);
		return promise;
	};

	/**
	 * The close dialog function.
	 * @param id The dialog ID.
	 */
	const closeDialog = (id: string): void => {
		setDialogStack(stDialogStack.filter((dialog) => dialog.props.id !== id));
	};

	/**
	 * The event handler for the return button.
	 * @param id The dialog ID.
	 * @param data The return data.
	 */
	const onHandleReturn = (id: string, data: any): void => {
		const dialog = stDialogStack.find((dialog) => dialog.props.id === id);
		if (dialog) {
			(dialog.promise as any).resolve(data);
			closeDialog(id);
		}
	};

	/**
	 * The event handler for the cancel button.
	 * @param id The dialog ID.
	 * @param data The cancel data.
	 */
	const onHandleCancel = (id: string, data: any): void => {
		const dialog = stDialogStack.find((dialog) => dialog.props.id === id);
		if (dialog) {
			(dialog.promise as any).resolve(data);
			closeDialog(id);
		}
	};

	return (
		<DialogContext.Provider
			value={{
				dialogStack: stDialogStack,
				openDialog,
				closeDialog,
			}}
		>
			{stDialogStack.map((dialog) => {
				const DialogComponent = dialog.component;
				return (
					<DialogComponent
						key={dialog.props.id}
						{...dialog.props}
						onHandleReturn={(data) => onHandleReturn(dialog.props.id, data)}
						onHandleCancel={(data) => onHandleCancel(dialog.props.id, data)}
					/>
				);
			})}
			{children}
		</DialogContext.Provider>
	);
};
