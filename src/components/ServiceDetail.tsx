import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "@/src/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Service } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, DollarSign, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthState } from "react-firebase-hooks/auth";

const MOCK_SERVICES: Record<string, Service> = {
  "oil-change": {
    id: "oil-change",
    name: "Full Synthetic Oil Change",
    description: "Premium synthetic oil change including filter replacement and multi-point inspection. We use high-quality synthetic oil that provides better protection for your engine and lasts longer than conventional oil.",
    price: 3499,
    duration: "45 mins",
    image: "https://mlixq4aghbvb.i.optimole.com/w:1500/h:1000/q:mauto/f:best/https://fordfixed.com/wp-content/uploads/2023/02/pexels-daniel-andraski-13065690.jpg"
  },
  "brake-service": {
    id: "brake-service",
    name: "Brake Inspection & Service",
    description: "Complete brake system check, pad replacement if necessary, and fluid top-off. Safety is our priority. Our technicians will inspect rotors, calipers, and brake lines to ensure your stopping power is at its peak.",
    price: 5999,
    duration: "1.5 hours",
    image: "https://www.olsonchevrolet.com/blogs/4889/wp-content/uploads/2024/03/Brake-Repair.jpg"
  },
  "tire-rotation": {
    id: "tire-rotation",
    name: "Tire Rotation & Balance",
    description: "Extend tire life with professional rotation and precision balancing. Regular rotation ensures even wear and a smoother ride.",
    price: 1299,
    duration: "30 mins",
    image: "https://gaywheels.com/wp-content/uploads/2018/04/tire-rotation3.jpg"
  },
  "engine-diag": {
    id: "engine-diag",
    name: "Engine Diagnostics",
    description: "Full computer diagnostic scan to identify performance issues or check engine lights. We use state-of-the-art equipment to pinpoint exactly what's wrong with your vehicle.",
    price: 2499,
    duration: "1 hour",
    image: "https://img.freepik.com/premium-photo/hightech-car-engine-diagnostic-tool-displaying-data-screen-mechanic-inspection_416256-34828.jpg"
  },
  "ac-recharge": {
    id: "ac-recharge",
    name: "A/C System Recharge",
    description: "Evacuate and recharge your vehicle's air conditioning system for maximum cooling. Don't sweat it out this summer.",
    price: 2999,
    duration: "1 hour",
    image: "https://www.slashgear.com/img/gallery/how-to-tell-if-your-cars-ac-needs-charging/l-intro-1712927707.jpg"
  },
  "detailing": {
    id: "detailing",
    name: "Full Interior & Exterior Detail",
    description: "Deep clean and protection for your vehicle inside and out. Includes hand wash, wax, vacuum, shampoo, and leather conditioning.",
    price: 8999,
    duration: "4 hours",
    image: "https://images.squarespace-cdn.com/content/v1/6702bdfaf6a8fd44becebb53/62f1fd1f-5226-414f-867e-7bc3058b601a/exterior-interior+detailing2.jpg"
  }
};

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

export function ServiceDetail({ mode = "view" }: { mode?: "view" | "book" }) {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [time, setTime] = useState<string>("");
  const [description, setDescription] = useState("");
  const [booking, setBooking] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "services", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Service;
          // Robust matching by ID or Name to ensure car-themed visuals are used
          let mockMatch = MOCK_SERVICES[id];
          if (!mockMatch) {
            mockMatch = Object.values(MOCK_SERVICES).find(m => 
              m.name.toLowerCase().includes(data.name.toLowerCase()) ||
              data.name.toLowerCase().includes(m.name.toLowerCase())
            );
          }
          setService({ 
            id: docSnap.id, 
            ...data, 
            image: mockMatch ? mockMatch.image : data.image 
          } as Service);
        } else if (MOCK_SERVICES[id]) {
          setService(MOCK_SERVICES[id]);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        if (MOCK_SERVICES[id]) setService(MOCK_SERVICES[id]);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book a service");
      navigate("/login");
      return;
    }

    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error("Selected date cannot be in the past");
      return;
    }
    if (date.getDay() === 0) {
      toast.error("Sundays are not available for booking. Please pick another day.");
      return;
    }

    setBooking(true);
    try {
      await addDoc(collection(db, "appointments"), {
        userId: user.uid,
        serviceId: service?.id,
        serviceName: service?.name,
        date: format(date, "yyyy-MM-dd"),
        time,
        description,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      toast.success("Appointment requested successfully!");
      navigate("/appointments");
    } catch (error: any) {
      toast.error("Failed to book appointment: " + error.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20">Loading service details...</div>;
  if (!service) return <div className="text-center py-20">Service not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <Button asChild variant="ghost" className="mb-4 font-bold hover:bg-primary/10 hover:text-primary transition-colors">
        <Link to="/"><ChevronLeft className="h-4 w-4 mr-2" /> Back to Services</Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video overflow-hidden rounded-[24px] border-4 border-white shadow-2xl">
            <img 
              src={service.image} 
              alt={service.name} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-black tracking-tighter text-foreground">{service.name}</h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
                <Clock className="h-5 w-5" />
                <span>{service.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold">
                <span className="text-xl">₹</span>
                <span>{service.price.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="text-xl leading-relaxed text-muted-foreground font-medium">
              {service.description}
            </p>
          </div>

          <div className="p-8 bg-card rounded-[24px] border-2 border-border shadow-sm space-y-6">
            <h3 className="text-2xl font-extrabold flex items-center gap-3 text-primary">
              <CheckCircle2 className="h-7 w-7" />
              Service Excellence Guaranteed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Certified Master Technicians",
                "Genuine OEM Parts & Fluids",
                "12-Month / 12,000-Mile Warranty",
                "Complimentary Multi-Point Inspection",
                "Digital Health Report with Photos",
                "Free Interior Vacuum & Exterior Wash"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-bold text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className={cn("sticky top-24 border-2 shadow-2xl rounded-[24px] z-10", mode === "book" ? "border-primary" : "border-border")}>
            <div className="bg-primary p-6 text-white">
              <CardTitle className="text-2xl font-black tracking-tight">
                {mode === "book" ? "Book Appointment" : "Service Summary"}
              </CardTitle>
              <CardDescription className="text-white/80 font-medium mt-1">
                {mode === "book" 
                  ? "Schedule your visit today." 
                  : "Premium automotive care."}
              </CardDescription>
            </div>
            <CardContent className="p-8 space-y-6">
              {mode === "book" ? (
                <>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Date</Label>
                    {!showCalendar ? (
                      <Button
                        type="button"
                        variant={"outline"}
                        onClick={() => setShowCalendar(true)}
                        className={cn(
                          "w-full h-14 justify-start text-left font-bold rounded-xl border-2 hover:border-primary transition-all cursor-pointer",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    ) : (
                      <div className="border-2 rounded-2xl p-2 bg-muted/30">
                        <div className="flex justify-between items-center px-4 mb-2">
                          <span className="text-xs font-bold text-muted-foreground">Ckick a date to select</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-black uppercase"
                            onClick={() => setShowCalendar(false)}
                          >
                            Close
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          required
                          selected={date}
                          onSelect={(d) => {
                            if (d) {
                              setDate(d);
                              setShowCalendar(false);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today || date.getDay() === 0;
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                    {date && !showCalendar && (date < new Date(new Date().setHours(0,0,0,0)) || date.getDay() === 0) && (
                      <p className="text-destructive text-xs font-bold flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        Invalid date selected.
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 px-1">
                      Note: Past dates and Sundays are disabled.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Time</Label>
                    <Select onValueChange={setTime}>
                      <SelectTrigger className="h-12 rounded-xl border-2 font-bold hover:border-primary transition-all">
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 shadow-xl">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot} className="font-bold py-3">{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Special Requirements</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="E.g. Check rear suspension noise..." 
                      className="rounded-xl border-2 min-h-[120px] font-medium p-4 focus-visible:ring-primary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-3 border-b-2 border-dashed">
                    <span className="text-muted-foreground font-bold">Service Fee</span>
                    <span className="text-xl font-black text-primary">₹{service.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-2 border-dashed">
                    <span className="text-muted-foreground font-bold">Estimated Time</span>
                    <span className="font-black">{service.duration}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm font-bold text-primary bg-primary/5 p-4 rounded-2xl border-2 border-primary/10">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>Final price may vary based on vehicle model and additional parts.</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-8 pt-0">
              {mode === "book" ? (
                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/30" onClick={handleBooking} disabled={booking}>
                  {booking ? "Processing..." : "Confirm Appointment"}
                </Button>
              ) : (
                <Button asChild className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/30">
                  <Link to={`/service/${service.id}/book`}>Book Appointment</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
