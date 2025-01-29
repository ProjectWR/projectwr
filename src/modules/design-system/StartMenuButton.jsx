import React from "react";
import PropTypes from "prop-types";
import { startStore } from "../core/stores/startStore";

const StartMenuButton = ({
  className,
  content,
  buttonText = "Default Button Text",
  onClick,
}) => {
  const activeContent = startStore((state) => state.activeContent);
  return (
    <button
      className={`StartMenuButton font-serif text-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-900 transition-all ease-in-out duration-100 ${
        activeContent === content
          ? "bg-zinc-300 dark:bg-zinc-900 shadow-inner shadow-zinc-400 dark:shadow-zinc-950 dark:text-zinc-500 text-zinc-500"
          : "bg-white dark:bg-zinc-800 shadow-sm shadow-zinc-400 dark:shadow-black hover:bg-zinc-100 hover:scale-[1.02] hover:dark:bg-zinc-900 "
      } rounded-sm ${className}`}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
};

StartMenuButton.propTypes = {
  className: PropTypes.string,
  content: PropTypes.string,
  buttonText: PropTypes.string,
  onClick: PropTypes.func,
};

export default StartMenuButton;
