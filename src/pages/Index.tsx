
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Zap, Users, Shield, Coins } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Bitlance</h1>
          </div>
          <div className="space-x-4">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            The Future of Freelancing is{" "}
            <span className="text-orange-500">Bitcoin</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect talented freelancers with clients worldwide. Get paid instantly 
            with Bitcoin and Lightning Network. No banks, no delays, just pure peer-to-peer commerce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              onClick={() => navigate("/signup")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Earning Bitcoin
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 text-lg"
              onClick={() => navigate("/marketplace")}
            >
              Browse Talents
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Bitlance?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant payments with Lightning Network. No waiting for bank transfers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Coins className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <CardTitle>Bitcoin Native</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All payments in Bitcoin. No fiat conversion fees or currency risks.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Self-custody payments with built-in escrow for project security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <CardTitle>Global Talent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access worldwide talent pool without geographic payment restrictions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Join the Bitcoin Economy?</h3>
          <p className="text-xl mb-8 opacity-90">
            Whether you're a client looking for talent or a freelancer ready to get paid in Bitcoin
          </p>
          <Button 
            size="lg" 
            className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 text-lg"
            onClick={() => navigate("/signup")}
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">Bitlance</span>
            </div>
            <div className="text-gray-400">
              © 2024 Bitlance. Empowering the Bitcoin economy.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
