import { CalendarDays, CheckCircle2, ClipboardList, Users } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export function PreviewCard() {
  return (
    <Card className="border-primary/15 w-full max-w-md bg-white/95 shadow-[0_16px_40px_-18px_rgba(18,59,112,0.4)]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge>Transport Dashboard Preview</Badge>
          <Badge variant="secondary">18 Seats Available</Badge>
        </div>
        <CardTitle className="text-lg">
          Morning Route: Main Gate to City Stops
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border-border bg-muted/40 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <CalendarDays className="text-primary h-4 w-4" />
              Departure
            </div>
            <p className="text-muted-foreground">6:40 AM</p>
          </div>
          <div className="border-border bg-muted/40 rounded-lg border p-3">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <Users className="text-primary h-4 w-4" />
              Occupancy
            </div>
            <p className="text-muted-foreground">22 / 40 Students</p>
          </div>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="border-border/80 flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <ClipboardList className="text-primary h-4 w-4" />
              Pending Booking Requests
            </span>
            <span className="text-foreground font-semibold">08</span>
          </div>
          <div className="border-border/80 flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="text-primary h-4 w-4" />
              Confirmed Trips Today
            </span>
            <span className="text-foreground font-semibold">12</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
