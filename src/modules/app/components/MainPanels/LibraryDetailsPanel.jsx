import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import GrainyButton from "../../../design-system/GrainyButton";
import syncManager from "../../lib/sync";
import { wait } from "lib0/promise";
import persistenceManagerForSubdocs from "../../lib/persistenceSubDocs";
import { Textarea } from "@mantine/core";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";
import {
  DetailsPanelButton,
  DetailsPanelButtonsShell,
} from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelButton";

const LibraryDetailsPanel = ({ libraryId }) => {
  const { deviceType } = useDeviceType();

  console.log("library details panel rendering: ", libraryId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSynced = syncManager.fireProviderMap.has(libraryId);

  const libraryPropsMapState = useYMap(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  console.log("Library Props Map STATE: ", libraryPropsMapState);

  const initialLibraryProperties = useRef({
    library_name: libraryPropsMapState.library_name,
    library_description: libraryPropsMapState.library_description,
  });

  const [libraryProperties, setLibraryProperties] = useState({
    library_name: libraryPropsMapState.library_name,
    library_description: libraryPropsMapState.library_description,
  });

  useEffect(() => {
    setLibraryProperties({
      library_name: libraryPropsMapState.library_name,
      library_description: libraryPropsMapState.library_description,
    });

    initialLibraryProperties.current = {
      library_name: libraryPropsMapState.library_name,
      library_description: libraryPropsMapState.library_description,
    };
  }, [libraryId, libraryPropsMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(libraryProperties, initialLibraryProperties.current);
  }, [libraryProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setLibraryProperties({
      ...libraryProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    dataManagerSubdocs
      .getLibrary(libraryId)
      .getMap("library_props")
      .set("library_name", libraryProperties.library_name);
    dataManagerSubdocs
      .getLibrary(libraryId)
      .getMap("library_props")
      .set("library_description", libraryProperties.library_description);

    setPanelOpened(true);
  };

  return (
    <DetailsPanel
      breadcrumbs={[
        { label: "Your Libraries", action: () => {} },
        { label: libraryProperties.library_name, action: () => {} },
      ]}
    >
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleSave();
        }}
        id="LibraryDetailsContent"
        className={formClassName}
      >
        <DetailsPanelHeader>
          {deviceType === "mobile" && (
            <>
              <button
                className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
                         order-1
          `}
                onClick={() => {
                  setPanelOpened(true);
                  setLibraryId("unselected");
                }}
              >
                <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
              </button>

              <button
                className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 mr-2 rounded-full text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center
                          order-3`}
                onClick={() => {
                  setPanelOpened(true);
                }}
                onMouseEnter={() => {
                  setIsDoorOpen(true);
                }}
                onMouseLeave={() => {
                  setIsDoorOpen(false);
                }}
              >
                <div className="relative w-full h-full">
                  <AnimatePresence mode="sync">
                    {isDoorOpen && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.1 }}
                        key="doorOpen"
                        className="icon-[ion--enter] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                      ></motion.span>
                    )}

                    {!isDoorOpen && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.1 }}
                        key="doorClose"
                        className="icon-[ion--enter-outline] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                      ></motion.span>
                    )}
                  </AnimatePresence>{" "}
                </div>
              </button>
            </>
          )}

          <DetailsPanelNameInput
            name="library_name"
            onChange={handleChange}
            value={libraryProperties.library_name}
          />
        </DetailsPanelHeader>

        <DetailsPanelDivider />

        <DetailsPanelButtonsShell>
          <DetailsPanelButton
            onClick={async () => {
              setSyncLoading(true);

              await syncManager.initFireSync(
                dataManagerSubdocs.getLibrary(libraryId)
              );

              await wait(2000);

              setSyncLoading(false);
            }}
            icon={
              isSynced ? (
                <span className="icon-[iconamoon--cloud-yes-thin] h-full w-full transition-colors duration-200"></span>
              ) : (
                <span className="icon-[iconamoon--cloud-no-thin] h-full w-full transition-colors duration-200"></span>
              )
            }
            text={"Synchronize"}
            loading={syncLoading}
          />
          <DetailsPanelButton
            onClick={async () => {
              setSaveLoading(true);
              console.log("Saving Archive");
              await persistenceManagerForSubdocs.saveArchive(
                dataManagerSubdocs.getLibrary(libraryId)
              );

              setSaveLoading(false);
            }}
            icon={
              <span className="icon-[ph--download-thin] h-full w-full transition-colors duration-200"></span>
            }
            text={"Save as archive"}
            loading={saveLoading}
          />
          <DetailsPanelButton
            onClick={async () => {
              setLoadLoading(true);
              console.log("Loading Archive");
              await persistenceManagerForSubdocs.loadArchive(
                dataManagerSubdocs.getLibrary(libraryId)
              );
              setLoadLoading(false);
            }}
            icon={
              <span className="icon-[ph--upload-thin] h-full w-full transition-colors duration-200"></span>
            }
            text={"Load from archive"}
            loading={loadLoading}
          />
          <DetailsPanelButton
            onClick={async () => {
              setDeleteLoading(true);
              console.log("Deleting Library");
              await wait(1000);
              setDeleteLoading(false);
            }}
            icon={
              <span className="icon-[ph--trash-thin] h-full w-full transition-colors duration-200"></span>
            }
            text={"Delete from device"}
            loading={deleteLoading}
          />
        </DetailsPanelButtonsShell>

        <DetailsPanelBody>
          <div className="prop w-full h-fit relative">
            <Textarea
              maxRows={10}
              id="libraryDescription"
              classNames={{
                root: "bg-appBackground pt-detailsPanelPropLabelHeight h-fit  border border-appLayoutBorder rounded-md overflow-hidden ",
                wrapper:
                  "bg-appBackground overflow-hidden text-detailsPanelPropsFontSize border-none focus:border-none w-full focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200",
                input:
                  "bg-appBackground px-3 pb-3 text-appLayoutText text-detailsPanelPropsFontSize font-serif min-h-[5rem] max-h-detailsPanelDescriptionInputHeight border-none focus:border-none overflow-y-auto",
              }}
              autosize
              name="library_description"
              placeholder="Enter Description"
              onChange={handleChange}
              value={libraryProperties.library_description}
            />

            <label
              htmlFor="libraryDescription"
              className="absolute top-2 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
            >
              Library Description
            </label>
          </div>

          <AnimatePresence>
            {unsavedChangesExist && (
              <motion.button
                type="submit"
                initial={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
                animate={{
                  height: "var(--libraryManagerAddButtonSize) ",
                  opacity: 1,
                  marginTop: `0.25rem`,
                  marginBottom: 0,
                  padding: `0.25rem`,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
                className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize transition-colors duration-100 rounded-full 
                            hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                            flex items-center justify-center
                        `}
              >
                <motion.span
                  animate={{
                    opacity: 1,
                  }}
                  className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
                ></motion.span>
              </motion.button>
            )}
          </AnimatePresence>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};
LibraryDetailsPanel.propTypes = {
  libraryEntryReference: PropTypes.object.isRequired,
};

export default LibraryDetailsPanel;

const LibraryActionButton = ({ children, onClick, disabled = false }) => (
  <GrainyButton
    disabled={disabled}
    size={10}
    onClick={onClick}
    className={`h-libraryDetailsActionButtonHeight w-libraryDetailsActionButtonWidth rounded-lg overflow-hidden border border-appLayoutBorder`}
  >
    <div className="h-full w-full">{children}</div>
  </GrainyButton>
);
