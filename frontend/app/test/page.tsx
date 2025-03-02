"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // For description
import { toast } from "sonner";

export default function EventForm() {
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API request (Replace with actual logic)
    setTimeout(() => {
      setLoading(false);
      toast.success("Event created successfully!");
      setEventName("");
      setDate("");
      setTime("");
      setLocation("");
      setDescription("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create an Event</h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details below to schedule an event.
              </p>
            </div>

            {/* Event Name */}
            <div className="grid gap-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                type="text"
                placeholder="Enter event name"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Time */}
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter event location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Event..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

