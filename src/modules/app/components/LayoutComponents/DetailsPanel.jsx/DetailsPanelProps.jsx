import { motion } from "motion/react";

const progress_values = [
  { value: 0, weight: 2, color: "darkgray", label: "Drafting" },
  { value: 1, weight: 1, color: "orange", label: "Editing" },
  { value: 2, weight: 1, color: "green", label: "Done" },
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
              key={progress.value}
              style={{
                flexGrow: progress.weight,
              }}
              className={`basis-0 h-full text-detailsPanelPropsFontSize text-appLayoutText relative rounded-md bg-appBackground transition-colors duration-300 ${
                !selected && "hover:bg-appLayoutInverseHover"
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
                  className="absolute h-full w-full top-0 left-0 z-[1] border-2 border-appLayoutBorder rounded-md shadow-md shadow-appLayoutShadow"
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
