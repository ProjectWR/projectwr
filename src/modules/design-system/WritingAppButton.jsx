import PropTypes from "prop-types";

const WritingAppButton = ({
  className,
  isPressed,
  buttonContent = <p>Default Text</p>,
  onClick,
  isDisabled = false,
}) => {
  return (
    <button
      className={`
        rounded-sm
        transition-all ease-in-out duration-200
        flex items-center 

        
        
        hover:bg-opacity-30

        ${
          isPressed
            ? "shadow-inner shadow-black bg-black bg-opacity-30 text-white dark:text-white "
            : "dark:text-neutral-400"
        }
        
        ${
          !isDisabled
            ? " text-white dark:text-white "
            : "dark:text-neutral-600"
        }

        ${className}
      `}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

WritingAppButton.propTypes = {
  className: PropTypes.string,
  isPressed: PropTypes.bool,
  buttonContent: PropTypes.node,
  onClick: PropTypes.func,
};

export default WritingAppButton;
