import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const FreelancerHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50 w-full">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/freelancer-dashboard" className="text-xl font-bold text-orange-600">Bitlance Freelancer</Link>
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link to="/freelancer-dashboard" className="hover:text-orange-600">Dashboard</Link>
          <Link to="/browse-jobs" className="hover:text-orange-600">Browse Jobs</Link>
          <Link to="/freelancer-profile" className="hover:text-orange-600">Profile</Link>
          {/* <Link to="/freelancer/public-profile/your-id" className="hover:text-orange-600">Public Profile</Link> */}
          <Link to="/messages" className="hover:text-orange-600">Messages</Link>
        </nav>
        <div className="hidden md:block">
          <button 
            onClick={handleLogout}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Logout
          </button>
        </div>
        {/* Mobile Hamburger */}
        <button className="md:hidden ml-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow px-4 pb-4">
          <nav className="flex flex-col gap-3">
            <Link to="/freelancer-dashboard" className="hover:text-orange-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/browse-jobs" className="hover:text-orange-600" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
            <Link to="/freelancer-profile" className="hover:text-orange-600" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link to="/freelancer/public-profile/your-id" className="hover:text-orange-600" onClick={() => setMenuOpen(false)}>Public Profile</Link>
            <Link to="/messages" className="hover:text-orange-600" onClick={() => setMenuOpen(false)}>Messages</Link>
            <button 
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 mt-2 text-left" 
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default FreelancerHeader; 