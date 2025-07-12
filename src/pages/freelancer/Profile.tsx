import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleLogout } from "@/lib/authUtils";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadImageWithRetry, validateImageFile } from "@/lib/imageUpload";

const defaultProfile = {
  firstName: "",
  lastName: "",
  title: "",
  location: "",
  overview: "",
  skills: [],
  hourlyRate: 0,
  experienceLevel: "Beginner", // Beginner, Intermediate, Expert
  education: [],
  certifications: [],
  languages: [],
  imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  online: true,
  verified: false,
  social: [],
  workHistory: [],
  portfolio: [],
  availability: "Available for new projects",
  uid: "",
  createdAt: "",
  updatedAt: "",
};

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "work", label: "Work History" },
  { key: "portfolio", label: "Portfolio" },
];

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editType, setEditType] = useState("");
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Fetch profile data from Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
      setLoading(true);
          const profileDoc = await getDoc(doc(db, "freelancers", user.uid));
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            // Also fetch user data from users collection to get firstName and lastName
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setProfile({
                ...defaultProfile,
                ...profileData,
                firstName: userData.firstName || profileData.firstName || "",
                lastName: userData.lastName || profileData.lastName || "",
                uid: user.uid,
              });
            } else {
              setProfile({
                ...defaultProfile,
                ...profileData,
                uid: user.uid,
              });
            }
          } else {
            // Create new profile if it doesn't exist
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            const newProfile = {
              ...defaultProfile,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              uid: user.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, "freelancers", user.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const saveProfile = async (updatedProfile?: any) => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const profileToSave = updatedProfile || profile;
      const profileData = {
        ...profileToSave,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(doc(db, "freelancers", auth.currentUser.uid), profileData);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Update local state and then persist to Firebase
  const updateProfile = (field: string, value: any) => {
    setProfile((prev: any) => {
      const updated = { ...prev, [field]: value };
      saveProfile(updated);
      return updated;
    });
  };

  const addItem = (field: string, item: any) => {
    setProfile((prev: any) => {
      const updated = { ...prev, [field]: [...(prev[field] || []), item] };
      saveProfile(updated);
      return updated;
    });
  };

  const updateItem = (field: string, index: number, item: any) => {
    setProfile((prev: any) => {
      const updated = { ...prev, [field]: prev[field].map((_: any, i: number) => i === index ? item : _) };
      saveProfile(updated);
      return updated;
    });
  };

  const deleteItem = (field: string, index: number) => {
    setProfile((prev: any) => {
      const updated = { ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) };
      saveProfile(updated);
      return updated;
    });
  };

  const openEditDialog = (type: string, data: any = {}) => {
    setEditType(type);
    setEditData(data);
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (editType === 'basic') {
      updateProfile('firstName', editData.firstName);
      updateProfile('lastName', editData.lastName);
      updateProfile('title', editData.title);
      updateProfile('location', editData.location);
      updateProfile('overview', editData.overview);
      updateProfile('hourlyRate', editData.hourlyRate);
    } else if (editType === 'skill') {
      if (editData.index !== undefined) {
        updateItem('skills', editData.index, { name: editData.name, endorsements: editData.endorsements || 0 });
      } else {
        addItem('skills', { name: editData.name, endorsements: editData.endorsements || 0 });
      }
    } else if (editType === 'social') {
      if (editData.index !== undefined) {
        updateItem('social', editData.index, { name: editData.name, url: editData.url, icon: editData.icon });
      } else {
        addItem('social', { name: editData.name, url: editData.url, icon: editData.icon });
      }
    } else if (editType === 'work') {
      if (editData.index !== undefined) {
        updateItem('workHistory', editData.index, editData);
      } else {
        addItem('workHistory', editData);
      }
    } else if (editType === 'portfolio') {
      if (editData.index !== undefined) {
        updateItem('portfolio', editData.index, editData);
      } else {
        addItem('portfolio', editData);
      }
    }
    setShowEditDialog(false);
    setEditData({});
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      validateImageFile(file);
      const imageUrl = await uploadImageWithRetry(file);
      toast({
        title: "Image Processed",
        description: "Image converted to base64 and saved successfully!",
      });
      return imageUrl;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to process image.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await handleImageUpload(file);
        setEditData({ ...editData, image: imageUrl });
        toast({
          title: "Image Uploaded",
          description: "Project image uploaded successfully!",
        });
      } catch (error) {
        // Error already handled in handleImageUpload
      }
    }
    // Reset the input
    event.target.value = '';
  };

  if (loading) {
    return (
      <Layout userType="freelancer" userName={`${profile.firstName} ${profile.lastName}`.trim() || "Loading..."} userAvatar={profile.imageUrl}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      userType="freelancer"
      userName={`${profile.firstName} ${profile.lastName}`.trim() || "Complete Your Profile"}
      userAvatar={profile.imageUrl}
      onLogout={handleLogout}
    >
      {/* Banner */}
      <div className="relative md:h-56 w-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-b-3xl overflow-hidden shadow">
        <img
          src={profile.bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover opacity-70"
        />
        {/* Orange overlay */}
        <div className="absolute inset-0 bg-orange-500 opacity-40 pointer-events-none" />
        {/* Overlayed Profile Image */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:left-16 md:translate-x-0 bottom-[20px] flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {profile.online && (
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-orange-400 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {`${profile.firstName} ${profile.lastName}`.trim() || <span className="italic text-gray-200">Add your name</span>}
              {profile.verified && (
                <span className="ml-1 px-2 py-0.5 bg-white text-orange-600 text-xs rounded-full font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" /></svg>
                  Verified
                </span>
              )}
            </h1>
            <p className="text-white font-semibold mt-1">{profile.title || <span className="italic text-gray-200">Add your title</span>}</p>
            <p className="text-white mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243A8 8 0 1117.657 16.657z" /></svg>
              {profile.location || <span className="italic text-gray-200">Add your location</span>}
            </p>
            <div className="flex gap-3 mt-2">
              {profile.social.length > 0 ? profile.social.map((s: any, index: number) => (
                <a
                  key={index}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  title={s.name}
                >
                  <svg className="w-6 h-6 text-white hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              )) : <span className="italic text-gray-200">Add social links</span>}
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-orange-600 hover:bg-orange-50 border-orange-200"
            onClick={() => window.open(`/freelancer/public-profile/${profile.uid || 'me'}`, '_blank')}
          >
            View Public Profile
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-24 px-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Tabs Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-6" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`pb-3 text-base font-medium border-b-2 transition-colors duration-150 ${
                    activeTab === tab.key
                      ? "border-orange-500 text-orange-700"
                      : "border-transparent text-gray-500 hover:text-orange-600"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panels */}
          {activeTab === "overview" && (
            <>
              {/* Overview */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" /></svg>
                    Overview
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog('basic', {
                      firstName: profile.firstName,
        lastName: profile.lastName,
                      title: profile.title,
                      location: profile.location,
                      overview: profile.overview,
                      hourlyRate: profile.hourlyRate
                    })}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {profile.overview || <span className="italic text-gray-400">Add your professional overview to help clients understand your expertise and experience.</span>}
                </p>
                {profile.hourlyRate > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-orange-700 font-semibold">${profile.hourlyRate}/hr</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L6 13.25l1.41-1.41L9.75 14.17l6.84-6.84L18 8.75z" /></svg>
                    Skills & Endorsements
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog('skill')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full shadow-sm">
                        <span className="text-orange-700 font-medium text-sm">{skill.name}</span>
                        <span className="text-xs text-gray-500">{skill.endorsements}+</span>
                        <div className="w-16 h-2 bg-orange-100 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-orange-400 rounded-full"
                            style={{ width: `${Math.min(skill.endorsements * 8, 100)}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => openEditDialog('skill', { ...skill, index })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteItem('skills', index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet. Add your first skill to get started!</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "work" && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 17.75l-6.172 3.245 1.179-6.873-5-4.873 6.9-1.002L12 2.25l3.093 6.997 6.9 1.002-5 4.873 1.179 6.873z" /></svg>
                  Work History
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog('work')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work
                </Button>
              </div>
              <div className="space-y-4">
                {profile.workHistory.length > 0 ? (
                  profile.workHistory.map((job: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start bg-gray-50 rounded-lg border border-gray-100 p-4 hover:shadow transition">
                      <img src={job.logo} alt={job.client} className="w-12 h-12 rounded-lg object-contain bg-white border" />
                      <div className="flex-1">
                        <a href={job.link} className="font-semibold text-gray-700 hover:text-blue-600 transition text-base" target="_blank" rel="noopener noreferrer">{job.job}</a>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                          <span>{job.client}</span>
                          <span className="mx-1">•</span>
                          <span>{job.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(Math.floor(job.rating))].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                          ))}
                          {job.rating % 1 > 0 && (
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><defs><linearGradient id={`half${idx}`}><stop offset="50%" stopColor="#facc15" /><stop offset="50%" stopColor="#e5e7eb" /></linearGradient></defs><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" fill={`url(#half${idx})`} /></svg>
                          )}
                          <span className="ml-2 text-xs text-gray-500">{job.rating}</span>
                        </div>
                        <p className="text-gray-600 mt-2 italic">"{job.review}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDialog('work', { ...job, index: idx })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem('workHistory', idx)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No work history yet. Add your first work experience!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Portfolio
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog('portfolio')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.portfolio.length > 0 ? (
                  profile.portfolio.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-base mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm flex-1">{item.description}</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-purple-600 hover:underline text-sm font-medium"
                        >
                          View Project
                        </a>
                      </div>
                      <div className="p-4 pt-0 flex gap-2">
                        <button
                          onClick={() => openEditDialog('portfolio', { ...item, index: idx })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem('portfolio', idx)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8 col-span-full">No portfolio projects yet. Add your first project!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editType === 'basic' && 'Edit Basic Information'}
              {editType === 'skill' && (editData.index !== undefined ? 'Edit Skill' : 'Add Skill')}
              {editType === 'social' && (editData.index !== undefined ? 'Edit Social Link' : 'Add Social Link')}
              {editType === 'work' && (editData.index !== undefined ? 'Edit Work Experience' : 'Add Work Experience')}
              {editType === 'portfolio' && (editData.index !== undefined ? 'Edit Portfolio Project' : 'Add Portfolio Project')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {editType === 'basic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    placeholder="Your last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    placeholder="e.g., Lagos, Nigeria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                  <Textarea
                    value={editData.overview || ''}
                    onChange={(e) => setEditData({ ...editData, overview: e.target.value })}
                    placeholder="Describe your expertise and experience..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <Input
                    type="number"
                    value={editData.hourlyRate || ''}
                    onChange={(e) => setEditData({ ...editData, hourlyRate: parseInt(e.target.value) || 0 })}
                    placeholder="40"
                  />
                </div>
              </>
            )}

            {editType === 'skill' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="e.g., React"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endorsements</label>
                  <Input
                    type="number"
                    value={editData.endorsements || ''}
                    onChange={(e) => setEditData({ ...editData, endorsements: parseInt(e.target.value) || 0 })}
                    placeholder="12"
                  />
                </div>
              </>
            )}

            {editType === 'work' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <Input
                    value={editData.client || ''}
                    onChange={(e) => setEditData({ ...editData, client: e.target.value })}
                    placeholder="e.g., Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <Input
                    value={editData.job || ''}
                    onChange={(e) => setEditData({ ...editData, job: e.target.value })}
                    placeholder="e.g., Developed a SaaS dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editData.rating || ''}
                    onChange={(e) => setEditData({ ...editData, rating: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                  <Textarea
                    value={editData.review || ''}
                    onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                    placeholder="Client review..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    value={editData.date || ''}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    placeholder="e.g., Feb 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <Input
                    value={editData.logo || ''}
                    onChange={(e) => setEditData({ ...editData, logo: e.target.value })}
                    placeholder="https://logo.clearbit.com/company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                  <Input
                    value={editData.link || ''}
                    onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                    placeholder="https://project-url.com"
                  />
                </div>
              </>
            )}

            {editType === 'portfolio' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="e.g., Crypto Trading Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={3}
                    maxLength={200}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Keep it concise for better card display</span>
                    <span>{(editData.description || '').length}/200</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                  <div className="space-y-2">
                    {/* Image Preview */}
                    {editData.image && (
                      <div className="relative">
                        <img 
                          src={editData.image} 
                          alt="Project preview" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, image: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* File Upload Input */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="portfolio-image-upload"
                        disabled={uploadingImage}
                      />
                      <label 
                        htmlFor="portfolio-image-upload" 
                        className="cursor-pointer block"
                      >
                        {uploadingImage ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-orange-600 hover:text-orange-500">
                                Click to upload
                              </span> or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                  <Input
                    value={editData.link || ''}
                    onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                    placeholder="https://project-url.com"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
