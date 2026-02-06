import Checkbox from "./Checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import PropTypes from "prop-types";

const DialogWrapper = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  options,
  onSubmit,
  submitLabel,
  destructive,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30  z-[10001]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] z-[10002] translate-y-[-50%] w-full max-w-[30rem] bg-appBackgroundAccent border border-appLayoutBorder rounded-md shadow-2xl shadow-appLayoutGentleShadow">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <Dialog.Title className="text-[1.1rem] text-appLayoutText px-4 pt-3">
                {title}
              </Dialog.Title>
              <Dialog.Close className="p-1 mt-1 mr-1 h-full" asChild>
                <button
                  className={`h-full flex items-center border border-appLayoutBorder justify-center w-fit p-px rounded-md text-appLayoutHighlight hover:bg-appLayoutInverseHover `}
                >
                  <span className="icon-[material-symbols-light--close-rounded] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted "></span>
                </button>
              </Dialog.Close>
            </div>

            {description && (
              <Dialog.Description className="text-optionsDropdownOptionFont text-appLayoutTextMuted px-4">
                {description}
              </Dialog.Description>
            )}

            {options &&
              options.map((option, index) => {
                return (
                  <div
                    key={option.label}
                    className="flex items-center justify-start gap-2 z-[10002] px-4 pb-2"
                  >
                    <Checkbox
                      checked={option.checked}
                      onCheckedChange={option.onChange}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="dontAskAgain"
                      className="text-optionsDropdownOptionFont text-appLayoutText cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                );
              })}
            <div className="flex items-center justify-end gap-2 px-4 pb-4">
              <div className="h-full">
                <Dialog.Close
                  className={`h-full flex items-center border border-appLayoutBorder justify-center w-fit px-2 pt-px rounded-sm text-appLayoutHighlight text-optionsDropdownOptionFont hover:bg-appLayoutInverseHover `}
                >
                  Cancel
                </Dialog.Close>
              </div>
              <div className="h-full">
                <button
                  className={`h-full flex items-center justify-center w-fit px-2 pt-px rounded-sm text-appLayoutHighlight text-optionsDropdownOptionFont  
                      ${destructive ? "bg-appLayoutDestruct/50 hover:bg-appLayoutDestruct/80" : "hover:bg-appLayoutInverseHover"}
                      `}
                  onClick={onSubmit}
                >
                  {submitLabel || "OK"}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

DialogWrapper.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  trigger: PropTypes.node,
};

export default DialogWrapper;
