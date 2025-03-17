import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useMemo, useRef, useState } from "react";

const GrainyDiv = ({ children, className, size = 30, disabled }) => {
  const grainyDivRef = useRef(null);

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(-1 * size * 16);
  const mouseXSpring = useSpring(mouseX, { stiffness: "400", damping: "50" });
  const mouseYSpring = useSpring(mouseY, { stiffness: "400", damping: "50" });

  const [hover, setHover] = useState(false);

  const primaryColor = useRef(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--appBackground"
    )
  );

  const hoverColor = useRef(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--appLayoutInverseHover"
    )
  );

  console.log(primaryColor, hoverColor);

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    mouseX.set(((clientX - left) / width) * 100);
    mouseY.set(((clientY - top) / height) * 100);
  };

  const handleMouseLeave = () => {
    mouseX.set(100);
    mouseY.set(100);
    setHover(false);
  };

  if (disabled) {
    mouseX.set(100);
    mouseY.set(100);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(${size}rem ${size}rem at ${mouseXSpring}% ${mouseYSpring}%, #262626 0%, #1F1F1F 100%`;
  return (
    <motion.div
      ref={grainyDivRef}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseMove={({ clientX, clientY, currentTarget }) => {
        if (disabled) return;
        handleMouseMove({ clientX, clientY, currentTarget });
      }}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: spotlightBackground,
      }}
      className={`relative ${className}`}
    >
      <div className="w-full h-full noiseFine mix-blend-multiply"></div>

      <div className="absolute w-full h-full top-0 left-0">{children}</div>
    </motion.div>
  );
};

export default GrainyDiv;
