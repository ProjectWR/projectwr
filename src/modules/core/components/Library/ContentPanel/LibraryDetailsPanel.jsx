import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import WritingAppButton from "../../../../design-system/WritingAppButton";
import useYMap from "../../../hooks/useYMap";
import DynamicSizeInputElement from "../../../../design-system/dynamicSizeInputElement";

const LibraryDetailsPanel = ({ libraryEntryReference }) => {
  console.log("library details panel rendering: ", libraryEntryReference.toJSON());

  const libraryEntryState = useYMap(libraryEntryReference);

  console.log("Library ENTRY STATE: ", libraryEntryState);

  const [libraryProperties, setLibraryProperties] = useState({
    library_name: "",
    library_description: "",
  });

  useEffect(() => {
    setLibraryProperties({
      library_name: libraryEntryReference.get("library_name"),
      library_description: libraryEntryReference.get("library_description"),
    });
  }, [libraryEntryReference]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setLibraryProperties({
      ...libraryProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    libraryEntryReference.set("library_name", libraryProperties.library_name);
    libraryEntryReference.set("library_description", libraryProperties.library_description);
  };

  return (
    <div
      id="LibraryDetailContainer"
      className="w-full h-full pt-[7rem] flex items-center justify-center"
    >
      <div
        id="LibraryDetailForm"
        className="min-w-[44rem] px-[2rem] h-full flex flex-col"
      >
        <div
          id="CreateLibraryHeader"
          className="h-[4.5rem] w-full flex items-center justify-start border-b border-zinc-800"
        >
          <DynamicSizeInputElement
            steps = {[[0, '5xl'], [28, '4xl'], [38, 'xl']]}
            className="bg-neutral-900 w-full focus:outline-none"
            name="library_name"
            onChange={handleChange}
            value={libraryProperties.library_name}
          />
        </div>

        <div
          id="CreateLibraryBody"
          className="h-fit w-full pt-[1.5rem] flex flex-col border-b border-zinc-800 pb-[1.5rem]"
        >
          <textarea
            className="bg-neutral-900 w-full border border-zinc-800 p-3 rounded-md max-h-[15rem]"
            name="library_description"
            onChange={handleChange}
            value={libraryProperties.library_description}
          />
        </div>

        <div
          id="CreateLibraryFooter"
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
LibraryDetailsPanel.propTypes = {
  libraryEntryReference: PropTypes.object.isRequired,
};

export default LibraryDetailsPanel;
