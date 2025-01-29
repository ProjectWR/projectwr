import WritingAppButton from "../../../design-system/WritingAppButton";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SecondarySidePanel from "./SIdePanel/SecondarySidePanel";
import ContentPanel from "./ContentPanel/ContentPanel";
import { pageStore } from "../../stores/pageStore";

const Library = () => {
  console.log("library rendering");
  const appWindow = getCurrentWindow();

  const secondarySidePanel = pageStore((state) => state.secondarySidePanel);
  const setSecondarySidePanel = pageStore(
    (state) => state.setSecondarySidePanel
  );

  const setContentPanel = pageStore((state) => state.setContentPanel);

  const setWhiteLinePosition = (top, left) => {
    const whiteLine = document.querySelector("#whiteLine");

    whiteLine.style.top = `${top}px`;
    whiteLine.style.left = `${left}px`;
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div
        data-tauri-drag-region
        id="actionBarContainer"
        className="bg-background border-b border-border w-full h-[2rem] min-h-[2rem] "
      >
        <div
          data-tauri-drag-region
          id="actionBar"
          className="w-full h-full flex justify-start items-center font-sans text-foreground"
        >
          <div
            className={`logo h-full w-[7rem] flex items-center justify-center ml-1 font-serif`}
          >
            <h1>ProjectWR</h1>
          </div>
          <WritingAppButton
            className={`h-full px-4 pb-px w-fit ml-1 hover:bg-accent-foreground`}
            buttonContent={<p>Home</p>}
            onClick={() => {
              setContentPanel("home");
            }}
          />

          <WritingAppButton
            className={`h-full px-4 pb-px w-fit  hover:bg-accent-foreground`}
            buttonContent={<p>Settings</p>}
          />
          <WritingAppButton
            className={`h-full px-4 pb-px w-fit  hover:bg-accent-foreground`}
            buttonContent={<p>Help</p>}
          />

          <div className="flex-grow"></div>

          <WritingAppButton
            className={`h-full px-4 w-fit ml-1 hover:bg-accent`}
            buttonContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
              >
                <path fill="#fbfafa" d="M20 14H4v-4h16"></path>
              </svg>
            }
            onClick={() => {
              appWindow.minimize();
            }}
          />
          <WritingAppButton
            className={`h-full px-4 w-fit hover:bg-accent`}
            buttonContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
              >
                <path fill="#fbfafa" d="M4 4h16v16H4zm2 4v10h12V8z"></path>
              </svg>
            }
            onClick={() => {
              appWindow.toggleMaximize();
            }}
          />
          <WritingAppButton
            className={`h-full px-4 w-fit ml-1 hover:bg-destructive hover:bg-opacity-70`}
            buttonContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fbfafa"
                  d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
                ></path>
              </svg>
            }
            onClick={() => {
              appWindow.close();
            }}
          />
        </div>
      </div>
      <div
        id="libraryContainer"
        className="w-full flex-grow min-h-0 bg-background flex"
      >
        <div
          id="sidePanelContainer"
          className="w-[35rem] min-w-[35rem] border-border border-r flex transition-all ease-in-out duration-300 "
        >
          <div
            id="primarySidePanel"
            className="w-[4.5rem] h-full  border-r border-border flex flex-col items-center font-sans relative"
          >
            <div
              id="whiteLine"
              className={`w-[1px] h-[4rem] bg-white absolute transition-all duration-100 top-[0px] left-[71px]`}
            ></div>

            <div
              className={`primarySidePanelButtonContainer w-[4.5rem] h-[4rem] flex  items-center justify-center px-px`}
            >
              <WritingAppButton
                className={`w-full h-full rounded-sm justify-center hover:bg-hover`}
                buttonContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={60}
                    height={60}
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="none"
                      stroke={`${
                        secondarySidePanel === "libraryManager" ||
                        secondarySidePanel === "library"
                          ? "#fff"
                          : "#a3a3a3"
                      }`}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M35.3 15.172H12.664c-.758 0-1.372.614-1.372 1.372V39.18c0 .758.614 1.372 1.371 1.372H35.3c.757 0 1.372-.614 1.372-1.372V16.544c0-.758-.615-1.372-1.372-1.372"
                    ></path>
                    <g
                      fill="none"
                      stroke={`${
                        secondarySidePanel === "libraryManager" ||
                        secondarySidePanel === "library"
                          ? "#fff"
                          : "#a3a3a3"
                      }`}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m36.54 34.844l2.08.218a1.37 1.37 0 0 0 1.507-1.221l2.365-22.512a1.37 1.37 0 0 0-1.22-1.508L18.758 7.455a1.37 1.37 0 0 0-1.508 1.221l-.675 6.424"></path>
                      <path d="M17.084 10.39L6.728 11.48c-.753.08-1.3.754-1.22 1.508l2.369 22.511c.08.754.754 1.3 1.508 1.221l1.768-.186m5.381-15.293H31.43m-14.896 4.414H31.43M16.534 30.07H31.43m-14.896 4.414h6.896"></path>
                    </g>
                  </svg>
                }
                isPressed={
                  secondarySidePanel === "libraryManager" ||
                  secondarySidePanel === "library"
                }
                onClick={() => {
                  setSecondarySidePanel("libraryManager");
                  setWhiteLinePosition(0, 71);
                }}
              />
            </div>
            <div
              className={`primarySidePanelButtonContainer w-[4.5rem] h-[4rem] flex items-center justify-center px-px`}
            >
              <WritingAppButton
                className={`w-full h-full rounded-lg justify-center hover:bg-hover`}
                buttonContent={<p>TMPS</p>}
                isPressed={secondarySidePanel === "templates"}
                onClick={() => {
                  setSecondarySidePanel("templates");
                  setWhiteLinePosition(64, 71);
                }}
              />
            </div>
            <div
              className={`primarySidePanelButtonContainer w-[4.5rem] h-[4rem] flex items-center justify-center px-px`}
            >
              <WritingAppButton
                className={`w-full h-full rounded-lg justify-center hover:bg-hover`}
                buttonContent={<p>HIST</p>}
                isPressed={secondarySidePanel === "history"}
                onClick={() => {
                  setSecondarySidePanel("history");
                  setWhiteLinePosition(128, 71);
                }}
              />
            </div>
          </div>

          <div
            id="secondarySidePanel"
            className="flex-grow h-full max-h-full min-h-0 flex flex-col"
          >
            <SecondarySidePanel />
          </div>
        </div>

        <div id="contentPanelContainer" className="flex-grow">
          <div
            id="contentPanel"
            className="w-full h-full shadow-inner shadow-shadow-partial"
          >
            <ContentPanel />
          </div>
        </div>
      </div>
      <div
        id="footerContainer"
        className=" border-t border-border w-full h-[1.5rem] min-h-[1.5rem] pt-1 pb-1 "
      ></div>
    </div>
  );
};

export default Library;
