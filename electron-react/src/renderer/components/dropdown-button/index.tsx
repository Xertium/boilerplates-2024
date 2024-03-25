import { mergeClasses } from "@fluentui/react-components";
import { CaretDown16Filled } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { ribbonSidebarWidth } from "@/styles";
import { useLocalStyles } from "./styles";


interface IDropdownButtonDefaultProps {
	/** The class name to apply to the dropdown button */
	className?: string;
	/** Whether the dropdown button is disabled */
	disabled?: boolean;
	/** Whether to hide the caret */
	hideCaret?: boolean;
	/** The content of the dropdown */
	dropdownContent: React.ReactNode;
	/** The class name to apply to the dropdown content */
	dropdownContentClassName?: string;
}

export interface IDropdownButtonWithContentProps extends IDropdownButtonDefaultProps {
	/**
	 * Dropdown button's content. It's override the following properties:
	 * - icon
	 * - label
	 * - description
	 * - hideCaret
	 * */
	content: React.ReactNode;
	/** Exclude description property */
	description?: never;
	/** Exclude hideCaret property */
	hideCaret?: never;
	/** Exclude icon property */
	icon?: never;
	/** Exclude label property */
	label?: never;
}

export interface IDropdownButtonWithoutContentProps extends IDropdownButtonDefaultProps {
	/** Exclude content property */
	content?: never;
	/** The description of the dropdown button */
	description?: string;
	/** The icon of the dropdown button */
	icon: React.ReactNode;
	/** The label of the dropdown button */
	label: string;
}

/**
 * A button that opens a dropdown when clicked.
 * @param className The class name to apply to the dropdown button
 * @param content Dropdown button's content. It's override the following properties:
 * - icon
 * - label
 * - description
 * @param disabled Whether the dropdown button is disabled
 * @param description The description of the dropdown button
 * @param dropdownContent The content of the dropdown
 * @param dropdownContentClassName The class name to apply to the dropdown content
 * @param hideCaret Whether to hide the caret
 * @param icon The icon of the dropdown button
 * @param label The label of the dropdown button
 * @returns The dropdown button
 */
export const DropdownButton = ({
	className,
	content,
	disabled,
	description,
	dropdownContent,
	dropdownContentClassName,
	hideCaret,
	icon,
	label
}: IDropdownButtonWithContentProps | IDropdownButtonWithoutContentProps): React.ReactElement => {
	const classes = useLocalStyles();

	/** The state for the dropdown open status */
	const [stDropdownOpen, setDropdownOpen] = useState(false);
	/** The state for the class name */
	const [stClassName, setClassName] = useState([classes.dropdownButton, className]);
	/** The state for the left position of the dropdown content */
	const [stDropdownContentLeft, setDropdownContentLeft] = useState(0);

	/** The reference of the dropdown button */
	const rfDropdownButton = useRef<HTMLDivElement>(null);
	/**
	 * The mutation observer for the dropdown button.
	 * It will close the dropdown when the data-dropdown-close attribute is set to true.
	 */
	const rfMutationObserver = useRef<MutationObserver>(new MutationObserver((mutations) => {
		for (let mutation of mutations) {
			if (mutation.type === "attributes" && mutation.attributeName === "data-dropdown-close") {
				setDropdownOpen(false);
			}
		}
	}));

	/**
	 * Event handler for the dropdown button click.
	 * It opens or closes the dropdown and closes all other dropdowns when this one dropdown is opening.
	 */
	const onDrowdownButtonClick = (): void => {
		// If the dropdown is opening, close all other dropdowns
		if (!stDropdownOpen) {
			const dropdownButtons = document.querySelectorAll("[data-dropdown-open=\"true\"]");
			for (let i = 0; i < dropdownButtons.length; i++) {
				const dropdownButton = dropdownButtons[i] as HTMLElement;
				dropdownButton.setAttribute("data-dropdown-close", "true");
			}
		}
		setDropdownOpen(!stDropdownOpen);
	};

	/**
	 * Event handler for the dropdown content click.
	 * It prevents the dropdown from closing when the user clicks on the dropdown content.
	 * @param event The mouse event
	 */
	const onDropdownContentClick = (event: React.MouseEvent<HTMLDivElement>): void => {
		// Prevent the dropdown from closing when the user clicks on the dropdown content
		event.stopPropagation();
	};

	/**
	 * Effect for updating the class name when the dropdown properties change.
	 */
	useEffect(() => {
		const classNames = [classes.dropdownButton];
		if (className) {
			classNames.push(className);
		}
		if (disabled) {
			classNames.push(classes.dropdownButtonDisabled);
		}
		if (stDropdownOpen) {
			classNames.push(classes.dropdownButtonOpen);
		}
		setClassName(classNames);
	}, [className, disabled, stDropdownOpen]);

	/**
	 * Effect for updating the left position of the dropdown content when the dropdown open status changes.
	 */
	useEffect(() => {
		if (stDropdownOpen) {
			// Calculate the left position of the dropdown content
			const dropdownButton = rfDropdownButton.current;
			if (dropdownButton) {
				const dropdownButtonRect = dropdownButton.getBoundingClientRect();
				const left =
					dropdownButtonRect.left - parseInt(ribbonSidebarWidth.replace("px", "")) + dropdownButtonRect.width;
				setDropdownContentLeft(left);
			}
		}
	}, [stDropdownOpen]);

	/**
	 * Effect for observing the dropdown button.
	 */
	useEffect(() => {
		rfMutationObserver.current.observe(rfDropdownButton.current as Node, { attributes: true });
		return (): void => {
			rfMutationObserver.current.disconnect();
		};
	}, []);

	return (
		<>
			<div
				ref={rfDropdownButton}
				data-dropdown-open={stDropdownOpen}
				className={mergeClasses(...stClassName)}
				onClick={onDrowdownButtonClick}
			>
				{content
					? content
					: (
						<>
							{icon}
							<div className={mergeClasses(classes.dropdownButtonDescriptionContainer)}>
								<span className={mergeClasses(classes.dropdownButtonDescription)}>{description}</span>
								<span className={mergeClasses(classes.dropdownButtonLabel)}>{label}</span>
							</div>
							{hideCaret ? null : <CaretDown16Filled />}
						</>
					)
				}
			</div>
			{stDropdownOpen && (
				<div
					className={mergeClasses(classes.dropdownBackdrop)}
					onClick={onDrowdownButtonClick}
				>
					<div
						className={
							!dropdownContentClassName
								? mergeClasses(classes.dropdownContainer)
								: mergeClasses(classes.dropdownContainer, dropdownContentClassName)}
						style={{ left: stDropdownContentLeft }}
						onClick={onDropdownContentClick}
					>
						{dropdownContent}
					</div>
				</div>
			)}
		</>
	);
};
