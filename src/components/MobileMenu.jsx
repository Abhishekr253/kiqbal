import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut } from "lucide-react";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

// panel opens by height only, no opacity on the wrapper
const panel = {
  hidden: { height: 0 },
  show: {
    height: "auto",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delayChildren: 0.1, staggerChildren: 0.06 },
  },
  exit: { height: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

// links fade + drop in one by one
const item = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const pill =
  "group flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black";

function MobileMenu({ open, onClose, totalItems, currentUser, onCart, onSignIn, onSignOut }) {
  const run = (fn) => () => {
    fn();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="overflow-hidden md:hidden"
        >
          {/* solid black: backdrop-blur only kicked in after the fade finished */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
            <div className="flex flex-col gap-5">
              {LINKS.map(({ label, to }) => (
                <motion.div key={to} variants={item}>
                  <Link to={to} onClick={onClose} className="block text-white transition-colors duration-300 hover:text-gray-300">
                    {label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={item} className="h-px w-full bg-white/10" />

              <motion.button
                variants={item}
                type="button"
                onClick={run(onCart)}
                className="group flex items-center gap-2 text-left text-white transition-colors duration-300 hover:text-gray-300"
              >
                <ShoppingCart size={19} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Cart ({totalItems})</span>
              </motion.button>

              <motion.button variants={item} type="button" onClick={run(currentUser ? onSignOut : onSignIn)} className={pill}>
                {currentUser ? (
                  <LogOut size={17} className="transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <User size={17} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                )}
                <span>{currentUser ? "Sign Out" : "Sign In"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;