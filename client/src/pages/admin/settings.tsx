import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, DollarSign, Clock, Building2, Save } from "lucide-react";
import type { MealRate, SystemConfig } from "@shared/schema";

const mealRateSchema = z.object({
  breakfast: z.string().min(1, "Required"),
  lunch: z.string().min(1, "Required"),
  dinner: z.string().min(1, "Required"),
});

const timingsSchema = z.object({
  checkInTime: z.string().min(1, "Required"),
  checkOutTime: z.string().min(1, "Required"),
  gateCloseTime: z.string().min(1, "Required"),
  messTiming: z.string().min(1, "Required"),
});

const hostelInfoSchema = z.object({
  hostelName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
});

type MealRateFormData = z.infer<typeof mealRateSchema>;
type TimingsFormData = z.infer<typeof timingsSchema>;
type HostelInfoFormData = z.infer<typeof hostelInfoSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: mealRates = [], isLoading: mealRatesLoading } = useQuery<MealRate[]>({
    queryKey: ["/api/meal-rates"],
  });

  const { data: configs = [], isLoading: configsLoading } = useQuery<SystemConfig[]>({
    queryKey: ["/api/system-config"],
  });

  const getConfigValue = (key: string) => {
    return configs.find((c) => c.key === key)?.value || "";
  };

  const mealRateForm = useForm<MealRateFormData>({
    resolver: zodResolver(mealRateSchema),
    defaultValues: {
      breakfast: "50",
      lunch: "80",
      dinner: "80",
    },
  });

  const timingsForm = useForm<TimingsFormData>({
    resolver: zodResolver(timingsSchema),
    defaultValues: {
      checkInTime: "06:00",
      checkOutTime: "22:00",
      gateCloseTime: "22:30",
      messTiming: "07:00 - 09:00, 12:00 - 14:00, 19:00 - 21:00",
    },
  });

  const hostelInfoForm = useForm<HostelInfoFormData>({
    resolver: zodResolver(hostelInfoSchema),
    defaultValues: {
      hostelName: "HMS Hostel",
      address: "123 University Road",
      phone: "+91 9876543210",
      email: "admin@hms.com",
    },
  });

  const updateMealRatesMutation = useMutation({
    mutationFn: async (data: MealRateFormData) => {
      const meals = [
        { mealType: "BREAKFAST", rate: data.breakfast },
        { mealType: "LUNCH", rate: data.lunch },
        { mealType: "DINNER", rate: data.dinner },
      ];
      for (const meal of meals) {
        await apiRequest("POST", "/api/meal-rates", {
          ...meal,
          effectiveFrom: new Date().toISOString().split("T")[0],
          isActive: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-rates"] });
      toast({ title: "Meal rates updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update meal rates", variant: "destructive" });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }[]) => {
      for (const config of data) {
        await apiRequest("POST", "/api/system-config", config);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-config"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const onMealRatesSubmit = (data: MealRateFormData) => {
    updateMealRatesMutation.mutate(data);
  };

  const onTimingsSubmit = (data: TimingsFormData) => {
    updateConfigMutation.mutate([
      { key: "CHECK_IN_TIME", value: data.checkInTime },
      { key: "CHECK_OUT_TIME", value: data.checkOutTime },
      { key: "GATE_CLOSE_TIME", value: data.gateCloseTime },
      { key: "MESS_TIMING", value: data.messTiming },
    ]);
  };

  const onHostelInfoSubmit = (data: HostelInfoFormData) => {
    updateConfigMutation.mutate([
      { key: "HOSTEL_NAME", value: data.hostelName },
      { key: "HOSTEL_ADDRESS", value: data.address },
      { key: "HOSTEL_PHONE", value: data.phone },
      { key: "HOSTEL_EMAIL", value: data.email },
    ]);
  };

  const isLoading = mealRatesLoading || configsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Configure system settings" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure hostel and system settings"
      />

      <Tabs defaultValue="meal-rates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="meal-rates" data-testid="tab-meal-rates">
            <DollarSign className="h-4 w-4 mr-2" />
            Meal Rates
          </TabsTrigger>
          <TabsTrigger value="timings" data-testid="tab-timings">
            <Clock className="h-4 w-4 mr-2" />
            Timings
          </TabsTrigger>
          <TabsTrigger value="hostel-info" data-testid="tab-hostel-info">
            <Building2 className="h-4 w-4 mr-2" />
            Hostel Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meal-rates">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meal Rates</CardTitle>
              <CardDescription>
                Configure daily meal rates for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...mealRateForm}>
                <form onSubmit={mealRateForm.handleSubmit(onMealRatesSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={mealRateForm.control}
                      name="breakfast"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breakfast Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              {...field}
                              data-testid="input-breakfast-rate"
                            />
                          </FormControl>
                          <FormDescription>Price per meal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mealRateForm.control}
                      name="lunch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lunch Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="80"
                              {...field}
                              data-testid="input-lunch-rate"
                            />
                          </FormControl>
                          <FormDescription>Price per meal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mealRateForm.control}
                      name="dinner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dinner Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="80"
                              {...field}
                              data-testid="input-dinner-rate"
                            />
                          </FormControl>
                          <FormDescription>Price per meal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateMealRatesMutation.isPending}
                      data-testid="button-save-meal-rates"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Meal Rates
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hostel Timings</CardTitle>
              <CardDescription>
                Configure check-in, check-out and other timings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...timingsForm}>
                <form onSubmit={timingsForm.handleSubmit(onTimingsSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={timingsForm.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              data-testid="input-check-in-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={timingsForm.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              data-testid="input-check-out-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={timingsForm.control}
                      name="gateCloseTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gate Close Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              data-testid="input-gate-close-time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={timingsForm.control}
                      name="messTiming"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mess Timings</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="07:00-09:00, 12:00-14:00, 19:00-21:00"
                              {...field}
                              data-testid="input-mess-timing"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateConfigMutation.isPending}
                      data-testid="button-save-timings"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Timings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hostel-info">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hostel Information</CardTitle>
              <CardDescription>
                Configure hostel name, address and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...hostelInfoForm}>
                <form onSubmit={hostelInfoForm.handleSubmit(onHostelInfoSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={hostelInfoForm.control}
                      name="hostelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostel Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="HMS Hostel"
                              {...field}
                              data-testid="input-hostel-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hostelInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="admin@hms.com"
                              {...field}
                              data-testid="input-hostel-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hostelInfoForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+91 9876543210"
                              {...field}
                              data-testid="input-hostel-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hostelInfoForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 University Road"
                              {...field}
                              data-testid="input-hostel-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateConfigMutation.isPending}
                      data-testid="button-save-hostel-info"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Information
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
