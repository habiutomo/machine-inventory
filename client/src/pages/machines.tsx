import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, ArrowUpDown, QrCode, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Machine, MachineBrand, MachineType } from "@shared/schema";
import MachineForm from "@/components/machine-form";
import TransferForm from "@/components/transfer-form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const statusColors = {
  new: "bg-green-500",
  in_use: "bg-blue-500",
  broken: "bg-red-500",
  sold: "bg-gray-500",
};

export default function MachinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const { data: machines = [], isLoading: loadingMachines } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const { data: types = [] } = useQuery<MachineType[]>({
    queryKey: ["/api/machine-types"],
  });

  const { data: brands = [] } = useQuery<MachineBrand[]>({
    queryKey: ["/api/machine-brands"],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/machines/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({
        title: "Success",
        description: "Machine deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(search.toLowerCase()) ||
      machine.barcode.toLowerCase().includes(search.toLowerCase()) ||
      machine.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Machines</h1>
        <Dialog open={showMachineForm} onOpenChange={setShowMachineForm}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <MachineForm 
              onSuccess={() => setShowMachineForm(false)}
              types={types}
              brands={brands}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search machines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barcode</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    {machine.barcode}
                  </div>
                </TableCell>
                <TableCell>{machine.name}</TableCell>
                <TableCell>
                  {types.find((t) => t.id === machine.typeId)?.name}
                </TableCell>
                <TableCell>
                  {brands.find((b) => b.id === machine.brandId)?.name}
                </TableCell>
                <TableCell>{machine.location}</TableCell>
                <TableCell>
                  <Badge 
                    className={statusColors[machine.status as keyof typeof statusColors]}
                  >
                    {machine.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog open={showTransferForm && selectedMachine?.id === machine.id} 
                           onOpenChange={(open) => {
                             setShowTransferForm(open);
                             if (!open) setSelectedMachine(null);
                           }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedMachine(machine)}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <TransferForm
                          machine={machine}
                          onSuccess={() => {
                            setShowTransferForm(false);
                            setSelectedMachine(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <History className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <TransferHistory machineId={machine.id} />
                      </DialogContent>
                    </Dialog>

                    {user?.role === "super_admin" && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(machine.id)}
                      >
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TransferHistory({ machineId }: { machineId: number }) {
  const { data: transfers = [] } = useQuery({
    queryKey: ["/api/machines", machineId, "transfers"],
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Transfer History</h2>
      <div className="space-y-2">
        {transfers.map((transfer) => (
          <div key={transfer.id} className="border rounded p-3">
            <div className="flex justify-between text-sm">
              <span>{new Date(transfer.transferDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-1 text-sm">
              <span className="text-muted-foreground">From: </span>
              {transfer.fromLocation}
              <span className="mx-2">→</span>
              <span className="text-muted-foreground">To: </span>
              {transfer.toLocation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
