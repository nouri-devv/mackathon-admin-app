"use client";

import { useState, useEffect } from "react";
import StaffSidebarLayout from "@/components/StaffSidebarLayout";

export default function StaffHome() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  let greeting = "Good Evening";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";

  const timeString = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <StaffSidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Greeting and Clock */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{greeting}, Staff Member 👋</h1>
            <p className="text-gray-600">Hope you're having a meaningful day!</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-mono text-gray-800">{timeString}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">📅 Upcoming Events</h2>
          <ul className="space-y-3">
            <li className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <strong>Career Fair 2025</strong> – Apr 30, 10:00 AM
            </li>
            <li className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <strong>Leadership Workshop</strong> – May 2, 2:00 PM
            </li>
            <li className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <strong>Hackathon Showcase</strong> – May 2, 7:00 PM
            </li>
          </ul>
        </div>
      </div>
    </StaffSidebarLayout>
  );
}
