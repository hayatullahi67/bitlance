import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  DollarSign,
  Clock,
  FileText,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "@/components/layout/LandingHeader";

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Create Your Profile",
      description: "Sign up as a client or freelancer. Build your profile, showcase your skills, and set your rates.",
      features: ["Free registration", "Profile customization", "Portfolio upload", "Skill verification"]
    },
    {
      icon: <Briefcase className="w-8 h-8 text-orange-600" />,
      title: "Post or Find Projects",
      description: "Clients post detailed job requirements while freelancers browse and apply for opportunities.",
      features: ["Detailed job descriptions", "Budget setting", "Skill matching", "Project categorization"]
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-600" />,
      title: "Connect & Collaborate",
      description: "Communicate directly through our secure messaging system and discuss project details.",
      features: ["Real-time messaging", "File sharing", "Video calls", "Project updates"]
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "Secure Payments",
      description: "Use our escrow system to ensure safe, secure payments with milestone-based releases.",
      features: ["Escrow protection", "Milestone payments", "Dispute resolution", "Secure transactions"]
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: "Lightning Fast",
      description: "Quick project matching and instant communication"
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: "Secure & Safe",
      description: "Protected payments and verified profiles"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Global Talent",
      description: "Access to skilled professionals worldwide"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-orange-600" />,
      title: "Quality Assured",
      description: "Rated and reviewed freelancers"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Freelancers", icon: <Users className="w-5 h-5" /> },
    { number: "5K+", label: "Completed Projects", icon: <CheckCircle className="w-5 h-5" /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Star className="w-5 h-5" /> },
    { number: "$2M+", label: "Paid to Freelancers", icon: <DollarSign className="w-5 h-5" /> }
  ];

  const benefits = {
    clients: [
      "Access to global talent pool",
      "Fixed project costs",
      "Quality assurance",
      "Fast project completion",
      "Secure payment protection",
      "24/7 support"
    ],
    freelancers: [
      "Work from anywhere",
      "Set your own rates",
      "Build your portfolio",
      "Secure payments",
      "Flexible schedule",
      "Professional growth"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Bitlance Works
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect talented freelancers with amazing clients. Simple, secure, and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/browse-jobs')}
              >
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-orange-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect, collaborate, and complete projects successfully
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Bitlance?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the tools and security you need to succeed in the freelance economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're a client or freelancer, Bitlance has something for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Clients */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-orange-600" />
                  For Clients
                </CardTitle>
                <CardDescription>
                  Find the perfect freelancer for your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.clients.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/signup')}
                >
                  Hire Talent
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* For Freelancers */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-orange-600" />
                  For Freelancers
                </CardTitle>
                <CardDescription>
                  Find exciting projects and grow your career
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.freelancers.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/signup', { state: { activeTab: 'freelancer' } })}
                >
                  Start Freelancing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of clients and freelancers who trust Bitlance for their projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/signup', { state: { activeTab: 'freelancer' } })}
            >
              Create Account
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-orange-600"
              onClick={() => navigate('/browse-jobs')}
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 