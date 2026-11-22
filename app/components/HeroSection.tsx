"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Left side er text gulo ekta ekta kore niche theke upore ashbe
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// Chhoto 3 ta benefit
const perks = ["Verified owners", "Flexible rental periods", "Secure payments"];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85";

const HERO_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1100'%3E%3Crect width='100%25' height='100%25' fill='%23111111'/%3E%3Ccircle cx='450' cy='520' r='150' fill='%23D9541E' opacity='0.35'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23F3EEE3' font-family='sans-serif' font-size='44'%3EGearly%3C/text%3E%3C/svg%3E";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F3EEE3]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2 lg:py-20">
        {/* ---------- Left: text ---------- */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 py-2 text-sm text-[#333333]"
          >
            <span className="h-2 w-2 rounded-full bg-[#D9541E]" />
            Equipment rental marketplace
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-5xl font-light leading-[1.05] tracking-tight text-[#111111] md:text-6xl lg:text-7xl"
          >
            Rent the right gear.
            <br />
            Skip the buying.
          </motion.h1>

          {/* Heading er niche orange line (draw hoy) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
            style={{ originX: 0 }}
            className="mt-4 h-1 w-40 rounded-full bg-[#D9541E]"
          />

          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-[#6B6B6B]">
            Find verified equipment from trusted owners, book it for the days you need, and pay securely. From
            cameras to construction machines, everything in one place.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#featured"
              className="rounded-full bg-[#D9541E] px-8 py-4 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#111111] hover:shadow-lg"
            >
              Explore Equipment
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-[#111111] px-8 py-4 font-medium text-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-[#D9541E] hover:text-[#D9541E]"
            >
              How it works
            </Link>
          </motion.div>

          {/* Perks */}
          <motion.ul variants={fadeUp} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#333333]">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#D9541E]/15 text-xs text-[#D9541E]">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ---------- Right: image ---------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl"
        >
          {/* Pichone orange block */}
          <div className="absolute -bottom-5 -right-5 h-full w-full rounded-[2rem] bg-[#D9541E]" />

          {/* Image card */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#1A1A1A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Construction equipment ready for rent"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = HERO_FALLBACK;
              }}
            />
            {/* Niche halka kalo gradient, jate card er text porte shohoj hoy */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/50 via-transparent to-transparent" />
          </div>

          {/* Floating card 1: equipment */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 top-10 w-56 rounded-2xl border border-[#D9D9D9] bg-white p-4 shadow-xl md:-left-10"
          >
            <p className="text-xs text-[#6B6B6B]">Featured</p>
            <p className="mt-1 text-[#111111]">Mini Excavator</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[#333333]">$120 / day</span>
              <span className="rounded-full bg-[#D9541E]/15 px-3 py-1 text-xs text-[#D9541E]">Available</span>
            </div>
          </motion.div>

          {/* Floating card 2: booking */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 left-6 flex items-center gap-3 rounded-2xl border border-[#D9D9D9] bg-white p-4 shadow-xl md:left-10"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-[#F3EEE3]">✓</span>
            <div>
              <p className="text-sm text-[#111111]">Booking confirmed</p>
              <p className="text-xs text-[#6B6B6B]">Pickup tomorrow, 9:00 AM</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}