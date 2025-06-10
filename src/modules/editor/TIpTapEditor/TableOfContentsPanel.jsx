import { useEffect, useState } from "react";

export const TableOfContentsPanel = ({
  editor,
  visible = false,
  refreshTOCPanel,
  keepTOCPanelAwake,
}) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const onUpdate = ({ editor }) => {
      const headings = editor.$nodes("heading");

      console.log("EDITOR UPDATES HEADINGS:", headings);

      setHeadings(
        headings.map((heading) => {
          return {
            level: heading.attributes.level,
            content: heading,
            action: async () => {
              console.log("HEADING POS", heading.pos);
              await editor
                .chain()
                .setTextSelection(heading.pos)
                .scrollIntoView()
                .run();              
            },
          };
        })
      );
    };

    editor.on("update", onUpdate);

    if (editor) {
      onUpdate({ editor });
    }

    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor]);

  return (
    <div
      onMouseEnter={() => {
        keepTOCPanelAwake();
      }}
      onMouseLeave={() => {
        refreshTOCPanel();
      }}
      className={`absolute rounded-r-lg shadow-2xl 
                shadow-appLayoutGentleShadow z-[3] w-[20rem] 
                h-[80%] top-1/2 left-0 -translate-y-1/2 
                ${visible ? "translate-x-0" : "-translate-x-full"}
                border-r border-y border-appLayoutBorder 
                text-appLayoutText bg-appBackground translate-transform
                duration-100 flex flex-col items-start justify-start px-3 py-1`}
    >
      <span className="text-3xl text-appLayoutText py-2 border-b border-appLayoutBorder w-full">
        Outline
      </span>
      <div className="grow w-full basis-0 min-h-0 flex flex-col items-start">
        {headings.map((heading) => {
          let content = "";

          console.log(
            "TEXT BETWEEN: ",
            editor.state.doc.textBetween(heading.range)
          );

          console.log("HEADING.CONTENT", heading);

          for (const node of heading.content.content.content) {
            if (node.text) {
              content = content + node.text;
            } else {
              content = content + node.attrs.label;
            }
          }

          return (
            <TOCHeadingButton
              key={`${content}`}
              level={heading.level}
              content={content}
              action={heading.action}
            />
          );
        })}
      </div>
    </div>
  );
};

const TOCHeadingButton = ({ level, content, action }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{
        fontSize: `calc(var(--editorTOCFontSize) + (${6 - level} * 0.15rem) )`,
        lineHeight: `calc(var(--editorTOCFontSize) + (${
          6 - level
        } * 0.15rem) )`,
        paddingLeft: `calc(0.5rem + 0.1rem * ${level - 1})`,
        paddingRight: `calc(0.5rem)`,
        opacity: hover ? "100%" : `calc(100% - (10% * ${level - 1}))`,
      }}
      className="py-2 w-full px-2 text-start rounded-lg hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight hover:opacity-100 text-nowrap overflow-x-hidden overflow-ellipsis"
      onClick={action}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      {content}
    </button>
  );
};
