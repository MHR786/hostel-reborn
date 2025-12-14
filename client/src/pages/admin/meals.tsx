import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Utensils } from "lucide-react";
import type { User, MealRecord } from "@shared/schema";

interface MealRecordWithStudent extends MealRecord {
  student?: User;
}

export default function MealsPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mealStates, setMealStates] = useState<Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>>({});

  const { data: students = [], isLoading: studentsLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: mealRecords = [], isLoading: mealsLoading } = useQuery<MealRecordWithStudent[]>({
    queryKey: ["/api/meal-records", selectedDate],
  });

  const studentList = students.filter((u) => u.role === "STUDENT");

  const saveMutation = useMutation({
    mutationFn: async (data: { date: string; meals: { studentId: string; breakfast: boolean; lunch: boolean; dinner: boolean }[] }) => {
      const res = await apiRequest("POST", "/api/meal-records/bulk", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-records", selectedDate] });
      toast({ title: "Meal records saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save meal records", variant: "destructive" });
    },
  });

  const getMealState = (studentId: string) => {
    if (mealStates[studentId]) {
      return mealStates[studentId];
    }
    const record = mealRecords.find((r) => r.studentId === studentId);
    return {
      breakfast: record?.breakfast || false,
      lunch: record?.lunch || false,
      dinner: record?.dinner || false,
    };
  };

  const toggleMeal = (studentId: string, meal: "breakfast" | "lunch" | "dinner") => {
    const current = getMealState(studentId);
    setMealStates({
      ...mealStates,
      [studentId]: {
        ...current,
        [meal]: !current[meal],
      },
    });
  };

  const handleSave = () => {
    const meals = studentList.map((student) => ({
      studentId: student.id,
      ...getMealState(student.id),
    }));
    saveMutation.mutate({ date: selectedDate, meals });
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setMealStates({});
  };

  const isLoading = studentsLoading || mealsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mark daily meals for students
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
          <Save className="h-4 w-4 mr-2" />
          Save Records
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Daily Meal Record
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(-1)}
                data-testid="button-prev-date"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setMealStates({});
                }}
                className="w-auto"
                data-testid="input-date"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeDate(1)}
                data-testid="button-next-date"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : studentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Utensils className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Student</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Breakfast</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Lunch</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((student) => {
                    const state = getMealState(student.id);
                    return (
                      <tr key={student.id} className="border-b last:border-0" data-testid={`row-${student.id}`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-sm">{student.name}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={state.breakfast}
                            onCheckedChange={() => toggleMeal(student.id, "breakfast")}
                            data-testid={`checkbox-breakfast-${student.id}`}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={state.lunch}
                            onCheckedChange={() => toggleMeal(student.id, "lunch")}
                            data-testid={`checkbox-lunch-${student.id}`}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={state.dinner}
                            onCheckedChange={() => toggleMeal(student.id, "dinner")}
                            data-testid={`checkbox-dinner-${student.id}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
