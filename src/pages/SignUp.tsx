import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Zap, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("client");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    // No longer needed as showConfirmation is removed
  }, []);

  // Function to create tables if they don't exist (like Firebase)
  const createTablesIfNotExist = async () => {
    // MOCK: Do nothing, just simulate async
    return Promise.resolve();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (userType: string) => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if user with this email and userType already exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);
      let foundType: string | null = null;
      querySnapshot.forEach((doc) => {
        if (doc.data().userType === userType) foundType = userType;
        else foundType = doc.data().userType;
      });
      if (foundType) {
          toast({
            title: "Account Already Exists",
          description: `You already created an account as a ${foundType} with this email. Please login or use a different email.`,
            variant: "destructive"
          });
        setIsLoading(false);
        return;
      }

      // 2. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const userData = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        userType,
        createdAt: new Date().toISOString(), // <-- This line adds the createdAt timestamp
      };
      // 3. Store in 'users' collection
      await setDoc(doc(db, "users", user.uid), userData);
      // 4. Store in 'clients' or 'freelancers' collection
      if (userType === "client") {
        await setDoc(doc(db, "clients", user.uid), userData);
      } else if (userType === "freelancer") {
        await setDoc(doc(db, "freelancers", user.uid), userData);
      }
    toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account.",
        });
      navigate('/login'); // Immediately navigate to login after successful signup
    } catch (error: any) {
        toast({
        title: "Sign Up Error",
        description: error.message || "Failed to sign up. Please try again.",
          variant: "destructive"
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Join Bitlance</h1>
          </div>
          <p className="text-gray-600">Choose your account type to get started</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="client" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>I'm a Client</span>
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>I'm a Freelancer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  <span>Create Client Account</span>
                </CardTitle>
                <CardDescription>
                  Post projects and hire talented freelancers paid in Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-firstName">First Name *</Label>
                    <Input 
                      id="client-firstName" 
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-lastName">Last Name *</Label>
                    <Input 
                      id="client-lastName" 
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email *</Label>
                  <Input 
                    id="client-email" 
                    type="email" 
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-password">Password *</Label>
                  <Input 
                    id="client-password" 
                    type="password" 
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="client-company">Company Name (Optional)</Label>
                  <Input id="client-company" placeholder="Your Company Inc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-industry">Industry</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => handleSignup("client")}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Client Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="freelancer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-orange-500" />
                  <span>Create Freelancer Account</span>
                </CardTitle>
                <CardDescription>
                  Showcase your skills and get paid in Bitcoin for your work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-firstName">First Name *</Label>
                    <Input 
                      id="freelancer-firstName" 
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-lastName">Last Name *</Label>
                    <Input 
                      id="freelancer-lastName" 
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="freelancer-email">Email *</Label>
                  <Input 
                    id="freelancer-email" 
                    type="email" 
                    placeholder="jane@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-password">Password *</Label>
                  <Input 
                    id="freelancer-password" 
                    type="password" 
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
{/* 
                <div className="space-y-2">
                  <Label htmlFor="freelancer-title">Professional Title</Label>
                  <Input id="freelancer-title" placeholder="Full Stack Developer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-category">Primary Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Web Development</SelectItem>
                      <SelectItem value="design">Design & Creative</SelectItem>
                      <SelectItem value="writing">Writing & Content</SelectItem>
                      <SelectItem value="marketing">Digital Marketing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-bio">Professional Bio</Label>
                  <Textarea 
                    id="freelancer-bio" 
                    placeholder="Tell clients about your experience and skills..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-rate">Hourly Rate (in USD equivalent)</Label>
                  <Input id="freelancer-rate" type="number" placeholder="50" />
                </div> */}

                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => handleSignup("freelancer")}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Freelancer Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Button variant="link" className="text-orange-500 p-0" onClick={() => navigate("/login")}>
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
