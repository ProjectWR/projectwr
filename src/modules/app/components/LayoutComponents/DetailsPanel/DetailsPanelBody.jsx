import { ScrollArea } from "@mantine/core";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

export const DetailsPanelBody = ({ children, className }) => {
  const { deviceType } = useDeviceType();

  return (
    <div id="DetailsPanelBody" className="grow w-full min-h-0 basis-0 flex flex-row relative">{children}</div>
  );
};

export const DetailsPanelProperties = ({ children, className }) => {
  const { deviceType } = useDeviceType();

  return (
    <div className="h-full min-w-0 grow flex flex-col items-center">
      <section
        id="DetailsPanelPropertiesBody"
        className={`h-full overflow-y-hidden py-4 px-6 gap-4 relative ${className}`}
        style={
          deviceType === "desktop" && {
            width: `var(--detailsPanelWidth)`,
            maxWidth: `100%`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
          }
        }
      >
        <ScrollArea
          overscrollBehavior="none"
          scrollbars="y"
          type="hover"
          classNames={{
            root: `grow basis-0 min-w-0 h-full p-0`,
            scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidth z-[5] opacity-70`,
            thumb: `bg-appLayoutBorder rounded-t-full hover:bg-appLayoutInverseHover`,
            content:
              "h-full w-full flex flex-col items-center justify-start gap-3",
          }}
        >
          {children}
        </ScrollArea>
      </section>
    </div>
  );
};
