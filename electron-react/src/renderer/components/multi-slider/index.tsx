import { mergeClasses } from "@fluentui/react-components";
import { useEffect, useRef, useState } from "react";
import { useLocalStyles } from "./styles";

interface IMultiSliderProps {
	/**
	 * The class name to apply to the root element.
	 */
	className?: string;
	/**
	 * The default value of the slider. If not provided, it will be [0, 100].
	 */
	defaultValue?: number[];
	/** If true, the slider will be disabled. */
	disabled?: boolean;
	/**
	 * If true, the slider trail's color will be inverted.
	 */
	inverted?: boolean;
	/** The minimum value of the slider. Default is 0. */
	min?: number;
	/** The maximum value of the slider. Default is 100. */
	max?: number;
	/** The ref to the input element. */
	ref?: React.RefObject<HTMLInputElement>;
	/** The thickness of the slider. Default is "thin". */
	size?: "thick" | "thin";
	/** The step value of the slider. Default is 1. */
	step?: number;
	/** The value of the slider. */
	value?: number[];
	/** The callback to call when the value changes. */
	onChange?: (value: number[]) => void;
}

/** Available dragging states of the slider which provides information about which thumb is dragging. */
type TDraggingState = "bottom" | "top" | false;

/** The local styles for the multi slider component. */
export const MultiSlider = ({
	className,
	defaultValue = [0, 100],
	disabled = false,
	inverted = false,
	min = 0,
	max = 100,
	ref,
	size = "thin",
	step = 1,
	value,
	onChange
}: IMultiSliderProps): React.ReactElement => {
	const classes = useLocalStyles();

	const [stValue, setValue] = useState<number[]>(value || defaultValue);
	const [stDragging, setDragging] = useState<TDraggingState>(false);

	const rfRoot = useRef<HTMLInputElement>(null);
	/** Prevents the slider from updating the value when dragging with this ref */
	const rfValue = useRef<number[]>(stValue);

	/**
	 * The onMouseDown event handler for the slider.
	 * @param evt The mouse down event.
	 */
	const onMouseDown = (evt: React.MouseEvent<HTMLDivElement>): void => {
		if (disabled) return;
		const bottomThumb = rfRoot.current!.querySelector("[data-thumb='bottom']") as HTMLDivElement;
		const topThumb = rfRoot.current!.querySelector("[data-thumb='top']") as HTMLDivElement;
		const bottomRect = bottomThumb.getBoundingClientRect();
		const topRect = topThumb.getBoundingClientRect();
		const bottomDistance = Math.abs(evt.clientX - bottomRect.left);
		const topDistance = Math.abs(evt.clientX - topRect.left);
		const cursorPosition = evt.clientX;
		const thumbPosition = bottomRect.left;
		const thumb = bottomDistance === topDistance
			? (cursorPosition < thumbPosition ? bottomThumb : topThumb)
			: (bottomDistance < topDistance ? bottomThumb : topThumb);

		if (thumb.dataset.thumb) {
			calculatePositions(evt.nativeEvent as MouseEvent, thumb.dataset.thumb as TDraggingState);
			setDragging(thumb.dataset.thumb as TDraggingState);
		}
	};

	/** The onMouseUp event handler for the slider. It sets the dragging state to false. */
	const onMouseUp = (): void => {
		setDragging(false);
	};

	/**
	 * The onMouseMove event handler for the slider. It calculates the new value of the slider.
	 * @param evt The mouse move event.
	 */
	const onMouseMove = (evt: MouseEvent): void => {
		if (stDragging) {
			calculatePositions(evt, stDragging);
		}
	};

	/**
	 * The calculatePositions function calculates the new value of the slider
	 * based on the mouse event and the dragging state.
	 * @param evt The mouse event.
	 * @param draggingState The dragging state of the slider.
	 */
	const calculatePositions = (evt: MouseEvent, draggingState: TDraggingState): void => {
		const rootRect = rfRoot.current!.getBoundingClientRect();
		const newValue = Math.round(((evt.clientX - rootRect.left) / rootRect.width) * (max - min));
		const newValueClamped = Math.min(max, Math.max(min, newValue));
		const newStValue = [...stValue];
		newStValue[draggingState === "bottom" ? 0 : 1] = newValueClamped;
		if (step) {
			newStValue[0] = Math.round(newStValue[0] / step) * step;
			newStValue[1] = Math.round(newStValue[1] / step) * step;
		}
		if (draggingState === "top" && newStValue[1] < newStValue[0]) {
			newStValue[1] = newStValue[0];
		} else if (draggingState === "bottom" && newStValue[0] > newStValue[1]) {
			newStValue[0] = newStValue[1];
		}
		if (rfValue.current.join(",") !== newStValue.join(",")) {
			rfValue.current = newStValue;
			setValue(newStValue);
		}
	};

	/**
	 * The useEffect hook for the slider. It sets the new value of the slider
	 * when the stValue changes and calls the onChange callback if provided.
	 */
	useEffect(() => {
		if (rfRoot.current) {
			const range = max - min;
			const bottomValue = ((stValue[0] - min) / range) * 100;
			const topValue = ((stValue[1] - min) / range) * 100;
			rfRoot.current.style.setProperty("--slider-bottom", `${bottomValue}%`);
			rfRoot.current.style.setProperty("--slider-top", `${topValue}%`);
		}
		if (onChange) {
			onChange(stValue);
		}
	}, [stValue]);

	/**
	 * The useEffect hook for the slider. It sets the mouse move and mouse up event listeners
	 * when the stDragging changes and removes them when the component unmounts.
	 */
	useEffect(() => {
		if (stDragging && !disabled) {
			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		}
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [stDragging]);

	/**
	 * The useEffect hook for the slider. It sets the initial value of the slider
	 * when the component mounts.
	 */
	useEffect(() => {
		if (rfRoot.current) {
			const range = max - min;
			const bottomValue = ((stValue[0] - min) / range) * 100;
			const topValue = ((stValue[1] - min) / range) * 100;
			rfRoot.current.style.setProperty("--slider-bottom", `${bottomValue}%`);
			rfRoot.current.style.setProperty("--slider-top", `${topValue}%`);
		}
	}, []);

	return (
		<div
			ref={rfRoot}
			className={mergeClasses(classes.root, className)}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			data-size={size}
		>
			<input
				ref={ref}
				className={mergeClasses(classes.input)}
				type="range"
				min={min}
				max={max}
				step={step}
				value={stValue.join(",")}
				/*
					* The onChange is required to prevent React from throwing a warning,
					* but in case of range input, it's never triggered.
					*/
				onChange={(_e) => undefined}
			/>
			<div
				data-inverted={inverted}
				className={mergeClasses(classes.trail)}
				data-trail
				data-disabled={disabled}
			/>
			<div
				data-thumb="bottom"
				data-thumb-active={stDragging === "bottom"}
				className={mergeClasses(classes.thumb)}
				data-disabled={disabled}
			/>
			<div
				data-thumb="top"
				data-thumb-active={stDragging === "top"}
				className={mergeClasses(classes.thumb)}
				data-disabled={disabled}
			/>
		</div>
	);
};
