"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useEvent } from "@/context/EventContext";
import { X } from "lucide-react";

interface EditEventSheetProps {
  event: {
    id: number;
    name: string;
    address: string;
    description: string;
    start_time: string;
    end_time?: string | null;
    capacity?: number;
  };
}

export function EditEventSheet({ event }: EditEventSheetProps) {
  const { editEvent, deleteEvent, fetchEvents } = useEvent();
  const [formData, setFormData] = useState({
    name: event.name,
    address: event.address,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time || "",
    capacity: event.capacity || "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit edit
  const handleSubmit = async () => {
    setLoading(true);
    const success = await editEvent(event.id, formData);

    if (success) {
      toast.success("Event updated successfully!");
      fetchEvents(); // Refresh event list
    } else {
      toast.error("Failed to update event.");
    }

    setLoading(false);
  };

  // Delete event
  const handleDelete = async () => {
    const success = await deleteEvent(event.id);

    if (success) {
      toast.success("Event deleted successfully!");
      fetchEvents();
    } else {
      toast.error("Failed to delete event.");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Event</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Event</SheetTitle>
          <SheetDescription>Modify the event details and save changes.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right pr-2">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right pr-2">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right pr-2">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_time" className="text-right pr-2">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_time" className="text-right pr-2">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right pr-2">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter className="flex justify-between">
          {/* Delete Confirmation */}
          {/* Save Changes */}
          <SheetClose asChild>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </SheetClose>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="mr-2" size={16} /> Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Deleting this event will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

