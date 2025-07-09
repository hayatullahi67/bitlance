// src/lib/jobManagement.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
  addDoc,
  increment,
  runTransaction
} from "firebase/firestore";
import { db, auth } from "./firebaseClient";

export interface JobData {
  id?: string;
  title: string;
  description: string;
  category: string;
  budget: {
    type: "fixed" | "hourly";
    min?: string;
    max?: string;
    hourly?: string;
  };
  skills: string[];
  experience: string;
  duration: string;
  location: string;
  clientId: string;
  clientEmail?: string;
  status: "open" | "in_progress" | "completed" | "expired" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;
  proposals: ProposalData[];
  views: number;
  applications: number;
}

// Proposal interfaces
export interface ProposalData {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  freelancerLocation?: string;
  proposal: {
    type: "fixed" | "hourly";
    amount: string;
    duration?: string;
  };
  budget?: string; // Added budget property
  message: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt?: Timestamp; // Added createdAt property
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  attachments?: string[];
  portfolio?: string[];
}

export interface ProposalUpdateData {
  status?: ProposalData['status'];
  message?: string;
  proposal?: {
    type: "fixed" | "hourly";
    amount: string;
    duration?: string;
  };
}

export interface JobUpdateData {
  title?: string;
  description?: string;
  category?: string;
  budget?: {
    type: "fixed" | "hourly";
    min?: string;
    max?: string;
    hourly?: string;
  };
  skills?: string[];
  experience?: string;
  duration?: string;
  location?: string;
}

// Job expiration time (30 days)
export const JOB_EXPIRATION_DAYS = 30;

// Create a new job
export const createJob = async (jobData: Omit<JobData, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'proposals' | 'views' | 'applications'>): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to create a job");
  }

  const now = serverTimestamp() as Timestamp;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + JOB_EXPIRATION_DAYS);

  const jobToSave: Omit<JobData, 'id'> = {
    ...jobData,
    clientId: auth.currentUser.uid,
    clientEmail: auth.currentUser.email || '',
    status: "open",
    createdAt: now,
    updatedAt: now,
    expiresAt: Timestamp.fromDate(expiresAt),
    proposals: [],
    views: 0,
    applications: 0,
  };

  const docRef = await addDoc(collection(db, "jobs"), jobToSave);
  return docRef.id;
};

// Get job by ID
export const getJob = async (jobId: string): Promise<JobData | null> => {
  try {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      return { id: jobDoc.id, ...jobDoc.data() } as JobData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};

// Get jobs by client ID
export const getClientJobs = async (clientId: string): Promise<JobData[]> => {
  try {
    const q = query(
      collection(db, "jobs"),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as JobData);
  } catch (error) {
    console.error("Error fetching client jobs:", error);
    throw error;
  }
};

// Update job status
export const updateJobStatus = async (jobId: string, status: JobData['status']): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to update job status");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  if (jobData.clientId !== auth.currentUser.uid) {
    throw new Error("Only the job owner can update job status");
  }

  await updateDoc(jobRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Update job details (only for open jobs)
export const updateJob = async (jobId: string, updateData: JobUpdateData): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to update job");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  if (jobData.clientId !== auth.currentUser.uid) {
    throw new Error("Only the job owner can update job");
  }

  if (jobData.status !== "open") {
    throw new Error("Only open jobs can be updated");
  }

  await updateDoc(jobRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

// Delete job with cleanup
export const deleteJob = async (jobId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to delete job");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  if (jobData.clientId !== auth.currentUser.uid) {
    throw new Error("Only the job owner can delete job");
  }

  const batch = writeBatch(db);

  // Delete the job
  batch.delete(jobRef);

  // Delete all proposals for this job
  const proposalsQuery = query(
    collection(db, "proposals"),
    where("jobId", "==", jobId)
  );
  const proposalsSnapshot = await getDocs(proposalsQuery);
  proposalsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete any messages related to this job
  const messagesQuery = query(
    collection(db, "messages"),
    where("jobId", "==", jobId)
  );
  const messagesSnapshot = await getDocs(messagesQuery);
  messagesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

// Extend job expiration
export const extendJobExpiration = async (jobId: string, days: number = JOB_EXPIRATION_DAYS): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to extend job");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  if (jobData.clientId !== auth.currentUser.uid) {
    throw new Error("Only the job owner can extend job");
  }

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + days);

  await updateDoc(jobRef, {
    expiresAt: Timestamp.fromDate(newExpiresAt),
    updatedAt: serverTimestamp(),
  });
};

// Check and update expired jobs
export const checkExpiredJobs = async (): Promise<void> => {
  const now = Timestamp.now();
  const q = query(
    collection(db, "jobs"),
    where("status", "==", "open"),
    where("expiresAt", "<=", now)
  );

  const querySnapshot = await getDocs(q);
  const batch = writeBatch(db);

  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      status: "expired",
      updatedAt: serverTimestamp(),
    });
  });

  if (querySnapshot.docs.length > 0) {
    await batch.commit();
    console.log(`Updated ${querySnapshot.docs.length} expired jobs`);
  }
};

// Increment job views
export const incrementJobViews = async (jobId: string): Promise<void> => {
  const jobRef = doc(db, "jobs", jobId);
  await updateDoc(jobRef, {
    views: increment(1),
  });
};

/**
 * Track unique job view for a freelancer
 * Only increments view count if this freelancer hasn't viewed this job before
 * @param jobId - The ID of the job
 * @param freelancerId - The ID of the freelancer viewing the job
 * @returns Promise<boolean> - Returns true if this is a new view, false if already viewed
 */
export const trackJobView = async (jobId: string, freelancerId: string): Promise<boolean> => {
  try {
    // Check if this freelancer has already viewed this job
    const jobViewRef = doc(db, "jobs", jobId, "jobViews", freelancerId);
    const jobViewDoc = await getDoc(jobViewRef);
    
    // If freelancer has already viewed this job, don't count as new view
    if (jobViewDoc.exists()) {
      console.log(`Freelancer ${freelancerId} has already viewed job ${jobId}`);
      return false;
    }
    
    // Use Firestore transaction to safely increment views and create view record
    await runTransaction(db, async (transaction) => {
      // Get the job document
      const jobRef = doc(db, "jobs", jobId);
      const jobDoc = await transaction.get(jobRef);
      
      if (!jobDoc.exists()) {
        throw new Error("Job not found");
      }
      
      const currentViews = jobDoc.data().views || 0;
      
      // Increment views count
      transaction.update(jobRef, {
        views: currentViews + 1,
        lastViewed: serverTimestamp()
      });
      
      // Create view record for this freelancer
      transaction.set(jobViewRef, {
        freelancerId: freelancerId,
        viewedAt: serverTimestamp(),
        jobId: jobId
      });
    });
    
    console.log(`New view tracked for job ${jobId} by freelancer ${freelancerId}`);
    return true;
  } catch (error) {
    console.error("Error tracking job view:", error);
    // Don't throw error to avoid breaking the user experience
    return false;
  }
};

/**
 * Check if a freelancer has already viewed a specific job
 * @param jobId - The ID of the job
 * @param freelancerId - The ID of the freelancer
 * @returns Promise<boolean> - Returns true if freelancer has viewed the job
 */
export const hasFreelancerViewedJob = async (jobId: string, freelancerId: string): Promise<boolean> => {
  try {
    const jobViewRef = doc(db, "jobs", jobId, "jobViews", freelancerId);
    const jobViewDoc = await getDoc(jobViewRef);
    return jobViewDoc.exists();
  } catch (error) {
    console.error("Error checking job view status:", error);
    return false;
  }
};

// Get job statistics
export const getJobStats = async (clientId: string): Promise<{
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  expired: number;
}> => {
  const jobs = await getClientJobs(clientId);
  
  return {
    total: jobs.length,
    open: jobs.filter(job => job.status === "open").length,
    inProgress: jobs.filter(job => job.status === "in_progress").length,
    completed: jobs.filter(job => job.status === "completed").length,
    expired: jobs.filter(job => job.status === "expired").length,
  };
}; 

// Proposal Management Functions

// Add proposal to a job
export const addProposalToJob = async (jobId: string, proposalData: Omit<ProposalData, 'id' | 'submittedAt' | 'updatedAt' | 'status'>): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to create a proposal");
  }

  const now = serverTimestamp() as Timestamp;
  const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const proposalToSave: ProposalData = {
    id: proposalId,
    ...proposalData,
    freelancerId: auth.currentUser.uid,
    freelancerEmail: auth.currentUser.email || '',
    status: "pending",
    submittedAt: now,
    updatedAt: now,
  };

  // Get the job and add the proposal to its proposals array
  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  const updatedProposals = [...jobData.proposals, proposalToSave];

  await updateDoc(jobRef, {
    proposals: updatedProposals,
    applications: increment(1),
    updatedAt: serverTimestamp(),
  });

  return proposalId;
};

// Get proposals for a specific job (from the job document)
export const getJobProposals = async (jobId: string): Promise<ProposalData[]> => {
  try {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      const jobData = jobDoc.data() as JobData;
      // Sort proposals by submittedAt in descending order
      return jobData.proposals.sort((a, b) => {
        const dateA = getDate(a.submittedAt);
        const dateB = getDate(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching job proposals:", error);
    throw error;
  }
};

// Get proposals by client (all jobs)
export const getClientProposals = async (clientId: string): Promise<ProposalData[]> => {
  try {
    const jobsQuery = query(
      collection(db, "jobs"),
      where("clientId", "==", clientId)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    
    const allProposals: ProposalData[] = [];
    jobsSnapshot.docs.forEach(doc => {
      const jobData = doc.data() as JobData;
      allProposals.push(...jobData.proposals);
    });
    
    // Sort all proposals by submittedAt in descending order
    return allProposals.sort((a, b) => {
      const dateA = getDate(a.submittedAt);
      const dateB = getDate(b.submittedAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching client proposals:", error);
    throw error;
  }
};

// Update proposal status (accept/reject)
export const updateProposalStatus = async (jobId: string, proposalId: string, status: ProposalData['status']): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to update proposal");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  if (jobData.clientId !== auth.currentUser.uid) {
    throw new Error("Only the job owner can update proposal status");
  }

  // Find and update the specific proposal
  const updatedProposals = jobData.proposals.map(proposal => {
    if (proposal.id === proposalId) {
      return {
        ...proposal,
        status,
        updatedAt: serverTimestamp() as Timestamp,
      };
    }
    return proposal;
  });

  const updateData: any = {
    proposals: updatedProposals,
    updatedAt: serverTimestamp(),
  };

  // If proposal is accepted, update job status to in_progress
  if (status === "accepted") {
    updateData.status = "in_progress";
  }

  await updateDoc(jobRef, updateData);
};

// Get proposal by ID (search in all jobs)
export const getProposal = async (proposalId: string): Promise<ProposalData | null> => {
  try {
    const jobsQuery = query(collection(db, "jobs"));
    const jobsSnapshot = await getDocs(jobsQuery);
    
    for (const jobDoc of jobsSnapshot.docs) {
      const jobData = jobDoc.data() as JobData;
      const proposal = jobData.proposals.find(p => p.id === proposalId);
      if (proposal) {
        return proposal;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching proposal:", error);
    throw error;
  }
};

// Delete proposal (for freelancers to withdraw)
export const deleteProposal = async (jobId: string, proposalId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to delete proposal");
  }

  const jobRef = doc(db, "jobs", jobId);
  const jobDoc = await getDoc(jobRef);
  
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }

  const jobData = jobDoc.data() as JobData;
  
  // Find the proposal to check ownership
  const proposal = jobData.proposals.find(p => p.id === proposalId);
  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.freelancerId !== auth.currentUser.uid) {
    throw new Error("Only the proposal owner can delete it");
  }

  // Remove the proposal from the array
  const updatedProposals = jobData.proposals.filter(p => p.id !== proposalId);

  await updateDoc(jobRef, {
    proposals: updatedProposals,
    applications: increment(-1),
    updatedAt: serverTimestamp(),
  });
}; 

// Helper to safely convert Firestore Timestamp, Date, string, or number to Date
function getDate(val: any): Date {
  if (val && typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  return new Date(); // fallback to now if invalid
} 