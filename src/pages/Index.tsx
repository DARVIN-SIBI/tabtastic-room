import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

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
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl">
            <UtensilsCrossed className="h-24 w-24 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
          Hotel Bill Management System
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
          Streamline your restaurant billing with our comprehensive management solution. 
          Track menu items, generate bills, and maintain complete billing history.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 gap-2"
            onClick={() => navigate("/auth")}
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Menu Management</h3>
            <p className="text-white/80">Add, edit, and organize your menu items with ease</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Quick Billing</h3>
            <p className="text-white/80">Generate bills instantly with automatic calculations</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Bill History</h3>
            <p className="text-white/80">Access and review all previous bills anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
