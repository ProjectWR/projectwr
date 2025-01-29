const dynamicSizeInputElement = ({ steps, className, name, onChange, value }) => {
  const length = value.length;
  console.log(steps);
  let finalFontSize = steps[0][1];

  for (const [step, fontSize] of steps) {
    if (length >= step) {
      finalFontSize = fontSize;
    }
  }

  return (
    <input
      name={name}
      onChange={onChange}
      className={`text-${finalFontSize} ${className}`}
      value={value}
    >
    </input>
  );
};

export default dynamicSizeInputElement;
