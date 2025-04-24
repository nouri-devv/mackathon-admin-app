'use client'

import { useState, useEffect } from 'react';

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        {currentTime.toLocaleTimeString()}
      </h1>
      <p className="text-2xl text-gray-600 dark:text-gray-300">
        {currentTime.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  );
}