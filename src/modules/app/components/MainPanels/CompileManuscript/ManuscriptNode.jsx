import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";

const ManuscriptNode = ({
  item,
  // index, // Unused for now
  moveItem,
  removeItem,
  updateItem,
  onDrop,
  level = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`relative flex flex-col`}
      style={{ marginLeft: `${level * 16}px` }}
    >
      <div className="flex items-center gap-2 p-2 bg-appLayoutBackground border border-appLayoutBorder rounded hover:bg-appLayoutHover mb-1 group">
        {/* Expand Toggle if has children */}
        {item.children && item.children.length > 0 ? (
          <button onClick={handleExpandToggle} className="p-1">
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="icon-[formkit--right] w-4 h-4 text-appLayoutTextMuted"
            />
          </button>
        ) : (
          <div className="w-6" /> // spacer
        )}

        {/* Icon */}
        <span
          className={`icon-[fluent--document-24-regular] w-4 h-4 text-appLayoutTextMuted`}
        />

        <span className="flex-1 text-appLayoutText truncate select-none">
          {item.title}
        </span>

        {/* Actions */}
        <button
          onClick={() => removeItem(item.id)}
          className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-appLayoutInverseHover rounded"
        >
          <span className="icon-[fluent--delete-24-regular] w-4 h-4" />
        </button>
      </div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && item.children && item.children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col"
          >
            {item.children.map((child, idx) => (
              <ManuscriptNode
                key={child.id}
                item={child}
                index={idx}
                moveItem={moveItem}
                removeItem={removeItem}
                updateItem={updateItem}
                onDrop={onDrop}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
