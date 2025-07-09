import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock, 
  FileText,
  Tag,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { handleLogout } from "@/lib/authUtils";
import { createJob } from "@/lib/jobManagement";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebaseClient";

const JobPost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: "",
    budget: {
      type: "fixed" as "fixed" | "hourly",
      min: "",
      max: "",
      hourly: ""
    },
    skills: [] as string[],
    experience: "",
    duration: "",
    location: "remote"
  });

  const [newSkill, setNewSkill] = useState("");

  const categories = [
    "Web Development",
    "Mobile Development", 
    "Design & Creative",
    "Writing & Translation",
    "Digital Marketing",
    "Data Science",
    "Blockchain & Crypto",
    "Other",
    "Bounty"
  ];

  const experienceLevels = [
    "Entry Level",
    "Intermediate", 
    "Expert",
    "No Experience Needed"
  ];

  const durations = [
    "Less than 1 week",
    "1-2 weeks",
    "2-4 weeks", 
    "1-3 months",
    "3+ months"
  ];



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!jobData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (jobData.title.length < 10) {
      newErrors.title = "Job title must be at least 10 characters";
    }

    if (!jobData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (jobData.description.length < 50) {
      newErrors.description = "Job description must be at least 50 characters";
    }

    if (!jobData.category) {
      newErrors.category = "Category is required";
    }

    if (jobData.budget.type === "fixed") {
      if (!jobData.budget.min || !jobData.budget.max) {
        newErrors.budget = "Both minimum and maximum budget are required for fixed price jobs";
      } else if (parseFloat(jobData.budget.min) >= parseFloat(jobData.budget.max)) {
        newErrors.budget = "Maximum budget must be greater than minimum budget";
      }
    } else {
      if (!jobData.budget.hourly) {
        newErrors.budget = "Hourly rate is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill.trim())) {
      setJobData({
        ...jobData,
        skills: [...jobData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setJobData({
      ...jobData,
      skills: jobData.skills.filter(skill => skill !== skillToRemove)
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to post a job");
      }

      const jobDataWithClientId = {
        ...jobData,
        clientId: currentUser.uid
      };

      const jobId = await createJob(jobDataWithClientId);
      
      setShowSuccess(true);
      toast({
        title: "Job posted successfully!",
        description: `Your job "${jobData.title}" has been posted and is now visible to freelancers.`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
    navigate("/client-dashboard");
      }, 2000);

    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  if (showSuccess) {
    return (
      <Layout 
        userType="client"
        userName="John Davis"
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        title="Job Posted Successfully"
        onPostJob={() => navigate("/post-job")}
        onLogout={handleLogout}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Your job "{jobData.title}" has been posted and is now visible to freelancers.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
              <ul className="text-green-700 text-left space-y-2">
                <li>• Freelancers will be able to view and apply to your job</li>
                <li>• You'll receive notifications when proposals are submitted</li>
                <li>• You can review and accept proposals from your dashboard</li>
                <li>• Track your job's performance and engagement</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => navigate("/client-dashboard")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowSuccess(false);
                  setJobData({
                    title: "",
                    description: "",
                    category: "",
                    budget: { type: "fixed", min: "", max: "", hourly: "" },
                    skills: [],
                    experience: "",
                    duration: "",
                    location: "remote"
                  });
                }}
              >
                Post Another Job
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      userType="client"
      userName="John Davis"
      userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      title="Post a Job"
      onPostJob={() => navigate("/post-job")}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
            <p className="text-gray-600">
              Describe your project and find the perfect freelancer to bring your ideas to life.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span>Job Details</span>
                </CardTitle>
                <CardDescription>
                  Provide clear information about your project to attract the right freelancers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                    placeholder="e.g., Build a Modern E-commerce Website"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    placeholder="Describe your project requirements, goals, and any specific details..."
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {jobData.description.length}/1000 characters (minimum 50)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={jobData.category} onValueChange={(value) => setJobData({...jobData, category: value})}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={jobData.experience} onValueChange={(value) => setJobData({...jobData, experience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  <span>Budget & Timeline</span>
                </CardTitle>
                <CardDescription>
                  Set your budget and project timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Budget Type *</Label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={jobData.budget.type === "fixed" ? "default" : "outline"}
                      onClick={() => setJobData({...jobData, budget: {...jobData.budget, type: "fixed"}})}
                      className={jobData.budget.type === "fixed" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      Fixed Price
                    </Button>
                    <Button
                      type="button"
                      variant={jobData.budget.type === "hourly" ? "default" : "outline"}
                      onClick={() => setJobData({...jobData, budget: {...jobData.budget, type: "hourly"}})}
                      className={jobData.budget.type === "hourly" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      Hourly Rate
                    </Button>
                  </div>
                </div>

                {jobData.budget.type === "fixed" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-budget">Minimum Budget (BTC) *</Label>
                      <Input
                        id="min-budget"
                        type="number"
                        step="0.001"
                        value={jobData.budget.min}
                        onChange={(e) => setJobData({...jobData, budget: {...jobData.budget, min: e.target.value}})}
                        placeholder="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-budget">Maximum Budget (BTC) *</Label>
                      <Input
                        id="max-budget"
                        type="number"
                        step="0.001"
                        value={jobData.budget.max}
                        onChange={(e) => setJobData({...jobData, budget: {...jobData.budget, max: e.target.value}})}
                        placeholder="0.05"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Hourly Rate (BTC) *</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      step="0.0001"
                      value={jobData.budget.hourly}
                      onChange={(e) => setJobData({...jobData, budget: {...jobData.budget, hourly: e.target.value}})}
                      placeholder="0.002"
                    />
                  </div>
                )}

                {errors.budget && (
                  <p className="text-sm text-red-500">{errors.budget}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Select value={jobData.duration} onValueChange={(value) => setJobData({...jobData, duration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={jobData.location} onValueChange={(value) => setJobData({...jobData, location: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-orange-500" />
                  <span>Skills Required</span>
                </CardTitle>
                <CardDescription>
                  Add the skills and technologies needed for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python, Figma)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {jobData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Section */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span>All fields marked with * are required</span>
              </div>
              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                  <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default JobPost;
