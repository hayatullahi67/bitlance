import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Zap, 
  Bell, 
  MessageSquare, 
  Settings, 
  User,
  Search,
  Plus,
  Briefcase,
  Wallet,
  LogOut
} from "lucide-react";

export interface HeaderProps {
  userType: "client" | "freelancer" | "guest";
  userName?: string;
  userAvatar?: string;
  showSearch?: boolean;
  showActions?: boolean;
  title?: string;
  onSearch?: (query: string) => void;
  onPostJob?: () => void;
  onFindWork?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
}

const Header = ({ 
  userType, 
  userName = "User", 
  userAvatar,
  showSearch = false,
  showActions = true,
  title,
  onSearch,
  onPostJob,
  onFindWork,
  onProfile,
  onLogout
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getProfileRoute = () => {
    return userType === "client" ? "/client-profile" : "/freelancer-profile";
  };

  const getDashboardRoute = () => {
    return userType === "client" ? "/client-dashboard" : "/freelancer-dashboard";
  };

  const getDefaultAvatar = () => {
    return userType === "client" 
      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      : "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face";
  };

  const getAvatarFallback = () => {
    return userName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogoClick = () => {
    if (userType === "guest") {
      navigate("/");
    } else {
      navigate(getDashboardRoute());
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch?.(query);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <Zap className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Bitlance</h1>
            </div>

            {/* Navigation Links - Only show for authenticated users */}
            {userType !== "guest" && (
              <nav className="hidden md:flex items-center space-x-4">
                {userType === "client" ? (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/browse-freelancers")}
                      className={location.pathname === "/browse-freelancers" ? "bg-orange-50 text-orange-600" : ""}
                    >
                      Find Talent
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/post-job")}
                      className={location.pathname === "/post-job" ? "bg-orange-50 text-orange-600" : ""}
                    >
                      Post a Job
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/browse-jobs")}
                      className={location.pathname === "/browse-jobs" ? "bg-orange-50 text-orange-600" : ""}
                    >
                      Find Work
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate("/freelancer-dashboard")}
                      className={location.pathname === "/freelancer-dashboard" ? "bg-orange-50 text-orange-600" : ""}
                    >
                      My Projects
                    </Button>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Center Section - Search (if enabled) */}
          {showSearch && (
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="search"
                  type="text"
                  placeholder="Search for jobs, freelancers, or skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </form>
            </div>
          )}

          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Page Title - Only show if provided and no search */}
            {title && !showSearch && (
              <h2 className="text-lg font-semibold text-gray-900 hidden md:block">
                {title}
              </h2>
            )}

            {/* Action Buttons */}
            {showActions && userType !== "guest" && (
              <div className="flex items-center space-x-2">
                {userType === "client" && onPostJob && (
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={onPostJob}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                )}
                
                {userType === "freelancer" && onFindWork && (
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={onFindWork}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Work
                  </Button>
                )}
              </div>
            )}

            {/* Guest Actions */}
            {userType === "guest" && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* User Menu - Only for authenticated users */}
            {userType !== "guest" && (
              <div className="flex items-center space-x-2">
                {/* Notification Icons */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>

                {/* Profile Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onProfile || (() => navigate(getProfileRoute()))}
                >
                  <User className="h-5 w-5" />
                </Button>

                {/* User Avatar */}
                <div className="relative group">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={userAvatar || getDefaultAvatar()} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{userName}</div>
                        <div className="text-gray-500">{userType === "client" ? "Client" : "Freelancer"}</div>
                      </div>
                      
                      <button
                        onClick={() => navigate(getProfileRoute())}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => navigate(getDashboardRoute())}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Dashboard
                      </button>
                      
                      <button
                        onClick={() => navigate("/pay")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Payments
                      </button>
                      
                      <div className="border-t">
                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 