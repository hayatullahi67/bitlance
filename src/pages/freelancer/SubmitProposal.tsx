import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/lib/notifications";

const MAX_FILE_SIZE_MB = 5;
const MAX_COVER_LETTER = 2000;

const SubmitProposal = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [budget, setBudget] = useState("");
  const [delivery, setDelivery] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [success, setSuccess] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [newPortfolioLink, setNewPortfolioLink] = useState("");

  useEffect(() => {
    setUser(auth.currentUser);
    const fetchJob = async () => {
      if (!jobId) return;
      setLoading(true);
      const jobSnap = await getDoc(doc(db, "jobs", jobId));
      if (jobSnap.exists()) {
        const jobData = { ...(jobSnap.data() as any), id: jobSnap.id };
        setJob(jobData);
        // Fetch client info
        if (jobData.clientId) {
          const clientSnap = await getDoc(doc(db, "clients", jobData.clientId));
          if (clientSnap.exists()) setClientInfo(clientSnap.data());
        }
      }
      setLoading(false);
    };
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const profileSnap = await getDoc(doc(db, "freelancers", auth.currentUser.uid));
      if (profileSnap.exists()) setUserProfile(profileSnap.data());
    };
    fetchJob();
    fetchProfile();
  }, [jobId]);

  const getClientFullName = () => {
    if (clientInfo?.firstName && clientInfo?.lastName) {
      return clientInfo.firstName + " " + clientInfo.lastName;
    }
    return clientInfo?.name || "Client";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFile(reader.result as string);
      setFileName(f.name);
    };
    reader.readAsDataURL(f);
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    setFileError("");
  };

  const handleAddPortfolioLink = () => {
    if (newPortfolioLink.trim() && !portfolioLinks.includes(newPortfolioLink.trim())) {
      setPortfolioLinks([...portfolioLinks, newPortfolioLink.trim()]);
      setNewPortfolioLink("");
    }
  };
  const handleRemovePortfolioLink = (link: string) => {
    setPortfolioLinks(portfolioLinks.filter(l => l !== link));
  };

  const isValid = coverLetter.trim().length > 0 && coverLetter.length <= MAX_COVER_LETTER && !fileError;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStep('preview');
  };

  const handleFinalSubmit = async () => {
    if (!user || !job) return;
    setSubmitting(true);
    try {
      const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const proposal = {
        id: proposalId, // Add unique ID
        freelancerId: user.uid,
        freelancerName: userProfile?.name || user.displayName || "Freelancer",
        freelancerAvatar: userProfile?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userProfile?.name || user.displayName || "F"),
        message: coverLetter,
        budget,
        deliveryTime: delivery,
        file: file ? { name: fileName, data: file } : null,
        portfolio: portfolioLinks,
        createdAt: new Date(),
        status: "pending",
        history: [
          { status: "pending", at: new Date().toISOString() }
        ]
      };
      const jobRef = doc(db, "jobs", job.id);
      const jobSnap = await getDoc(jobRef);
      let proposals = [];
      if (jobSnap.exists() && Array.isArray(jobSnap.data().proposals)) {
        proposals = jobSnap.data().proposals;
      }
      proposals.push(proposal);
      await updateDoc(jobRef, { proposals });
      setSuccess(true);
      toast({ title: "Proposal Submitted!", description: "Your proposal was sent successfully.", variant: "default" });
      setTimeout(() => navigate(`/freelancer/job/${job.id}`), 2000);
      if (job && job.clientId) {
        try {
          // Get freelancer and client data for notification
          const freelancerDoc = await getDoc(doc(db, "users", user.uid));
          const clientDoc = await getDoc(doc(db, "users", job.clientId));
          
          const freelancerData = freelancerDoc.exists() ? freelancerDoc.data() : { firstName: "Freelancer", lastName: "" };
          const clientData = clientDoc.exists() ? clientDoc.data() : { firstName: "Client", lastName: "" };

          console.log("Creating proposal notification:", {
            senderUuid: user.uid,
            receiverUuid: job.clientId,
            senderName: `${freelancerData.lastName} ${freelancerData.firstName}`,
            receiverName: `${clientData.firstName} ${clientData.lastName}`,
            message: `New proposal received for "${job.title}" from ${freelancerData.firstName}`
          });

          await createNotification({
            senderUuid: user.uid,
            receiverUuid: job.clientId,
            senderName: `${freelancerData.lastName} ${freelancerData.firstName}`,
            receiverName: `${clientData.firstName} ${clientData.lastName}`,
            type: "new_proposal",
            message: `New proposal received for "${job.title}" from ${freelancerData.firstName}`,
            link: `/client/job/${job.id}`,
          });
          
          console.log("Proposal notification created successfully");
        } catch (error) {
          console.error("Error creating proposal notification:", error);
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit proposal.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!job) return <div className="flex justify-center items-center min-h-screen text-red-500">Job not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-0 flex justify-center  items-center">
      <div className="w-[80%] bg-white rounded-lg shadow-lg p-6">
        <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center mb-6">
          <div className="mr-4">
            {/* <div className="text-xs text-gray-500 mb-1">Posted by {getClientFullName()}</div> */}
            <Avatar className="h-14 w-14">
              <AvatarImage src={clientInfo?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(getClientFullName())} />
              <AvatarFallback>{getClientFullName()[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-bold text-lg">{getClientFullName()}</div>
            <div className="text-sm text-gray-500">{clientInfo?.rating ? `⭐ ${clientInfo.rating}` : "No rating yet"}</div>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">Applying to:</div>
          <div className="font-semibold text-xl text-gray-900">{job.title}</div>
          <div className="flex items-center gap-2 mt-2">
            {clientInfo?.avatar && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={clientInfo.avatar} />
                <AvatarFallback>{getClientFullName()[0]}</AvatarFallback>
              </Avatar>
            )}
            {/* <span className="text-sm text-gray-600">Client: {getClientFullName() || "Unknown"}</span> */}
          </div>
        </div>
        {step === 'form' && (
          <form onSubmit={handleFormSubmit}>
            <div className="mb-5">
              <label className="block font-medium mb-1">Cover Letter <span className="text-red-500">*</span></label>
              <Textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={7}
                maxLength={MAX_COVER_LETTER}
                placeholder="Describe why you're the best fit for this job..."
                className="resize-none"
                required
              />
              <div className="text-xs text-gray-400 text-right mt-1">{coverLetter.length}/{MAX_COVER_LETTER} characters</div>
            </div>
            <div className="mb-5">
              <label className="block font-medium mb-1">Proposed Budget</label>
              <Input
                type="number"
                min="0"
                step="any"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                                      placeholder="e.g. 1000000 (sats)"
              />
                              <div className="text-xs text-gray-400 mt-1">Enter your proposed amount in sats.</div>
            </div>
            <div className="mb-5">
              <label className="block font-medium mb-1">Delivery Time</label>
              <Input
                type="text"
                value={delivery}
                onChange={e => setDelivery(e.target.value)}
                placeholder="e.g. 2 weeks"
              />
            </div>
            <div className="mb-5">
              <label className="block font-medium mb-1">Portfolio Links <span className="text-xs text-gray-400">(optional)</span></label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="url"
                  placeholder="https://your-portfolio.com/item"
                  value={newPortfolioLink}
                  onChange={e => setNewPortfolioLink(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleAddPortfolioLink} disabled={!newPortfolioLink.trim()}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {portfolioLinks.map((link, idx) => (
                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{link}</a>
                    <Button type="button" size="icon" variant="ghost" className="p-0 h-4 w-4" onClick={() => handleRemovePortfolioLink(link)}><X className="h-3 w-3" /></Button>
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block font-medium mb-1">Attachment <span className="text-xs text-gray-400">(optional, max {MAX_FILE_SIZE_MB}MB)</span></label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="*" onChange={handleFileChange} />
                {file && (
                  <Button type="button" variant="ghost" size="icon" onClick={removeFile}><X className="h-4 w-4" /></Button>
                )}
              </div>
              {fileName && <div className="text-xs mt-1">Selected: {fileName}</div>}
              {fileError && <div className="text-xs text-red-500 mt-1">{fileError}</div>}
              {file && fileName && file.startsWith("data:image") && (
                <img src={file} alt="Preview" className="mt-2 max-h-32 rounded border" />
              )}
            </div>
            <div className="flex justify-end items-center mt-8">
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={!isValid}>
                Preview Proposal
              </Button>
            </div>
          </form>
        )}
        {step === 'preview' && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Proposal Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="font-semibold">Cover Letter:</span>
                  <div className="mt-1 whitespace-pre-line text-gray-800 bg-gray-100 rounded p-3">{coverLetter}</div>
                </div>
                <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Budget:</span> {budget ? `${budget} sats` : <span className="text-gray-400">(Not specified)</span>}</div>
                <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Delivery:</span> {delivery || <span className="text-gray-400">(Not specified)</span>}</div>
                {portfolioLinks.length > 0 && (
                  <div className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold">Portfolio Links:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {portfolioLinks.map((link, idx) => (
                        <li key={idx}><a href={link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{link}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                {fileName && <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Attachment:</span> {fileName}</div>}
                {file && fileName && file.startsWith("data:image") && (
                  <img src={file} alt="Preview" className="mt-2 max-h-32 rounded border" />
                )}
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('form')} disabled={submitting}>Edit</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleFinalSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
            {success && (
              <div className="flex items-center mt-6 text-green-600 font-semibold">
                <CheckCircle className="h-5 w-5 mr-2" /> Proposal submitted successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitProposal; 