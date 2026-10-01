import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All shoes", to: "/shop" },
      { label: "Running", to: "/shop?cat=Running" },
      { label: "Casual", to: "/shop?cat=Casual" },
      { label: "Trail", to: "/shop?cat=Trail" },
      { label: "Court", to: "/shop?cat=Court" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Size guide", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "X", href: "#" },
    ],
  },
];

const linkClass =
  "inline-block text-white/60 transition-all duration-300 hover:translate-x-1 hover:text-white";

function Footer() {
  const footerRef = useRef(null);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    if (reduced()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
            once: true,
          },
        })
        .from(".footer-fade", {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        })
        .from(
          ".footer-letter",
          {
            yPercent: 110,
            duration: 1,
            stagger: 0.07,
            ease: "power4.out",
          },
          "-=0.4",
        );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const join = (e) => {
    e.preventDefault();
    if (email) setDone(true);
  };

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-[#15181a] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(140,150,152,0.22),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl border-t border-white/10 px-4 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
          {/* Newsletter */}
          <div className="footer-fade max-w-md">
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              First to know about new drops.
            </h2>
            <p className="mt-3 text-white/60">
              Launches and offers in your inbox. Unsubscribe anytime.
            </p>

            {done ? (
              <p className="mt-6 font-bold">You're in. Check your inbox.</p>
            ) : (
              <form
                onSubmit={join}
                className="mt-6 flex items-center border-b border-white/40 transition-colors focus-within:border-white"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="group flex items-center gap-2 py-3 pl-4 font-bold"
                >
                  Join
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {COLUMNS.map(({ title, links }) => (
              <nav key={title} className="footer-fade" aria-label={title}>
                <h3 className="mb-4 font-bold">{title}</h3>
                <ul className="space-y-3">
                  {links.map(({ label, to, href }) => (
                    <li key={label}>
                      {to ? (
                        <Link to={to} className={linkClass}>
                          {label}
                        </Link>
                      ) : (
                        <a href={href} className={linkClass}>
                          {label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-fade mt-14 flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-white/50 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KIQBAL. All rights reserved.</p>
          <p>UPI · Cards · Cash on delivery</p>
          <button
            type="button"
            onClick={toTop}
            className="group inline-flex items-center gap-2 self-start font-bold text-white sm:self-auto"
          >
            Back to top
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-black">
              ↑
            </span>
          </button>
        </div>
      </div>

      {/* Giant wordmark: letters rise from a mask, fill in on hover */}
      <div
        className="relative flex select-none justify-center overflow-hidden px-2 pb-4 text-[20vw] font-black leading-[0.85] tracking-tight"
        aria-hidden="true"
      >
        {"KIQBAL".split("").map((ch, i) => (
          <span key={i} className="overflow-hidden pb-[0.05em]">
            <span
              className="footer-letter inline-block text-transparent transition-colors duration-300 hover:text-white"
              style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)" }}
            >
              {ch}
            </span>
          </span>
        ))}
      </div>
    </footer>
  );
}

export default Footer;