import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialDuration = 60) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Start timer
  const start = useCallback(() => {
    if (isFinished) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, initialDuration - Math.floor(elapsed / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        stop();
        setIsFinished(true);
      }
    }, 100);
  }, [initialDuration, isFinished]);

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    pausedTimeRef.current = Date.now() - startTimeRef.current;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning]);

  // Stop timer
  const stop = useCallback(() => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset timer
  const reset = useCallback((newDuration = initialDuration) => {
    stop();
    setTimeLeft(newDuration);
    setIsFinished(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [initialDuration, stop]);

  // Get elapsed time
  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return isRunning ? Date.now() - startTimeRef.current : pausedTimeRef.current;
  }, [isRunning]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  }, [initialDuration, timeLeft]);

  // Format time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isRunning,
    isFinished,
    start,
    pause,
    stop,
    reset,
    getElapsedTime,
    getProgress,
    formatTime
  };
};
