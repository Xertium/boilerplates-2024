import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogTitle,
	DialogBody,
	DialogActions,
	DialogContent,
	Button,
} from "@fluentui/react-components";
import { IDialogComponentProps } from "@/providers";

/**
 * A simple dialog component.
 * @param title The title of the dialog.
 * @param content The content of the dialog.
 * @param cancelText The text of the cancel button.
 * @param confirmText The text of the confirm button.
 * @param onHandleReturn The event handler for the return button.
 * @param onHandleCancel The event handler for the cancel button.
 */
export const SimpleDialog: React.FC<IDialogComponentProps<true, false>> = ({
	title,
	content,
	cancelText,
	confirmText,
	onHandleReturn,
	onHandleCancel,
}) => {
	/** State for storing the open state of the dialog. */
	const [stOpen, setOpen] = useState(true);

	/** Event handler for the return button. */
	const handleReturn = (): void => {
		setOpen(false);
		onHandleReturn?.(true);
	};

	/** Event handler for the cancel button. */
	const handleCancel = (): void => {
		setOpen(false);
		onHandleCancel?.(false);
	};

	return (
		<Dialog open={stOpen}>
			<DialogSurface>
				<DialogBody>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>
						{typeof content === "string" ? <p>{content}</p> : content}
					</DialogContent>
					<DialogActions>
						<DialogTrigger disableButtonEnhancement>
							<Button appearance="secondary" onClick={handleCancel}>{cancelText || "Cancel"}</Button>
						</DialogTrigger>
						<Button appearance="primary" onClick={handleReturn}>{confirmText || "OK"}</Button>
					</DialogActions>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
};
