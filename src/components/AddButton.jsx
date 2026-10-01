import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext"; // <- change path if yours differs
import flyToCart from "./flyToCart";

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Add-to-cart button. Click: pops + shows a check, shoe flies to the navbar cart,
// item is added when it lands.
//   variant "round" = + icon (product cards), "pill" = text button (slider)
// Do NOT put CSS `transition-transform` / `hover:rotate-*` / `hover:scale-*` in className:
// framer-motion drives the transform and CSS would fight it.
function AddButton({ product, variant = "round", className = "" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    // callers may pass the photo as `img` or `image`. Store both so the fly animation,
    // navbar drawer and cart page all find it.
    const photo = product.img ?? product.image;
    const item = {
      ...product,
      id: product.id ?? slug(product.name),
      img: photo,
      image: photo,
    };

    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);

    // flyToCart adds the item instantly when motion is reduced or no cart icon is visible
    flyToCart(ref.current, item, () => addToCart(item));
  };

  const motionOn = !reduced();

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={add}
      animate={added && motionOn ? { scale: [0.85, 1] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 14 }}
      whileHover={
        motionOn
          ? variant === "round"
            ? { rotate: 90, scale: 1.08 }
            : { scale: 1.04 }
          : undefined
      }
      whileTap={motionOn ? { scale: 0.9 } : undefined}
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
    </motion.button>
  );
}

export default AddButton;