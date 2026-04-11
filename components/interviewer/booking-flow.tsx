"use client";

import { useState, useMemo } from "react";
import { useInterviewerAvailability, useCreateBooking } from "@/hooks/use-interviewer";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addHours, startOfDay, isSameDay, parse, isAfter } from "date-fns";
import { Clock, Calendar as CalendarIcon, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BookingFlow({ interviewerId }: { interviewerId: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { data: availabilityData, isLoading } = useInterviewerAvailability(interviewerId);
  const createBooking = useCreateBooking();
  const router = useRouter();

  // Helper to generate slots from ranges (e.g., 09:00 - 17:00 -> [09:00, 10:00, ...])
  const availableSlots = useMemo(() => {
    if (!availabilityData || !date) return [];
    
    const dayOfWeek = date.getDay();
    const daySlots = availabilityData.availability.weeklySlots.filter((s: any) => s.dayOfWeek === dayOfWeek);
    
    const slots: Date[] = [];
    daySlots.forEach((range: any) => {
      let current = parse(range.startTime, "HH:mm", date);
      const end = parse(range.endTime, "HH:mm", date);
      
      while (current < end) {
        // Filter out past slots for today
        if (!isAfter(current, new Date())) {
          current = addHours(current, 1);
          continue;
        }

        // Filter out already booked slots
        const isBooked = availabilityData.bookedSlots.some((b: any) => 
          isSameDay(new Date(b.start), date) && 
          format(new Date(b.start), "HH:mm") === format(current, "HH:mm")
        );
        
        if (!isBooked) {
          slots.push(new Date(current));
        }
        current = addHours(current, 1);
      }
    });

    return slots;
  }, [availabilityData, date]);

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    const start = new Date(selectedSlot);
    const end = addHours(start, 1);

    try {
      await createBooking.mutateAsync({
        interviewerId,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      toast.success("Interview booked successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Calendar Selection */}
      <Card className="border-primary/5 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Select Date
          </CardTitle>
          <CardDescription>Choose a day that works for you.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-0 pb-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < startOfDay(new Date())}
            className="rounded-md border-none"
          />
        </CardContent>
      </Card>

      {/* Slot Selection */}
      <Card className="border-primary/5 shadow-xl flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Available Slots
          </CardTitle>
          <CardDescription>
            {date ? format(date, "EEEE, MMMM do") : "Select a date first"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden pb-4">
          <ScrollArea className="h-[280px] w-full pr-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2 py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Loading slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => {
                  const timeKey = slot.toISOString();
                  return (
                    <Button
                      key={timeKey}
                      variant={selectedSlot === timeKey ? "default" : "outline"}
                      className={`h-12 text-sm font-medium ${selectedSlot === timeKey ? "shadow-primary/20 shadow-lg" : "hover:border-primary/50"}`}
                      onClick={() => setSelectedSlot(timeKey)}
                    >
                      {format(slot, "h:mm a")}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground max-w-[200px]">No available slots for this date.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <div className="p-6 border-t mt-auto">
          <Button 
            className="w-full h-12 text-lg font-bold gap-2" 
            disabled={!selectedSlot || createBooking.isPending}
            onClick={handleBooking}
          >
            {createBooking.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
