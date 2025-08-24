import { Tooltip } from "@mantine/core"

export const StyledTooltip = ({ children, label }) => {
    return (
        <Tooltip classNames={{
            tooltip: "border-appLayoutGradientHover border bg-appLayoutHighlight/95 backdrop-blur-[2px] text-appBackgroundAccent text-tooltipFontSize w-fit h-fit w-4",
            arrow: "border-appLayoutGradientHover border bg-appLayoutHighlight/95 backdrop-blur-[2px]"
        }} label={label} position="right" withArrow arrowSize={10} offset={{ mainAxis: 10, crossAxis: 0 }}>
            {children}
        </Tooltip>
    )
}