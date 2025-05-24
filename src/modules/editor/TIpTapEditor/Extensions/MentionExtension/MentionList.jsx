import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="contextMenuContent z-[1050]">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`contextMenuItem font-serif ${
              index === selectedIndex ? "bg-appLayoutInverseHover" : ""
            } `}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="pt-[3px]">{item}</span>
          </button>
        ))
      ) : (
        <div className="contextMenuLabel font-serif">
          <span className="pt-[3px]">No result</span>
        </div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
