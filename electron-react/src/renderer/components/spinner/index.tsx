import { Spinner, SpinnerProps } from "@fluentui/react-components";

interface ISpinnerWrapperProps {
	/** The children of the spinner. */
	children: React.ReactNode;
	/** Whether to show the spinner. */
	isLoading: boolean;
	/** Additional props for the spinner. */
	spinnerProps?: Partial<SpinnerProps>;
}

/**
 * A component that wraps the children with a spinner.
 * If isLoading is true, the spinner will be shown, otherwise the children.
 */
export const SpinnerWrapper = ({ children, isLoading, spinnerProps }: ISpinnerWrapperProps): React.ReactElement => {
	return isLoading ? (
		<Spinner {...spinnerProps} />
	) : (
		<>{children}</>
	);
};
