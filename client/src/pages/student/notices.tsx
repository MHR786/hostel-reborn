import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Notice } from "@shared/schema";

export default function StudentNotices() {
  const { data: notices = [], isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const activeNotices = notices.filter((n) => n.isActive);

  const getPriorityVariant = (priority: string | null) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "LOW":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Notice Board
        </h1>
        <p className="text-muted-foreground">
          Stay updated with hostel announcements
        </p>
      </div>

      {activeNotices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Notices</h3>
              <p className="text-sm text-muted-foreground">
                There are no active notices at the moment.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeNotices.map((notice) => (
            <Card
              key={notice.id}
              className={notice.priority === "URGENT" ? "border-destructive" : ""}
              data-testid={`card-notice-${notice.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {notice.priority === "URGENT" && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span data-testid={`text-notice-title-${notice.id}`}>
                        {notice.title}
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Posted on {format(new Date(notice.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getPriorityVariant(notice.priority)}>
                      {notice.priority || "Normal"}
                    </Badge>
                    <Badge variant="outline">{notice.visibility}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className="text-sm whitespace-pre-wrap"
                  data-testid={`text-notice-content-${notice.id}`}
                >
                  {notice.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
