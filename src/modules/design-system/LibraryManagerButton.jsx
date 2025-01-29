import PropTypes from "prop-types";

const LibraryManagerButton = ({
  className,
  isPressed,
  buttonContent = (<p>Default Text</p>),
  onClick,
}) => {
  return (
    <button
      className={`text-lg transition-all ease-in-out duration-200 ${
        isPressed
          ? "bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-500 text-zinc-500 shadow-inner shadow-zinc-500 dark:shadow-zinc-950 bg-opacity-30 dark:bg-opacity-30 "
          : " dark:shadow-black hover:bg-white hover:dark:bg-zinc-900 hover:bg-opacity-50 dark:hover:bg-opacity-70 "
      } rounded-sm ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

LibraryManagerButton.propTypes = {
  className: PropTypes.string,
  isPressed: PropTypes.bool, 
  buttonContent: PropTypes.node,
  onClick: PropTypes.func,
};

export default LibraryManagerButton;
