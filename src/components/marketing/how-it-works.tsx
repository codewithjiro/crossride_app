import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { Bus, Users } from "lucide-react";

type Service = {
  name: string;
  quantity: number;
  capacity: string;
  color: string;
  description: string;
  image: string;
};

const services: Service[] = [
  {
    name: "Hiace Commuter Deluxe",
    quantity: 2,
    capacity: "12-14 Passengers",
    color: "from-blue-500 to-blue-600",
    description: "Comfortable air-conditioned transport for daily commutes",
    image: "/images/deluxe.png",
  },
  {
    name: "Hiace Grandia",
    quantity: 1,
    capacity: "11 Passengers",
    color: "from-purple-500 to-purple-600",
    description: "Premium executive van with enhanced comfort features",
    image: "/images/grandia.png",
  },
  {
    name: "L300 Van",
    quantity: 2,
    capacity: "8-10 Passengers",
    color: "from-emerald-500 to-emerald-600",
    description: "Reliable and efficient transport for flexible routes",
    image: "/images/L300.png",
  },
];

export function HowItWorks() {
  const totalVehicles = services.reduce(
    (sum, service) => sum + service.quantity,
    0,
  );

  return (
    <section
      id="how-it-works"
      className="from-background via-primary/5 to-background bg-gradient-to-b px-4 py-24 sm:px-6"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-20 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>

          <Badge className="bg-secondary border-secondary mx-auto w-fit rounded-full border-2 px-5 py-1.5 text-xs font-bold tracking-widest text-blue-900 uppercase shadow-lg">
            Our Fleet
          </Badge>

          <div className="space-y-4">
            <h2 className="text-secondary text-4xl leading-tight font-black tracking-tighter md:text-5xl">
              Our Transport Services
            </h2>
            <p className="text-foreground/80 mx-auto max-w-3xl text-lg leading-relaxed font-medium md:text-xl">
              Holy Cross College operates a modern fleet of {totalVehicles}{" "}
              vehicles to ensure safe and comfortable transportation for our
              students.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>
        </div>

        {/* Fleet Cards */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="group relative">
              <div className="from-secondary/30 to-primary/20 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
              <div className="from-primary/15 via-primary/5 to-background border-secondary/20 hover:border-secondary/40 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br shadow-lg transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl">
                {/* Vehicle Image Section */}
                <div className="from-primary/20 to-background relative h-72 w-full overflow-hidden bg-gradient-to-br">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-contain object-center p-6 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-8">
                  {/* Vehicle Icon */}
                  <div
                    className={`bg-gradient-to-br ${service.color} mb-4 w-fit rounded-lg p-3`}
                  >
                    <Bus className="h-6 w-6 text-white" />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1">
                    <h3 className="text-secondary mb-2 text-lg font-bold">
                      {service.name}
                    </h3>
                    <p className="text-foreground/80 mb-4 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="border-secondary/20 space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70 text-sm font-medium">
                        Quantity:
                      </span>
                      <span
                        className={`bg-gradient-to-r ${service.color} rounded-lg px-3 py-1 text-sm font-bold text-white`}
                      >
                        {service.quantity} Unit{service.quantity > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-foreground/80 flex items-center gap-2">
                      <Users className="text-secondary h-4 w-4" />
                      <span className="text-sm">{service.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Summary */}
        <div className="group relative mt-4">
          <div className="from-secondary/25 via-primary/20 to-secondary/15 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
          <div className="from-secondary/15 via-primary/10 to-background border-secondary/30 hover:border-secondary/50 relative rounded-2xl border-2 bg-gradient-to-br p-8 text-center shadow-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl md:p-12">
            {/* Content wrapper */}
            <div>
              <div className="mb-6 flex items-start justify-center">
                <div className="from-secondary/20 to-primary/10 rounded-2xl bg-gradient-to-br px-8 py-6">
                  <p className="text-foreground/80 mb-6 text-lg leading-relaxed md:text-xl">
                    With our diverse fleet of{" "}
                    <span className="text-secondary text-2xl font-black md:text-3xl">
                      {totalVehicles} vehicles
                    </span>
                    , we provide flexible and reliable school transportation
                    solutions tailored to meet the needs of Holy Cross College.
                  </p>
                </div>
              </div>

              <div className="border-secondary/30 grid grid-cols-3 gap-6 border-t pt-8">
                <div className="group/stat">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <Bus className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-secondary text-3xl font-black md:text-4xl">
                    {totalVehicles}
                  </p>
                  <p className="text-foreground/70 mt-2 text-sm font-medium">
                    Total Vehicles
                  </p>
                </div>
                <div className="group/stat">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                    <Users className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-secondary text-3xl font-black md:text-4xl">
                    50+
                  </p>
                  <p className="text-foreground/70 mt-2 text-sm font-medium">
                    Total Capacity
                  </p>
                </div>
                <div className="group/stat">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                    <span className="text-lg font-bold text-purple-400">
                      🕐
                    </span>
                  </div>
                  <p className="text-secondary text-3xl font-black md:text-4xl">
                    School
                  </p>
                  <p className="text-foreground/70 mt-2 text-sm font-medium">
                    Hours Ready
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
