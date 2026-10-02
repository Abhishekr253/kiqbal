import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SHOP_ALL_PRODUCT = {
  id: "shop-all-collection",
  name: "Shop All Collection",
  price: 3999,
  img: "/shoe1.png",
  hue: 0,
};

function ShopAll() {
  const sectionRef = useRef(null);

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    const bg = sectionRef.current.querySelector(".shop-bg");
    const content = sectionRef.current.querySelector(".shop-content");
    const button = sectionRef.current.querySelector(".shop-button");

    // Background parallax
    gsap.fromTo(
      bg,
      {
        yPercent: -10,
      },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      }
    );

    // Content entrance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
      },
    });

    tl.fromTo(
      content,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power4.out",
      }
    ).fromTo(
      button,
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.4"
    );
  }, sectionRef);

  return () => ctx.revert();
}, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#15181a] text-white sm:min-h-[75vh] lg:min-h-screen"
    >
      {/* Background Image */}
      <div
  className="shop-bg absolute inset-0 bg-cover bg-center"
  style={{
    backgroundImage: "url('/shop.png')",
  }}
/>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="shop-content relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/70 sm:text-base">
          Discover Your Style
        </p>

        <h2 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-[9rem]">
          Shop All
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg md:text-xl">
          Explore our complete collection of footwear designed for everyday
          comfort, modern style, and effortless performance.
        </p>

        <div className="shop-button mt-8 flex items-center justify-center gap-4">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#15181a] transition-all duration-300 hover:scale-105 hover:bg-[#15181a] hover:text-white sm:px-10 sm:py-5 sm:text-base"
          >
            Shop All
            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ShopAll;
