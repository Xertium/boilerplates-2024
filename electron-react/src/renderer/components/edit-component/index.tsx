export interface IEditComponentProps {
	/** If true, the edit component, otherwise the preview component will be rendered. */
	inEditMode: boolean;
	/** The edit component. */
	editComponent: React.ReactElement;
	/** The preview component. */
	previewComponent: React.ReactElement;
}

/**
 * A component that renders the edit or preview component based on the inEditMode prop.
 */
export const EditComponent = ({
	inEditMode,
	editComponent,
	previewComponent
}: IEditComponentProps): React.ReactElement => {
	return inEditMode ? editComponent : previewComponent;
};
