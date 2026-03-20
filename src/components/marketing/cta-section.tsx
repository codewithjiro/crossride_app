import Link from "next/link";

import { Button } from "~/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="border-primary/15 bg-primary text-primary-foreground mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl border px-6 py-10 sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to use CrossRide?
          </h2>
          <p className="text-primary-foreground/80 mt-2 max-w-2xl">
            Join Holy Cross College transport staff and students using a
            cleaner, more organized way to manage school rides.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="lg">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/35 bg-white/10 text-white hover:bg-white/20"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
