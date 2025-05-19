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
} from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import {
  DetailsPanelBody,
  DetailsPanelProperties,
} from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import {
  DetailsPanelButton,
  DetailsPanelButtonsShell,
} from "../LayoutComponents/DetailsPanel/DetailsPanelButton";
import {
  DetailsPanelButtonOnClick,
  DetailsPanelSubmitButton,
} from "../LayoutComponents/DetailsPanel/DetailsPanelSubmitButton";
import { DetailsPanelDescriptionProp } from "../LayoutComponents/DetailsPanel/DetailsPanelProps";
import useRefreshableTimer from "../../hooks/useRefreshableTimer";
import { DetailsPanelNotesPanel } from "../LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";

const LibraryDetailsPanel = ({ libraryId, ytree }) => {
  const { deviceType } = useDeviceType();
  const isMd = appStore((state) => state.isMd);

  console.log("library details panel rendering: ", libraryId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const [isNotesPanelAwake, refreshNotesPanel, keepNotesPanelAwake] =
    useRefreshableTimer({ time: 1000 });
  const [notesPanelOpened, setNotesPanelOpened] = useState(false);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSynced = syncManager.fireProviderMap.has(libraryId);

  const itemMapState = useYMap(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  console.log("Library Props Map STATE: ", itemMapState);

  const initialItemProperties = useRef({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    });

    initialItemProperties.current = {
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    };
  }, [libraryId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(itemProperties, initialItemProperties.current);
  }, [itemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setItemProperties({
      ...itemProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    dataManagerSubdocs
      .getLibrary(libraryId)
      .getMap("library_props")
      .set("item_properties", {
        item_title: itemProperties.item_title,
        item_description: itemProperties.item_description,
      });

    setPanelOpened(true);
  };

  return (
    <DetailsPanel>
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

          <DetailsPanelButtonOnClick
            onClick={() => {
              if (isMd) {
                setNotesPanelOpened(!notesPanelOpened);
              } else {
                if (!(notesPanelOpened && isNotesPanelAwake)) {
                  setNotesPanelOpened(true);
                  refreshNotesPanel();
                }
              }
            }}
            exist={true}
            icon={
              notesPanelOpened && (isMd || isNotesPanelAwake) ? (
                <span className="icon-[fluent--squares-nested-20-filled] w-full h-full"></span>
              ) : (
                <span className="icon-[fluent--squares-nested-20-regular] w-full h-full"></span>
              )
            }
          />

          <DetailsPanelNameInput
            name="item_title"
            onChange={handleChange}
            value={itemProperties.item_title}
          />

          <DetailsPanelSubmitButton unsavedChangesExist={unsavedChangesExist} />
        </DetailsPanelHeader>

        <DetailsPanelDivider />

        <DetailsPanelBody>
          <DetailsPanelNotesPanel
            libraryId={libraryId}
            itemId={libraryId}
            ytree={ytree}
            notesPanelOpened={notesPanelOpened}
            isNotesPanelAwake={isNotesPanelAwake}
            refreshNotesPanel={refreshNotesPanel}
            keepNotesPanelAwake={keepNotesPanelAwake}
          />
          <DetailsPanelProperties>
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
            <DetailsPanelDescriptionProp
              itemProperties={itemProperties}
              setItemProperties={setItemProperties}
            />
          </DetailsPanelProperties>
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
