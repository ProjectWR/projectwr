/**
 * Breadcrumbs component.
 *
 * @param {Object} props - Component props.
 * @param {Array<{label: string, action: Function}>} props.breadcrumbs - Array of breadcrumb objects, each containing a label and an action.
 */
export const Breadcrumbs = ({ breadcrumbs = [] }) => {
  return (
    <section className="w-full h-breadCrumbHeight gap-1 flex flex-row flex-nowrap justify-center items-center">
      {breadcrumbs.map(({ label, action }, index) => {
        return (
          <span
            className="h-full w-fit flex flex-row gap-1 flex-nowrap items-center"
            key={label}
          >
            <button
              onClick={action}
              className="w-fit max-w-[10rem] text-breadcrumbItemMaxWidth text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText"
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
