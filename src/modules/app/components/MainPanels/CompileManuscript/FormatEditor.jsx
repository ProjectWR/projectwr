import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../LayoutComponents/Tabs";

const FormatEditor = () => {


    return (
        <div className="w-full h-full flex flex-col px-1">
            <div className="text-libraryDirectoryBookNodeFontSize px-1 py-1 text-appLayoutText flex items-center gap-2">
                Presets:
            </div>

            <div className="h-px w-full bg-appLayoutBorder">

            </div>

            <div className="text-libraryDirectoryBookNodeFontSize px-1 py-1 text-appLayoutText flex items-center gap-2">
                Insert Dropdown here
            </div>



            <div className="text-libraryDirectoryBookNodeFontSize mt-3 px-1 py-1 text-appLayoutText flex items-center gap-2">
                Edit format based on scopes
            </div>

            <div className="h-px w-full bg-appLayoutBorder">

            </div>

            <Tabs className="w-full grow gap-0 mt-1">
                <TabsList>
                    <TabsTrigger value="global">
                        Global
                    </TabsTrigger>
                    <TabsTrigger value="type">
                        Type
                    </TabsTrigger>
                    <TabsTrigger value="page">
                        Page
                    </TabsTrigger>
                </TabsList>

                <div className="h-px w-full bg-appLayoutBorder"></div>
            </Tabs>
        </div>

    )
}

export default FormatEditor;