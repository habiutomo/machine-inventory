import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMachineTransferSchema, type InsertMachineTransfer, type Machine } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type TransferFormProps = {
  machine: Machine;
  onSuccess: () => void;
};

export default function TransferForm({ machine, onSuccess }: TransferFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<InsertMachineTransfer>({
    resolver: zodResolver(insertMachineTransferSchema),
    defaultValues: {
      machineId: machine.id,
      fromLocation: machine.location,
      userId: user?.id,
      transferDate: new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertMachineTransfer) => {
      const res = await apiRequest("POST", "/api/transfers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/machines", machine.id, "transfers"]
      });
      toast({
        title: "Success",
        description: "Transfer recorded successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMachineTransfer) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Transfer Machine</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Current Location: {machine.location}
          </p>
        </div>

        <FormField
          control={form.control}
          name="toLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter new location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Record Transfer
        </Button>
      </form>
    </Form>
  );
}
