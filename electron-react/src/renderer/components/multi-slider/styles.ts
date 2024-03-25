import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { borderAll } from "@/styles";

const thumbSize = "20px";

export const useLocalStyles = makeStyles({
	root: {
		position: "relative",
		display: "inline-grid",
		alignItems: "center",
		height: thumbSize,
		"grid-template-columns": `1fr calc(100% - ${thumbSize}) 1fr`,
		"grid-template-rows": `1fr ${thumbSize} 1fr`,
		"[data-size='thick'] input": {
			height: `calc(${tokens.strokeWidthThick} * 2)`,
		},
		"[data-size='thick'] [data-trail]::before": {
			height: `calc(${tokens.strokeWidthThick} * 2)`,
			top: `calc(0px + ${thumbSize} / 2 - ${tokens.strokeWidthThick})`,
		},
	},
	input: {
		...shorthands.flex(1),
		"-webkit-appearance": "none !important",
		height: tokens.strokeWidthThin,
		backgroundColor: tokens.colorNeutralStroke2,
		"grid-column-start": "1",
		"grid-column-end": "-1",
		"grid-row-start": "1",
		"grid-row-end": "-1",
		"::-webkit-slider-thumb": {
			"-webkit-appearance": "none",
		},
	},
	trail: {
		"::before": {
			content: "''",
			position: "absolute",
			top: `calc(0px + ${thumbSize} / 2)`,
			width: "100%",
			height: tokens.strokeWidthThin,
		},
		"[data-inverted='false']::before": {
			backgroundImage: `linear-gradient(
				90deg,
				transparent 0%,
				transparent var(--slider-bottom),
				${tokens.colorNeutralForeground2BrandHover} var(--slider-bottom),
				${tokens.colorNeutralForeground2BrandHover} var(--slider-top),
				transparent var(--slider-top),
				transparent 100%
			)`,
		},
		"[data-inverted='true']::before": {
			backgroundImage: `linear-gradient(
				90deg,
				${tokens.colorNeutralForeground2BrandHover} 0%,
				${tokens.colorNeutralForeground2BrandHover} var(--slider-bottom),
				transparent var(--slider-bottom),
				transparent var(--slider-top),
				${tokens.colorNeutralForeground2BrandHover} var(--slider-top),
				${tokens.colorNeutralForeground2BrandHover} 100%
			)`,
		},
		"[data-disabled='true'][data-inverted='false']::before": {
			backgroundImage: `linear-gradient(
				90deg,
				transparent 0%,
				transparent var(--slider-bottom),
				${tokens.colorNeutralStroke3} var(--slider-bottom),
				${tokens.colorNeutralStroke3} var(--slider-top),
				transparent var(--slider-top),
				transparent 100%
				)`,
		},
		"[data-disabled='true'][data-inverted='true']::before": {
			backgroundImage: `linear-gradient(
				90deg,
				${tokens.colorNeutralStroke3} 0%,
				${tokens.colorNeutralStroke3} var(--slider-bottom),
				transparent var(--slider-bottom),
				transparent var(--slider-top),
				${tokens.colorNeutralStroke3} var(--slider-top),
				${tokens.colorNeutralStroke3} 100%
			)`,
		},
	},
	thumb: {
		cursor: "pointer",
		...borderAll,
		...shorthands.borderRadius("50%"),
		...shorthands.borderColor(tokens.colorNeutralStroke1),
		position: "absolute",
		"grid-column-start": "2",
		"grid-column-end": "-2",
		"grid-row-start": "2",
		"grid-row-end": "-2",
		top: 0,
		backgroundColor: tokens.colorNeutralBackground1,
		width: "20px",
		height: "20px",
		transform: "translateX(-50%)",
		...shorthands.transition("all", tokens.durationFaster),
		"::before": {
			content: "''",
			position: "absolute",
			top: "3px",
			left: "3px",
			right: "3px",
			bottom: "3px",
			backgroundColor: tokens.colorBrandBackground,
			...borderAll,
			...shorthands.borderRadius("50%"),
			...shorthands.borderColor(tokens.colorBrandBackground),
		},
		":hover::before": {
			backgroundColor: tokens.colorBrandBackgroundHover,
			...shorthands.borderColor(tokens.colorBrandBackgroundHover),
		},
		"[data-thumb='bottom']": {
			left: "var(--slider-bottom)",
		},
		"[data-thumb='top']": {
			left: "var(--slider-top)",
		},
		"[data-thumb-active='true']": {
			...shorthands.borderColor(tokens.colorNeutralForeground2BrandHover + " !important"),
			"::before": {
				backgroundColor: tokens.colorNeutralForeground2BrandHover + " !important",
				...shorthands.borderColor(tokens.colorNeutralForeground2BrandHover + " !important"),
			},
		},
		"[data-disabled='true']::before": {
			backgroundColor: tokens.colorNeutralStroke3 + " !important",
			...shorthands.borderColor(tokens.colorNeutralStroke3 + " !important"),
		},
	},
});
