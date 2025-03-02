"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface Event {
  id: number;
  name: string;
  address: string;
  description: string;
  start_time: string;
  end_time?: string | null;
  creator_id: number;
  capacity?: number;
  current_registered: number;
}

interface EventContextType {
  events: Event[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: Omit<Event, "id" | "current_registered">) => Promise<boolean>;
  joinEvent: (eventId: number) => Promise<boolean>;
  editEvent: (eventId: number, updatedData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: number) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events/all", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      toast.error("Network error while fetching events");
    } finally {
      setLoading(false);
    }
  };

  // Create an event
  const createEvent = async (eventData: Omit<Event, "id" | "current_registered">) => {
    try {
      const res = await fetch("http://localhost:5858/create_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        toast.success("Event created successfully!");
        await fetchEvents();
        return true;
      } else {
        toast.error("Failed to create event");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  // Join an event
  const joinEvent = async (eventId: number) => {
    try {
      const res = await fetch(`http://localhost:5858/join_event/${eventId}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Successfully joined the event!");
        await fetchEvents();
        return true;
      } else {
        toast.error("Failed to join the event");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  // Edit an event
  const editEvent = async (eventId: number, updatedData: Partial<Event>) => {
    try {
      const res = await fetch(`http://localhost:5858/edit_event/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        toast.success("Event updated successfully!");
        await fetchEvents();
        return true;
      } else {
        toast.error("Failed to update event");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: number) => {
    try {
      const res = await fetch(`http://localhost:5858/delete_event/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Event deleted successfully!");
        await fetchEvents();
        return true;
      } else {
        toast.error("Failed to delete event");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  // Load events on mount
  //useEffect(() => {
  //  fetchEvents();
  //}, []);

  return (
    <EventContext.Provider value={{ events, loading, fetchEvents, createEvent, joinEvent, editEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
}

// Custom hook for easy access to EventContext
export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
