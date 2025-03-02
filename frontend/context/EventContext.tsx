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
  creator_username?: string | null;
  capacity?: number;
  current_registered: number;
  is_attending: boolean;
}

interface SafeLocation {
  name: string;
  latitude: number;
  longitude: number;
  safety_score: number;
}

interface EventContextType {
  events: Event[];
  myEvents: {};
  loading: boolean;
  safeLocations: SafeLocation[];
  fetchSafeLocations: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchMine: () => Promise<void>;
  createEvent: (eventData: Omit<Event, "id" | "current_registered">) => Promise<boolean>;
  joinEvent: (eventId: number) => Promise<boolean>;
  leaveEvent: (eventId: number) => Promise<boolean>;
  editEvent: (eventId: number, updatedData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: number) => Promise<boolean>;
}


const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSafeLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events/safe", { method: "GET", credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        setSafeLocations(data.courts || []);
      } else {
        toast.error("Failed to fetch safe locations.");
      }
    } catch (error) {
      toast.error("Network error while fetching safe locations.");
    } finally {
      setLoading(false);
    }
  };

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

  // fetch only my events
  const fetchMine = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setMyEvents(data || {});
      } else {
        toast.error("Failed to load my events");
      }
    } catch (error) {
      toast.error("Network error while fetching my events");
    } finally {
      setLoading(false);
    }
  };

  // Create an event
  const createEvent = async (eventData: Omit<Event, "id" | "current_registered">) => {
    try {
      const res = await fetch("/api/events/create", {
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

  const joinEvent = async (eventId: number) => {
    console.log(eventId);
    try {
      const res = await fetch(`/api/events/join/${eventId}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Successfully joined the event!");
        await fetchEvents();
        return true;
      } else {
        toast.error(data.error || "Failed to join the event");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };

  const leaveEvent = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events/leave/${eventId}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("You have left the event.");
        await fetchEvents();
        await fetchMine();
        return true;
      } else {
        toast.error("Failed to leave the event.");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      return false;
    }
  };




  const editEvent = async (eventId: number, updatedData: Partial<Event>) => {
    try {
      const res = await fetch(`/api/events/edit/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        toast.success("Event updated successfully!");
        await Promise.all([fetchEvents(), fetchMine()]);
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
      const res = await fetch(`/api/events/delete/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Event deleted successfully!");
        await Promise.all([fetchEvents(), fetchMine()]);
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
    <EventContext.Provider value={{ events, myEvents, loading, safeLocations, fetchSafeLocations, fetchEvents, fetchMine, createEvent, joinEvent, leaveEvent, editEvent, deleteEvent }}>
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
