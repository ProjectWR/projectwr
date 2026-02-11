import { useCallback } from "react";
import PropTypes from "prop-types";
import ManuscriptNode from "./ManuscriptNode";

const ManuscriptView = ({ data, onUpdate }) => {
  // Recursive removal
  const removeItem = useCallback(
    (id) => {
      const removeRecursive = (items) => {
        return items
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            children: item.children ? removeRecursive(item.children) : [],
          }));
      };
      onUpdate(removeRecursive(data));
    },
    [data, onUpdate],
  );

  // Move item (internal reordering - disabled for now as per "remove whole drag and drop" but framework remains)
  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      // Placeholder for when reordering is reintroduced via different mechanism
    },
    [data, onUpdate],
  );

  return (
    <div className={`w-full h-full min-h-[200px] flex flex-col gap-2`}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-appLayoutTextMuted select-none pointer-events-none">
          Add items from the Binder to build your manuscript
        </div>
      ) : (
        <div className="flex flex-col gap-1 pb-20">
          {data.map((item, index) => (
            <ManuscriptNode
              key={item.id}
              item={item}
              index={index}
              removeItem={removeItem}
              moveItem={moveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManuscriptView;

ManuscriptView.propTypes = {
  data: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
