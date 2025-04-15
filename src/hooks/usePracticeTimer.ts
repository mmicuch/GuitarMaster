import { useState, useEffect, useCallback } from 'react';

interface PracticeTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export const usePracticeTimer = (onTimeUpdate?: (time: PracticeTime) => void) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const formatTime = useCallback((totalSeconds: number): PracticeTime => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive && startTime) {
      intervalId = setInterval(() => {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(formatTime(currentTime));
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, startTime, onTimeUpdate, formatTime]);

  const start = useCallback(() => {
    setStartTime(Date.now());
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    return formatTime(elapsedTime);
  }, [elapsedTime, formatTime]);

  const reset = useCallback(() => {
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  const getFormattedTime = useCallback(() => {
    return formatTime(elapsedTime);
  }, [elapsedTime, formatTime]);

  const getTimeString = useCallback(() => {
    const { hours, minutes, seconds } = formatTime(elapsedTime);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedTime, formatTime]);

  return {
    isActive,
    elapsedTime,
    start,
    stop,
    reset,
    getFormattedTime,
    getTimeString,
  };
};