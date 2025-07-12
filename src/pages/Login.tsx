import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader as CardHeaderUI, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Zap, User, Briefcase, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LandingHeader from "@/components/layout/LandingHeader";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("client");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (userType: string) => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      // 2. Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
          toast({
          title: "Login Error",
          description: "User profile not found. Please contact support.",
          variant: "destructive"
        });
        setIsLoading(false);
          return;
        }
      const userData = userDoc.data();
      // 3. Check userType
      if (userData.userType !== userType) {
            toast({
              title: "Wrong Login Tab",
          description: `You're registered as a ${userData.userType}. Please switch to the correct login tab to continue. If you'd like to create a ${userType} account, please register with a different email address.`,
              variant: "destructive"
            });
          setIsLoading(false);
          return;
        }
      // 4. Login successful - show welcome message and navigate
    toast({
      title: "Welcome back!",
      description: `Successfully logged in to your ${userType} account.`,
    });
    if (userType === "client") {
      navigate("/client-dashboard");
    } else {
      navigate("/freelancer-dashboard");
      }
    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive"
        });
      } else if (error.code === "auth/user-disabled") {
        toast({
          title: "Account Disabled",
          description: "This account has been disabled. Please contact support.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Error",
          description: error.message || "Failed to login. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <LandingHeader />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Client</span>
              </TabsTrigger>
              <TabsTrigger value="freelancer" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Freelancer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <Card>
                <CardHeaderUI>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-orange-500" />
                    <span>Client Login</span>
                  </CardTitle>
                  <CardDescription>
                    Access your client dashboard
                  </CardDescription>
                </CardHeaderUI>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input 
                      id="client-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password</Label>
                    <Input 
                      id="client-password" 
                      type="password" 
                      placeholder="Your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleLogin("client")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In as Client"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="freelancer">
              <Card>
                <CardHeaderUI>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-orange-500" />
                    <span>Freelancer Login</span>
                  </CardTitle>
                  <CardDescription>
                    Access your freelancer dashboard
                  </CardDescription>
                </CardHeaderUI>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-email">Email</Label>
                    <Input 
                      id="freelancer-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freelancer-password">Password</Label>
                    <Input 
                      id="freelancer-password" 
                      type="password" 
                      placeholder="Your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleLogin("freelancer")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In as Freelancer"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Button variant="link" className="text-orange-500 p-0" onClick={() => navigate("/signup")}>
                Sign up here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
