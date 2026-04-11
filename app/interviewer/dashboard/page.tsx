"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/common/navbar";
import AuthWrapper from "@/components/auth/auth-wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import {
  useInterviewerAvailability,
  useMyInterviewerBookings,
  useUpdateAvailability,
} from "@/hooks/use-interviewer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Settings,
  Video,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function InterviewerDashboard() {
  const { user } = useAuth();
  const { data: availabilityData, isLoading } = useInterviewerAvailability(
    user?.id || "",
  );
  const updateAvailability = useUpdateAvailability();

  // Local state for editing availability
  const [weeklySlots, setWeeklySlots] = useState<any[]>([]);

  // Initialize/Sync slots when data loads or changes
  useEffect(() => {
    if (availabilityData?.availability?.weeklySlots) {
      setWeeklySlots(availabilityData.availability.weeklySlots);
    }
  }, [availabilityData]);

  const handleAddSlot = (dayIdx: number) => {
    setWeeklySlots([
      ...weeklySlots,
      { dayOfWeek: dayIdx, startTime: "09:00", endTime: "10:00" },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setWeeklySlots(weeklySlots.filter((_, i) => i !== index));
  };

  const handleUpdateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...weeklySlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setWeeklySlots(newSlots);
  };

  const saveAvailability = () => {
    updateAvailability.mutate(
      {
        weeklySlots,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      {
        onSuccess: () => {
          toast.success("Availability updated!");
        },
        onError: () => {
          toast.error("Failed to update availability");
        },
      },
    );
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Interviewer Portal
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your schedule and upcoming peer interviews.
              </p>
            </div>
          </div>

          <Tabs defaultValue="availability" className="space-y-8">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="availability" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Video className="w-4 h-4" />
                Upcoming Interviews
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Profile Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="availability">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-primary/5 shadow-xl">
                    <CardHeader>
                      <CardTitle>Weekly Recurring Schedule</CardTitle>
                      <CardDescription>
                        Set the times you are typically available for interviews
                        each week.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {DAYS.map((day, dayIdx) => {
                        const daySlots = weeklySlots.filter(
                          (s) => s.dayOfWeek === dayIdx,
                        );
                        return (
                          <div
                            key={day}
                            className="space-y-4 pb-6 border-b last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold text-lg">{day}</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddSlot(dayIdx)}
                                className="gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Slot
                              </Button>
                            </div>

                            {daySlots.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">
                                No availability set for this day.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {weeklySlots.map((slot, globalIdx) => {
                                  if (slot.dayOfWeek !== dayIdx) return null;
                                  return (
                                    <div
                                      key={globalIdx}
                                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border group"
                                    >
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <input
                                        type="time"
                                        className="bg-transparent text-sm font-medium focus:outline-none"
                                        value={slot.startTime}
                                        onChange={(e) =>
                                          handleUpdateSlot(
                                            globalIdx,
                                            "startTime",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <span className="text-muted-foreground">
                                        —
                                      </span>
                                      <input
                                        type="time"
                                        className="bg-transparent text-sm font-medium focus:outline-none"
                                        value={slot.endTime}
                                        onChange={(e) =>
                                          handleUpdateSlot(
                                            globalIdx,
                                            "endTime",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() =>
                                          handleRemoveSlot(globalIdx)
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                    <div className="p-6 border-t bg-primary/5 flex justify-end">
                      <Button
                        className="gap-2 px-8"
                        onClick={saveAvailability}
                        disabled={updateAvailability.isPending}
                      >
                        {updateAvailability.isPending && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-primary/5 shadow-lg bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total Slots:
                        </span>
                        <span className="font-bold">{weeklySlots.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Active Days:
                        </span>
                        <span className="font-bold">
                          {new Set(weeklySlots.map((s) => s.dayOfWeek)).size}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <InterviewerBookingsList />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-primary/5 shadow-xl">
                <CardHeader>
                  <CardTitle>Interviewer Profile</CardTitle>
                  <CardDescription>
                    Update your public information and expertise.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Profile editing functionality coming soon. Currently managed
                    by AI vetting.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthWrapper>
  );
}

function InterviewerBookingsList() {
  const { data: bookings, isLoading } = useMyInterviewerBookings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Fetching your schedule...
        </p>
      </div>
    );

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="border-primary/5 shadow-xl text-center py-20 bg-muted/10 border-2 border-dashed">
        <CardHeader>
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <CardTitle>No Upcoming Interviews</CardTitle>
          <CardDescription>
            New bookings will appear here. Candidates can find you in the
            discovery marketplace.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Scheduled Sessions</h2>
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking: any) => (
          <Card
            key={booking._id}
            className="hover:shadow-md transition-all group border-primary/5"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {booking.candidateId?.name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {booking.candidateId?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(booking.startTime), "PPP p")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:w-auto">
                  {new Date(booking.startTime) > now && (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] animate-pulse"
                    >
                      Live Soon
                    </Badge>
                  )}
                  {new Date(booking.startTime) <= now ? (
                    <Link
                      href={`/interview/human/${booking._id}`}
                      className="flex-1 md:flex-none"
                    >
                      <Button className="w-full md:w-auto gap-2 font-bold shadow-lg shadow-primary/10">
                        <Video className="w-4 h-4" />
                        Join Call
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="w-full md:w-auto gap-2 opacity-50 cursor-not-allowed font-bold"
                      variant="secondary"
                    >
                      <Clock className="w-4 h-4" />
                      Starts at {format(new Date(booking.startTime), "p")}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
