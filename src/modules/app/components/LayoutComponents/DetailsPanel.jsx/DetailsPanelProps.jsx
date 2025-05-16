import { motion } from "motion/react";

const progress_values = [
  { value: 0, weight: 2, color: "lightgray", label: "Drafting" },
  { value: 1, weight: 1, color: "peach", label: "Editing" },
  { value: 2, weight: 1, color: "lightgreen", label: "Done" },
];

export const DetailsPanelStatusProp = ({
  itemProperties,
  setItemProperties,
}) => {
  const item_progress = itemProperties.item_progress;
  const setItemProgress = (val) => {
    setItemProperties({
      ...itemProperties,
      item_progress: val,
    });
  };
  return (
    <div className="w-full h-fit">
      <div className="w-full h-[3rem] px-1 py-1 flex items-center gap-2 border border-appLayoutBorder rounded-md">
        <h2 className="w-fit h-fit px-2 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          Book Status
        </h2>
        {progress_values.map((progress) => {
          const selected = progress.value === item_progress;
          return (
            <motion.button
              type="button"
              key={progress.value}
              style={{
                flexGrow: progress.weight,
              }}
              className={`basis-0 h-full text-detailsPanelPropsFontSize text-appBackground relative rounded-md bg-appBackground transition-colors duration-500 ${
                !selected && "hover:bg-appLayoutInverseHover text-appLayoutText"
              }
              ${selected && ""}
          
              `}
              onClick={() => {
                setItemProgress(progress.value);
              }}
            >
              <span className="w-fit h-fit m-auto relative z-[2]">
                {progress.label}
              </span>
              {selected && (
                <motion.div
                  className="absolute h-full w-full top-0 left-0 z-[1] border border-appLayoutText bg-appLayoutHighlight rounded-md shadow-none shadow-appLayoutShadow"
                  layoutId="statusBackground"
                  id="statusBackground"
                ></motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export const DetailsPanelWordCountProp = ({
  currentWordCount,
  itemProperties,
  onChange,
}) => {
  return (
    <div className="w-full h-fit">
      <div className="w-full h-[3rem] px-1 py-1 flex items-center gap-2 border border-appLayoutBorder rounded-md">
        <h2 className="w-fit h-fit px-2 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          Word Count
        </h2>
        <span className="grow basis-0 h-fit px-2 flex justify-center items-center text-detailsPanelPropLabelFontSize text-appLayoutText">
          {currentWordCount}
        </span>
        <span className="w-fit h-fit px-2 flex justify-center items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          /
        </span>
        <input
          value={itemProperties.item_goal}
          name={"item_goal"}
          onChange={onChange}
          className="grow basis-0 h-fit px-2 text-center focus:outline-none rounded-md text-detailsPanelPropLabelFontSize text-appLayoutTextMuted focus:text-appLayoutText focus:bg-appLayoutInputBackground transition-colors duration-200"
        />
      </div>
    </div>
  );
};
