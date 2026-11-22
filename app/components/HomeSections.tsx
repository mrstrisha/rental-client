"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  CalendarClock,
  Camera,
  CircleCheck,
  Cpu,
  HardHat,
  MapPin,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tractor,
  Truck,
  Wrench,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { CATEGORIES, type Equipment } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL;
const FEATURED_LIMIT = 6;

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23F3EEE3'/%3E%3Ccircle cx='400' cy='260' r='72' fill='%23D9541E' opacity='0.18'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23111111' font-family='sans-serif' font-size='34'%3EGearly%3C/text%3E%3C/svg%3E";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const revealProps = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, amount: 0.15 },
};

const categoryCards = [
  { name: CATEGORIES[0], Icon: HardHat },
  { name: CATEGORIES[1], Icon: Camera },
  { name: CATEGORIES[2], Icon: Truck },
  { name: CATEGORIES[3], Icon: Tractor },
  { name: CATEGORIES[4], Icon: Cpu },
  { name: CATEGORIES[5], Icon: PartyPopper },
];

const benefits = [
  {
    Icon: BadgeDollarSign,
    title: "Affordable Rental Prices",
    description: "Pay only for the days you need instead of buying equipment you will rarely use.",
  },
  {
    Icon: BadgeCheck,
    title: "Verified Equipment Owners",
    description: "Browse listings from owners whose equipment and details have been reviewed.",
  },
  {
    Icon: CalendarClock,
    title: "Flexible Rental Periods",
    description: "Choose daily, weekly, or monthly rentals that fit your project schedule.",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Payments",
    description: "Complete your booking through a protected flow with clear rental terms.",
  },
];

const steps = [
  {
    Icon: Search,
    title: "Find your equipment",
    description: "Search approved listings by category, location, and price.",
  },
  {
    Icon: CalendarClock,
    title: "Choose your dates",
    description: "Select a rental period that works for your project.",
  },
  {
    Icon: ShieldCheck,
    title: "Book securely",
    description: "Confirm the rental and complete the protected checkout.",
  },
  {
    Icon: Wrench,
    title: "Pick up and use",
    description: "Collect the gear from the owner and get to work.",
  },
];

const reviews = [
  {
    name: "Sample Renter 01",
    rating: 5,
    comment:
      "The listing was exactly as described. Booking was quick and pickup was well organized.",
  },
  {
    name: "Sample Renter 02",
    rating: 5,
    comment:
      "I needed a camera for a short project. Renting it here cost a fraction of buying one.",
  },
  {
    name: "Sample Renter 03",
    rating: 4,
    comment:
      "Clear pricing, responsive owners, and a smooth process from search to pickup.",
  },
  {
    name: "Sample Renter 04",
    rating: 5,
    comment:
      "Great range of equipment and helpful owners. I will use Gearly for the next job too.",
  },
];

function isApprovedEquipment(value: unknown): value is Equipment {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Equipment>;
  return (
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    ["Approved", "approved"].includes(String(item.status))
  );
}

function priceLabel(item: Equipment): string {
  const amount = Number(item.rentalPrice);
  const value = Number.isFinite(amount)
    ? amount.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "—";
  const type = item.rentalType ? String(item.rentalType).toLowerCase() : "day";
  return `$${value} / ${type}`;
}

function availabilityLabel(item: Equipment): { text: string; available: boolean } {
  const quantity = Number(item.quantity);
  if (Number.isFinite(quantity) && quantity <= 0) {
    return { text: "Out of stock", available: false };
  }
  return { text: quantity > 0 ? `Available · ${quantity}` : "Available", available: true };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#D9541E]">
        <span className="h-px w-8 bg-[#D9541E]" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-light leading-tight text-[#111111] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#111111]/60">{description}</p>
    </div>
  );
}

function EquipmentCard({
  item,
  onViewDetails,
  sessionPending,
}: {
  item: Equipment;
  onViewDetails: (id: string) => void;
  sessionPending: boolean;
}) {
  const availability = availabilityLabel(item);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#111111]/10 bg-white shadow-sm hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#111111]/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={String(item.image || FALLBACK_IMAGE)}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${
            availability.available
              ? "bg-[#D9541E] text-white"
              : "bg-[#111111]/80 text-white"
          }`}
        >
          {availability.text}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-[#D9541E]">
            {item.category || "Equipment"}
          </span>
          <span className="text-sm font-medium text-[#111111]">{priceLabel(item)}</span>
        </div>

        <h3 className="mt-3 text-lg font-medium text-[#111111]">{item.name}</h3>

        <p className="mt-2 flex items-center gap-2 text-sm text-[#111111]/55">
          <MapPin className="h-4 w-4 text-[#D9541E]" />
          {item.location || "Location not provided"}
        </p>

        <button
          type="button"
          disabled={sessionPending}
          onClick={() => onViewDetails(item._id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#D9541E] disabled:cursor-wait disabled:opacity-60"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
      {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-[#111111]/10 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#111111]/5" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#111111]/10" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#111111]/10" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#111111]/10" />
            <div className="h-11 w-full animate-pulse rounded-full bg-[#111111]/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeSections() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeatured() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API}/api/equipment?limit=${FEATURED_LIMIT}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Could not load featured equipment");

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid equipment response");

        setItems(payload.filter(isApprovedEquipment).slice(0, FEATURED_LIMIT));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load featured equipment"
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFeatured();
    return () => controller.abort();
  }, [reloadKey]);

  const openDetails = (id: string) => {
    if (isPending) return;
    router.push(
      session?.user
        ? `/equipment/${id}`
        : `/login?redirect=${encodeURIComponent(`/equipment/${id}`)}`
    );
  };

  const recentItems = items.slice(0, 3);

  return (
    <main className="bg-[#F3EEE3] text-[#111111]">
      {/* Featured equipment */}
      <section id="featured" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div {...revealProps} variants={fadeUp}>
          <SectionHeading
            eyebrow="Featured equipment"
            title="Ready for your next project"
            description="Explore approved equipment from trusted owners, available for the exact rental period you need."
          />
        </motion.div>

        <div className="mt-10">
          {loading ? (
            <FeaturedSkeleton />
          ) : error ? (
            <div className="rounded-3xl border border-[#111111]/10 bg-white p-10 text-center">
              <p className="text-[#111111]">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-5 rounded-full bg-[#D9541E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#111111]"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#111111]/20 bg-white p-10 text-center text-[#111111]/60">
              No approved equipment is available right now.
            </div>
          ) : (
            <motion.div
              {...revealProps}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((item) => (
                <EquipmentCard
                  key={item._id}
                  item={item}
                  onViewDetails={openDetails}
                  sessionPending={isPending}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="border-y border-[#111111]/10 bg-white/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div {...revealProps} variants={fadeUp}>
            <SectionHeading
              eyebrow="Categories"
              title="Find the right gear, faster"
              description="From construction sites to creative productions, browse equipment by category."
            />
          </motion.div>

          <motion.div
            {...revealProps}
            variants={stagger}
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categoryCards.map(({ name, Icon }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="group flex items-center gap-5 rounded-3xl border border-[#111111]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#D9541E]/10 text-[#D9541E] transition-colors group-hover:bg-[#D9541E] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-base font-medium text-[#111111]">{name}</span>
                  <span className="mt-1 block text-sm text-[#111111]/50">Explore listings</span>
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why-choose-us" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div {...revealProps} variants={fadeUp}>
          <SectionHeading
            eyebrow="Why choose us"
            title="Renting made simple and dependable"
            description="Every part of the platform is built to help you get the right equipment without the usual friction."
          />
        </motion.div>

        <motion.div
          {...revealProps}
          variants={stagger}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map(({ Icon, title, description }) => (
            <motion.article
              key={title}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-[#111111]/10 bg-white p-6 shadow-sm hover:shadow-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#111111] text-[#D9541E]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium text-[#111111]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#111111]/60">{description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#111111] py-20 text-[#F3EEE3] lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div {...revealProps} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#D9541E]">
              <span className="h-px w-8 bg-[#D9541E]" />
              How it works
            </span>
            <h2 className="mt-4 max-w-2xl text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">
              From search to pickup in four steps
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#F3EEE3]/60">
              A clear process so you can spend less time coordinating and more time working.
            </p>
          </motion.div>

          <motion.div
            {...revealProps}
            variants={stagger}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map(({ Icon, title, description }, index) => (
              <motion.div key={title} variants={fadeUp} className="relative rounded-3xl border border-[#F3EEE3]/10 bg-white/5 p-6">
                <span className="absolute right-5 top-5 text-sm text-[#D9541E]">
                  0{index + 1}
                </span>
                <Icon className="h-7 w-7 text-[#D9541E]" />
                <h3 className="mt-6 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F3EEE3]/60">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recently added */}
      <section id="recently-added" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div {...revealProps} variants={fadeUp}>
            <SectionHeading
              eyebrow="Recently added"
              title="New on Gearly"
              description="A quick look at the latest approved listings from our owners."
            />
          </motion.div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#111111] px-5 py-3 text-sm font-medium text-[#111111] transition-all hover:border-[#D9541E] hover:text-[#D9541E]"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-10">
            <FeaturedSkeleton />
          </div>
        ) : recentItems.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-[#111111]/20 bg-white p-8 text-center text-[#111111]/60">
            Recently added equipment will appear here.
          </p>
        ) : (
          <motion.div
            {...revealProps}
            variants={stagger}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {recentItems.map((item) => (
              <EquipmentCard
                key={`recent-${item._id}`}
                item={item}
                onViewDetails={openDetails}
                sessionPending={isPending}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Customer reviews */}
      <section id="reviews" className="border-t border-[#111111]/10 bg-white/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div {...revealProps} variants={fadeUp}>
            <SectionHeading
              eyebrow="Customer reviews"
              title="What renters are saying"
              description="Sample testimonials shown for this homepage until live review data is connected."
            />
          </motion.div>

          <motion.div
            {...revealProps}
            variants={stagger}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {reviews.map((review) => (
              <motion.article
                key={review.name}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="flex h-full flex-col rounded-3xl border border-[#111111]/10 bg-white p-6 shadow-sm hover:shadow-lg"
              >
                <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4"
                      fill={index < review.rating ? "#D9541E" : "none"}
                      stroke={index < review.rating ? "#D9541E" : "#11111130"}
                    />
                  ))}
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-[#111111]/70">
                  “{review.comment}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-[#111111]/10 pt-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#D9541E]/10 text-sm font-medium text-[#D9541E]">
                    {review.name.charAt(review.name.length - 1)}
                  </span>
                  <span className="text-sm font-medium text-[#111111]">{review.name}</span>
                  <CircleCheck className="ml-auto h-4 w-4 text-[#D9541E]" />
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <motion.div
          {...revealProps}
          variants={fadeUp}
          className="flex flex-col items-start gap-6 rounded-[2rem] bg-[#111111] p-8 text-[#F3EEE3] sm:p-12 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <Sparkles className="h-6 w-6 text-[#D9541E]" />
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              Need equipment for a short-term job?
            </h2>
            <p className="mt-3 max-w-xl text-[#F3EEE3]/60">
              Find verified gear, compare prices, and book only for the time you need.
            </p>
          </div>
          <Link
            href="/equipment"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#D9541E] px-7 py-4 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#111111]"
          >
            Explore Equipment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
