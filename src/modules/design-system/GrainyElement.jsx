/**
 * GrainyDiv component displays a div with a dynamic, animated background gradient that simulates a "spotlight" effect following the mouse position.
 * It utilizes motion values and springs for a smooth transition effect, and supports disabling the interaction as well as an active state styling.
 *
 * @component
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional CSS class names to apply to the div.
 * @param {boolean} [props.disabled=false] - Flag indicating if the interactive spotlight effect is disabled.
 * @param {React.ReactNode} [props.children] - Child nodes to render within the div.
 * @param {number} [props.restingPosX=0] - The x-coordinate (as a percentage) where the gradient centers when at rest.
 * @param {number} [props.restingPosY=50] - The y-coordinate (as a percentage) where the gradient centers when at rest.
 * @param {number} [props.gradientSize=125] - The size of the gradient effect.
 * @param {boolean} [props.active=false] - Flag indicating if the active state style should be applied.
 * @returns {JSX.Element} The rendered GrainyDiv component.
 */

import PropTypes from "prop-types";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useCallback, useRef } from "react";

export function GrainyElement(props) {
  const {
    className,
    active = false,
    disabled = false,
    children,
    restingPosX = 50,
    restingPosY = -200,
    gradientSize = 10,
  } = props;

  const grainyDivRef = useRef(null);

  const mouseX = useMotionValue(restingPosX);
  const mouseY = useMotionValue(restingPosY);

  const mouseXSpring = useSpring(mouseX, { stiffness: 400, damping: 50 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 400, damping: 50 });

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    // mouseX.set(((clientX - left) / width) * 100);
    // mouseY.set(((clientY - top) / height) * 100);

    mouseX.set(50);
    mouseY.set(50);
  };

  const handleMouseLeave = useCallback(() => {
    mouseX.set(restingPosX);
    mouseY.set(restingPosY);
  }, []);

  if (disabled) {
    mouseX.set(restingPosX);
    mouseY.set(restingPosY);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(${gradientSize}rem ${gradientSize}rem at ${mouseXSpring}% ${mouseYSpring}%, hsl(var(--appLayoutInverseHover)) 0%, hsl(var(--appBackgroundAccent)))`;

  console.log(spotlightBackground);
  return (
    <motion.div
      ref={grainyDivRef}
      onMouseMove={({ clientX, clientY, currentTarget }) => {
        if (disabled) return;
        handleMouseMove({ clientX, clientY, currentTarget });
      }}
      onMouseLeave={handleMouseLeave}
      className={`transition-colors ease-out duration-200 relative ${
        active && "bg-appLayoutInverseHover"
      } ${className}`}
      style={{
        backgroundBlendMode: "color",
        backgroundSize: "100%",
        backgroundImage: spotlightBackground,
      }}
    >
      <div className="absolute w-full h-full bg-repeat top-0 left-0 noiseFine mix-blend-multiply"></div>
      {children}
    </motion.div>
  );
}

GrainyElement.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  restingPosX: PropTypes.number,
  restingPosY: PropTypes.number,
  gradientSize: PropTypes.number,
};
