import { useState, useEffect, useRef, useCallback } from "react";

const useRefreshableTimer = ({ time = 3000 } = {}) => {
  // timerState increments every time the timer expires
  const [timerState, setTimerState] = useState(false);
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
    }, time);
  }, [time]);

  const forceClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setTimerState(false);
  }, []);

  // Start the timer on mount and whenever 'time' changes
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [keepAwake]);

  return [timerState, refreshTimer, keepAwake, forceClose];
};

export default useRefreshableTimer;
