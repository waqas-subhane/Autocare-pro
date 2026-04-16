import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Service } from "@/src/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, DollarSign, ChevronRight, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_SERVICES: Service[] = [
  {
    id: "oil-change",
    name: "Full Synthetic Oil Change",
    description: "Premium synthetic oil change including filter replacement and multi-point inspection.",
    price: 3499,
    duration: "45 mins",
    image: "https://mlixq4aghbvb.i.optimole.com/w:1500/h:1000/q:mauto/f:best/https://fordfixed.com/wp-content/uploads/2023/02/pexels-daniel-andraski-13065690.jpg"
  },
  {
    id: "brake-service",
    name: "Brake Inspection & Service",
    description: "Complete brake system check, pad replacement if necessary, and fluid top-off.",
    price: 5999,
    duration: "1.5 hours",
    image: "https://www.olsonchevrolet.com/blogs/4889/wp-content/uploads/2024/03/Brake-Repair.jpg"
  },
  {
    id: "tire-rotation",
    name: "Tire Rotation & Balance",
    description: "Extend tire life with professional rotation and precision balancing.",
    price: 1299,
    duration: "30 mins",
    image: "https://gaywheels.com/wp-content/uploads/2018/04/tire-rotation3.jpg"
  },
  {
    id: "engine-diag",
    name: "Engine Diagnostics",
    description: "Full computer diagnostic scan to identify performance issues or check engine lights.",
    price: 2499,
    duration: "1 hour",
    image: "https://img.freepik.com/premium-photo/hightech-car-engine-diagnostic-tool-displaying-data-screen-mechanic-inspection_416256-34828.jpg"
  },
  {
    id: "ac-recharge",
    name: "A/C System Recharge",
    description: "Evacuate and recharge your vehicle's air conditioning system for maximum cooling.",
    price: 2999,
    duration: "1 hour",
    image: "https://www.slashgear.com/img/gallery/how-to-tell-if-your-cars-ac-needs-charging/l-intro-1712927707.jpg"
  },
  {
    id: "detailing",
    name: "Full Interior & Exterior Detail",
    description: "Deep clean and protection for your vehicle inside and out.",
    price: 8999,
    duration: "4 hours",
    image: "https://images.squarespace-cdn.com/content/v1/6702bdfaf6a8fd44becebb53/62f1fd1f-5226-414f-867e-7bc3058b601a/exterior-interior+detailing2.jpg"
  }
];

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map(doc => {
          const data = doc.data() as Service;
          // Robust matching by ID or Name to ensure car-themed visuals are used
          const mockMatch = MOCK_SERVICES.find(m => 
            m.id === doc.id || 
            m.name.toLowerCase().includes(data.name.toLowerCase()) ||
            data.name.toLowerCase().includes(m.name.toLowerCase())
          );
          return { 
            id: doc.id, 
            ...data, 
            image: mockMatch ? mockMatch.image : data.image 
          } as Service;
        });
        
        if (servicesData.length > 0) {
          setServices(servicesData);
        } else {
          // Fallback to mock data if Firestore is empty
          setServices(MOCK_SERVICES);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-extrabold tracking-tighter text-primary">Select Service</h2>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Premium maintenance for your vehicle. Choose a professional service below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Card key={service.id} className="group overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 shadow-xl hover:shadow-2xl rounded-[24px]">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={service.image} 
                alt={service.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-bold">Starting at ₹{service.price.toLocaleString("en-IN")}</p>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-white border-none px-3 py-1 font-bold rounded-full shadow-lg">
                  {service.duration}
                </Badge>
              </div>
            </div>
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{service.name}</CardTitle>
              <CardDescription className="text-sm font-medium leading-relaxed line-clamp-2 mt-2">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-2">
              <div className="flex items-center gap-2 text-2xl font-black text-foreground">
                <span className="text-primary">₹</span>
                <span>{service.price.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-2 gap-3">
              <Button asChild variant="outline" className="flex-1 rounded-xl font-bold border-2 hover:bg-muted">
                <Link to={`/service/${service.id}`}>
                  Details
                </Link>
              </Button>
              <Button asChild className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
                <Link to={`/service/${service.id}/book`}>
                  Book Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
