import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import WritingAppButton from "../../../../design-system/WritingAppButton";
import useYMap from "../../../hooks/useYMap";
import DynamicSizeInputElement from "../../../../design-system/dynamicSizeInputElement";
import BaseEditor from "../../../../../modules/editor/BaseEditor/BaseEditor";
import persistenceManagerForSubdocs from "@/modules/core/lib/persistenceSubDocs";
import TiptapEditor from "@/modules/editor/TIpTapEditor/TipTapEditor";

const PaperDetailsPanel = ({ paperEntryReference }) => {
  console.log("paper panel rendering: ", paperEntryReference.toJSON());

  console.log("paper entry reference", paperEntryReference);

  const paperEntryState = useYMap(paperEntryReference);

  console.log("PaperENTRY STATE: ", paperEntryState);

  useEffect(() => {
    // paperEntryReference.get('paper-ydoc').load();
    // persistenceManagerForSubdocs.initLocalPersistenceForYDoc(paperEntryReference.get('paper-ydoc'));
  }, [paperEntryReference]);

  const [paperProperties, setPaperProperties] = useState({
    title: "",
  });

  useEffect(() => {
    setPaperProperties({
      title: paperEntryReference.get("title"),
    });
  }, [paperEntryReference]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setPaperProperties({
      ...paperProperties,
      [name]: value,
    });
  };

  const handleSave = () => {
    paperEntryReference.set("title", paperProperties.title);
  };

  return (
    <div
      id="PaperDetailContainer"
      className="w-full h-full pt-[1rem] flex items-center justify-center"
    >
      <div
        id="PaperDetailForm"
        className="w-full min-w-[44rem] h-full flex flex-col"
      >
        <div className="h-[2rem] w-full pl-4 px-2">
          <div
            id="CreatePaperHeader"
            className="h-full pl-2 w-full flex items-center justify-start border-b border-zinc-800"
          >
            <DynamicSizeInputElement
              steps={[
                [0, "xl"],
                [53, "lg"],
                [70, "md"],
              ]}
              className="bg-neutral-900 w-full focus:outline-none"
              name="title"
              onChange={handleChange}
              value={paperProperties.title}
            />

            <WritingAppButton
              className="h-full px-2 w-fit ml-1 text-xl"
              buttonContent={<p>Save</p>}
              onClick={handleSave}
            />
          </div>
        </div>

        <div
          id="CreatePaperBody"
          data-registry="plate"
          className="w-full pt-[0.5rem] flex-grow min-h-0 min-w-0 basis-0"
        >
          {/* <BaseEditor sharedType={paperEntryReference.get("paper-text")} /> */}
          <TiptapEditor yDoc={paperEntryReference.get("paper-ydoc")} />
        </div>
      </div>
    </div>
  );
};
PaperDetailsPanel.propTypes = {
  paperEntryReference: PropTypes.object.isRequired,
};

export default PaperDetailsPanel;
