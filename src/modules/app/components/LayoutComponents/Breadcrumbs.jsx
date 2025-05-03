import { useMemo } from "react";
import { appStore } from "../../stores/appStore";
import { DropdownMenu } from "radix-ui";

/**
 * Breadcrumbs component.
 *
 * @param {Object} props - Component props.
 * @param {Array<{label: string, action: Function}>} props.breadcrumbs - Array of breadcrumb objects, each containing a label and an action.
 */
export const Breadcrumbs = ({ breadcrumbs = [] }) => {
  const isMd = appStore((state) => state.isMd);

  const [maxLength, leftLimbSize, rightLimbSize] = useMemo(() => {
    if (isMd) {
      return [6, 3, 3];
    } else {
      return [4, 2, 2];
    }
  }, [isMd]);

  if (breadcrumbs.length >= maxLength) {
    const breadcrumbsLeft = breadcrumbs.slice(0, leftLimbSize);
    const breadcrumbsMiddle = breadcrumbs.slice(
      leftLimbSize,
      -1 * rightLimbSize + 1
    );
    const breadcrumbsRight = breadcrumbs.slice(-1 * rightLimbSize + 1);

    console.log(
      "Breadcrumbs: ",
      breadcrumbs,
      breadcrumbsLeft,
      breadcrumbsMiddle,
      breadcrumbsRight
    );

    return (
      <section className="w-full h-breadCrumbHeight gap-1 flex flex-row flex-nowrap justify-center items-center">
        {breadcrumbsLeft.map(({ label, action }, index) => {
          return (
            <span
              className="h-full w-fit flex flex-row gap-1 flex-nowrap items-center"
              key={`${label}-${index}`}
            >
              <button
                onClick={action}
                className="w-fit max-w-breadcrumbItemMaxWidth text-breadcrumbFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText"
              >
                {label}
              </button>

              <span className="icon-[formkit--right] h-breadcrumbSeperatorSize w-breadcrumbSeperatorSize text-appLayoutTextMuted"></span>
            </span>
          );
        })}

        <span
          className="h-full w-fit flex flex-row gap-1 flex-nowrap items-center"
          key={`moreButton`}
        >
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="w-fit max-w-breadcrumbItemMaxWidth text-breadcrumbFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText">
                ...
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              style={{
                opacity: 1,
              }}
              className="contextMenuContent z-[1100] "
              sideOffset={5}
              align="center"
            >
              {breadcrumbsMiddle.map(({ label, action }, index) => {
                return (
                  <DropdownMenu.Item
                    key={`${label}-${index}`}
                    className={`contextMenuItem`}
                    onClick={action}
                  >
                    <span className="pt-[3px]"> {label}</span>
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <span className="icon-[formkit--right] h-breadcrumbSeperatorSize w-breadcrumbSeperatorSize text-appLayoutTextMuted"></span>
        </span>

        {breadcrumbsRight.map(({ label, action }, index) => {
          return (
            <span
              className="h-full w-fit flex flex-row gap-1 flex-nowrap items-center"
              key={`${label}-${index}`}
            >
              <button
                onClick={action}
                className="w-fit max-w-breadcrumbItemMaxWidth text-breadcrumbFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText"
              >
                {label}
              </button>
              {index < breadcrumbsRight.length - 1 && (
                <span className="icon-[formkit--right] h-breadcrumbSeperatorSize w-breadcrumbSeperatorSize text-appLayoutTextMuted"></span>
              )}{" "}
            </span>
          );
        })}
      </section>
    );
  }

  return (
    <section className="w-full h-breadCrumbHeight gap-1 flex flex-row flex-nowrap justify-center items-center">
      {breadcrumbs.map(({ label, action }, index) => {
        return (
          <span
            className="h-full w-fit flex flex-row gap-1 flex-nowrap items-center"
            key={`${label}-${index}`}
          >
            <button
              onClick={action}
              className="w-fit max-w-breadcrumbItemMaxWidth text-breadcrumbFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText"
            >
              {label}
            </button>
            {index < breadcrumbs.length - 1 && (
              <span className="icon-[formkit--right] h-breadcrumbSeperatorSize w-breadcrumbSeperatorSize text-appLayoutTextMuted"></span>
            )}
          </span>
        );
      })}
    </section>
  );
};
