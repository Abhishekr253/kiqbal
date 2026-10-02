import React, { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AddButton from "../components/AddButton";

gsap.registerPlugin(ScrollTrigger);

const inr = (n) => `\u20b9${n.toLocaleString("en-IN")}`;
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CATEGORIES = ["All", "Running", "Casual", "Trail", "Court"];

// Every shoe in the store. hue tints the photo so 4 images make 12 colourways.
// Use real photos per item: change img, set hue: 0.
const PRODUCTS = [
  {
    id: "runner-air",
    name: "Runner Air",
    cat: "Running",
    price: 4999,
    img: "/shoe1.png",
    hue: 0,
    tag: "New",
  },
  {
    id: "street-low",
    name: "Street Low",
    cat: "Casual",
    price: 3799,
    img: "/shoe2.png",
    hue: 0,
  },
  {
    id: "trail-pro",
    name: "Trail Pro",
    cat: "Trail",
    price: 5499,
    img: "/shoe3.png",
    hue: 0,
    tag: "Bestseller",
  },
  {
    id: "court-classic",
    name: "Court Classic",
    cat: "Court",
    price: 3299,
    old: 3999,
    img: "/shoe4.png",
    hue: 0,
    tag: "Sale",
  },
  {
    id: "runner-air-sunset",
    name: "Runner Air Sunset",
    cat: "Running",
    price: 5299,
    img: "/shoe1.png",
    hue: 160,
  },
  {
    id: "runner-air-volt",
    name: "Runner Air Volt",
    cat: "Running",
    price: 5199,
    img: "/shoe1.png",
    hue: 60,
  },
  {
    id: "street-low-mint",
    name: "Street Low Mint",
    cat: "Casual",
    price: 3999,
    img: "/shoe2.png",
    hue: 90,
    tag: "New",
  },
  {
    id: "street-low-dusk",
    name: "Street Low Dusk",
    cat: "Casual",
    price: 3899,
    img: "/shoe2.png",
    hue: 250,
  },
  {
    id: "trail-pro-clay",
    name: "Trail Pro Clay",
    cat: "Trail",
    price: 5699,
    img: "/shoe3.png",
    hue: 300,
  },
  {
    id: "trail-pro-moss",
    name: "Trail Pro Moss",
    cat: "Trail",
    price: 5599,
    img: "/shoe3.png",
    hue: 120,
  },
  {
    id: "court-classic-noir",
    name: "Court Classic Noir",
    cat: "Court",
    price: 3499,
    img: "/shoe4.png",
    hue: 200,
  },
  {
    id: "court-classic-coral",
    name: "Court Classic Coral",
    cat: "Court",
    price: 3399,
    old: 3799,
    img: "/shoe4.png",
    hue: 330,
    tag: "Sale",
  },
];

function Shop() {
  // filter lives in the URL: /shop?cat=Running (footer links use this too)
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat");
  const filter = CATEGORIES.includes(cat) ? cat : "All";

  const pageRef = useRef(null);
  const prevFilter = useRef(filter);
  const q = gsap.utils.selector(pageRef);

  const visible = PRODUCTS.filter((p) => filter === "All" || p.cat === filter);

  // 1) Mount only: heading + chips entrance, card wipe reveal
  useLayoutEffect(() => {
    if (reduced()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from(".shop-word", {
          yPercent: 115,
          duration: 0.9,
          stagger: 0.12,
          ease: "power4.out",
        })
        .from(
          ".shop-meta",
          { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" },
          "-=0.5",
        )
        .from(
          ".shop-chip",
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
          "-=0.4",
        );

      // cards open upward as they enter the screen
      const cards = gsap.utils.toArray(".shop-card");
      gsap.set(cards, { clipPath: "inset(100% 0% 0% 0%)", y: 40 });
      ScrollTrigger.batch(cards, {
        start: "top 95%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
            overwrite: true,
            clearProps: "clipPath,transform",
          }),
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // 2) Filter really changed: animate new cards in.
  // Compared with previous value, so React StrictMode's double effect run does nothing
  // (old version re-ran the animation on first load and fought the reveal above).
  useLayoutEffect(() => {
    if (prevFilter.current === filter) return;
    prevFilter.current = filter;

    const els = q(".shop-card");
    gsap.killTweensOf(els);
    gsap.set(els, { clearProps: "clipPath" });
    ScrollTrigger.refresh(); // page height changed, re-measure footer trigger
    if (reduced()) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 30, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
        clearProps: "opacity,transform",
      },
    );
  }, [filter]);

  const pick = (c) => {
    if (c === filter) return;
    const go = () =>
      setParams(c === "All" ? {} : { cat: c }, { replace: true });
    if (reduced()) return go();
    gsap.to(q(".shop-card"), {
      opacity: 0,
      y: 16,
      scale: 0.96,
      duration: 0.25,
      stagger: 0.02,
      overwrite: true,
      onComplete: go,
    });
  };

  return (
    <>
      <main ref={pageRef}>
        {/* Dark top band: your navbar has white text, so it needs a dark background */}
        <section className="bg-[#15181a] pb-10 pt-28 text-white sm:pb-14 sm:pt-36">
          <div className="mx-auto max-w-7xl px-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-bold transition-colors hover:bg-white hover:text-[#15181a]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Home
            </Link>

            {/* Heading */}
            <div className="mt-8 flex flex-col gap-4 sm:mt-12 md:flex-row md:items-end md:justify-between">
              <h1 className="flex gap-x-[0.3em] text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl lg:text-[9rem]">
                {["All", "Shoes"].map((w) => (
                  <span key={w} className="overflow-hidden pb-[0.08em]">
                    <span className="shop-word inline-block">{w}</span>
                  </span>
                ))}
              </h1>
              <p className="shop-meta text-lg text-white/60 sm:text-xl md:pb-3">
                {visible.length} {visible.length === 1 ? "style" : "styles"} ·
                Free shipping above {inr(999)}
              </p>
            </div>

            {/* Filters */}
            <div
              className="mt-8 flex gap-2 overflow-x-auto pb-1 sm:mt-10 sm:flex-wrap sm:gap-3 sm:overflow-visible"
              role="tablist"
              aria-label="Filter shoes"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={c === filter}
                  onClick={() => pick(c)}
                  className={`shop-chip shrink-0 rounded-full border px-5 py-2 text-sm font-bold transition-colors sm:px-6 sm:text-base ${
                    c === filter
                      ? "border-white bg-white text-[#15181a]"
                      : "border-white/40 hover:border-white hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="min-h-[60vh] bg-[#e7eaea] pb-16 pt-10 text-[#15181a] sm:pb-24 sm:pt-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((p) => (
                <article key={p.name} className="shop-card group">
                  <div className="relative aspect-square overflow-hidden bg-[#d3d8d9]">
                    <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-lg font-black text-[#15181a]/10 sm:text-2xl">
                      {p.name}
                    </span>
                    {/* hover / focus: photo rotates + grows */}
                    <img
                      src={p.img}
                      alt={p.name}
                      draggable="false"
                      style={{ filter: `hue-rotate(${p.hue}deg)` }}
                      className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 ease-out will-change-transform group-focus-within:-rotate-12 group-focus-within:scale-110 sm:p-6 [@media(hover:hover)]:group-hover:-rotate-12 [@media(hover:hover)]:group-hover:scale-110"
                      onError={(e) => (e.currentTarget.style.opacity = 0)}
                    />
                    {p.tag && (
                      <span className="absolute left-2 top-2 bg-[#15181a] px-2.5 py-1 text-[11px] font-bold text-white sm:left-3 sm:top-3 sm:text-xs">
                        {p.tag}
                      </span>
                    )}
                    <AddButton
                      product={{
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        image: p.img,
                      }}
                      variant="round"
                      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#15181a] text-white transition-transform duration-300 sm:bottom-3 sm:right-3 sm:h-11 sm:w-11"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold leading-tight sm:text-lg">
                        {p.name}
                      </h3>
                      <p className="text-sm text-[#15181a]/55">{p.cat}</p>
                    </div>
                    <p className="whitespace-nowrap text-right text-sm sm:text-base">
                      <span className="font-bold">{inr(p.price)}</span>
                      {p.old && (
                        <span className="block text-[#15181a]/40 line-through">
                          {inr(p.old)}
                        </span>
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Shop;
