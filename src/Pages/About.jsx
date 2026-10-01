import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageBand from "../components/PageBand";

gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// EDIT: your own story
const STATEMENT =
  "We make football boots for players who move with purpose. Engineered for speed, control, agility, and confidence on the pitch. Clean design, performance-driven comfort, and a fit made for every touch.";

// EDIT: swap for real numbers
const STATS = [
  { value: 12, label: "Styles in store" },
  { value: 4, label: "Categories" },
  { value: 999, prefix: "\u20b9", label: "Free shipping above" },
];

// EDIT: your own values
const VALUES = [
  { n: "01", title: "Comfort first", text: "Every pair is built around how it feels after hours on your feet, not only how it looks on a shelf." },
  { n: "02", title: "Made to last", text: "Good materials and simple construction, so your shoes keep going season after season." },
  { n: "03", title: "Fair pricing", text: "No middlemen markup and no fake discounts. The price you see is the price you pay." },
];

function About() {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const stats = gsap.utils.toArray(".stat-num");

    if (reduced()) return;

    const ctx = gsap.context(() => {
      // statement: words light up as you scroll
      gsap.fromTo(
        ".about-w",
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".about-statement",
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );

      // image parallax
      gsap.fromTo(
        ".about-img",
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-img-wrap",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      // stats count up once
      stats.forEach((el) => {
        const end = Number(el.dataset.value);
        const o = { v: 0 };
        el.textContent = "0";
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: end,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => (el.textContent = Math.round(o.v)),
            }),
        });
      });

      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".stats", start: "top 85%", once: true },
      });

      // values: top line draws, then text rises
      const vt = gsap.timeline({
        scrollTrigger: { trigger: ".values", start: "top 80%", once: true },
      });
      vt.from(".val-line", { scaleX: 0, transformOrigin: "left", duration: 1, stagger: 0.15, ease: "power3.inOut" }).from(
        ".val-body",
        { y: 30, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out" },
        "-=0.7",
      );

      gsap.from(".about-cta > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-cta", start: "top 80%", once: true },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <main ref={pageRef}>
        <PageBand
          kicker="Our story"
          words={["About", "Us"]}
          sub="Everyday shoes, made simple."
        />

        {/* Statement */}
        <section className="bg-[#e7eaea] py-16 text-[#15181a] sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <p className="about-statement max-w-5xl text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {STATEMENT.split(" ").map((w, i) => (
                <span key={i} className="about-w mr-[0.25em] inline-block">
                  {w}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* Parallax image */}
        <section className="about-img-wrap relative h-[50vh] overflow-hidden bg-[#15181a] sm:h-[65vh]">
          <div
            className="about-img absolute inset-x-0 -top-[15%] h-[130%] bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pinimg.com/1200x/37/06/5c/37065cbdd98934a1db08b1c6ac8a04f8.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </section>

        {/* Stats */}
        <section className="stats bg-[#15181a] py-16 text-white sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-3">
            {STATS.map(({ value, prefix, label }) => (
              <div key={label} className="stat-item">
                <p className="text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
                  {prefix}
                  <span className="stat-num" data-value={value}>
                    {value}
                  </span>
                </p>
                <p className="mt-2 text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="values bg-[#e7eaea] py-16 text-[#15181a] sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {VALUES.map(({ n, title, text }) => (
                <div key={n}>
                  <div className="val-line h-px w-full bg-[#15181a]/40" />
                  <div className="val-body pt-6">
                    <p className="text-sm font-bold text-[#15181a]/50">{n}</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{title}</h3>
                    <p className="mt-3 text-[#15181a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#15181a] py-20 text-white sm:py-28">
          <div className="about-cta mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
            <h2 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
              Find your pair
            </h2>
            <p className="mt-5 max-w-md text-white/60">Browse every style and see what fits.</p>
            <Link
              to="/shop"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-[#15181a] transition-transform duration-300 hover:scale-105"
            >
              Shop all
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;