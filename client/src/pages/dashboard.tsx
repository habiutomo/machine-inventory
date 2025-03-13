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
import { 
  Loader2, 
  Box, 
  AlertTriangle, 
  CheckCircle2,
  Archive,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  new: "bg-green-500/10 text-green-500",
  in_use: "bg-blue-500/10 text-blue-500",
  broken: "bg-red-500/10 text-red-500",
  sold: "bg-gray-500/10 text-gray-500",
};

const statusIcons = {
  new: CheckCircle2,
  in_use: Activity,
  broken: AlertTriangle,
  sold: Archive,
};

export default function Dashboard() {
  const { data: machines = [], isLoading: loadingMachines } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const { data: types = [], isLoading: loadingTypes } = useQuery<MachineType[]>({
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
      value: machines.length,
      icon: Box,
      description: "Total machines in inventory",
      trend: "Total across all types and brands",
    },
    {
      name: "Machine Types",
      value: types.length,
      icon: Activity,
      description: "Different types of machines",
      trend: "Unique categories of equipment",
    },
    {
      name: "In Use",
      value: machines.filter((m) => m.status === "in_use").length,
      icon: CheckCircle2,
      description: "Machines currently in operation",
      trend: `${Math.round((machines.filter(m => m.status === "in_use").length / machines.length) * 100)}% of total`,
    },
    {
      name: "Needs Attention",
      value: machines.filter((m) => m.status === "broken").length,
      icon: AlertTriangle,
      description: "Machines requiring maintenance",
      trend: `${Math.round((machines.filter(m => m.status === "broken").length / machines.length) * 100)}% of total`,
    },
  ];

  const recentMachines = machines
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const statusSummary = Object.entries(
    machines.reduce((acc, machine) => {
      acc[machine.status] = (acc[machine.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="text-xs text-muted-foreground mt-1">{stat.trend}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusSummary.map(([status, count]) => {
                const Icon = statusIcons[status as keyof typeof statusIcons];
                return (
                  <div key={status} className="flex items-center">
                    <div className={`p-2 rounded-full mr-2 ${statusColors[status as keyof typeof statusColors]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium capitalize">{status.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {count} machines ({Math.round((count / machines.length) * 100)}%)
                      </div>
                    </div>
                    <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={`h-full ${statusColors[status as keyof typeof statusColors].replace('/10', '')}`}
                        style={{ width: `${(count / machines.length) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMachines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.location}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[machine.status as keyof typeof statusIcons]}>
                        {machine.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}