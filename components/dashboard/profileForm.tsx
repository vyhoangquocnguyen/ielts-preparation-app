"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { updateUserProfile } from "@/lib/actions/user";
import { toast } from "sonner";

interface ProfileFormProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    targetScore: number | null;
    studyGoal: string | null;
  };
}
const ProfileForm = ({ user }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      targetScore: parseFloat(formData.get("targetScore") as string),
      studyGoal: formData.get("studyGoal") as string,
    };
    try {
      // Update user data

      await updateUserProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" type="text" defaultValue={user.firstName || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" type="text" defaultValue={user.lastName || ""} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetScore">Target Score</Label>
        <Select name="targetScore" defaultValue={user.targetScore?.toString() || "7.0"}>
          <SelectTrigger>
            <SelectValue placeholder="Select a target score" />
          </SelectTrigger>
          <SelectContent>
            {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((score) => (
              <SelectItem key={score} value={score.toString()}>
                {score}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="studyGoal">Study Goal</Label>
        <Select name="studyGoal" defaultValue={user.studyGoal || "academic"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
