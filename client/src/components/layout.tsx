import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Box,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Machines", href: "/machines", icon: Box },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-3 h-16">
        <h1 className="font-semibold">Machine Inventory</h1>
      </div>
      
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2")}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
        <NavContent />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
