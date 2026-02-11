import {
  HoverListDivider,
  HoverListHeader,
  ListShell,
} from "../../LayoutComponents/HoverListShell";

export const AppAuthComponent = () => {
  return (
    <ListShell className={`h-full w-full min-w-0 bg-appBackgroundAccent`}>
      <HoverListHeader className={"gap-4"}>
        <span>Sync</span>
      </HoverListHeader>

      <HoverListDivider />

      <section className="flex items-start gap-2 w-full h-fit px-2">
        <div className="w-full flex flex-wrap py-2 gap-1">
          <button
            onClick={() => { }}
            className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
          >
            <img
              src="/src/assets/pen.svg"
              width={100}
              height={100}
              className="w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize stroke-appLayoutText"
            />
            Login to Sylvanite
          </button>
          <span className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder text-appLayoutTextMuted">
            For Supporters
          </span>
        </div>
      </section>
    </ListShell>
  );
};
