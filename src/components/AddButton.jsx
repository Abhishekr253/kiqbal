import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCart } from "../context/CartContext"; // <- change path if yours differs
import flyToCart from "./flyToCart";

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Add-to-cart button. Click: button pops and shows a check, shoe flies to the
// navbar cart, item is added when it lands.
// variant "round" = + icon (product cards), "pill" = text button (slider).
function AddButton({ product, variant = "round", className = "" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    const item = { ...product, id: product.id ?? slug(product.name) };

    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);

    if (!reduced()) {
      gsap.fromTo(
        ref.current,
        { scale: 0.85 },
        { scale: 1, duration: 0.6, ease: "back.out(3)", clearProps: "transform" },
      );
    }

    flyToCart(ref.current, item, () => addToCart(item));
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={add}
      aria-label={`Add ${product.name} to cart`}
      className={className}
    >
      {variant === "round" ? (
        <span className="relative block h-4 w-4">
          <svg
            viewBox="0 0 24 24"
            className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
              added ? "rotate-90 scale-0 opacity-0" : "scale-100 opacity-100"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
              added ? "scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        <span className="inline-grid">
          <span
            className={`col-start-1 row-start-1 transition-all duration-300 ${
              added ? "-translate-y-3 opacity-0" : ""
            }`}
          >
            Add to cart
          </span>
          <span
            className={`col-start-1 row-start-1 transition-all duration-300 ${
              added ? "" : "translate-y-3 opacity-0"
            }`}
          >
            Added ✓
          </span>
        </span>
      )}
    </button>
  );
}

export default AddButton;