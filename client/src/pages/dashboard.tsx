import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Machine, MachineType } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: machines, isLoading: loadingMachines } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const { data: types, isLoading: loadingTypes } = useQuery<MachineType[]>({
    queryKey: ["/api/machine-types"],
  });

  if (loadingMachines || loadingTypes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      name: "Total Machines",
      value: machines?.length || 0,
    },
    {
      name: "Machine Types",
      value: types?.length || 0,
    },
    {
      name: "In Use",
      value: machines?.filter((m) => m.status === "in_use").length || 0,
    },
    {
      name: "Needs Attention",
      value: machines?.filter((m) => m.status === "broken").length || 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Machines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines?.slice(0, 5).map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>{machine.barcode}</TableCell>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>{machine.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
