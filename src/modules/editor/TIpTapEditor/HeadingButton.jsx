import { useCallback, useEffect, useState } from "react";
import useOuterClick from "../../design-system/useOuterClick";
import WritingAppButton from "../../design-system/WritingAppButton";

const formats = {
  p: {
    text: "<p> Normal Text </p>",
  },
};

const TextFormatButton = ({ editor }) => {
  console.log("textformat button rerendered");
  const [isOpened, setIsOpened] = useState(false);

  const innerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  const [activeHeading, setActiveHeading] = useState(getActiveHeading(editor));

  const onSelectionUpdate = useCallback(() => {
    setActiveHeading(getActiveHeading(editor));
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      console.log("No Editor");
      return;
    }

    editor.on("selectionUpdate", onSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor, onSelectionUpdate]);

  return (
    <div className="relative" ref={innerRef}>
      <div className="h-[2rem] w-[12rem] px-1">
        <WritingAppButton
          className={`w-full h-full px-[0.35rem] hover:bg-hover rounded-[0.35rem] `}
          buttonContent={
            <div className="w-full h-full flex items-center justify-between">
              <div className="flex-grow h-full flex items-center justify-center py-[0.3rem]">
                <ReturnPlainElementForFormat format={activeHeading} />
              </div>
              <ReturnArrowIcon isUp={!isOpened} />
            </div>
          }
          onClick={() => setIsOpened(!isOpened)}
        />
      </div>

      <div
        className={`w-[12rem] h-fit p-1 bg-background z-30 bg-opacity-100 ${
          isOpened ? "flex " : "hidden"
        } absolute items-center flex-col rounded-[0.2rem] border-border border left-[50%] -translate-x-1/2 top-[35px] shadow-shadow shadow-md`}
      >
        <WritingAppButton
          className={`w-full h-[2.5rem] px-[0.35rem] py-[0.3rem] hover:bg-hover border-b border-border flex items-center justify-center relative`}
          buttonContent={<ReturnElementForFormat format={"p"} />}
          onClick={() => {
            setFormat("p", editor);
          }}
        />
        <WritingAppButton
          className={`w-full h-[4rem] px-[0.35rem] py-[0.3rem] hover:bg-hover border-b border-border flex items-center justify-center`}
          buttonContent={<ReturnElementForFormat format={"h1"} />}
          onClick={() => {
            setFormat("h1", editor);
          }}
        />
        <WritingAppButton
          className={`w-full h-[3rem] px-[0.35rem] py-[0.3rem] hover:bg-hover border-b border-border flex items-center justify-center`}
          buttonContent={<ReturnElementForFormat format={"h2"} />}
          onClick={() => {
            setFormat("h2", editor);
          }}
        />
        <WritingAppButton
          className={`w-full h-[2.5rem] px-[0.35rem] py-[0.3rem] hover:bg-hover border-b border-border flex items-center justify-center`}
          buttonContent={<ReturnElementForFormat format={"h3"} />}
          onClick={() => {
            setFormat("h3", editor);
          }}
        />
        <WritingAppButton
          className={`w-full h-[2.5rem] px-[0.35rem] py-[0.3rem] hover:bg-hover border-b border-border flex items-center justify-center`}
          buttonContent={<ReturnElementForFormat format={"h4"} />}
          onClick={() => {
            setFormat("h4", editor);
          }}
        />
        <WritingAppButton
          className={`w-full h-[2 rem] px-[0.35rem] py-[0.3rem] hover:bg-hover flex items-center justify-center`}
          buttonContent={<ReturnElementForFormat format={"h5"} />}
          onClick={() => {
            setFormat("h5", editor);
          }}
        />
      </div>
    </div>
  );
};

export default TextFormatButton;

const ReturnPlainElementForFormat = ({format}) => {
  switch (format) {
    case "h1":
      console.log("Inside plain element renderer: ", format);
      return <p>Title</p>;

    case "h2":
      return <p>Heading 1</p>;

    case "h3":
      return <p>Heading 2</p>;

    case "h4":
      return <p>Heading 3</p>;

    case "h5":
      return <p>Heading 4</p>;

    default:
      return <p>Normal Text</p>;
  }
};

const ReturnElementForFormat = ({ format }) => {
  switch (format) {
    case "p":
      return <p>Normal Text</p>;

    case "h1":
      return <h1 style={{ margin: 0 }}>Title</h1>;

    case "h2":
      return <h2 style={{ margin: 0 }}>Heading 1</h2>;

    case "h3":
      return <h3 style={{ margin: 0 }}>Heading 2</h3>;

    case "h4":
      return <h4 style={{ margin: 0 }}>Heading 3</h4>;

    case "h5":
      return <h5 style={{ margin: 0 }}>Heading 4</h5>;

    default:
      return null;
  }
};

const setFormat = (format, editor) => {
  switch (format) {
    case "p":
      editor.chain().focus().setParagraph().run();
      break;
    case "h1":
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case "h2":
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case "h3":
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    case "h4":
      editor.chain().focus().toggleHeading({ level: 4 }).run();
      break;
    case "h5":
      editor.chain().focus().toggleHeading({ level: 5 }).run();
      break;
  }
};

const getActiveHeading = (editor) => {
  const { level } = editor.getAttributes("heading");

  switch (level) {
    case 1:
      return "h1";

    case 2:
      return "h2";

    case 3:
      return "h3";

    case 4:
      return "h4";

    case 5:
      return "h5";

    default:
      return "p";
  }
};

const ReturnArrowIcon = ({ isUp }) => {
  if (isUp) {
    return (
      <span
        className={`icon-[material-symbols-light--keyboard-arrow-up] mt-px h-full w-[2rem]`}
      ></span>
    );
  } else {
    return (
      <span
        className={`icon-[material-symbols-light--keyboard-arrow-down] mt-px h-full w-[2rem]`}
      ></span>
    );
  }
};
