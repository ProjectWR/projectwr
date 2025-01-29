import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import WritingAppButton from "../../../../design-system/WritingAppButton";
import useYMap from "../../../hooks/useYMap";
import DynamicSizeInputElement from "../../../../design-system/dynamicSizeInputElement";

const BookDetailsPanel = ({ bookEntryReference }) => {
  console.log("book details panel rendering: ", bookEntryReference.toJSON());

  const bookEntryState = useYMap(bookEntryReference);

  console.log("BOOK ENTRY STATE: ", bookEntryState);

  const [bookProperties, setBookProperties] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    setBookProperties({
      title: bookEntryReference.get("title"),
      description: bookEntryReference.get("description"),
    });
  }, [bookEntryReference]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setBookProperties({
      ...bookProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    bookEntryReference.set("title", bookProperties.title);
    bookEntryReference.set("description", bookProperties.description);
  };

  return (
    <div
      id="BookDetailContainer"
      className="w-full h-full pt-[7rem] flex items-center justify-center"
    >
      <div
        id="BookDetailForm"
        className="min-w-[44rem] px-[2rem] h-full flex flex-col"
      >
        <div
          id="CreateBookHeader"
          className="h-[4.5rem] w-full flex items-center justify-start border-b border-zinc-800"
        >
          <DynamicSizeInputElement
            steps = {[[0, '5xl'], [28, '4xl'], [38, 'xl']]}
            className="bg-neutral-900 w-full focus:outline-none"
            name="title"
            onChange={handleChange}
            value={bookProperties.title}
          />
        </div>

        <div
          id="CreateBookBody"
          className="h-fit w-full pt-[1.5rem] flex flex-col border-b border-zinc-800 pb-[1.5rem]"
        >
          <textarea
            className="bg-neutral-900 w-full border border-zinc-800 p-3 rounded-md max-h-[15rem]"
            name="description"
            onChange={handleChange}
            value={bookProperties.description}
          />
        </div>

        <div
          id="CreateBookFooter"
          className="h-fit mt-1 w-full flex items-center justify-end"
        >
          <WritingAppButton
            className={`w-fit h-fit text-2xl p-4`}
            buttonContent={"Save Details"}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};
BookDetailsPanel.propTypes = {
  bookEntryReference: PropTypes.object.isRequired,
};

export default BookDetailsPanel;
