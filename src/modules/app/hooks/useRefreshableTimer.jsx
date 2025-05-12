import { useState, useEffect, useRef, useCallback } from "react";

const useRefreshableTimer = ({ time = 250 } = {}) => {
  // timerState increments every time the timer expires
  const [timerState, setTimerState] = useState(true);
  const timerRef = useRef(null);

  const keepAwake = useCallback(() => {
    setTimerState(true);
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const refreshTimer = useCallback(() => {
    setTimerState(true);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Start a new timer
    timerRef.current = setTimeout(() => {
      setTimerState(false);
      console.log("TIMER STATE SET TO FALSE");
    }, time);
  }, [time]);

  // Start the timer on mount and whenever 'time' changes
  useEffect(() => {
    keepAwake();
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [keepAwake]);

  return [timerState, refreshTimer, keepAwake];
};

export default useRefreshableTimer;
