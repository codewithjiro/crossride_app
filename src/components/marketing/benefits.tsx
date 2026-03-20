import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, Clock, Shield, Zap } from "lucide-react";

export function Benefits() {
  return (
    <section
      id="features"
      className="from-background via-primary/5 to-background bg-gradient-to-b px-4 py-24 sm:px-6"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="relative mb-24 space-y-6 text-center">
          {/* Decorative top line */}
          <div className="flex justify-center">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>

          <Badge className="bg-secondary border-secondary mx-auto w-fit rounded-full border-2 px-5 py-1.5 text-xs font-bold tracking-widest text-blue-900 uppercase shadow-lg transition-shadow hover:shadow-xl">
            About Us
          </Badge>

          <div className="space-y-4">
            <h2 className="text-secondary text-4xl leading-tight font-black tracking-tighter drop-shadow-lg md:text-5xl">
              What is CrossRide?
            </h2>
            <p className="text-foreground/80 mx-auto max-w-3xl text-lg leading-relaxed font-medium md:text-xl">
              Your complete school transport management solution designed to
              simplify operations and enhance student safety.
            </p>
          </div>

          {/* Decorative bottom line */}
          <div className="flex justify-center pt-2">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-20 grid items-center gap-16 lg:grid-cols-2">
          {/* Image Section - Left */}
          <div className="order-2 lg:order-1">
            <div className="group relative">
              <div className="from-secondary/30 via-primary/20 to-secondary/10 absolute -inset-6 rounded-3xl bg-gradient-to-br opacity-60 blur-2xl transition-all duration-300 group-hover:opacity-100 group-hover:blur-3xl" />
              <div className="border-secondary/40 from-primary/20 to-background relative aspect-square w-full overflow-hidden rounded-3xl border-2 bg-gradient-to-br shadow-2xl">
                <Image
                  src="/images/about.png"
                  alt="CrossRide System"
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="order-1 space-y-8 lg:order-2">
            {/* Card 1 */}
            <div className="group relative">
              <div className="from-secondary/30 to-primary/20 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
              <div className="from-primary/15 via-primary/5 to-background border-secondary/20 hover:border-secondary/40 relative space-y-4 rounded-2xl border bg-gradient-to-br p-8 shadow-lg transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 flex-shrink-0 rounded-lg p-3">
                    <CheckCircle className="text-secondary h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-secondary text-lg font-bold">
                      Your Transport Solution
                    </h3>
                    <p className="text-foreground/85 text-sm leading-relaxed sm:text-base">
                      CrossRide is a comprehensive school transport management
                      system designed to streamline how Holy Cross College
                      handles student transportation with real-time visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="from-primary/30 to-secondary/20 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
              <div className="from-secondary/10 via-background to-primary/5 border-secondary/20 hover:border-secondary/40 relative space-y-4 rounded-2xl border bg-gradient-to-br p-8 shadow-lg transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 flex-shrink-0 rounded-lg p-3">
                    <Zap className="text-secondary h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-secondary text-lg font-bold">
                      Why Choose CrossRide
                    </h3>
                    <p className="text-foreground/85 text-sm leading-relaxed sm:text-base">
                      Eliminate confusion, reduce overcrowding, and ensure every
                      student gets a safe ride. Built for modern schools with
                      effortless coordination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="from-secondary/10 to-primary/5 border-secondary/20 hover:border-secondary/40 cursor-pointer rounded-xl border bg-gradient-to-br p-4 text-center transition-all duration-400 hover:-translate-y-0.5 hover:shadow-lg">
                <Clock className="text-secondary mx-auto mb-2 h-6 w-6" />
                <p className="text-secondary text-sm font-bold">Real-Time</p>
                <p className="text-foreground/70 mt-1 text-xs">Live Tracking</p>
              </div>
              <div className="from-secondary/10 to-primary/5 border-secondary/20 hover:border-secondary/40 cursor-pointer rounded-xl border bg-gradient-to-br p-4 text-center transition-all duration-400 hover:-translate-y-0.5 hover:shadow-lg">
                <Shield className="text-secondary mx-auto mb-2 h-6 w-6" />
                <p className="text-secondary text-sm font-bold">Secure</p>
                <p className="text-foreground/70 mt-1 text-xs">& Reliable</p>
              </div>
              <div className="from-secondary/10 to-primary/5 border-secondary/20 hover:border-secondary/40 cursor-pointer rounded-xl border bg-gradient-to-br p-4 text-center transition-all duration-400 hover:-translate-y-0.5 hover:shadow-lg">
                <CheckCircle className="text-secondary mx-auto mb-2 h-6 w-6" />
                <p className="text-secondary text-sm font-bold">Simple</p>
                <p className="text-foreground/70 mt-1 text-xs">Easy to Use</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
