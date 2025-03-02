"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function EditLocationSheet() {
  const { user, updateLocation } = useAuth();
  const [location, setLocation] = useState(user?.location || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const success = await updateLocation(location);

    if (success) {
      toast.success("Location updated!");
    } else {
      toast.error("Failed to update location.");
    }

    setLoading(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Location</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update Location</SheetTitle>
          <SheetDescription>Change your current location and save the update.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right pr-2">Location</Label>
            <Input
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter className="flex justify-between">
          <SheetClose asChild>
            <Button variant="destructive">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
