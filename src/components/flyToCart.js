import gsap from "gsap";

// first cart target that is actually visible (desktop cart icon, or mobile menu button)
const findTarget = () =>
  [...document.querySelectorAll("[data-cart-target]")].find(
    (el) => el.getBoundingClientRect().width > 0,
  );

const SIZE = 56;

// Shoe photo flies from the clicked button to the navbar cart, "Added to cart" label
// pops at the button, ring ripples on the cart. onLand() runs when it arrives
// (that is when the item is really added, so the badge pops at the right moment).
export default function flyToCart(fromEl, product, onLand) {
  const target = findTarget();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fromEl || !target || reduce) return onLand();

  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const sx = a.left + a.width / 2;
  const sy = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - sx;
  const dy = b.top + b.height / 2 - sy;

  // --- flying shoe
  const orb = document.createElement("div");
  orb.className =
    "pointer-events-none fixed z-[9999] overflow-hidden rounded-full border-2 border-white bg-white shadow-2xl";
  Object.assign(orb.style, {
    left: `${sx - SIZE / 2}px`,
    top: `${sy - SIZE / 2}px`,
    width: `${SIZE}px`,
    height: `${SIZE}px`,
  });
  const img = new Image();
  img.src = product.img ?? product.image ?? "";
  img.alt = "";
  img.className = "h-full w-full object-contain p-1.5";
  img.style.filter = `hue-rotate(${product.hue ?? 0}deg)`;
  img.onerror = () => img.remove();
  orb.appendChild(img);
  document.body.appendChild(orb);

  // --- "Added to cart" label above the button
  const tag = document.createElement("div");
  tag.textContent = "Added to cart \u2713";
  tag.className =
    "pointer-events-none fixed z-[9999] whitespace-nowrap rounded-full bg-[#15181a] px-3 py-1.5 text-xs font-bold text-white shadow-lg";
  document.body.appendChild(tag);
  const tw = tag.offsetWidth;
  tag.style.left = `${Math.max(8, Math.min(sx - tw / 2, window.innerWidth - tw - 8))}px`;
  tag.style.top = `${Math.max(8, a.top - 44)}px`;
  gsap.fromTo(tag, { opacity: 0, y: 10, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(2)" });
  gsap.to(tag, { opacity: 0, y: -14, duration: 0.35, delay: 1, ease: "power2.in", onComplete: () => tag.remove() });

  // --- flight: pop, lift, then arc down into the cart
  gsap.set(orb, { scale: 0.4 });
  gsap
    .timeline({
      onComplete: () => {
        orb.remove();
        ripple(b);
        onLand();
      },
    })
    .to(orb, { scale: 1, duration: 0.2, ease: "back.out(2)" })
    .to(orb, { x: dx, duration: 0.8, ease: "power1.inOut" }, ">")
    .to(
      orb,
      {
        keyframes: [
          { y: -70, duration: 0.3, ease: "power2.out" },
          { y: dy, duration: 0.5, ease: "power2.in" },
        ],
      },
      "<",
    )
    .to(orb, { scale: 0.25, rotation: 360, duration: 0.8, ease: "power2.in" }, "<");
}

// ring that expands from the cart icon on arrival
function ripple(rect) {
  const r = document.createElement("div");
  r.className = "pointer-events-none fixed z-[9998] rounded-full border-2 border-white";
  Object.assign(r.style, {
    left: `${rect.left + rect.width / 2 - 20}px`,
    top: `${rect.top + rect.height / 2 - 20}px`,
    width: "40px",
    height: "40px",
  });
  document.body.appendChild(r);
  gsap.fromTo(
    r,
    { scale: 0.6, opacity: 0.9 },
    { scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out", onComplete: () => r.remove() },
  );
}