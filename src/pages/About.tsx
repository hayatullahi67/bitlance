import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Globe, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "@/components/layout/LandingHeader";

const About = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: "Destiny",
      role: "Co-Founder & CMO",
      bio: "Passionate about connecting talent with opportunity",
      avatar: "D"
    },
    {
      name: "Ola",
      role: "Co-Founder & CTO",
      bio: "Building the future of freelance platforms",
      avatar: "O"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-orange-600" />,
      title: "Trust & Transparency",
      description: "We believe in building relationships based on honesty and clear communication."
    },
    {
      icon: <Target className="w-8 h-8 text-orange-600" />,
      title: "Quality First",
      description: "We're committed to connecting you with the best talent and opportunities."
    },
    {
      icon: <Globe className="w-8 h-8 text-orange-600" />,
      title: "Global Community",
      description: "Bringing together talented professionals from around the world."
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "Security & Safety",
      description: "Your security and data protection are our top priorities."
    }
  ];

  const milestones = [
    {
      year: "2025",
      title: "Platform Launch",
      description: "Bitlance officially launched with core features"
    },
    {
      year: "2025",
      title: "10K+ Users",
      description: "Reached our first major milestone of active users"
    },
    {
      year: "2025",
      title: "Mobile App",
      description: "Released our mobile application for iOS and Android"
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanded to serve freelancers and clients worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Bitlance
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're revolutionizing the way freelancers and clients connect, collaborate, and succeed together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate('/signup')}
              >
                Join Our Community
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/how-it-works')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Bitlance, we believe that talent knows no boundaries. Our mission is to create a global platform where skilled professionals can connect with amazing opportunities, and businesses can find the perfect talent for their projects.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to building a community that values quality, transparency, and mutual success. Whether you're a freelancer looking to grow your career or a client seeking exceptional work, Bitlance is here to make it happen.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-gray-700">10K+ Active Users</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-gray-700">98% Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-8">
              <div className="text-center">
                <Zap className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Empowering Global Talent
                </h3>
                <p className="text-gray-600">
                  We're building the future of work, one connection at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do at Bitlance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Bitlance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      {member.avatar}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key milestones in our mission to revolutionize freelance work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {milestone.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Bitlance Community
          </h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Be part of the future of freelance work. Connect, collaborate, and succeed with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/signup')}
            >
              Get Started Today
            </Button>
            {/* <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 