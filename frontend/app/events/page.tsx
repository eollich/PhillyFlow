"use client";

import { useEffect } from "react";
import { useEvent } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EditEventSheet } from "@/components/edit-event-sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const Events = () => {
  const { events, loading, fetchEvents, joinEvent, leaveEvent, deleteEvent } = useEvent();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Events</h1>

      {loading ? (
        <p className="text-gray-500 text-center">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No events available.</p>
          <Button onClick={() => router.push("/events/create")} className="mt-4">
            <Plus className="mr-2" size={18} /> Add an Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-sm text-gray-500">Hosted by {event.creator_username}</p>
                <p className="text-sm text-gray-600">{event.address}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 mt-2 italic">
                  {event.description || "No description available."}
                </p>

                <div className="mt-4 flex justify-end gap-3">
                  {user && user.username === event.creator_username ? (
                    <>
                      {/* Edit Event Sheet */}
                      <EditEventSheet event={event} />

                      {/* Delete Confirmation Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2" size={16} /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Deleting this event will remove all
                              associated data permanently.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEvent(event.id)}
                              className="bg-red-500 text-white"
                            >
                              Confirm Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
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

export default Events;

