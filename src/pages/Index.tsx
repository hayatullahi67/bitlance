
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X, ArrowRight, Star, MessageCircle, Shield, Users, CheckCircle, Quote, Twitter, Github } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Bitlance</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/jobs')} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer">Browse Jobs</button>
            <button onClick={() => navigate('/find-talent')} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer">Find Talent</button>
            <button onClick={() => navigate('/how-it-works')} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer">How it Works</button>
            <button onClick={() => navigate('/about')} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer">About</button>
          </nav>
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 hover:text-orange-600" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-orange-100">
            <nav className="flex flex-col space-y-4 mt-4">
              <button onClick={() => { setIsMenuOpen(false); navigate('/jobs'); }} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer text-left">Browse Jobs</button>
              <button onClick={() => { setIsMenuOpen(false); navigate('/find-talent'); }} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer text-left">Find Talent</button>
              <button onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer text-left">How it Works</button>
              <button onClick={() => { setIsMenuOpen(false); navigate('/about'); }} className="text-gray-600 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer text-left">About</button>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="justify-start text-gray-600 hover:text-orange-600" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                  Sign In
                </Button>
                <Button className="justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white" onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}>
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Powered by Bitcoin Lightning</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Work. Hire. Get Paid — in <span className="text-orange-600">Bitcoin</span>.
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                The simple freelance platform built for the Bitcoin economy. Instant payments, global talent, and Lightning-powered trust.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg"
                onClick={() => navigate('/signup', { state: { activeTab: 'client' } })}
              >
                Post a Job
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg"
                onClick={() => navigate('/jobs')}
              >
                Find Work
              </Button>
            </div>
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2.5k+</div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1.25M</div>
                <div className="text-sm text-gray-600">Sats in Escrow</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mobile App Development</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    In Progress
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">800k / 1.2M sats</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div>
                    <div className="font-medium text-sm">Alice Thompson</div>
                    <div className="text-xs text-gray-500">React Native Developer</div>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Escrow Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-orange-100 rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Lightning Fast Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const projects = [
  {
    id: 1,
    title: "E-commerce Bitcoin Integration",
    description: "Need a developer to integrate BTCPay Server into our online store with Lightning support.",
    budget: "500k sats",
    raised: "300k sats",
    progress: 60,
    freelancer: {
      name: "Marcus Chen",
      avatar: "M",
      rating: 4.9,
    },
    skills: ["Bitcoin", "JavaScript", "BTCPay"],
    status: "In Progress",
    milestones: 3,
    completedMilestones: 2,
  },
  {
    id: 2,
    title: "Lightning Network Mobile Wallet UI",
    description: "Design modern, intuitive UI/UX for a Lightning wallet mobile application.",
    budget: "800k sats",
    raised: "100k sats",
    progress: 12,
    freelancer: {
      name: "Sarah Design",
      avatar: "S",
      rating: 5.0,
    },
    skills: ["UI/UX", "Mobile", "Figma"],
    status: "Just Started",
    milestones: 4,
    completedMilestones: 0,
  },
  {
    id: 3,
    title: "Bitcoin Node Management Dashboard",
    description: "Build a web dashboard for monitoring and managing Bitcoin nodes with real-time stats.",
    budget: "1.2M sats",
    raised: "1.2M sats",
    progress: 100,
    freelancer: {
      name: "Alex Nakamoto",
      avatar: "A",
      rating: 4.8,
    },
    skills: ["React", "Node.js", "Bitcoin"],
    status: "Completed",
    milestones: 5,
    completedMilestones: 5,
  },
];

const FeaturedProjects = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover active Bitcoin-funded projects and join the decentralized workforce
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Completed' 
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {project.status}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">{project.budget ? (typeof project.budget === 'object' ? `${project.budget?.min ?? '?'} - ${project.budget?.max ?? '?'} sats` : project.budget) : 'N/A'}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{project.raised} / {project.budget && typeof project.budget === 'object' ? `${project.budget?.min ?? '?'} - ${project.budget?.max ?? '?'} sats` : project.budget || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {project.completedMilestones} of {project.milestones} milestones completed
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {project.freelancer.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {project.freelancer.name}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{project.freelancer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-orange-600 hover:bg-orange-50">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  size="sm"
                >
                  View Project
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 px-8"
          >
            View All Projects
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const steps = [
  {
    icon: Users,
    title: "Post or Find Work",
    description: "Create detailed job listings or browse opportunities that match your Bitcoin skills.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: Shield,
    title: "Secure Bitcoin Escrow",
    description: "Funds are held safely in Lightning-powered escrow until milestones are completed.",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: CheckCircle,
    title: "Complete Milestones",
    description: "Work gets done in stages with clear deliverables and milestone-based payments.",
    color: "from-green-400 to-green-600",
  },
  {
    icon: Zap,
    title: "Instant Bitcoin Payments",
    description: "Receive payments instantly via Lightning Network - no banks, no delays, no fees.",
    color: "from-purple-400 to-purple-600",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Bitcoin Freelancing Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our Lightning-powered escrow system ensures secure, instant payments while protecting both clients and freelancers
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm text-orange-600 font-semibold mb-2">
                Step {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                 Bitcoin-Native Freelancing Platform
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Empowering freelancers and clients with trustless, milestone-based Bitcoin payments. Built for freedom, built for Bitcoin.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Multi-signature Security</h4>
                    <p className="text-gray-600 text-sm">Your Bitcoin is secured by cryptographic contracts, not corporate promises.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Lightning Fast Settlements</h4>
                    <p className="text-gray-600 text-sm">Payments settle in seconds, not days. Perfect for milestone-based work.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dispute Resolution</h4>
                    <p className="text-gray-600 text-sm">Built-in arbitration system protects both parties if issues arise.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">127.8M</div>
                  <div className="text-sm text-gray-600">Total Sats in Escrow</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">99.2%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">&lt; 1min</div>
                    <div className="text-xs text-gray-600">Avg Settlement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const testimonials = [
  {
    name: "Alex Rodriguez",
    role: "Full-stack Developer",
    avatar: "A",
    content: "Finally, a platform where I get paid instantly for my work. No more waiting weeks for payments to clear. Bitcoin changed everything.",
    rating: 5,
    earned: "₿2.3",
  },
  {
    name: "Sarah Kim",
    role: "UI/UX Designer",
    avatar: "S",
    content: "The milestone-based escrow system gives me confidence that I'll get paid for each stage of work. It's transparent and fair.",
    rating: 5,
    earned: "₿1.8",
  },
  {
    name: "Marcus Chen",
    role: "Blockchain Developer",
    avatar: "M",
    content: "Love working with clients who understand Bitcoin. The Lightning payments are instant and the platform fees are minimal.",
    rating: 5,
    earned: "₿4.1",
  },
];

const Testimonials = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Freelancers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers, designers, and Bitcoin professionals earning on Bitlance
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-6">
                <Quote className="w-8 h-8 text-orange-300 mb-4" />
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Earned: </span>
                  <span className="font-semibold text-orange-600">{testimonial.earned}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning Bitcoin?</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Join the growing community of freelancers who've chosen financial sovereignty over traditional payment systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                onClick={() => navigate('/signup', { state: { activeTab: 'freelancer' } })}
              >
                Start Freelancing
              </button>
              <button 
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
                onClick={() => navigate('/signup', { state: { activeTab: 'client' } })}
              >
                Post a Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Bitlance</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              The first freelancing platform built for the Bitcoin economy. Secure, instant, and global.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Platform */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><button onClick={() => navigate('/jobs')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Browse Jobs</button></li>
              <li><button onClick={() => navigate('/find-talent')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Find Talent</button></li>
              <li><button onClick={() => navigate('/signup', { state: { activeTab: 'client' } })} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Post a Job</button></li>
              <li><button onClick={() => navigate('/how-it-works')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">How it Works</button></li>
              <li><button onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Pricing</button></li>
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bitcoin Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Lightning Tutorial</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              <li><button onClick={() => navigate('/about')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">About</button></li>
              <li><button onClick={() => navigate('/careers')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Careers</button></li>
              <li><button onClick={() => navigate('/privacy')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Privacy</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Terms</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-left">Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Bitlance. Built on Bitcoin, powered by Lightning Network.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AllComponent = () => (
  <>
    <Header />
    <Hero />
    <FeaturedProjects />
    <HowItWorks />
    <Testimonials />
    <Footer />
  </>
);

export default AllComponent;
