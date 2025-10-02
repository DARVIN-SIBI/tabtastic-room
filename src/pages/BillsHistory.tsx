import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Bill = Database["public"]["Tables"]["bills"]["Row"];
type BillItem = Database["public"]["Tables"]["bill_items"]["Row"];

const BillsHistory = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBillItems = async (billId: string) => {
    try {
      const { data, error } = await supabase
        .from("bill_items")
        .select("*")
        .eq("bill_id", billId);

      if (error) throw error;
      setBillItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openBillDetails = async (bill: Bill) => {
    setSelectedBill(bill);
    await fetchBillItems(bill.id);
    setIsDialogOpen(true);
  };

  const filteredBills = bills.filter((bill) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bill.bill_number.toLowerCase().includes(searchLower) ||
      bill.customer_name?.toLowerCase().includes(searchLower) ||
      bill.room_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Bills History
        </h1>
        <p className="text-muted-foreground mt-1">View all previous bills</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by bill number, customer, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">{bill.bill_number}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(bill.created_at), "PPp")}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-accent">
                    ₹{bill.total}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bill.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{bill.customer_name}</p>
                  </div>
                )}
                {bill.room_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-medium">{bill.room_number}</p>
                  </div>
                )}
                {bill.payment_method && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{bill.payment_method}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => openBillDetails(bill)}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredBills.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No bills found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Bill Number</p>
                  <p className="font-mono font-semibold">{selectedBill.bill_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{format(new Date(selectedBill.created_at), "PPp")}</p>
                </div>
                {selectedBill.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{selectedBill.customer_name}</p>
                  </div>
                )}
                {selectedBill.customer_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedBill.customer_phone}</p>
                  </div>
                )}
                {selectedBill.room_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-medium">{selectedBill.room_number}</p>
                  </div>
                )}
                {selectedBill.payment_method && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{selectedBill.payment_method}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Items</h3>
                <div className="space-y-2">
                  {billItems.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.unit_price} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item.total_price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{selectedBill.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold">₹{selectedBill.tax}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-accent">₹{selectedBill.total}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillsHistory;
