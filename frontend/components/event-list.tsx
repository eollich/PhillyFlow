"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, X, Pen } from "lucide-react";
import { EditEventSheet } from "@/components/edit-event-sheet";

interface EventListProps {
  type: "all" | "my"; // "all" for all events, "my" for user's events
}

const EventList = ({ type }: EventListProps) => {
  const { events, myEvents, loading, fetchEvents, fetchMine, joinEvent, leaveEvent } = useEvent();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (type === "all") fetchEvents();
    if (type === "my") fetchMine();
  }, [type]);

  const displayedEvents = type === "all" ? events : myEvents;
  const isMyEvents = type === "my";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isMyEvents ? "My Events" : "Events"}
      </h1>

      {loading ? (
        <p className="text-gray-500 text-center">Loading events...</p>
      ) : Object.keys(displayedEvents).length === 0 ||
        (!displayedEvents.created?.length && !displayedEvents.participating?.length && !events.length) ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-gray-500">
            {isMyEvents ? "You have no events yet." : "No events available."}
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/events/create")}>
              <Plus className="mr-2" size={18} /> Add an Event
            </Button>
            {!isMyEvents && (
              <Button variant="outline" onClick={() => router.push("/events")}>
                <Search className="mr-2" size={18} /> Join an Event
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Events Created By User */}
          {isMyEvents && displayedEvents.created?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Events You Created</h2>
              <div className="grid gap-4">
                {displayedEvents.created.map((event) => (
                  <Card key={event.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <p className="text-sm text-gray-600">{event.address}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleString()}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <EditEventSheet event={event} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Events User is Participating In */}
          {isMyEvents && displayedEvents.participating?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mt-6 mb-4">Events You're Attending</h2>
              <div className="grid gap-4">
                {displayedEvents.participating.map((event) => (
                  <Card key={event.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <p className="text-sm text-gray-600">{event.address}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleString()}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => leaveEvent(event.id)} variant="destructive">
                          <X className="mr-2" size={16} /> Leave Event
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          {!isMyEvents &&
            events.map((event) => (
              <Card key={event.id} className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <p className="text-sm text-gray-500">Hosted by {event.creator_username}</p>
                  <p className="text-sm text-gray-600">{event.address}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleString()}
                  </p>

                  <div className="mt-4 flex justify-end gap-3">
                    {user && user.username === event.creator_username ? (
                      <EditEventSheet event={event} />
                    ) : event.is_attending ? (
                      <Button onClick={() => leaveEvent(event.id)} variant="destructive">
                        <X className="mr-2" size={16} /> Leave Event
                      </Button>
                    ) : (
                      <Button onClick={() => joinEvent(event.id)} variant="outline">
                        <Plus className="mr-2" size={16} /> Join Event
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
