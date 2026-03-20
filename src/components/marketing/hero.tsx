import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{
        backgroundImage: "url(/images/hero.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Lighter overlay gradient - more transparent */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,29,58,0.65)] via-[rgba(7,29,58,0.55)] to-[rgba(7,29,58,0.1)]" />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-12">
          <div className="max-w-2xl space-y-5">
            <Badge
              variant="secondary"
              className="text-secondary inline-flex w-fit px-4 py-2 text-xs font-bold"
            >
              ESTABLISHED FOR HOLY CROSS COLLEGE
            </Badge>
            <h1 className="max-w-3xl text-4xl leading-[1.2] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Smart Transport Scheduling Made Simple
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-blue-50 sm:text-lg">
              CrossRide helps your school manage van schedules, booking
              requests, and transport assignments in one clean and organized
              platform.
            </p>

            {/* Values Section */}
            <div className="space-y-5 pt-6">
              <Separator className="bg-secondary/60 h-1" />
              <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-3">
                {/* Fides */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-yellow-400">
                    Fides (Faith)
                  </h3>
                  <p className="text-xs leading-relaxed text-blue-50">
                    We uphold solidarity and harmony in faith and spirituality
                    through values and religious education.
                  </p>
                </div>

                {/* Caritas */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-yellow-400">
                    Caritas (Charity)
                  </h3>
                  <p className="text-xs leading-relaxed text-blue-50">
                    We commit service-responsive leadership through relevance
                    and social responsibility.
                  </p>
                </div>

                {/* Libertas */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-yellow-400">
                    Libertas (Liberty)
                  </h3>
                  <p className="text-xs leading-relaxed text-blue-50">
                    We stand for truth, integrity and independence in the
                    pursuit of our mission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
