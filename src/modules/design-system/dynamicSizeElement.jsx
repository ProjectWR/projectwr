import React from "react";

const dynamicSizeElement = ({steps, buttonContent = "Default Text"}) => {
    const length = buttonContent.length;
    console.log(steps);
    let finalFontSize = steps[0][1];

    for (const [step, fontSize] of steps) {
        console.log(step, fontSize);
        if (length > step) {
            finalFontSize = fontSize;
        }
        console.log(finalFontSize);
        
    }

    return (
        <p className={`text-${finalFontSize}`}>{buttonContent}</p>
    )
}

export default React.memo(dynamicSizeElement);