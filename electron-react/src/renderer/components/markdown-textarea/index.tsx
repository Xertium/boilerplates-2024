import {
	Button,
	Divider,
	SelectTabData,
	SelectTabEvent,
	Tab,
	TabList,
	TabValue,
	Textarea,
	TextareaOnChangeData,
	TextareaProps,
	mergeClasses,
} from "@fluentui/react-components";
import {
	AppsList24Regular,
	Code24Regular,
	Link24Regular,
	TextBold24Filled,
	TextHeader124Filled,
	TextItalic24Regular,
	TooltipQuote24Regular,
	TaskListLtr24Regular,
	TextNumberListLtr24Regular
} from "@fluentui/react-icons";
import { MarkdownPreview } from "@/components";
import {
	ChangeEvent,
	KeyboardEvent,
	useRef,
	useState
} from "react";
import { useTheme } from "@/providers";
import { useLocalStyles } from "./styles";

interface IMarkdownTextareaProps extends TextareaProps {
	/** The selected tab of the component. */
	selectedTab?: TabValue;
	/** The height of the component. */
	height?: string | number;
	/** The label of the textarea. */
	textareaLabel: string;
	/** The label of the preview. */
	previewLabel: string;
}

/**
 * Enum for the textarea insert.
 */
enum ETextareaInsert {
	HEADING = "### ",
	BOLD = "**",
	ITALIC = "_",
	QUOTE = "> ",
	LINK = "[](url)",
	CODE = "```",
	APPS_LIST = "- ",
	NUMBER_LIST = "1. ",
	TASK_LIST = "- [ ]",
}

/**
 * Textarea with markdown preview.
 * @param props Textarea props
 * @returns React.ReactElement
 */
export const MarkdownTextarea = (
	props: IMarkdownTextareaProps
): React.ReactElement => {
	const { selectedTab, height, textareaLabel, previewLabel, onChange, onKeyDown } = props;
	const classes = useLocalStyles();
	const [stSelectedTab, setSelectedTab] = useState<TabValue>(selectedTab || "textarea");
	const { theme } = useTheme();

	const rfPanel = useRef<HTMLDivElement>(null);

	/**
	 * Check if the line is an app list element.
	 * @param line Line to check
	 * @returns false | number False if it's not an app list element, otherwise the index of the element.
	 */
	const isAppListElement = (line: string): false | number => {
		if (
			line.trimStart().startsWith(ETextareaInsert.APPS_LIST) &&
			(!line.trimStart().startsWith(ETextareaInsert.TASK_LIST) && !line.trimStart().startsWith("- [x]"))
		) {
			return line.indexOf(ETextareaInsert.APPS_LIST);
		}
		return false;
	};

	/**
	 * Check if the line is a number list element.
	 * @param line Line to check
	 * @returns false | { index: number, nextVal: number } False if it's not a number list element,
	 * otherwise the index of the element and the next value.
	 */
	const isNumberListElement = (line: string): false | { index: number, nextVal: number } => {
		const trimmed = line.trimStart();
		if (trimmed.match(/^\d+\./)) {
			return {
				index: line.indexOf(trimmed),
				nextVal: parseInt(trimmed.split(".")[0]) + 1,
			};
		}
		return false;
	};

	/**
	 * Check if the line is a task list element.
	 * @param line Line to check
	 * @returns false | number False if it's not a task list element, otherwise the index of the element.
	 */
	const isTaskListElement = (line: string): false | number => {
		if (line.trimStart().startsWith(ETextareaInsert.TASK_LIST) || line.trimStart().startsWith("- [x]")){
			return line.indexOf(ETextareaInsert.TASK_LIST);
		}
		return false;
	};

	/**
	 * Event handler for the tab select event.
	 * @param _evt The select tab event.
	 * @param data The select tab data.
	 */
	const onTabSelect = (_evt: SelectTabEvent, data: SelectTabData): void => {
		setSelectedTab(data.value);
	};

	/**
	 * Event handler for the key down event of the textarea.
	 * It handles what to do when the user presses the "Enter" key.
	 * It also calls the original onKeyDown event and the onChange event.
	 * @param evt The keyboard event.
	 */
	const onPreKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		if (evt.key === "Enter") {
			const lines = textarea.value.split("\n");
			const cursorPosition = textarea.selectionStart;
			const lineIndex = textarea.value.substring(0, cursorPosition).split("\n").length - 1;
			const currentLine = lines[lineIndex];
			const isAppListEl = isAppListElement(currentLine);
			const isNumberListEl = isNumberListElement(currentLine);
			const isTaskListEl = isTaskListElement(currentLine);
			if (isAppListEl !== false) {
				// Add a new line with the same indentation.
				evt.preventDefault();
				const newLine = `${" ".repeat(isAppListEl)}${ETextareaInsert.APPS_LIST}`;
				textarea.value = `${
					textarea.value.substring(0, cursorPosition)
				}\n${newLine}${
					textarea.value.substring(cursorPosition)
				}`;
			} else if (isNumberListEl !== false) {
				// Add a new line with the same indentation.
				evt.preventDefault();
				const newLine = `${" ".repeat(isNumberListEl.index)}${isNumberListEl.nextVal}. `;
				textarea.value = `${
					textarea.value.substring(0, cursorPosition)
				}\n${newLine}${
					textarea.value.substring(cursorPosition)
				}`;
			} else if (isTaskListEl !== false) {
				// Add a new line with the same indentation.
				evt.preventDefault();
				const newLine = `${" ".repeat(isTaskListEl)}${ETextareaInsert.TASK_LIST}`;
				textarea.value = `${
					textarea.value.substring(0, cursorPosition)
				}\n${newLine} ${
					textarea.value.substring(cursorPosition)
				}`;
			}
		}

		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}

		if (onKeyDown) {
			onKeyDown(evt);
		}
	};

	/**
	 * Event handler for the change event of the textarea.
	 * It calls the original onChange event.
	 * @param evt The change event.
	 * @param data The change data.
	 */
	const onPreChange = (evt: ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData): void => {
		// If there is something to do with the change event before we pass it to the original onChange event.
		// Comes here...
		if (onChange) {
			onChange(evt, data);
		}
	};

	/**
	 * Event handler for the heading click.
	 * It adds a heading mark to the textarea.
	 */
	const onHeadingClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		const cursorPosition = textarea.selectionStart;
		textarea.value = `${
			textarea.value.substring(0, cursorPosition)
		}${ETextareaInsert.HEADING}${
			textarea.value.substring(cursorPosition)
		}`;
		textarea.focus();
		textarea.setSelectionRange(cursorPosition + 4, cursorPosition + 4);
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the bold click.
	 * It adds bold mark to the textarea.
	 */
	const onBoldClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		if (textarea.selectionStart === textarea.selectionEnd) {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.BOLD}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
		} else {
			const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.BOLD}${selectedText}${ETextareaInsert.BOLD}${
				textarea.value.substring(textarea.selectionEnd)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2 + selectedText.length);
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the italic click.
	 * It adds italic mark to the textarea.
	 */
	const onItalicClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		if (textarea.selectionStart === textarea.selectionEnd) {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.ITALIC}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
		} else {
			const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.ITALIC}${selectedText}${ETextareaInsert.ITALIC}${
				textarea.value.substring(textarea.selectionEnd)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1 + selectedText.length);
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the quote click.
	 * It adds quote mark to the textarea.
	 */
	const onQuoteClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		if (
			(textarea.selectionStart === 0 && textarea.selectionEnd === 0) ||
			(textarea.selectionStart === 0 && textarea.selectionEnd > 0)
		) {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.QUOTE}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
		} else if (textarea.selectionStart > 0 && textarea.selectionEnd > 0) {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}\n${ETextareaInsert.QUOTE}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the link click.
	 * It adds link mark to the textarea.
	 */
	const onLinkClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		if (textarea.selectionStart !== textarea.selectionEnd) {
			const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.LINK.replace("[]", `[${selectedText}]`)}${
				textarea.value.substring(textarea.selectionEnd)
			}`;
			textarea.focus();
			textarea.setSelectionRange(
				cursorPosition + selectedText.length + 3,
				cursorPosition + selectedText.length + 6
			);
		} else {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.LINK}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the code click.
	 * It adds code mark to the textarea.
	 */
	const onCodeClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		// If there is a selection, wrap it with code tags.
		if (textarea.selectionStart !== textarea.selectionEnd) {
			const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.CODE}\n${selectedText}\n${ETextareaInsert.CODE}${
				textarea.value.substring(textarea.selectionEnd)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 3, cursorPosition + 3 + selectedText.length);
		} else {
			const cursorPosition = textarea.selectionStart;
			textarea.value = `${
				textarea.value.substring(0, cursorPosition)
			}${ETextareaInsert.CODE}\n${ETextareaInsert.CODE}${
				textarea.value.substring(cursorPosition)
			}`;
			textarea.focus();
			textarea.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
		}

		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the app list click.
	 * It adds app list mark to the textarea.
	 */
	const onAppListClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		// If there is a app list element, remove it.
		const cursorPosition = textarea.selectionStart;
		const lineIndex = textarea.value.substring(0, cursorPosition).split("\n").length - 1;
		const currentLine = textarea.value.split("\n")[lineIndex];
		const isAppListEl = isAppListElement(currentLine);
		const lines = textarea.value.split("\n");
		const selectionBefore = {
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		};
		if (isAppListEl !== false) {
			lines[lineIndex] = lines[lineIndex].replace(ETextareaInsert.APPS_LIST, "");
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start - ETextareaInsert.APPS_LIST.length,
					selectionBefore.end - ETextareaInsert.APPS_LIST.length
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition - ETextareaInsert.APPS_LIST.length,
					cursorPosition - ETextareaInsert.APPS_LIST.length
				);
			}
		} else {
			lines[lineIndex] = `${ETextareaInsert.APPS_LIST}${lines[lineIndex]}`;
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start + ETextareaInsert.APPS_LIST.length,
					selectionBefore.end + ETextareaInsert.APPS_LIST.length
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition + ETextareaInsert.APPS_LIST.length,
					cursorPosition + ETextareaInsert.APPS_LIST.length
				);
			}
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the number list click.
	 * It adds number list mark to the textarea.
	 */
	const onNumberListClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		// If there is a app list element, remove it.
		const cursorPosition = textarea.selectionStart;
		const lineIndex = textarea.value.substring(0, cursorPosition).split("\n").length - 1;
		const currentLine = textarea.value.split("\n")[lineIndex];
		const isNumberListEl = isNumberListElement(currentLine);
		const lines = textarea.value.split("\n");
		const selectionBefore = {
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		};
		if (isNumberListEl !== false) {
			lines[lineIndex] = lines[lineIndex].replace(/^\d+\./, "");
			if (lines[lineIndex].startsWith(" ")) {
				lines[lineIndex] = lines[lineIndex].substring(1);
			}
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start - ETextareaInsert.NUMBER_LIST.length,
					selectionBefore.end - ETextareaInsert.NUMBER_LIST.length
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition - ETextareaInsert.NUMBER_LIST.length,
					cursorPosition - ETextareaInsert.NUMBER_LIST.length
				);
			}
		} else {
			lines[lineIndex] = `${ETextareaInsert.NUMBER_LIST}${lines[lineIndex]}`;
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start + ETextareaInsert.NUMBER_LIST.length,
					selectionBefore.end + ETextareaInsert.NUMBER_LIST.length
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition + ETextareaInsert.NUMBER_LIST.length,
					cursorPosition + ETextareaInsert.NUMBER_LIST.length
				);
			}
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	/**
	 * Event handler for the task list click.
	 * It adds task list mark to the textarea.
	 */
	const onTaskListClick = (): void => {
		const textarea = rfPanel.current?.querySelector("textarea");
		if (!textarea) {
			return;
		}
		// If there is a app list element, remove it.
		const cursorPosition = textarea.selectionStart;
		const lineIndex = textarea.value.substring(0, cursorPosition).split("\n").length - 1;
		const currentLine = textarea.value.split("\n")[lineIndex];
		const isTaskListEl = isTaskListElement(currentLine);
		const lines = textarea.value.split("\n");
		const selectionBefore = {
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		};
		let length = ETextareaInsert.TASK_LIST.length;
		if (isTaskListEl !== false) {
			if (lines[lineIndex].startsWith(ETextareaInsert.TASK_LIST)) {
				lines[lineIndex] = lines[lineIndex].replace(ETextareaInsert.TASK_LIST, "");
			} else if (lines[lineIndex].startsWith("- [x]")) {
				lines[lineIndex] = lines[lineIndex].replace("- [x]", "");
			}
			if (lines[lineIndex].startsWith(" ")) {
				lines[lineIndex] = lines[lineIndex].substring(1);
				length += 1;
			}
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start - length,
					selectionBefore.end - length
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition - length,
					cursorPosition - length
				);
			}
		} else {
			lines[lineIndex] = `${ETextareaInsert.TASK_LIST} ${lines[lineIndex]}`;
			textarea.value = lines.join("\n");
			textarea.focus();
			if (selectionBefore.start !== selectionBefore.end) {
				textarea.setSelectionRange(
					selectionBefore.start + ETextareaInsert.TASK_LIST.length + 1,
					selectionBefore.end + ETextareaInsert.TASK_LIST.length + 1
				);
			} else {
				textarea.setSelectionRange(
					cursorPosition + ETextareaInsert.TASK_LIST.length + 1,
					cursorPosition + ETextareaInsert.TASK_LIST.length + 1
				);
			}
		}
		if (onChange) {
			onChange({ target: textarea } as ChangeEvent<HTMLTextAreaElement>, { value: textarea.value });
		}
	};

	return (
		<div
			className={mergeClasses(classes.root)}
			style={{ height: height ?? "auto" }}
		>
			<div className={mergeClasses(classes.header)}>
				<TabList
					className={mergeClasses(classes.tablist)}
					selectedValue={stSelectedTab}
					onTabSelect={onTabSelect}
				>
					<Tab value="textarea">{textareaLabel}</Tab>
					<Tab value="preview">{previewLabel}</Tab>
				</TabList>
				<div className={mergeClasses(classes.buttonList)}>
					{stSelectedTab === "textarea" && (
						<>
							<Button icon={<TextHeader124Filled />} onClick={onHeadingClick}/>
							<Button icon={<TextBold24Filled />} onClick={onBoldClick}/>
							<Button icon={<TextItalic24Regular />} onClick={onItalicClick}/>
							<Button icon={<TooltipQuote24Regular />} onClick={onQuoteClick}/>
							<Divider inset vertical />
							<Button icon={<Link24Regular />} onClick={onLinkClick}/>
							<Button icon={<Code24Regular />} onClick={onCodeClick}/>
							<Divider inset vertical />
							<Button icon={<AppsList24Regular />} onClick={onAppListClick}/>
							<Button icon={<TextNumberListLtr24Regular />} onClick={onNumberListClick}/>
							<Button icon={<TaskListLtr24Regular />} onClick={onTaskListClick}/>
						</>
					)}
				</div>
			</div>
			<div
				ref={rfPanel}
				className={
					stSelectedTab === "textarea"
						? mergeClasses(classes.panel, classes.panelWithTextarea)
						: mergeClasses(classes.panel)
				}
			>
				{stSelectedTab === "textarea" && (
					<Textarea
						{...props}
						className={mergeClasses(classes.textarea)}
						onKeyDown={onPreKeyDown}
						onChange={onPreChange}
					/>
				)}
				{stSelectedTab === "preview" && (
					<MarkdownPreview source={props.value} />
				)}
			</div>
		</div>
	);
};
