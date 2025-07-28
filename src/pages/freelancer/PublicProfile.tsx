import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FreelancerHeader from "@/components/layout/FreelancerHeader";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { handleLogout } from "@/lib/authUtils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "work", label: "Work History" },
  { key: "portfolio", label: "Portfolio" },
];

const PublicProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<"client" | "freelancer">("freelancer");
  const [userName, setUserName] = useState("");
  const [userTypeLoading, setUserTypeLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUserTypeLoading(true);
      if (user) {
        setCurrentUser(user);
        
        // Check if user is viewing their own profile
        const isOwnProfile = user.uid === id;
        
        if (isOwnProfile) {
          // User is viewing their own profile - check if they're a freelancer
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const fullName = `${userData.firstName} ${userData.lastName}`.trim();
              
              // Check if they're a freelancer
              const freelancerDoc = await getDoc(doc(db, "freelancers", user.uid));
              if (freelancerDoc.exists()) {
                setUserType("freelancer");
                setUserName(fullName || "Freelancer");
              } else {
                // Check if they're a client
                const clientDoc = await getDoc(doc(db, "clients", user.uid));
                if (clientDoc.exists()) {
                  setUserType("client");
                  setUserName(fullName || "Client");
                }
              }
            } else {
              setUserName("User");
            }
          } catch (error) {
            console.error("Error determining user type:", error);
            setUserType("freelancer");
            setUserName("User");
          }
        } else {
          // User is viewing someone else's profile - determine their type
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const fullName = `${userData.firstName} ${userData.lastName}`.trim();
              
              // Check if they're a freelancer
              const freelancerDoc = await getDoc(doc(db, "freelancers", user.uid));
              if (freelancerDoc.exists()) {
                setUserType("freelancer");
                setUserName(fullName || "Freelancer");
              } else {
                const clientDoc = await getDoc(doc(db, "clients", user.uid));
                if (clientDoc.exists()) {
                  setUserType("client");
                  setUserName(fullName || "Client");
                }
              }
            } else {
              setUserName("User");
            }
          } catch (error) {
            console.error("Error determining user type:", error);
            setUserType("client"); // Default to client for viewing other profiles
            setUserName("Client");
          }
        }
      } else {
        setCurrentUser(null);
        setUserType("client"); // Default to client for non-authenticated users
        setUserName("Guest");
      }
      setUserTypeLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    fetchPublicProfile();
    // eslint-disable-next-line
  }, [id]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    setNotFound(false);
    let uid = id;
    
    if (!uid) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile from Firebase
      const profileDoc = await getDoc(doc(db, "freelancers", uid));
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        
        // Also fetch user data to get firstName and lastName
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            ...profileData,
            firstName: userData.firstName || profileData.firstName || "",
            lastName: userData.lastName || profileData.lastName || "",
          });
        } else {
          setProfile(profileData);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching public profile:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while determining user type or loading profile
  if (userTypeLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (notFound || !profile) {
    return (
      <>
        <FreelancerHeader  />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-500">This freelancer profile does not exist or is not public.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FreelancerHeader/>
      {/* Banner */}
      <div className="relative h-48 md:h-56 w-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-b-3xl overflow-hidden shadow">
        <img
          src={profile.bannerUrl}
          alt="Banner"
          className="w-full h-full object-cover opacity-70"
        />
        {/* Orange overlay */}
        <div className="absolute inset-0 bg-orange-500 opacity-40 pointer-events-none" />
        {/* Overlayed Profile Image */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:left-16 md:translate-x-0 bottom-[100px] translate-y-1/2 flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {/* {profile.online && (
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></span>
            )} */}
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {`${profile.firstName} ${profile.lastName}`.trim() || "Freelancer"}
              {profile.verified && (
                <span className="ml-1 px-2 py-0.5 bg-white text-orange-600 text-xs rounded-full font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" /></svg>
                  Verified
                </span>
              )}
            </h1>
            <p className="text-white font-semibold mt-1">{profile.title || "Add your title"}</p>
            <p className="text-white mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243A8 8 0 1117.657 16.657z" /></svg>
              {profile.location || "Add your location"}
            </p>
            <div className="flex gap-3 mt-2">
              {profile.social && profile.social.length > 0 ? profile.social.map((s: any, index: number) => (
                <a
                  key={index}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  title={s.name}
                >
                  <svg className="w-6 h-6 text-white hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              )) : (
                <span className="text-white text-sm">No social links</span>
              )}
            </div>
          </div>
        </div>
        {/* Contact Button */}
        <button className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition" title="Contact Freelancer">
          Contact
        </button>
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
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" /></svg>
                  Overview
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {profile.overview || "This freelancer hasn't added an overview yet."}
                </p>
                {profile.hourlyRate > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-orange-700 font-semibold">${profile.hourlyRate}/hr</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L6 13.25l1.41-1.41L9.75 14.17l6.84-6.84L18 8.75z" /></svg>
                  Skills & Endorsements
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full shadow-sm">
                        <span className="text-orange-700 font-medium text-sm">
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                        {skill.endorsements && (
                          <>
                            <span className="text-xs text-gray-500">{skill.endorsements}+</span>
                            <div className="w-16 h-2 bg-orange-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-orange-400 rounded-full"
                                style={{ width: `${Math.min(skill.endorsements * 8, 100)}%` }}
                              ></div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "work" && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 17.75l-6.172 3.245 1.179-6.873-5-4.873 6.9-1.002L12 2.25l3.093 6.997 6.9 1.002-5 4.873 1.179 6.873z" /></svg>
                Work History
              </h2>
              <div className="space-y-4">
                {profile.workHistory && profile.workHistory.length > 0 ? (
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
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No work history yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Portfolio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.portfolio && profile.portfolio.length > 0 ? (
                  profile.portfolio.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-800 text-base mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm flex-1">
                          {item.description && item.description.length > 100
                            ? `${item.description.slice(0, 100)}...`
                            : item.description}
                        </p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-orange-600 hover:underline text-sm font-medium"
                        >
                          View Project
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-8 col-span-full">No portfolio projects yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
 