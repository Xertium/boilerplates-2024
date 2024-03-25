import { Input, mergeClasses } from "@fluentui/react-components";
import { useEffect, useRef, useState } from "react";
import { useLocalStyles } from "./styles";

interface ICodeInputProps {
	/** If true, the input will be focused when mounted. */
	autoFocus?: boolean;
	/** The length of the code. */
	length: number;
	/** The value of the code. */
	value: string;
	/** The onChange event for the code. */
	onChange: (code: string) => void;
}

/**
 * It's a simple input component which is used to input a code.
 * Code means "PIN" or "OTP" etc.
 */
export const CodeInput = (props: ICodeInputProps): React.ReactElement => {
	const { autoFocus, length, value, onChange } = props;
	const classes = useLocalStyles();

	/** State for storing the code. */
	const [stCode, setCode] = useState<string[]>(
		Array.from({ length }, (_, index) => value[index] || "")
	);

	/** Reference of the parent element. */
	const rfParent = useRef<HTMLDivElement>(null);

	/**
	 * Event handler for the code change.
	 * It calls the onChange event.
	 */
	const onCodeChange = (): void => {
		const newCode = [...stCode];
		onChange(newCode.join(""));
	};

	/**
	 * Event handler for the key down event of the code input.
	 * It handles the "Backspace" and "Ctrl+V" keys.
	 * @param evt The keyboard event.
	 * @param index The index of the input.
	 */
	const onCodeKeyDown = async (evt: React.KeyboardEvent<HTMLInputElement>, index: number): Promise<void> => {
		if (evt.key === "v" && (evt.ctrlKey || evt.metaKey)) {
			const clipboard = await navigator.clipboard.readText().then((text) => text);
			if (clipboard.length === length && !isNaN(parseInt(clipboard))) {
				const newCode = clipboard.split("");
				setCode(newCode);
				onChange(newCode.join(""));
				// Focus last input
				const inputs = rfParent.current!.getElementsByTagName("input");
				const input = inputs[length - 1] as HTMLInputElement;
				input?.focus();
			}
		} else if (evt.key === "Backspace") {
			const newCode = [...stCode];
			newCode[index] = "";
			setCode(newCode);
			onChange(newCode.join(""));
			// Focus the previous input
			const inputs = rfParent.current!.getElementsByTagName("input");
			const input = inputs[index - 1] as HTMLInputElement;
			input?.focus();
		} else if (evt.key !== "Backspace") {
			// If the key is not a valid number, ignore it
			if (isNaN(parseInt(evt.key))) {
				return;
			}
			const newCode = [...stCode];
			newCode[index] = evt.key;
			setCode(newCode);
			onChange(newCode.join(""));
			// Focus the next input in rfParent
			const inputs = rfParent.current!.getElementsByTagName("input");
			const input = inputs[index + 1] as HTMLInputElement;
			input?.focus();
		}
	};

	/** Effect for focusing the first input when the component is mounted. */
	useEffect(() => {
		if (autoFocus) {
			const inputs = rfParent.current!.getElementsByTagName("input");
			const input = inputs[0] as HTMLInputElement;
			input?.focus();
		}
	}, []);

	/** Inputs fields for the characters of the code. */
	const inputs = Array.from({ length }, (_, index) => (
		<Input
			key={index}
			className={classes.codeInput}
			type="text"
			maxLength={1}
			value={stCode[index]}
			onChange={onCodeChange}
			onKeyDown={(e) => onCodeKeyDown(e, index)}
		/>
	));

	return <div className={mergeClasses(classes.root)} ref={rfParent}>{inputs}</div>;
};
