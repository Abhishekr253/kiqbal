import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Dark top band shared by inner pages. Dark because the navbar text is white.
function PageBand({ words, kicker, sub }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from(".band-kicker", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" })
        .from(".band-word", { yPercent: 115, duration: 0.9, stagger: 0.12, ease: "power4.out" }, "-=0.3")
        .from(".band-sub", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "-=0.5");
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="bg-[#15181a] pb-12 pt-28 text-white sm:pb-16 sm:pt-36">
      <div className="mx-auto max-w-7xl px-6">
        <p className="band-kicker text-sm font-bold uppercase tracking-[0.3em] text-white/60">
          {kicker}
        </p>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="flex flex-wrap gap-x-[0.3em] text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl lg:text-[9rem]">
            {words.map((w) => (
              <span key={w} className="overflow-hidden pb-[0.08em]">
                <span className="band-word inline-block">{w}</span>
              </span>
            ))}
          </h1>
          {sub && (
            <p className="band-sub max-w-sm text-lg text-white/60 sm:text-xl md:pb-3">{sub}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageBand;