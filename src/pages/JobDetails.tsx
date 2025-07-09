import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Star, 
  MessageSquare, 
  Send,
  Bookmark,
  Share2,
  Flag,
  CheckCircle,
  Award,
  Zap
} from "lucide-react";

const JobDetails = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK: Replace Supabase fetch with static job data
      setLoading(true);
    // Example static job data
    const staticJob = {
      id,
      title: "Static Job Title",
      category: "Development",
      isActive: true,
      postedDate: "2 days ago",
      location: "Remote",
      proposals: 5,
      client: {
        name: "Static Client",
        avatar: "https://ui-avatars.com/api/?name=Client",
        rating: 4.8,
        totalSpent: "1 BTC",
        location: "Internet"
      },
      description: "This is a static job description for UI purposes.",
    };
    setTimeout(() => {
      setJob(staticJob);
      setLoading(false);
    }, 500);
  }, [id]);

  const proposals = [
    {
      id: "1",
      freelancer: {
        name: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 4.9,
        hourlyRate: 0.002,
        totalEarnings: "8.2 BTC",
        location: "Toronto, Canada"
      },
      proposal: {
        coverLetter: "I have extensive experience building e-commerce platforms and integrating Bitcoin payments. I've completed similar projects for 5+ clients with excellent feedback.",
        bid: 0.08,
        deliveryTime: "3 weeks",
        attachments: 2
      },
      isTopRated: true,
      isRecommended: true
    },
    {
      id: "2",
      freelancer: {
        name: "Maria Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        rating: 4.7,
        hourlyRate: 0.0018,
        totalEarnings: "5.1 BTC",
        location: "Barcelona, Spain"
      },
      proposal: {
        coverLetter: "I specialize in React development and have worked with Bitcoin APIs before. I can deliver a high-quality e-commerce solution within your timeline.",
        bid: 0.12,
        deliveryTime: "4 weeks",
        attachments: 1
      },
      isTopRated: false,
      isRecommended: false
    }
  ];

  const handleApply = () => {
    navigate("../apply-job", { state: { jobId: job.id } });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <Layout 
      {...props}
      title="Job Details"
      onPostJob={() => navigate("../post-job")}
      onLogout={() => navigate("/login")}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Job Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="secondary" className="text-sm">
                    {job.category}
                  </Badge>
                  {job.isActive && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {job.postedDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{job.proposals} proposals</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Client Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.client?.avatar || "https://ui-avatars.com/api/?name=Client"} />
                    <AvatarFallback>{job.client?.name ? job.client.name.split(' ').map(n => n[0]).join('') : 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.client?.name || "Client"}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{job.client?.rating ?? 'N/A'}</span>
                      </div>
                      <span>•</span>
                      <span>{job.client?.totalSpent ? `${job.client.totalSpent} spent` : 'No spend data'}</span>
                      <span>•</span>
                      <span>{job.client?.location || 'Unknown location'}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line text-gray-700">{job.description}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-semibold text-gray-900">
                            {(job.budget?.min ?? 'N/A')} - {(job.budget?.max ?? 'N/A')} {job.budget?.currency ?? ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{job.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-semibold text-gray-900">{job.experience}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Project Type</p>
                          <p className="font-semibold text-gray-900">Fixed Price</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skills Required</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="proposals" className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={proposal.freelancer.avatar} />
                            <AvatarFallback>
                              {proposal.freelancer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                  {proposal.freelancer.name}
                                </h3>
                                {proposal.isTopRated && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Award className="h-3 w-3 mr-1" />
                                    Top Rated
                                  </Badge>
                                )}
                                {proposal.isRecommended && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {proposal.proposal.bid} BTC
                                </p>
                                <p className="text-sm text-gray-600">
                                  {proposal.proposal.deliveryTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{proposal.freelancer.rating}</span>
                              </div>
                              <span>•</span>
                              <span>{proposal.freelancer.totalEarnings} earned</span>
                              <span>•</span>
                              <span>{proposal.freelancer.location}</span>
                            </div>
                            <p className="text-gray-700 mb-4">{proposal.proposal.coverLetter}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </div>
                              <Button className="bg-orange-500 hover:bg-orange-600">
                                <Send className="h-4 w-4 mr-2" />
                                Hire
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-900">Job posted</p>
                            <p className="text-xs text-gray-600">{job.postedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-900">First proposal received</p>
                            <p className="text-xs text-gray-600">2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-900">Job viewed {job.views} times</p>
                            <p className="text-xs text-gray-600">Last viewed today</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {(job.budget?.min ?? 'N/A')} - {(job.budget?.max ?? 'N/A')} {job.budget?.currency ?? ''}
                    </p>
                    <p className="text-sm text-gray-600">Fixed Price</p>
                  </div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 mb-3"
                    onClick={handleApply}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Client
                  </Button>
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proposals</span>
                    <span className="font-semibold">{job.proposals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">{job.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Bid</span>
                    <span className="font-semibold">0.09 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Delivery</span>
                    <span className="font-semibold">3.2 weeks</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetails; 