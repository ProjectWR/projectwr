export const DetailsPanelNameInput = ({ className, name, onChange, value }) => {
  return (
    <input
      className={`bg-appBackground grow h-full text-detailsPanelNameFontSize text-center
                    focus:bg-appLayoutInputBackground rounded-none focus:outline-none 
                    pt-px pb-2 px-3 pr-1 transition-colors duration-200 order-2 ${className}`}
      name={name}
      onChange={onChange}
      value={value}
    />
  );
};

export const DetailsPanelNameLabel = ({ children, className }) => {
  return (
    <p
      className={`bg-appBackground grow h-full text-detailsPanelNameFontSize 
                       rounded-none focus:outline-none flex items-center justify-center
                        pt-px pb-2 px-3 pr-1 transition-colors duration-200 order-2 ${className}`}
    >
      {children}
    </p>
  );
};
