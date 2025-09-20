"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/actions", label: "Action Items" },
  { href: "/knowledge", label: "Knowledge Base" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex lg:mr-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">AI</span>
            <span className="font-semibold">Meeting Intelligence</span>
          </Link>
        </div>

        <nav className="hidden md:flex md:flex-1 items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`px-3 py-2 rounded-md transition-colors ${pathname === item.href ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="default" asChild>
            <Link href={`/knowledge?query=${encodeURIComponent(query)}`}>Search</Link>
          </Button>
        </div>

        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md ${pathname === item.href ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Input
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button asChild>
                  <Link href={`/knowledge?query=${encodeURIComponent(query)}`}>Search</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}