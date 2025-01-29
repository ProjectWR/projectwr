import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import WritingAppButton from "../../../../design-system/WritingAppButton";
import useYMap from "../../../hooks/useYMap";
import DynamicSizeInputElement from "../../../../design-system/dynamicSizeInputElement";

const SectionDetailsPanel = ({ sectionEntryReference }) => {
  console.log("book details panel rendering: ", sectionEntryReference.toJSON());

  const sectionEntryState = useYMap(sectionEntryReference);

  console.log("BOOK ENTRY STATE: ", sectionEntryState);

  const [sectionProperties, setSectionProperties] = useState({
    title: "",
    prefix: "",
  });

  useEffect(() => {
    setSectionProperties({
      title: sectionEntryReference.get("title"),
      prefix: sectionEntryReference.get("prefix"),
    });
  }, [sectionEntryReference]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setSectionProperties({
      ...sectionProperties,
      [name]: value,
    });
  };

  const handleSave = () => {
    sectionEntryReference.set("title", sectionProperties.title);
    sectionEntryReference.set("prefix", sectionProperties.prefix);
  };

  return (
    <div
      id="SectionDetailContainer"
      className="w-full h-full pt-[7rem] flex items-center justify-center"
    >
      <div
        id="SectionDetailForm"
        className="min-w-[44rem] px-[2rem] h-full flex flex-col"
      >
        <div
          id="CreateSectionHeader"
          className="h-[4.5rem] w-full flex items-center justify-start border-b border-zinc-800"
        >
          <DynamicSizeInputElement
            steps = {[[0, '5xl'], [28, '4xl'], [38, 'xl']]}
            className="bg-neutral-900 w-full focus:outline-none"
            name="title"
            onChange={handleChange}
            value={sectionProperties.title}
          />
        </div>

        <div
          id="CreateSectionBody"
          className="h-fit w-full pt-[1.5rem] flex flex-col border-b border-zinc-800 pb-[1.5rem]"
        >
          <textarea
            className="bg-neutral-900 w-full border border-zinc-800 p-3 rounded-md max-h-[15rem]"
            name="prefix"
            onChange={handleChange}
            value={sectionProperties.prefix}
          />
        </div>

        <div
          id="CreateSectionFooter"
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
SectionDetailsPanel.propTypes = {
  sectionEntryReference: PropTypes.object.isRequired,
};

export default SectionDetailsPanel;
