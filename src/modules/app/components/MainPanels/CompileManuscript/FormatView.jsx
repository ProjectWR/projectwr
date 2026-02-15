import FormatEditor from "./FormatEditor";

const FormatView = () => {


    return (
        <div id="FormatViewContainer" className="grow min-w-0 w-full basis-0 flex gap-2 border border-appLayoutBorder rounded-lg p-2">
            <div id="FormatEditorContainer" className="w-1/3 h-full">
                <FormatEditor />
            </div>

            <div className="h-full w-px bg-appLayoutBorder"></div>

            <div id="FormatViewPreviewContainer" className="h-full grow bg-neutral-800 rounded-lg overflow-hidden"></div>
        </div>
    )
}

export default FormatView;