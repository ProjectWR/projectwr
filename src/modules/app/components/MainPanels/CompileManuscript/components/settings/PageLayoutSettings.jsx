import PropTypes from "prop-types";
import { PAGE_SIZE_PRESETS } from "../../formatConstants";

const PageLayoutSettings = ({ settings, onChange }) => {
  const handleChange = (category, field, value) => {
    onChange({
      [category]: {
        ...settings[category],
        [field]: value,
      },
    });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Page Size */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Page Size
        </label>
        <select
          value={settings.layout?.pageSize || "A4"}
          onChange={(e) => handleChange("layout", "pageSize", e.target.value)}
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        >
          {Object.entries(PAGE_SIZE_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Size */}
      {settings.layout?.pageSize === "CUSTOM" && (
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
              Width (mm)
            </label>
            <input
              type="number"
              value={settings.layout?.customWidth || 210}
              onChange={(e) =>
                handleChange(
                  "layout",
                  "customWidth",
                  parseFloat(e.target.value),
                )
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
              Height (mm)
            </label>
            <input
              type="number"
              value={settings.layout?.customHeight || 297}
              onChange={(e) =>
                handleChange(
                  "layout",
                  "customHeight",
                  parseFloat(e.target.value),
                )
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
        </div>
      )}

      {/* Orientation */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Orientation
        </label>
        <select
          value={settings.layout?.orientation || "portrait"}
          onChange={(e) =>
            handleChange("layout", "orientation", e.target.value)
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>

      {/* Margins */}
      <div className="flex flex-col gap-2">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Margins (mm)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              Top
            </label>
            <input
              type="number"
              value={settings.layout?.marginTop || 25}
              onChange={(e) =>
                handleChange("layout", "marginTop", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              Bottom
            </label>
            <input
              type="number"
              value={settings.layout?.marginBottom || 25}
              onChange={(e) =>
                handleChange(
                  "layout",
                  "marginBottom",
                  parseFloat(e.target.value),
                )
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              Left
            </label>
            <input
              type="number"
              value={settings.layout?.marginLeft || 25}
              onChange={(e) =>
                handleChange("layout", "marginLeft", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted">
              Right
            </label>
            <input
              type="number"
              value={settings.layout?.marginRight || 25}
              onChange={(e) =>
                handleChange(
                  "layout",
                  "marginRight",
                  parseFloat(e.target.value),
                )
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Columns
        </label>
        <input
          type="number"
          min="1"
          max="4"
          value={settings.layout?.columns || 1}
          onChange={(e) =>
            handleChange("layout", "columns", parseInt(e.target.value))
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        />
      </div>

      {settings.layout?.columns > 1 && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
              Column Gap (mm)
            </label>
            <input
              type="number"
              value={settings.layout?.columnGap || 10}
              onChange={(e) =>
                handleChange("layout", "columnGap", parseFloat(e.target.value))
              }
              className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.layout?.columnRule || false}
              onChange={(e) =>
                handleChange("layout", "columnRule", e.target.checked)
              }
              className="w-4 h-4"
            />
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
              Show column rule
            </label>
          </div>
        </>
      )}
    </div>
  );
};

PageLayoutSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  level: PropTypes.string.isRequired,
  onReset: PropTypes.func,
};

export default PageLayoutSettings;
