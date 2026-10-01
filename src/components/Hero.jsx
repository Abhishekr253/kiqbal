import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const IMG_DESKTOP = "/img.png"; // wide photo
const IMG_MOBILE = `https://i.pinimg.com/736x/39/40/c7/3940c7af67a4512fc46a117fef405a0c.jpg`; // portrait photo for phones (<768px)
const PIECES = [0, 1, 2, 3];

function Hero() {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const pieces = ".hero-piece";
      const title = ".hero-title";

      // Initial states
      gsap.set(pieces, { yPercent: -100 });
      gsap.set(title, { opacity: 0 });

      // Entrance
      gsap
        .timeline()
        .to(pieces, {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.25,
          ease: "power4.out",
        })
        .to(title, { opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5");

      // Scroll zoom: one timeline, values switch by screen size
      gsap
        .matchMedia()
        .add(
          { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
          ({ conditions: { desktop } }) => {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top top",
                  end: desktop ? "+=180%" : "+=130%",
                  scrub: desktop ? 1.2 : 1.8,
                  pin: true,
                  anticipatePin: 1,
                },
              })
              .to(title, { scale: desktop ? 5 : 2.2, ease: "none" })
              .to(pieces, { scale: desktop ? 1.15 : 1.08, ease: "none" }, "<");
          },
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* One image split into 4 pieces. <picture> picks mobile or desktop photo,
          only the matching file is downloaded. */}
      <div className="absolute inset-0 flex">
        {PIECES.map((i) => (
          <div
            key={i}
            className="hero-piece relative h-full w-1/4 overflow-hidden"
          >
            <picture
              className="absolute inset-y-0 block"
              style={{ width: "400%", left: `-${i * 100}%` }}
            >
              <source media="(min-width: 768px)" srcSet={IMG_DESKTOP} />
              <img
                src={IMG_MOBILE}
                alt=""
                draggable="false"
                fetchpriority="high"
                className="block h-full w-full object-cover object-center"
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Title */}
      <div className="relative z-10 flex w-full items-center justify-center px-2">
  <h3
    className="hero-title whitespace-nowrap text-center text-5xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-[6rem]"
    style={{
      color: "transparent",
      WebkitTextStroke: "3px white",
    }}
  >
    KIQBAL
  </h3>
</div>
    </section>
  );
}

export default Hero;
