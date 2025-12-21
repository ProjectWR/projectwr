import useMainPanel from "../../hooks/useMainPanel";
import { appStore } from "../../stores/appStore";

const MobileDockBar = () => {
  const libraryId = appStore((state) => state.libraryId);

  const activity = appStore((state) => state.activity);
  const setActivity = appStore((state) => state.setActivity);
  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const { mainPanelState, activatePanel } = useMainPanel();

  const DockButton = ({ icon, label, isActive, onClick }) => {
    return (
      <button
        className={`flex flex-col items-center justify-center grow h-full gap-1 active:scale-90 transition-transform duration-100 ${
          isActive ? "text-appLayoutHighlight" : "text-appLayoutTextMuted"
        }`}
        onClick={onClick}
      >
        <span className={`${icon} text-2xl`}></span>
        {/* <span className="text-xs">{label}</span> */}
      </button>
    );
  };

  return (
    <div className="w-full h-16 bg-appBackgroundAccent border-t border-appLayoutBorder flex flex-row justify-between items-center px-2 pb-safe shrink-0 z-50">
      <DockButton
        icon="icon-[ion--library-sharp]"
        label="Library"
        isActive={panelOpened && activity === "libraries"}
        onClick={() => {
          setActivity("libraries");
          setPanelOpened(true);

          if (
            mainPanelState.panelType !== "libraries" &&
            libraryId !== "unselected"
          ) {
            activatePanel("libraries", null, [libraryId]);
          }
        }}
      />
      <DockButton
        icon="icon-[material-symbols-light--search]"
        label="Search"
        isActive={panelOpened &&activity === "search"}
        onClick={() => {
          setActivity("search");
          setPanelOpened(true);

          if (
            mainPanelState.panelType !== "libraries" &&
            libraryId !== "unselected"
          ) {
            activatePanel("libraries", null, [libraryId]);
          }
        }}
      />
      <DockButton
        icon="icon-[material-symbols-light--home]"
        isActive={mainPanelState.panelType === "home"}
        label="Home"
        onClick={() => {
          activatePanel("home", null, []);
          setPanelOpened(false);
        }}
      />
      <DockButton
        icon="icon-[material-symbols-light--match-word-rounded]"
        label="Dictionary"
        isActive={mainPanelState.panelType === "dictionary"}
        onClick={() => {
          activatePanel("dictionary", null, []);
          setPanelOpened(false);
        }}
      />
      <DockButton
        icon="icon-[material-symbols-light--settings]"
        isActive={mainPanelState.panelType === "settings"}
        label="Settings"
        onClick={() => {
          activatePanel("settings", null, []);
          setPanelOpened(false);
        }}
      />
    </div>
  );
};

export default MobileDockBar;
