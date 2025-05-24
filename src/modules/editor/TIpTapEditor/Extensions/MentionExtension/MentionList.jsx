import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { getOrInitLibraryYTree } from "../../../../app/lib/ytree";
import { appStore } from "../../../../app/stores/appStore";
import dataManagerSubdocs from "../../../../app/lib/dataSubDoc";

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item.id, label: item.label });
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
        props.items.map((item, index) => {
         

          return (
            <button
              className={`contextMenuItem font-serif ${
                index === selectedIndex ? "bg-appLayoutInverseHover" : ""
              } `}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.label && <span className="pt-[3px]">{item.label}</span>}
            </button>
          );
        })
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
