"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/context/EventContext";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EditEventSheet } from "@/components/edit-event-sheet";

const MyEvents = () => {
  const { myEvents, loading, fetchMine, leaveEvent } = useEvent();
  const router = useRouter();

  useEffect(() => {
    fetchMine();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Events</h1>

      {loading ? (
        <p className="text-gray-500 text-center">Loading events...</p>
      ) : Object.keys(myEvents).length === 0 ||
        (!myEvents.created?.length && !myEvents.participating?.length) ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-gray-500">You have no events yet.</p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/add-event")}>
              <Plus className="mr-2" size={18} /> Add an Event
            </Button>
            <Button variant="outline" onClick={() => router.push("/events")}>
              <Search className="mr-2" size={18} /> Join an Event
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Events Created By User */}
          {myEvents.created?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Events You Created</h2>
              <div className="grid gap-4">
                {myEvents.created.map((event) => (
                  <Card key={event.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <p className="text-sm text-gray-500">{event.address}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 italic">
                        {event.description || "No description available."}
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
          {myEvents.participating?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mt-6 mb-4">Events You're Attending</h2>
              <div className="grid gap-4">
                {myEvents.participating.map((event) => (
                  <Card key={event.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <p className="text-sm text-gray-500">{event.address}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 italic">
                        {event.description || "No description available."}
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
        </>
      )}
    </div>
  );
};

export default MyEvents;

