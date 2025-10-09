import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Shield, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center space-y-12">
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl">
            <UtensilsCrossed className="h-24 w-24 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          Hotel Bill Management System
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
          Choose your access level to get started
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader className="space-y-4">
              <div className="mx-auto p-4 bg-primary/10 rounded-2xl w-fit">
                <Shield className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-3xl">Admin Access</CardTitle>
              <CardDescription className="text-base">
                Full system access with menu management and complete billing oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-left space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Add & manage menu items
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  View all customer bills
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Full system control
                </li>
              </ul>
              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-lg"
                onClick={() => navigate("/auth", { state: { userType: "admin" } })}
              >
                Admin Sign In
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader className="space-y-4">
              <div className="mx-auto p-4 bg-accent/10 rounded-2xl w-fit">
                <User className="h-16 w-16 text-accent" />
              </div>
              <CardTitle className="text-3xl">Customer Access</CardTitle>
              <CardDescription className="text-base">
                View your personal billing history and track your expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-left space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  View your bills only
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Track your expenses
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Download bill copies
                </li>
              </ul>
              <Button 
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-lg"
                onClick={() => navigate("/auth", { state: { userType: "customer" } })}
              >
                Customer Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
