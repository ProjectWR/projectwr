import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";

const ManuscriptNode = ({
  item,
  // index, // Unused for now
  moveItem,
  removeItem,
  updateItem,
  onDrop,
  level = 0,
}) => {
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  return (
    <div className="flex items-center w-full gap-1 h-fit text-libraryDirectoryBookNodeFontSize  rounded ">
      <div
        className={`flex items-center h-libraryDirectoryPaperNodeHeight py-1 px-2 rounded-md grow gap-2 hover:bg-appLayoutHover group ${isRemoveHovered ? "bg-appLayoutHover" : ""}`}
      >
        {/* Icon */}
        <span
          className={`icon-[fluent--document-24-regular] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted`}
        />

        <span className="flex-1 text-appLayoutText truncate select-none">
          {item.title}
        </span>
      </div>

      <StyledTooltip label="Remove">
        <button
          onClick={() => removeItem(item.id)}
          className="p-1 rounded-md w-libraryDirectoryPaperNodeHeight h-libraryDirectoryPaperNodeHeight hover:bg-appLayoutHover text-appLayoutTextMuted hover:text-appLayoutText flex items-center justify-center"
          onMouseOver={() => setIsRemoveHovered(true)}
          onMouseOut={() => setIsRemoveHovered(false)}
        >
          <span className="icon-[mdi--remove] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize" />
        </button>
      </StyledTooltip>
    </div>
  );
};

ManuscriptNode.propTypes = {
  item: PropTypes.object.isRequired,
  // index: PropTypes.number.isRequired,
  moveItem: PropTypes.func,
  removeItem: PropTypes.func,
  updateItem: PropTypes.func,
  onDrop: PropTypes.func,
  level: PropTypes.number,
};

export default ManuscriptNode;
