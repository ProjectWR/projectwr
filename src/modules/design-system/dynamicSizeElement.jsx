import React from "react";

const dynamicSizeElement = ({steps, buttonContent = "Default Text"}) => {
    const length = buttonContent.length;
    let finalFontSize = steps[0][1];

    for (const [step, fontSize] of steps) {
        if (length > step) {
            finalFontSize = fontSize;
        }
        
    }

    return (
        <p className={`text-${finalFontSize}`}>{buttonContent}</p>
    )
}

export default React.memo(dynamicSizeElement);