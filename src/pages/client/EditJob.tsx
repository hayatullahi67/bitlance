import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ClientHeader from "@/components/layout/ClientHeader";
import { Plus, DollarSign, Calendar, MapPin, Clock, FileText, Tag, Users, AlertCircle, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getJob } from "@/lib/jobManagement";

const EditJob = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobData, setJobData] = useState<any>(null);
  const [newSkill, setNewSkill] = useState("");

  const categories = [
    "Web Development", "Mobile Development", "Design & Creative", "Writing & Translation", "Digital Marketing", "Data Science", "Blockchain & Crypto", "Other", "Bounty"
  ];
  const experienceLevels = ["Entry Level", "Intermediate", "Expert", "No Experience Needed"];
  const durations = ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"];

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        if (!jobId) throw new Error("No job ID");
        const job = await getJob(jobId);
        if (!job) throw new Error("Job not found");
        if (auth.currentUser?.uid !== job.clientId) {
          toast({ title: "Unauthorized", description: "You are not allowed to edit this job.", variant: "destructive" });
          navigate("/client-dashboard");
          return;
        }
        setJobData({ ...job });
      } catch (error) {
        toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load job.", variant: "destructive" });
        navigate("/client-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!jobData.title?.trim()) newErrors.title = "Job title is required";
    else if (jobData.title.length < 10) newErrors.title = "Job title must be at least 10 characters";
    if (!jobData.description?.trim()) newErrors.description = "Job description is required";
    else if (jobData.description.length < 50) newErrors.description = "Job description must be at least 50 characters";
    if (!jobData.category) newErrors.category = "Category is required";
    if (jobData.budget.type === "fixed") {
      if (!jobData.budget.min || !jobData.budget.max) newErrors.budget = "Both minimum and maximum budget are required for fixed price jobs";
      else if (parseFloat(jobData.budget.min) >= parseFloat(jobData.budget.max)) newErrors.budget = "Maximum budget must be greater than minimum budget";
    } else {
      if (!jobData.budget.hourly) newErrors.budget = "Hourly rate is required";
    }
    if (!jobData.numberOfFreelancers || jobData.numberOfFreelancers < 1) newErrors.numberOfFreelancers = "Please specify at least 1 freelancer.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill.trim())) {
      setJobData({ ...jobData, skills: [...jobData.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (skillToRemove: string) => {
    setJobData({ ...jobData, skills: jobData.skills.filter((skill: string) => skill !== skillToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors in the form before submitting.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const jobRef = doc(db, "jobs", jobId!);
      await updateDoc(jobRef, {
        ...jobData,
        updatedAt: new Date(),
      });
      toast({ title: "Job updated!", description: "Your job has been updated successfully." });
      navigate(`/client/job/${jobId}`);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update job.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "jobs", jobId!));
      toast({ title: "Job deleted", description: "The job has been deleted." });
      navigate("/client-dashboard");
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete job.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !jobData) {
    return (
      <>
        <ClientHeader />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <ClientHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Job
            </Button>
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
                  Update your project details below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={e => setJobData({ ...jobData, title: e.target.value })}
                    placeholder="e.g., Build a Modern E-commerce Website"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={e => setJobData({ ...jobData, description: e.target.value })}
                    placeholder="Describe your project requirements, goals, and any specific details..."
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  <p className="text-sm text-gray-500">{jobData.description.length}/1000 characters (minimum 50)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={jobData.category} onValueChange={value => setJobData({ ...jobData, category: value })}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={jobData.experience} onValueChange={value => setJobData({ ...jobData, experience: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Number of Freelancers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span>Number of Freelancers</span>
                </CardTitle>
                <CardDescription>
                  Specify how many freelancers you want to hire for this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  min={1}
                  value={jobData.numberOfFreelancers}
                  onChange={e => setJobData({ ...jobData, numberOfFreelancers: Math.max(1, parseInt(e.target.value) || 1) })}
                  className={errors.numberOfFreelancers ? "border-red-500" : ""}
                />
                {errors.numberOfFreelancers && <p className="text-sm text-red-500">{errors.numberOfFreelancers}</p>}
              </CardContent>
            </Card>
            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  <span>Budget & Timeline</span>
                </CardTitle>
                <CardDescription>Set your budget and project timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Budget Type *</Label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={jobData.budget.type === "fixed" ? "default" : "outline"}
                      onClick={() => setJobData({ ...jobData, budget: { ...jobData.budget, type: "fixed" } })}
                      className={jobData.budget.type === "fixed" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      Fixed Price
                    </Button>
                    <Button
                      type="button"
                      variant={jobData.budget.type === "hourly" ? "default" : "outline"}
                      onClick={() => setJobData({ ...jobData, budget: { ...jobData.budget, type: "hourly" } })}
                      className={jobData.budget.type === "hourly" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      Hourly Rate
                    </Button>
                  </div>
                </div>
                {/* Dynamic budget label and input */}
                {jobData.budget.type === "fixed" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-budget">
                        {jobData.numberOfFreelancers > 1 ? "Min Budget per Freelancer (sats) *" : "Minimum Budget (sats) *"}
                      </Label>
                      <Input
                        id="min-budget"
                        type="number"
                        step="0.001"
                        value={jobData.budget.min}
                        onChange={e => setJobData({ ...jobData, budget: { ...jobData.budget, min: e.target.value } })}
                        placeholder="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-budget">
                        {jobData.numberOfFreelancers > 1 ? "Max Budget per Freelancer (sats) *" : "Maximum Budget (sats) *"}
                      </Label>
                      <Input
                        id="max-budget"
                        type="number"
                        step="0.001"
                        value={jobData.budget.max}
                        onChange={e => setJobData({ ...jobData, budget: { ...jobData.budget, max: e.target.value } })}
                        placeholder="0.05"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">
                      {jobData.numberOfFreelancers > 1 ? "Hourly Rate per Freelancer (sats) *" : "Hourly Rate (sats) *"}
                    </Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      step="0.0001"
                      value={jobData.budget.hourly}
                      onChange={e => setJobData({ ...jobData, budget: { ...jobData.budget, hourly: e.target.value } })}
                      placeholder="0.002"
                    />
                  </div>
                )}
                {/* Show calculated total if more than one freelancer */}
                {jobData.numberOfFreelancers > 1 && (
                  <div className="text-sm text-gray-500 mt-2">
                    Total Min Budget: {parseFloat(jobData.budget.min || "0") * jobData.numberOfFreelancers} sats<br />
                    Total Max Budget: {parseFloat(jobData.budget.max || "0") * jobData.numberOfFreelancers} sats
                  </div>
                )}
                {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Select value={jobData.duration} onValueChange={value => setJobData({ ...jobData, duration: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map(duration => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={jobData.location} onValueChange={value => setJobData({ ...jobData, location: value })}>
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
                <CardDescription>Add or remove skills for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Python, Figma)"
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {jobData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((skill: string, index: number) => (
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
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditJob; 