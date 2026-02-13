import { useState } from "react";
import PropTypes from "prop-types";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../LayoutComponents/Tabs";
import { DropdownMenu } from "radix-ui";
import { TYPE_CATEGORIES } from "../organizeConstants";
import PageLayoutSettings from "./settings/PageLayoutSettings";
import TypographySettings from "./settings/TypographySettings";

const FormatEditor = ({
  compileConfig,
  globalSettings,
  pageTypeSettings,
  pageSettings,
  onUpdateGlobal,
  onUpdatePageType,
  onUpdatePage,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState("global");
  const [selectedPageType, setSelectedPageType] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState("layout");

  // Get unique page types from compile config
  const pageTypes = [...new Set(compileConfig.map((c) => c.type))];

  // Get all page type labels
  const getPageTypeLabel = (type) => {
    for (const section of Object.values(TYPE_CATEGORIES)) {
      const found = section.find((t) => t.value === type);
      if (found) return found.label;
    }
    return type;
  };

  const renderSettings = (settings, level, onUpdate) => {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* Layout Settings */}
        <div className="w-full border border-appLayoutBorder rounded-md overflow-hidden">
          <button
            onClick={() =>
              setExpandedCategory(
                expandedCategory === "layout" ? null : "layout",
              )
            }
            className="w-full px-3 py-2 flex items-center justify-between bg-appLayoutHover hover:bg-appLayoutInputBg transition-colors"
          >
            <span className="text-libraryDirectoryBookNodeFontSize font-medium text-appLayoutText flex items-center gap-2">
              <span className="icon-[mdi--page-layout-body] w-4 h-4" />
              Page Layout
            </span>
            <span
              className={`icon-[mdi--chevron-down] w-4 h-4 transition-transform ${expandedCategory === "layout" ? "rotate-180" : ""}`}
            />
          </button>
          {expandedCategory === "layout" && (
            <div className="p-3 bg-appLayoutBackground">
              <PageLayoutSettings
                settings={settings}
                onChange={onUpdate}
                level={level}
                onReset={onReset}
              />
            </div>
          )}
        </div>

        {/* Typography Settings */}
        <div className="w-full border border-appLayoutBorder rounded-md overflow-hidden">
          <button
            onClick={() =>
              setExpandedCategory(
                expandedCategory === "typography" ? null : "typography",
              )
            }
            className="w-full px-3 py-2 flex items-center justify-between bg-appLayoutHover hover:bg-appLayoutInputBg transition-colors"
          >
            <span className="text-libraryDirectoryBookNodeFontSize font-medium text-appLayoutText flex items-center gap-2">
              <span className="icon-[mdi--format-text] w-4 h-4" />
              Typography
            </span>
            <span
              className={`icon-[mdi--chevron-down] w-4 h-4 transition-transform ${expandedCategory === "typography" ? "rotate-180" : ""}`}
            />
          </button>
          {expandedCategory === "typography" && (
            <div className="p-3 bg-appLayoutBackground">
              <TypographySettings
                settings={settings}
                onChange={onUpdate}
                level={level}
                onReset={onReset}
              />
            </div>
          )}
        </div>

        {/* Additional categories can be added here */}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-appLayoutBackground">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="w-full justify-start border-b border-appLayoutBorder rounded-none bg-transparent p-0">
          <TabsTrigger value="global" className="rounded-none">
            Global
          </TabsTrigger>
          <TabsTrigger value="pageType" className="rounded-none">
            Page Type
          </TabsTrigger>
          <TabsTrigger value="page" className="rounded-none">
            Page
          </TabsTrigger>
        </TabsList>

        {/* Global Tab */}
        <TabsContent value="global" className="flex-1 overflow-auto p-4">
          <div className="w-full mb-3">
            <h3 className="text-sm font-medium text-appLayoutText">
              Global Formatting
            </h3>
            <p className="text-xs text-appLayoutTextMuted">
              These settings apply to the entire manuscript unless overridden.
            </p>
          </div>
          {renderSettings(globalSettings, "global", onUpdateGlobal)}
        </TabsContent>

        {/* Page Type Tab */}
        <TabsContent value="pageType" className="flex-1 overflow-auto p-4">
          <div className="w-full mb-3 flex flex-col gap-2">
            <h3 className="text-sm font-medium text-appLayoutText">
              Page Type Formatting
            </h3>
            <p className="text-xs text-appLayoutTextMuted">
              Select a page type to customize its formatting.
            </p>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-full px-3 py-2 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize text-left flex items-center justify-between hover:bg-appLayoutHover">
                  <span>
                    {selectedPageType
                      ? getPageTypeLabel(selectedPageType)
                      : "Select a page type..."}
                  </span>
                  <span className="icon-[mdi--chevron-down] w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                className="contextMenuContent z-1100 min-w-[200px]"
                sideOffset={5}
                align="start"
              >
                {pageTypes.map((type) => (
                  <DropdownMenu.Item
                    key={type}
                    className="contextMenuItem"
                    onClick={() => setSelectedPageType(type)}
                  >
                    {getPageTypeLabel(type)}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {selectedPageType ? (
            renderSettings(
              pageTypeSettings[selectedPageType] || {},
              "pageType",
              (updates) => onUpdatePageType(selectedPageType, updates),
            )
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-appLayoutTextMuted text-sm">
              Select a page type to customize its formatting
            </div>
          )}
        </TabsContent>

        {/* Page Tab */}
        <TabsContent value="page" className="flex-1 overflow-auto p-4">
          <div className="w-full mb-3 flex flex-col gap-2">
            <h3 className="text-sm font-medium text-appLayoutText">
              Page Formatting
            </h3>
            <p className="text-xs text-appLayoutTextMuted">
              Select a specific page to customize its formatting.
            </p>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-full px-3 py-2 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize text-left flex items-center justify-between hover:bg-appLayoutHover">
                  <span>
                    {selectedPageId
                      ? compileConfig.find((c) => c.nodeId === selectedPageId)
                          ?.nodeId || "Select a page..."
                      : "Select a page..."}
                  </span>
                  <span className="icon-[mdi--chevron-down] w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                className="contextMenuContent z-1100 max-h-[300px] overflow-auto"
                sideOffset={5}
                align="start"
              >
                {compileConfig.map((config) => (
                  <DropdownMenu.Item
                    key={config.nodeId}
                    className="contextMenuItem"
                    onClick={() => setSelectedPageId(config.nodeId)}
                  >
                    {getPageTypeLabel(config.type)} -{" "}
                    {config.nodeId.substring(0, 8)}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          {selectedPageId ? (
            renderSettings(
              pageSettings[selectedPageId] || {},
              "page",
              (updates) => onUpdatePage(selectedPageId, updates),
            )
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-appLayoutTextMuted text-sm">
              Select a page to customize its formatting
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

FormatEditor.propTypes = {
  compileConfig: PropTypes.array.isRequired,
  globalSettings: PropTypes.object.isRequired,
  pageTypeSettings: PropTypes.object.isRequired,
  pageSettings: PropTypes.object.isRequired,
  onUpdateGlobal: PropTypes.func.isRequired,
  onUpdatePageType: PropTypes.func.isRequired,
  onUpdatePage: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default FormatEditor;
