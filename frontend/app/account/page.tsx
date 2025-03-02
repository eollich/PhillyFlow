"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, User, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, updateLocation, logout } = useAuth();
  const [location, setLocation] = useState(user?.location || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateLocation = async () => {
    setLoading(true);
    const success = await updateLocation(location);
    if (success) {
      toast.success("Location updated successfully!");
    } else {
      toast.error("Failed to update location.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  console.log(user);
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Account Settings</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User size={20} /> Profile
          </h2>
          <p className="text-gray-500 mt-1">Manage your account details.</p>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user?.username || "N/A"} disabled className="bg-gray-100" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || "N/A"} disabled className="bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Update Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin size={20} /> Location
          </h2>
          <p className="text-gray-500 mt-1">Update your current location.</p>

          <div className="mt-4 flex gap-4">
            <Input
              id="location"
              value={location}
              placeholder="Enter your location"
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button onClick={handleUpdateLocation} disabled={loading}>
              {loading ? "Updating..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin size={20} /> Radius
          </h2>
          <p className="text-gray-500 mt-1">Update your current search radius.</p>

          <div className="mt-4 flex gap-4">
            <Input
              id="radius"
              value={0.1}
              placeholder="Enter your radius"
              onChange={() => { }}
            />
            <Button onClick={() => { }} disabled={loading}>
              {loading ? "Updating..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button onClick={handleLogout} variant="destructive" className="w-full">
        <LogOut className="mr-2" /> Logout
      </Button>
    </div >
  );
}

