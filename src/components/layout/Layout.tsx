import { ReactNode } from "react";
import Header, { HeaderProps } from "./Header";

interface LayoutProps extends HeaderProps {
  children: ReactNode;
  className?: string;
  userType: "client" | "freelancer";
  userName?: string;
  userAvatar?: string;
}

const Layout = ({ children, className = "", userType, userName, userAvatar, ...headerProps }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userType} userName={userName} userAvatar={userAvatar} {...headerProps} />
      <main className={className}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 