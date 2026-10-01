import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCart } from "../context/CartContext";

gsap.registerPlugin(ScrollTrigger);

// Put your 4 shoe images in /public with these names (transparent PNG looks best)
const SHOES = [
  {
    id: "runner-air",
    name: "Runner Air",
    price: 4999,
    tag: "New",
    img: "/shoe1.png",
  },
  {
    id: "street-low",
    name: "Street Low",
    price: 3799,
    tag: "Trending",
    img: "/shoe2.png",
  },
  {
    id: "trail-pro",
    name: "Trail Pro",
    price: 5499,
    tag: "Bestseller",
    img: "/shoe3.png",
  },
  {
    id: "court-classic",
    name: "Court Classic",
    price: 3299,
    tag: "Sale",
    img: "/shoe4.png",
  },
];

const N = SHOES.length;
const inr = (n) => `\u20b9${n.toLocaleString("en-IN")}`;
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// offset of card i from active card, wrapped to -2..1 (3 visible + 1 hidden)
const offsetOf = (i, active) => ((i - active + 2 + N * 2) % N) - 2;

// gap between cards (in % of card width) per screen size; matches card width classes below
const spacing = () =>
  window.innerWidth < 640 ? 76 : window.innerWidth < 1024 ? 104 : 108;

// look of a card for a given offset: centre = big + sharp, sides = small + dim + blur
const pose = (o) => {
  const seen = Math.abs(o) <= 1;
  return {
    xPercent: -50 + o * spacing(),
    scale: o === 0 ? 1 : seen ? 0.72 : 0.5,
    opacity: o === 0 ? 1 : seen ? 0.4 : 0,
    filter: o === 0 ? "blur(0px)" : "blur(3px)",
    zIndex: o === 0 ? 3 : seen ? 2 : 1,
  };
};

const ARROWS = [
  { dir: -1, label: "Previous shoe", side: "left-0", d: "M15 5l-7 7 7 7" },
  { dir: 1, label: "Next shoe", side: "right-0", d: "M9 5l7 7-7 7" },
];

function ShoeCollection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const cards = useRef([]);
  const caption = useRef(null);
  const first = useRef(true);
  const activeRef = useRef(0);
  const { addToCart } = useCart();

  const go = (dir) => setActive((a) => (a + dir + N) % N);

  // 1) Mount only: place cards, entrance on scroll, background parallax, resize fix
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cards.current.forEach((el, i) => gsap.set(el, pose(offsetOf(i, 0))));
      if (reduced()) return;

      // Entrance: words rise from mask, cards fan out of one stack, then caption + thumbs
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
            refreshPriority: -1, // refresh after hero pin so start point is right
          },
        })
        .from(".shoe-word", {
          yPercent: 115,
          duration: 0.9,
          stagger: 0.12,
          ease: "power4.out",
        })

      // Big outline word slides sideways while section scrolls past
      gsap.fromTo(
        ".shoe-bg",
        { xPercent: 12 },
        {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            refreshPriority: -1,
          },
        },
      );
    }, sectionRef);

    // keep card gaps right when window resizes / phone rotates
    const onResize = () =>
      cards.current.forEach((el, i) =>
        gsap.set(el, {
          xPercent: -50 + offsetOf(i, activeRef.current) * spacing(),
        }),
      );
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(cards.current);
      ctx.revert();
    };
  }, []);

  // 2) On change: glide cards. NO context revert here (revert wipes styles = jump)
  useLayoutEffect(() => {
    activeRef.current = active;
    if (first.current) {
      first.current = false;
      return;
    }
    const dur = reduced() ? 0 : 0.8;

    cards.current.forEach((el, i) =>
      gsap.to(el, {
        ...pose(offsetOf(i, active)),
        duration: dur,
        ease: "power3.inOut",
        overwrite: "auto",
      }),
    );

    if (dur) {
      gsap.fromTo(
        caption.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
  }, [active]);

  const current = SHOES[active];

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-[#15181a] px-4 py-14 text-white sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(140,150,152,0.3),transparent_60%)]" />

      {/* Background outline word */}
      <span
        aria-hidden="true"
        className="shoe-bg pointer-events-none absolute left-0 top-[16%] select-none whitespace-nowrap text-[30vw] font-black leading-none text-transparent lg:text-[22vw]"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.12)" }}
      >
        SNEAKERS
      </span>

      <h2 className="relative flex flex-wrap justify-center gap-x-[0.3em] text-center text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
        {["Shoe", "Collection"].map((w) => (
          <span key={w} className="overflow-hidden pb-[0.1em]">
            <span className="shoe-word inline-block">{w}</span>
          </span>
        ))}
      </h2>

      {/* Carousel */}
      <div className="relative mt-8 h-[40vh] min-h-[260px] w-full max-w-6xl sm:mt-10 sm:h-[46vh] lg:h-[52vh]">
        {SHOES.map((shoe, i) => (
          <button
            key={shoe.name}
            type="button"
            ref={(el) => (cards.current[i] = el)}
            onClick={() => setActive(i)}
            aria-label={`Show ${shoe.name}`}
            className="group absolute left-1/2 top-0 flex h-full w-[64%] items-center justify-center overflow-hidden bg-white/[0.06] sm:w-[46%] lg:w-[32%]"
          >
            <span className="absolute text-xl font-black text-white/10 sm:text-2xl">
              {shoe.name}
            </span>
            {/* hover / focus: photo rotates + grows */}
            <img
              src={shoe.img}
              alt={shoe.name}
              draggable="false"
              className="relative h-full w-full object-contain p-4 transition-transform duration-500 ease-out will-change-transform group-focus-visible:-rotate-12 group-focus-visible:scale-110 sm:p-6 [@media(hover:hover)]:group-hover:-rotate-12 [@media(hover:hover)]:group-hover:scale-110"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
            {i === active && (
              <span className="absolute left-2 top-2 bg-white px-2.5 py-1 text-[11px] font-bold text-black sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                {shoe.tag}
              </span>
            )}
          </button>
        ))}

        {ARROWS.map(({ dir, label, side, d }) => (
          <button
            key={dir}
            type="button"
            onClick={() => go(dir)}
            aria-label={label}
            className={`absolute ${side} top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/40 backdrop-blur transition-colors hover:bg-white hover:text-black sm:h-12 sm:w-12 lg:h-14 lg:w-14`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={d} />
            </svg>
          </button>
        ))}
      </div>

      {/* Caption */}
      <div ref={caption} className="relative mt-6 text-center sm:mt-8">
        <h3 className="text-2xl font-black sm:text-3xl lg:text-4xl">
          {current.name}
        </h3>
        <p className="mt-1 text-lg text-white/70 sm:text-xl">
          {inr(current.price)}
        </p>
        <motion.button
          type="button"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.35 }}
          onClick={() =>
            addToCart({
              id: current.id,
              name: current.name,
              price: current.price,
              image: current.img,
            })
          }
          className="mt-4 rounded-full border border-white/70 px-6 py-2.5 font-bold transition-colors hover:bg-white hover:text-black sm:mt-5 sm:px-8 sm:py-3"
        >
          Add to cart
        </motion.button>
      </div>

      {/* Thumbnails */}
      <div
        className="relative mt-8 flex gap-2.5 sm:mt-10 sm:gap-4"
        role="tablist"
        aria-label="All shoes"
      >
        {SHOES.map((shoe, i) => (
          <button
            key={shoe.name}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={shoe.name}
            onClick={() => setActive(i)}
            className={`shoe-thumb h-14 w-14 overflow-hidden border-2 bg-white/[0.06] transition-all duration-300 sm:h-16 sm:w-16 lg:h-20 lg:w-20 ${
              i === active
                ? "border-white opacity-100"
                : "border-transparent opacity-50 hover:opacity-90"
            }`}
          >
            <img
              src={shoe.img}
              alt=""
              draggable="false"
              className="h-full w-full object-contain p-1"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default ShoeCollection;
