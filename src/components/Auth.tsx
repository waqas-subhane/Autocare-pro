import React, { useState } from "react";
import { auth, db } from "@/src/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Car } from "lucide-react";

export function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore if it doesn't exist
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "customer"
        });
      }

      toast.success("Welcome to AutoCare Pro!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: "customer"
      });

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
      <div className="flex items-center gap-4 mb-10 group">
        <div className="bg-primary p-4 rounded-[20px] shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
          <Car className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-foreground">AutoCare Pro</h1>
      </div>

      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted rounded-2xl border-2">
          <TabsTrigger value="login" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg">LOGIN</TabsTrigger>
          <TabsTrigger value="register" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg">REGISTER</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="mt-6">
          <Card className="border-2 shadow-2xl rounded-[32px] overflow-hidden">
            <div className="bg-primary p-8 text-white">
              <CardTitle className="text-3xl font-black tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-white/80 font-bold mt-2">Enter your credentials to access your garage.</CardDescription>
            </div>
            <form onSubmit={handleLogin}>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="alex@autocare.pro" 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/30" type="submit" disabled={loading}>
                  {loading ? "AUTHENTICATING..." : "START ENGINE"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-black">OR</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-14 rounded-2xl font-black text-lg border-2" 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  CONTINUE WITH GOOGLE
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <Card className="border-2 shadow-2xl rounded-[32px] overflow-hidden">
            <div className="bg-primary p-8 text-white">
              <CardTitle className="text-3xl font-black tracking-tight">Join the Club</CardTitle>
              <CardDescription className="text-white/80 font-bold mt-2">Create your profile for premium service tracking.</CardDescription>
            </div>
            <form onSubmit={handleRegister}>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Alex Johnson" 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="reg-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="alex@autocare.pro" 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="reg-password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/30" type="submit" disabled={loading}>
                  {loading ? "CREATING..." : "JOIN AUTOCARE"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-black">OR</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-14 rounded-2xl font-black text-lg border-2" 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  CONTINUE WITH GOOGLE
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
