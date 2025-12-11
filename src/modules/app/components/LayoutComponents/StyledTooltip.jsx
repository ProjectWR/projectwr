import { Tooltip } from "@mantine/core";

export const StyledTooltip = ({ children, label, position = "right" }) => {
  return (
    <Tooltip
      classNames={{
        tooltip:
          "z-[9999] border-appLayoutGradientHover shadow-sm shadow-appLayoutShadow border bg-appBackgroundAccent text-appLayoutText px-2 py-px text-tooltipFontSize w-fit h-fit",
        arrow:
          "z-[9999] border-appLayoutGradientHover shadow-sm border bg-appBackgroundAccent",
      }}
      label={label}
      position={position}
      withArrow
      arrowSize={10}
      zIndex={100000000}
      offset={{ mainAxis: 10, crossAxis: 0 }}
    >
      {children}
    </Tooltip>
  );
};
