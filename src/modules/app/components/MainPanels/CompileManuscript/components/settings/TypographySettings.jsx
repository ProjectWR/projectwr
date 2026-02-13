import PropTypes from "prop-types";
import { FONT_FAMILIES, ALIGNMENT_OPTIONS } from "../../formatConstants";

const TypographySettings = ({ settings, onChange }) => {
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
      {/* Font Family */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Font Family
        </label>
        <select
          value={settings.typography?.fontFamily || "Georgia, serif"}
          onChange={(e) =>
            handleChange("typography", "fontFamily", e.target.value)
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Font Size (pt)
        </label>
        <input
          type="number"
          min="6"
          max="72"
          value={settings.typography?.fontSize || 12}
          onChange={(e) =>
            handleChange("typography", "fontSize", parseFloat(e.target.value))
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        />
      </div>

      {/* Line Height */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Line Height
        </label>
        <input
          type="number"
          min="1"
          max="3"
          step="0.1"
          value={settings.typography?.lineHeight || 1.5}
          onChange={(e) =>
            handleChange("typography", "lineHeight", parseFloat(e.target.value))
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        />
      </div>

      {/* Paragraph Spacing */}
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
            Space Before (pt)
          </label>
          <input
            type="number"
            value={settings.typography?.paragraphSpaceBefore || 0}
            onChange={(e) =>
              handleChange(
                "typography",
                "paragraphSpaceBefore",
                parseFloat(e.target.value),
              )
            }
            className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
            Space After (pt)
          </label>
          <input
            type="number"
            value={settings.typography?.paragraphSpaceAfter || 12}
            onChange={(e) =>
              handleChange(
                "typography",
                "paragraphSpaceAfter",
                parseFloat(e.target.value),
              )
            }
            className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="flex flex-col gap-1">
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
          Alignment
        </label>
        <select
          value={settings.typography?.alignment || "justify"}
          onChange={(e) =>
            handleChange("typography", "alignment", e.target.value)
          }
          className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
        >
          {ALIGNMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* First Line Indent */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.typography?.firstLineIndent || false}
          onChange={(e) =>
            handleChange("typography", "firstLineIndent", e.target.checked)
          }
          className="w-4 h-4"
        />
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
          First Line Indent
        </label>
      </div>

      {settings.typography?.firstLineIndent && (
        <div className="flex flex-col gap-1 ml-6">
          <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
            Indent Value (pt)
          </label>
          <input
            type="number"
            value={settings.typography?.firstLineIndentValue || 15}
            onChange={(e) =>
              handleChange(
                "typography",
                "firstLineIndentValue",
                parseFloat(e.target.value),
              )
            }
            className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
          />
        </div>
      )}

      {/* Hyphenation */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.typography?.hyphenation ?? true}
          onChange={(e) =>
            handleChange("typography", "hyphenation", e.target.checked)
          }
          className="w-4 h-4"
        />
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
          Enable Hyphenation
        </label>
      </div>

      {/* Widow/Orphan Control */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.typography?.widowOrphanControl ?? true}
          onChange={(e) =>
            handleChange("typography", "widowOrphanControl", e.target.checked)
          }
          className="w-4 h-4"
        />
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
          Widow/Orphan Control
        </label>
      </div>

      {/* Drop Caps */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.typography?.dropCaps || false}
          onChange={(e) =>
            handleChange("typography", "dropCaps", e.target.checked)
          }
          className="w-4 h-4"
        />
        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
          Drop Caps
        </label>
      </div>

      {settings.typography?.dropCaps && (
        <div className="flex flex-col gap-1 ml-6">
          <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
            Drop Cap Lines
          </label>
          <input
            type="number"
            min="2"
            max="5"
            value={settings.typography?.dropCapsLines || 3}
            onChange={(e) =>
              handleChange(
                "typography",
                "dropCapsLines",
                parseInt(e.target.value),
              )
            }
            className="w-full px-2 py-1 rounded-md bg-appLayoutInputBg border border-appLayoutBorder text-appLayoutText text-libraryDirectoryBookNodeFontSize"
          />
        </div>
      )}
    </div>
  );
};

TypographySettings.propTypes = {
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  level: PropTypes.string.isRequired,
  onReset: PropTypes.func,
};

export default TypographySettings;
