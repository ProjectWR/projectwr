import StartMenuButton from "../../../design-system/StartMenuButton";
import Settings from "../Settings/Settings";
import { startStore } from "../../stores/startStore";
import React, { lazy } from "react";

const LibraryManager = lazy(() => import("../SIdePanels/LibraryManager/LibraryManager"))

const preloadLibraryManager = () => {
  return (<LibraryManager />);
};

const Start = () => {
  preloadLibraryManager();
  
  const activeContent = startStore((state) => state.activeContent);
  const setActiveContent = startStore((state) => state.setActiveContent);

  return (
    <div
      id="StartPageContainer"
      className="overflow-auto h-full w-full flex justify-center items-center border rounded-sm border-zinc-300 dark:border-zinc-800"
    >
      <div id="StartCardContainer" className="container flex flex-col">
        <div id="StartCardHeader" className="flex justify-center items-center">
          <h1 className="text-6xl font-extralight font-serif">project wr</h1>
        </div>

        <div id="StartCardBody" className="w-full flex justify-center mt-2 ">
          <div
            id="StartMenuButtons"
            className={`grid grid-cols-4 grid-rows-1 gap-1`}
          >
            <StartMenuButton
              buttonText={"libraries"}
              content="libraries"
              className="col-start-1 col-span-2"
              onClick={() => setActiveContent("libraries")}
            />
            <StartMenuButton
              buttonText={"settings"}
              content="settings"
              className="col-start-3 col-span-1"
              onClick={() => setActiveContent("settings")}
            />
            <StartMenuButton
              buttonText={"help"}
              content="help"
              className="col-start-4 col-span-1  "
              onClick={() => setActiveContent("help")}
            />
          </div>
        </div>

        <div
          id="StartMenuContentContainer"
          className={`m-auto mt-1 transition-all ease-in-out duration-200  ${
            activeContent === ""
              ? "StartMenuContentClosed"
              : "StartMenuContentOpened-" + activeContent
          } bg-zinc-300 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-800 shadow-inner shadow-zinc-500 dark:shadow-zinc-900 rounded-sm `}
        >
          {activeContent === "settings" && <Settings />}
          <React.Suspense fallback={<p>Loading...</p>}>
            {activeContent === "libraries" && <LibraryManager />}
          </React.Suspense>
          {activeContent === "help" && <h1>Help</h1>}
        </div>
      </div>
    </div>
  );
};

export default Start;
