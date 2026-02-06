import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import PropTypes from "prop-types";

const Checkbox = ({
  checked,
  onCheckedChange,
  disabled,
  label,
  className = "",
  rootClassName = "",
  inputClassName = "",
  id,
  ...props
}) => {
  return (
    <div className={`flex items-center gap-2 ${rootClassName}`}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={`
          flex shrink-0 items-center justify-center rounded-[2px] border 
          transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-appLayoutFocus 
          disabled:cursor-not-allowed disabled:opacity-50
          ${
            checked
              ? "bg-appLayoutHighlight border-appLayoutHighlight"
              : "bg-transparent border-appLayoutBorder hover:border-appLayoutInverseHover"
          }
          ${className}
          ${inputClassName}
        `}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-appLayoutTextInverted">
          <span className="icon-[fluent--checkmark-12-filled] w-3 h-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : "text-appLayoutText"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
  rootClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  id: PropTypes.string,
};

export default Checkbox;
