import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Bitlance</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">Browse Jobs</a>
            <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">Find Talent</a>
            <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">How it Works</a>
            <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">About</a>
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
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">Browse Jobs</a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">Find Talent</a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">About</a>
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

export default LandingHeader; 