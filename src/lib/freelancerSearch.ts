// src/lib/freelancerSearch.ts
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebaseClient";

export interface FreelancerData {
  uid: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  location: string;
  overview: string;
  skills: Array<{ name: string; endorsements: number }>;
  hourlyRate: number;
  experienceLevel: string;
  imageUrl: string;
  bannerUrl: string;
  online: boolean;
  verified: boolean;
  availability: string;
  workHistory: Array<{
    client: string;
    job: string;
    rating: number;
    review: string;
    date: string;
    logo: string;
    link: string;
  }>;
  portfolio: Array<{
    title: string;
    description: string;
    image: string;
    link: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string;
  skills?: string[];
  minRating?: number;
  maxRate?: number;
  availability?: string;
  experienceLevel?: string;
  location?: string;
}

export interface SortOptions {
  field: 'newest' | 'rating' | 'jobs' | 'rate-low' | 'rate-high';
  direction: 'asc' | 'desc';
}

// Get all freelancers with optional filtering
export const getFreelancers = async (
  filters?: SearchFilters,
  sortBy: SortOptions = { field: 'newest', direction: 'desc' },
  limitCount: number = 50
): Promise<FreelancerData[]> => {
  try {
    let q = query(collection(db, "freelancers"));

    // Apply filters
    if (filters?.availability) {
      q = query(q, where("availability", "==", filters.availability));
    }

    if (filters?.experienceLevel) {
      q = query(q, where("experienceLevel", "==", filters.experienceLevel));
    }

    if (filters?.location) {
      // Note: Firestore doesn't support partial string matching
      // We'll filter this in JavaScript
    }

    // Apply sorting
    switch (sortBy.field) {
      case 'newest':
        q = query(q, orderBy("createdAt", sortBy.direction));
        break;
      case 'rating':
        // We'll sort by average rating in JavaScript since it's calculated
        break;
      case 'jobs':
        // We'll sort by workHistory length in JavaScript
        break;
      case 'rate-low':
        q = query(q, orderBy("hourlyRate", "asc"));
        break;
      case 'rate-high':
        q = query(q, orderBy("hourlyRate", "desc"));
        break;
    }

    // Apply limit
    q = query(q, limit(limitCount));

    const querySnapshot = await getDocs(q);
    let freelancers = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as FreelancerData[];

    // Apply JavaScript-based filters
    if (filters?.skills && filters.skills.length > 0) {
      freelancers = freelancers.filter(freelancer =>
        freelancer.skills.some(skill =>
          filters.skills!.some(filterSkill =>
            skill.name.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    if (filters?.minRating) {
      freelancers = freelancers.filter(freelancer => {
        const avgRating = freelancer.workHistory.length > 0
          ? freelancer.workHistory.reduce((sum, work) => sum + work.rating, 0) / freelancer.workHistory.length
          : 0;
        return avgRating >= filters.minRating!;
      });
    }

    if (filters?.maxRate) {
      freelancers = freelancers.filter(freelancer => freelancer.hourlyRate <= filters.maxRate!);
    }

    if (filters?.location) {
      freelancers = freelancers.filter(freelancer =>
        freelancer.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Apply JavaScript-based sorting
    if (sortBy.field === 'rating') {
      freelancers.sort((a, b) => {
        const ratingA = a.workHistory.length > 0
          ? a.workHistory.reduce((sum, work) => sum + work.rating, 0) / a.workHistory.length
          : 0;
        const ratingB = b.workHistory.length > 0
          ? b.workHistory.reduce((sum, work) => sum + work.rating, 0) / b.workHistory.length
          : 0;
        return sortBy.direction === 'desc' ? ratingB - ratingA : ratingA - ratingB;
      });
    }

    if (sortBy.field === 'jobs') {
      freelancers.sort((a, b) => {
        const jobsA = a.workHistory.length;
        const jobsB = b.workHistory.length;
        return sortBy.direction === 'desc' ? jobsB - jobsA : jobsA - jobsB;
      });
    }

    return freelancers;
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    throw error;
  }
};

// Search freelancers by text query
export const searchFreelancers = async (
  query: string,
  limitCount: number = 50
): Promise<FreelancerData[]> => {
  try {
    const allFreelancers = await getFreelancers(undefined, { field: 'newest', direction: 'desc' }, 1000);
    
    const searchTerm = query.toLowerCase();
    
    return allFreelancers.filter(freelancer => {
      // Search in name
      if (freelancer.name.toLowerCase().includes(searchTerm)) return true;
      
      // Search in title
      if (freelancer.title.toLowerCase().includes(searchTerm)) return true;
      
      // Search in skills
      if (freelancer.skills.some(skill => skill.name.toLowerCase().includes(searchTerm))) return true;
      
      // Search in overview
      if (freelancer.overview.toLowerCase().includes(searchTerm)) return true;
      
      // Search in location
      if (freelancer.location.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    }).slice(0, limitCount);
  } catch (error) {
    console.error("Error searching freelancers:", error);
    throw error;
  }
};

// Get freelancer by ID
export const getFreelancer = async (freelancerId: string): Promise<FreelancerData | null> => {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const freelancerDoc = await getDoc(doc(db, "freelancers", freelancerId));
    
    if (freelancerDoc.exists()) {
      return {
        uid: freelancerDoc.id,
        ...freelancerDoc.data()
      } as FreelancerData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching freelancer:", error);
    throw error;
  }
};

// Get freelancer statistics
export const getFreelancerStats = async (freelancerId: string) => {
  try {
    const freelancer = await getFreelancer(freelancerId);
    if (!freelancer) return null;

    const completedJobs = freelancer.workHistory.length;
    const avgRating = completedJobs > 0
      ? freelancer.workHistory.reduce((sum, work) => sum + work.rating, 0) / completedJobs
      : 0;
    
    const totalEarnings = freelancer.workHistory.reduce((sum, work) => {
      // This would need to be calculated from actual job data
      // For now, we'll estimate based on hourly rate
      return sum + (freelancer.hourlyRate * 40); // Assume 40 hours per job
    }, 0);

    return {
      completedJobs,
      avgRating,
      totalEarnings,
      skills: freelancer.skills.length,
      portfolio: freelancer.portfolio.length,
      verified: freelancer.verified,
      online: freelancer.online
    };
  } catch (error) {
    console.error("Error fetching freelancer stats:", error);
    throw error;
  }
};

// Get popular skills (for search suggestions)
export const getPopularSkills = async (): Promise<string[]> => {
  try {
    const freelancers = await getFreelancers(undefined, { field: 'newest', direction: 'desc' }, 1000);
    
    const skillCounts: { [key: string]: number } = {};
    
    freelancers.forEach(freelancer => {
      freelancer.skills.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
    });
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([skill]) => skill);
  } catch (error) {
    console.error("Error fetching popular skills:", error);
    return [];
  }
}; 