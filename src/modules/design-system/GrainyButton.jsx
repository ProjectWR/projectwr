import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useMemo, useRef, useState } from "react";

const GrainyButton = ({
  children,
  className,
  size = 30,
  onClick,
  disabled,
}) => {
  const grainyButtonRef = useRef(null);

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
    mouseX.set(50);
    mouseY.set(-1 * size * 16);
    setHover(false);
  };

  if (disabled) {
    mouseX.set(50);
    mouseY.set(-1 * size * 16);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(${size}rem ${size}rem at ${mouseXSpring}% ${mouseYSpring}%, #2E2E2E 0%, #1F1F1F 100%`;
  return (
    <motion.div
      onClick={onClick}
      ref={grainyButtonRef}
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
      <div className="w-full h-full noise mix-blend-multiply"></div>

      <button
        className="absolute w-full h-full top-0 left-0"
        disabled={disabled}
      >
        {children}
      </button>
    </motion.div>
  );
};

export default GrainyButton;
