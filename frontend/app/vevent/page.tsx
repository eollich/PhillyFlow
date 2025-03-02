import { EventDisplay } from "@/components/event-display";

export default function EventPage() {
  const sampleEvent = {
    name: "Philly Flow Conference",
    date: "March 10, 2025",
    time: "6:00 PM - 9:00 PM",
    location: "Philadelphia Convention Center",
    description:
      "Join us for an exciting event featuring guest speakers, networking, and hands-on workshops on the latest trends in technology and innovation.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <EventDisplay {...sampleEvent} />
    </div>
  );
}

