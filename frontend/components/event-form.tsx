"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EventFormValues {
  name: string;
  date: string;
  time: string;
  address: string;
  capacity?: number;
  description: string;
}

export function EventForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>();

  const maxChars = 200;
  const descriptionValue = watch("description", "");

  const onSubmit = async (data: EventFormValues) => {
    const startDateTime = `${data.date}T${data.time}:00`;

    const eventData: Record<string, any> = {
      name: data.name,
      address: data.address,
      description: data.description,
      start_time: startDateTime,
      end_time: null,
      creator_id: 1, // TODO: Replace with actual user ID
    };

    if (data.capacity) {
      eventData.capacity = data.capacity;
    }

    try {
      const response = await fetch("http://localhost:5858/create_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success("Event created successfully!");
        reset(); // Reset form after successful submission
      } else {
        toast.error(responseData.error || "Failed to create event.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <Card className="overflow-hidden p-0 w-full">
        <CardContent className="p-6">
          <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create an Event</h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details below to schedule an event.
              </p>
            </div>

            {/* Event Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" className="w-full" {...register("name", { required: "Event name is required" })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" className="w-full" {...register("date", { required: "Date is required" })} />
              {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>

            {/* Time */}
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" className="w-full" {...register("time", { required: "Time is required" })} />
              {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" className="w-full" {...register("address", { required: "Address is required" })} />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>

            {/* Capacity (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input id="capacity" type="number" className="w-full" {...register("capacity")} placeholder="Leave empty for unlimited" />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Max {maxChars} characters)</Label>
              <Textarea
                id="description"
                rows={3}
                {...register("description", {
                  required: "Description is required",
                  maxLength: { value: maxChars, message: `Max ${maxChars} characters` },
                })}
                className="w-full resize-none overflow-y-auto max-h-32 border border-gray-300 focus:border-gray-500 rounded-md"
              />
              <p className="text-right text-sm text-gray-500">{descriptionValue.length}/{maxChars} characters</p>
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

