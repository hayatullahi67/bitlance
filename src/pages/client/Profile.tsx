import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { 
  Zap, 
  Edit, 
  Save, 
  X, 
  Plus, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Star,
  Award,
  Clock,
  Wallet,
  Settings,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building,
  User,
  Download,
  Eye,
  MessageSquare,
  Heart,
  Share2
} from "lucide-react";
import { handleLogout } from "@/lib/authUtils";

const ClientProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [profileData, setProfileData] = useState({
    name: "John Davis",
    title: "CEO & Founder",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    email: "john@techcorp.com",
    phone: "+1 (555) 123-4567",
    joinedDate: "March 2022",
    totalSpent: "0.45 BTC",
    completedProjects: 18,
    avgRating: 4.8,
    responseRate: "95%",
    avgResponseTime: "2 hours",
    description: "Entrepreneur and technology enthusiast with 15+ years of experience in software development and business management. I'm passionate about building innovative solutions and working with talented freelancers to bring ideas to life. Always looking for creative and reliable professionals to join our projects.",
    companySize: "10-49 employees",
    industry: "Technology",
    founded: "2018",
    budget: "0.05-0.15 BTC per project"
  });

  const activeProjects = [
    {
      id: 1,
      title: "E-commerce Platform Redesign",
      freelancer: "Sarah Johnson",
      budget: "0.08 BTC",
      status: "In Progress",
      deadline: "Dec 20, 2024",
      progress: 65
    },
    {
      id: 2,
      title: "Mobile App Development",
      freelancer: "Mike Chen",
      budget: "0.12 BTC",
      status: "Planning",
      deadline: "Jan 15, 2025",
      progress: 15
    }
  ];

  const completedProjects = [
    {
      id: 1,
      title: "Website Development",
      freelancer: "Emily Rodriguez",
      amount: "0.06 BTC",
      completedDate: "Nov 10, 2024",
      rating: 5,
      feedback: "Excellent work! Emily delivered exactly what we needed on time and within budget."
    },
    {
      id: 2,
      title: "Logo Design",
      freelancer: "Alex Thompson",
      amount: "0.02 BTC",
      completedDate: "Oct 25, 2024",
      rating: 5,
      feedback: "Great design work and very professional communication throughout the project."
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <Layout 
      userType="client"
      userName="John Davis"
      userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      title="Profile"
      onPostJob={() => navigate("/post-job")}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{profileData.avgRating}</span>
                    <span className="text-gray-500">({profileData.completedProjects} reviews)</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">{profileData.responseRate} Response Rate</p>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
                    <p className="text-xl text-gray-600 mb-2">{profileData.title}</p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{profileData.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <a href={profileData.website} className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {profileData.website}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{profileData.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profileData.totalSpent}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profileData.completedProjects}</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profileData.avgRating}</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{profileData.responseRate}</p>
                    <p className="text-sm text-gray-600">Response Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-orange-500" />
                  <span>About</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={profileData.description}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    rows={4}
                    placeholder="Tell us about yourself and your business..."
                  />
                ) : (
                  <p className="text-gray-700">{profileData.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-orange-500" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Company Size</Label>
                    {isEditing ? (
                      <Select value={profileData.companySize} onValueChange={(value) => setProfileData({...profileData, companySize: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                          <SelectItem value="10-49 employees">10-49 employees</SelectItem>
                          <SelectItem value="50-199 employees">50-199 employees</SelectItem>
                          <SelectItem value="200+ employees">200+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-700">{profileData.companySize}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Industry</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.industry}
                        onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-700">{profileData.industry}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Founded</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.founded}
                        onChange={(e) => setProfileData({...profileData, founded: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-700">{profileData.founded}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Typical Budget</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.budget}
                        onChange={(e) => setProfileData({...profileData, budget: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-700">{profileData.budget}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  <span>Active Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Freelancer:</span> {project.freelancer}
                        </div>
                        <div>
                          <span className="font-medium">Budget:</span> {project.budget}
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span> {project.deadline}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {project.progress}%
                        </div>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  <span>Completed Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{project.rating}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Freelancer:</span> {project.freelancer}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> {project.amount}
                        </div>
                        <div>
                          <span className="font-medium">Completed:</span> {project.completedDate}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{project.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  <span>Reviews from Freelancers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500">Reviews will appear here once freelancers complete projects with you</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-gray-600">Control who can see your profile</p>
                  </div>
                  <Select defaultValue="public">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email updates about your projects</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Security</p>
                    <p className="text-sm text-gray-600">Manage your account security settings</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientProfile; 