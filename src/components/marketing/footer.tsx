import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

import { Separator } from "~/components/ui/separator";

export function Footer() {
  return (
    <footer className="from-background to-background/80 border-secondary/20 border-t bg-gradient-to-b px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Main Content Grid */}
        <div className="mb-12 grid gap-12 md:grid-cols-2">
          {/* About Us Section */}
          <div>
            <h3 className="text-secondary mb-4 text-lg font-bold">About Us</h3>
            <p className="text-foreground/90 max-w-md text-sm leading-relaxed">
              Holy Cross Academy is the first private Catholic school in Sta.
              Ana, Pampanga, founded on November 29, 1945 by the late Very Rev.
              Msgr. Fernando C. Lansangan with the support of dedicated
              civic-minded citizens.
            </p>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3 className="text-secondary mb-4 text-lg font-bold">
              Contact Info
            </h3>
            <div className="space-y-3">
              <p className="text-foreground/90 text-sm">
                Sta. Lucia, Santa Ana, Pampanga, Philippines, 2022
              </p>
              <div className="text-foreground/90 text-sm">
                <span className="text-secondary">Facebook :</span>
                <Link
                  href="https://facebook.com/holycrosscollege"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80 ml-2 underline transition"
                >
                  Holy Cross College
                </Link>
              </div>
              <div className="text-foreground/90 text-sm">
                <span className="text-secondary">Email :</span>
                <Link
                  href="mailto:registrar.office@holycrosscollegepampanga.edu.ph"
                  className="text-foreground/90 hover:text-foreground ml-2 break-all transition"
                >
                  registrar.office@holycrosscollegepampanga.edu.ph
                </Link>
              </div>
              <div className="pt-2">
                <p className="text-secondary mb-2 text-sm font-medium">
                  Follow Us On:
                </p>
                <div className="flex gap-3">
                  <Link
                    href="https://facebook.com/holycrosscollege"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-secondary transition"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-secondary transition"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-secondary transition"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-secondary transition"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-secondary/20" />

        {/* Copyright Section */}
        <div className="mt-8 text-center">
          <p className="text-foreground/70 text-sm">
            Copyright © {new Date().getFullYear()}. All Rights Reserved.
            <Link
              href="#"
              className="text-secondary hover:text-secondary/80 ml-2 transition"
            >
              Holy Cross College Pampanga
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
