import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { Utensils, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import type { MealRecord, MealRate } from "@shared/schema";

export default function StudentMeals() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: mealRecords = [], isLoading: recordsLoading } = useQuery<MealRecord[]>({
    queryKey: ["/api/meal-records", { studentId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: mealRates = [], isLoading: ratesLoading } = useQuery<MealRate[]>({
    queryKey: ["/api/meal-rates"],
  });

  const getRate = (mealType: string) => {
    const rate = mealRates.find((r) => r.mealType === mealType && r.isActive);
    return rate ? parseFloat(rate.rate as string) : 0;
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMealRecord = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return mealRecords.find((r) => r.date === dateStr);
  };

  const monthlyStats = daysInMonth.reduce(
    (acc, day) => {
      const record = getMealRecord(day);
      if (record) {
        if (record.breakfast) acc.breakfast++;
        if (record.lunch) acc.lunch++;
        if (record.dinner) acc.dinner++;
      }
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0 }
  );

  const breakfastRate = getRate("BREAKFAST");
  const lunchRate = getRate("LUNCH");
  const dinnerRate = getRate("DINNER");

  const totalCost =
    monthlyStats.breakfast * breakfastRate +
    monthlyStats.lunch * lunchRate +
    monthlyStats.dinner * dinnerRate;

  const isLoading = recordsLoading || ratesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          Meal Records
        </h1>
        <p className="text-muted-foreground">
          Track your daily meals and monthly expenses
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium min-w-[140px] text-center" data-testid="text-current-month">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Breakfast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-breakfast-count">
              {monthlyStats.breakfast}
            </p>
            <p className="text-xs text-muted-foreground">
              Rs. {(monthlyStats.breakfast * breakfastRate).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lunch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-lunch-count">
              {monthlyStats.lunch}
            </p>
            <p className="text-xs text-muted-foreground">
              Rs. {(monthlyStats.lunch * lunchRate).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dinner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-dinner-count">
              {monthlyStats.dinner}
            </p>
            <p className="text-xs text-muted-foreground">
              Rs. {(monthlyStats.dinner * dinnerRate).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary" data-testid="text-total-cost">
              Rs. {totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-center">Breakfast</TableHead>
                  <TableHead className="text-center">Lunch</TableHead>
                  <TableHead className="text-center">Dinner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daysInMonth.map((day) => {
                  const record = getMealRecord(day);
                  const isPast = day <= new Date();
                  return (
                    <TableRow
                      key={format(day, "yyyy-MM-dd")}
                      className={!isPast ? "opacity-50" : ""}
                      data-testid={`row-meal-${format(day, "yyyy-MM-dd")}`}
                    >
                      <TableCell className="font-medium">
                        {format(day, "d")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(day, "EEE")}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.breakfast ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="outline" className="gap-1">
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.lunch ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="outline" className="gap-1">
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {record?.dinner ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="outline" className="gap-1">
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meal Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Breakfast</p>
              <p className="font-semibold">Rs. {breakfastRate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lunch</p>
              <p className="font-semibold">Rs. {lunchRate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dinner</p>
              <p className="font-semibold">Rs. {dinnerRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
