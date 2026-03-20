"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, Menu, UserPlus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#features" },
  { label: "Our Fleet", href: "#how-it-works" },
  { label: "Our Drivers", href: "#drivers" },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "how-it-works", "drivers"];
      let current = "home";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = section;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="border-border/90 bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="#home"
          className="text-foreground inline-flex items-center gap-2 text-base font-bold tracking-tight"
        >
          <span className="bg-card border-border/90 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
            <Image
              src="/images/logohcc-150x150.png"
              alt="Holy Cross College logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </span>
          CrossRide
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative transition-colors duration-200 ${
                activeSection === link.href.slice(1)
                  ? "text-secondary font-semibold"
                  : "hover:text-foreground"
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <span className="bg-secondary absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link href="/sign-in">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/sign-up">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/images/logohcc-150x150.png"
                  alt="Holy Cross College logo"
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 rounded-sm object-cover"
                />
                CrossRide
              </SheetTitle>
              <SheetDescription>
                Smart school transport management for Holy Cross College.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  asChild
                  variant={
                    activeSection === link.href.slice(1) ? "default" : "ghost"
                  }
                  className={`justify-start ${
                    activeSection === link.href.slice(1)
                      ? "bg-secondary font-semibold text-blue-900"
                      : ""
                  }`}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/sign-in">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
