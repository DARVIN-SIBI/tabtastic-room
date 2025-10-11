import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

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
          Streamline your hotel billing and menu management
        </p>

        <Button 
          size="lg"
          className="w-full max-w-md mx-auto bg-white text-primary hover:bg-white/90 text-xl py-6"
          onClick={() => navigate("/auth")}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
