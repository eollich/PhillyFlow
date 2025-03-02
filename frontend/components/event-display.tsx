"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

interface EventProps {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  onJoin?: () => void; // Optional function for Join button
  onEdit?: () => void; // Optional function for Edit button
}

export function EventDisplay({ name, date, time, location, description, onJoin, onEdit }: EventProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardContent className="p-6 flex flex-col gap-4">
        {/* Event Name */}
        <h2 className="text-3xl font-bold">{name}</h2>

        {/* Event Details */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>{location}</span>
          </div>
        </div>

        {/* Event Description */}
        <p className="leading-relaxed">{description}</p>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <Button onClick={onJoin} className="bg-green-600 text-white hover:bg-green-700 w-full">
            Join Event
          </Button>
          <Button onClick={onEdit} className="bg-blue-600 text-white hover:bg-blue-700 w-full">
            Edit Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

