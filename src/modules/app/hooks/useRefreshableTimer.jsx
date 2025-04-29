import { useState, useEffect, useRef, useCallback } from "react";

const useRefreshableTimer = ({ time = 1000 } = {}) => {
  // timerState increments every time the timer expires
  const [timerState, setTimerState] = useState(false);
  const timerRef = useRef(null);

  const refreshTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setTimerState(true);

    // Start a new timer
    timerRef.current = setTimeout(() => {
      setTimerState(false);
    }, time);
  }, [time]);

  // Start the timer on mount and whenever 'time' changes
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [time, refreshTimer]);

  return [timerState, refreshTimer];
};

export default useRefreshableTimer;
