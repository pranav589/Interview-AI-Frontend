import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useInterviewers = (params?: any) => {
  return useQuery({
    queryKey: ["interviewers", params],
    queryFn: async () => {
      const response = await api.get<{ interviewers: any[] }>("interviewer/list", { params });
      return response.interviewers;
    },
  });
};

export const useInterviewerAvailability = (id: string) => {
  return useQuery({
    queryKey: ["interviewer-availability", id],
    queryFn: async () => {
      const response = await api.get<{ availability: any; bookedSlots: any[] }>(`interviewer/availability/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { interviewerId: string; startTime: string; endTime: string }) => {
      const response = await api.post("interviewer/bookings", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewer-availability"] });
    },
  });
};

export const useBookingDetails = (id: string) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const response = await api.get<{ booking: any; videoSDKToken: string }>(`interviewer/bookings/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

export const useMyInterviewerBookings = () => {
  return useQuery({
    queryKey: ["my-bookings", "interviewer"],
    queryFn: async () => {
      const response = await api.get<{ bookings: any[] }>("interviewer/my-bookings/interviewer");
      return response.bookings;
    },
  });
};

export const useMyCandidateBookings = () => {
  return useQuery({
    queryKey: ["my-bookings", "candidate"],
    queryFn: async () => {
      const response = await api.get<{ bookings: any[] }>("interviewer/my-bookings/candidate");
      return response.bookings;
    },
  });
};
export const useCompleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actualDuration }: { id: string; actualDuration?: number }) => {
      return await api.post(`interviewer/bookings/${id}/complete`, { actualDuration });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { weeklySlots: any[]; timezone: string }) => {
      return await api.post("interviewer/availability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewer-availability"] });
    },
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, feedback, score, actualDuration }: { id: string; feedback: string; score: number; actualDuration?: number }) => {
      return await api.post(`interviewer/bookings/${id}/feedback`, { feedback, score, actualDuration });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings", "interviewer"] });
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { answers: string[] }) => {
      return await api.post("interviewer/application", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
