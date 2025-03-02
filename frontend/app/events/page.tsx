"use client";

import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";

const Events = () => {
  const { events, loading, fetchEvents } = useEvent(); // ✅ Get loading state

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      {/* ✅ Proper loading handling */}
      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events available.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="p-4 border rounded shadow">
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <p className="text-sm text-gray-600">{event.address}</p>
              <p className="text-sm text-gray-600">
                {new Date(event.start_time).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Events;

