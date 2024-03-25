// eslint-disable-next-line import-newlines/enforce
import {
	default as ReactMarkdownPreview,
	MarkdownPreviewProps,
} from "@uiw/react-markdown-preview";
import { useLocalStyles } from "./styles";
import { mergeClasses } from "@fluentui/react-components";

export interface IMarkdownPreviewProps extends MarkdownPreviewProps {
	/**
	 * This will be added to original ReactMarkdownPreview wrapperElement "data-color-mode" attribute.
	 */
	theme?: "light" | "dark";
}

/**
 * A component that renders the markdown preview.
 */
export const MarkdownPreview = (props: IMarkdownPreviewProps): React.ReactElement => {
	const { className, theme, wrapperElement } = props;
	const classes = useLocalStyles();
	return (
		<ReactMarkdownPreview
			{...props}
			className={mergeClasses(classes.preview, className)}
			wrapperElement={wrapperElement || { "data-color-mode": theme}}
		/>
	);
};
