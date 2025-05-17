import { ContextMenu } from "radix-ui";
import React from "react";
import PropTypes from "prop-types";

/**
 *
 * @param {{children: React.ReactNode,
 *          triggerClassname: string,
 *          options: [{
 *              label?: string,
 *              icon?: React.ReactNode,
 *              disabled?: boolean,
 *              action?: function,
 *              isDivider?: boolean}]}} param0
 * @returns
 */
const ContextMenuWrapper = ({ children, triggerClassname, options }) => {
  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger className={`w-full h-full ${triggerClassname}`}>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Content
        style={{
          opacity: 1,
        }}
        className="contextMenuContent z-[1100] "
        sideOffset={5}
        align="end"
      >
        {options.map(({ label, icon, disabled, action, isDivider = false }) => {
          if (isDivider) {
            return (
              <ContextMenu.Separator
                key={`${label}`}
                className="contextMenuSeparator"
              />
            );
          }

          if (disabled) {
            return (
              <ContextMenu.Label key={label} className="contextMenuLabel">
                {icon}
                <span className="pt-[3px]"> {label}</span>
              </ContextMenu.Label>
            );
          }

          return (
            <ContextMenu.Item
              key={label}
              className={`contextMenuItem`}
              onClick={action}
            >
              {icon}
              <span className="pt-[3px]"> {label}</span>
            </ContextMenu.Item>
          );
        })}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

ContextMenuWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  triggerClassname: PropTypes.string.isRequired,
  options: PropTypes.array,
};

export default ContextMenuWrapper;
