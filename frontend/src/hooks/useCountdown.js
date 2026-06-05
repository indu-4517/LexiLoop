import { useState, useEffect } from 'react';

/**
 * Returns a human-readable countdown string until the given date.
 * Updates every second if under 1 hour, every minute otherwise.
 */
export function useCountdown(targetDate) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setLabel('Due now');
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        setLabel(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setLabel(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setLabel(`${minutes}m ${seconds}s`);
      } else {
        setLabel(`${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return label;
}
