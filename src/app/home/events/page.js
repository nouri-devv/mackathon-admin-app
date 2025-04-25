"use client";

import { useState } from "react";
import StaffSidebarLayout from "@/components/StaffSidebarLayout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

const tagOptions = ["Academic", "Social", "Sport", "Cultural", "Career"];

export default function StaffEvents() {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Career Fair 2025",
      date: "2025-04-30",
      time: "10:00 AM",
      tag: "Career",
    },
    {
      id: 2,
      name: "Leadership Workshop",
      date: "2025-05-02",
      time: "2:00 PM",
      tag: "Academic",
    },
    {
      id: 3,
      name: "Hackathon Showcase",
      date: "2025-05-05",
      time: "5:00 PM",
      tag: "Social",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    tag: tagOptions[0],
    editId: null,
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterTag, setFilterTag] = useState("All");

  const formatDate = (dateObj) => dateObj.toISOString().split("T")[0];

  const eventsOnSelectedDate = events.filter(
    (e) =>
      e.date === formatDate(selectedDate) &&
      (filterTag === "All" || e.tag === filterTag)
  );

  const filteredEvents = events.filter(
    (e) => filterTag === "All" || e.tag === filterTag
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, date, time, tag } = form;
    if (!name || !date || !time || !tag) return;

    if (form.editId !== null) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === form.editId
            ? { ...event, name, date, time, tag }
            : event
        )
      );
    } else {
      const newEvent = {
        id: Date.now(),
        name,
        date,
        time,
        tag,
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    setForm({ name: "", date: "", time: "", tag: tagOptions[0], editId: null });
  };

  const handleEdit = (event) => {
    setForm({
      name: event.name,
      date: event.date,
      time: event.time,
      tag: event.tag,
      editId: event.id,
    });
  };

  const handleDelete = (id) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <StaffSidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Heading */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-4xl font-extrabold text-gray-800">
          Event Portal
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            {form.editId ? "Edit Event" : "Create New Event"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              type="text"
              placeholder="Event Name"
              className="p-3 border rounded-xl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="date"
              className="p-3 border rounded-xl"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              type="time"
              className="p-3 border rounded-xl"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <select
              className="p-3 border rounded-xl"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            >
              {tagOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-full md:col-span-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
            >
              {form.editId ? "Update Event" : "Add Event"}
            </button>
          </form>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center px-2">
          <span className="text-lg font-medium text-gray-700">Filter by Tag:</span>
          <button
            onClick={() => setFilterTag("All")}
            className={`px-4 py-1 rounded-full border ${
              filterTag === "All"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            All
          </button>
          {tagOptions.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-1 rounded-full border ${
                filterTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Calendar + List */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">🗓️ Calendar</h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) => {
                const isEventDay = events.some(
                  (e) => e.date === formatDate(date) && (filterTag === "All" || e.tag === filterTag)
                );
                return isEventDay
                  ? "bg-blue-100 text-blue-700 font-bold rounded-md"
                  : "";
              }}
            />
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-700">
                Events on {selectedDate.toDateString()}
              </h3>
              <ul className="mt-3 space-y-3">
                {eventsOnSelectedDate.length > 0 ? (
                  eventsOnSelectedDate.map((event) => (
                    <li
                      key={event.id}
                      className="bg-blue-50 p-4 rounded-lg shadow-sm"
                    >
                      <strong className="text-blue-700">{event.name}</strong>
                      <p className="text-gray-600">
                        {event.time} •{" "}
                        <span className="inline-block px-2 py-0.5 text-sm bg-blue-200 text-blue-800 rounded-full">
                          {event.tag}
                        </span>
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No events on this day.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Event List */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">📋 All Events</h2>
            <ul className="space-y-6">
              {filteredEvents.map((event) => (
                <li
                  key={event.id}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-xl text-blue-700">{event.name}</strong>
                      <p className="text-gray-600">
                        {event.date} – {event.time}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-sm bg-blue-200 text-blue-800 rounded-full">
                        {event.tag}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-4 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </StaffSidebarLayout>
  );
}
