import { useState, useEffect } from "react";
import { db, auth } from "@/src/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Appointment } from "@/src/types";
import { useAuthState } from "react-firebase-hooks/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Car, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function Appointments() {
  const [user] = useAuthState(auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancel = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "cancelled"
      });
      toast.success("Appointment cancelled");
    } catch (error: any) {
      toast.error("Failed to cancel: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "confirmed": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Confirmed</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-6">My Appointments</h2>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black tracking-tighter text-primary">My Appointments</h2>
        <p className="text-lg text-muted-foreground font-medium">Manage your upcoming and past vehicle service bookings.</p>
      </div>

      {appointments.length === 0 ? (
        <Card className="border-4 border-dashed py-20 rounded-[32px] bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="bg-primary/10 p-6 rounded-full">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black">No appointments yet</h3>
              <p className="text-muted-foreground max-w-sm font-medium">You haven't booked any services. Our experts are ready to help you!</p>
            </div>
            <Button asChild size="lg" className="rounded-2xl font-black px-8">
              <Link to="/">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden border-2 shadow-xl rounded-[24px] hover:shadow-2xl transition-all duration-300">
              <div className="bg-muted/50 p-6 border-b-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">{appointment.serviceName}</CardTitle>
                    <CardDescription className="font-bold text-xs uppercase tracking-widest">ID: {appointment.id.slice(0, 8)}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border-2">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Scheduled Date</p>
                      <p className="text-lg font-black">{appointment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border-2">
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preferred Time</p>
                      <p className="text-lg font-black">{appointment.time}</p>
                    </div>
                  </div>
                </div>
                {appointment.description && (
                  <div className="mt-8 p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Service Notes</p>
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                      "{appointment.description}"
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex flex-wrap justify-between items-center gap-4 border-t-2">
                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>Please arrive 10 minutes before your slot.</span>
                </div>
                {appointment.status === "pending" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl font-black text-destructive hover:text-destructive hover:bg-destructive/10 px-6 h-10"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                  </Button>
                )}
                {appointment.status === "completed" && (
                  <div className="flex items-center gap-2 text-accent text-lg font-black">
                    <CheckCircle2 className="h-6 w-6" /> Service Completed
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
