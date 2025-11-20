import { Tooltip } from "@mantine/core"

export const StyledTooltip = ({ children, label }) => {
    return (
        <Tooltip classNames={{
            tooltip: "border-appLayoutGradientHover shadow-sm shadow-appLayoutShadow border bg-appBackgroundAccent/95 backdrop-blur-[2px] text-appLayoutTextMuted text-tooltipFontSize w-fit h-fit w-4",
            arrow: "border-appLayoutGradientHover shadow-sm border bg-appBackgroundAccent/95 backdrop-blur-[2px]"
        }} label={label} position="right" withArrow arrowSize={10} offset={{ mainAxis: 10, crossAxis: 0 }}>
            {children}
        </Tooltip>
    )
}