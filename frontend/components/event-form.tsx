"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvent } from "@/context/EventContext";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

export function EventForm({ className, ...props }: React.ComponentProps<"div">) {
  const { createEvent } = useEvent();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [safeLocations, setSafeLocations] = useState<{ name: string; latitude: number; longitude: number; safety_score: number }[]>([]);
  const maxChars = 200;

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      setDescription(e.target.value);
    } else {
      toast.error(`Description must be ${maxChars} characters or less.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const startDateTime = `${date}T${time}:00`;

    const eventData: Record<string, any> = {
      name,
      address,
      description,
      start_time: startDateTime,
      end_time: null,
    };

    if (capacity.trim() !== "") {
      eventData.capacity = parseInt(capacity, 10);
    }

    const success = await createEvent(eventData);

    if (success) {
      toast.success("Event created successfully!");
      setName("");
      setDate("");
      setTime("");
      setAddress("");
      setCapacity("");
      setDescription("");
    } else {
      toast.error("Failed to create event.");
    }

    setLoading(false);
  };

  const fetchSafeLocations = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/events/safe", { method: "GET", credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        setSafeLocations(data.courts || []);
      } else {
        toast.error("Failed to fetch safe locations.");
      }
    } catch (error) {
      toast.error("Network error while fetching locations.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 max-w-lg mx-auto", className)} {...props}>
      <Card className="overflow-hidden p-0 w-full">
        <CardContent className="p-6">
          <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create an Event</h1>
              <p className="text-muted-foreground text-sm">Fill in the details below to schedule an event.</p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" type="text" placeholder="Event Name" required value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} disabled={loading} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" type="text" placeholder="Event Address" required value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input id="capacity" type="number" placeholder="Leave empty for unlimited" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={loading} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description (Max {maxChars} characters)</Label>
              <Textarea id="description" placeholder="Event description..." rows={3} required value={description} onChange={handleDescriptionChange} disabled={loading} className="resize-none" />
              <p className="text-right text-sm text-gray-500">{description.length}/{maxChars} characters</p>
            </div>

            {/* Safe Location Suggestions */}
            <div className="grid gap-3">
              <Label>Need a Safe Location Suggestion?</Label>
              <Button type="button" variant="outline" onClick={fetchSafeLocations} disabled={loadingSuggestions}>
                {loadingSuggestions ? "Finding Safe Locations..." : <><Search className="mr-2" size={18} /> Suggest a Safe Location</>}
              </Button>

              {/* Display Safe Location Options */}
              {safeLocations.length > 0 && (
                <div className="mt-2">
                  <Label>Suggested Locations (Click to Select)</Label>
                  <ul className="border rounded p-2 bg-gray-50 max-h-40 overflow-y-auto">
                    {safeLocations.map((court, index) => (
                      <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center" onClick={() => setAddress(court.name)}>
                        <span>{court.name}</span>
                        <span className="text-sm text-gray-600">Score: {court.safety_score}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

