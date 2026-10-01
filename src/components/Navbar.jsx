import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Minus, Plus, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";

function Navbar() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const { currentUser, signOut } = useAuth();
  const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const totalDisplay = useMemo(
    () => `₹${subtotal.toLocaleString("en-IN")}`,
    [subtotal],
  );

  const closeMenu = () => setMenuOpen(false);

  const handleCheckout = () => {
    if (!currentUser) {
      setCartOpen(false);
      setAuthOpen(true);
      return;
    }

    setCartOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-50 w-full bg-transparent transition-all duration-1000 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        {/* 1. Change py-5 → py-3 to tighten the navbar */}
<div className="mx-auto max-w-7xl px-5 py-3 md:px-6">

  <div className="flex items-center justify-between">

    {/* 2. Fix logo — use h- not w- so it scales correctly on both mobile and desktop */}
    <Link to="/">
      <img
        src="/logo.png"
        alt="KIQBAL"
        className="h-18 w-auto object-contain md:h-19"
        style={{ mixBlendMode: "screen" }}
      />
    </Link>

            <div className="hidden items-center justify-center gap-8 md:flex">
              <Link to="/" className="text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-300">
                Home
              </Link>
              <Link to="/shop" className="text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-300">
                Shop
              </Link>
              <Link to="/about" className="text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-300">
                About
              </Link>
              <Link to="/contact" className="text-white transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-300">
                Contact
              </Link>
            </div>

            <div className="hidden items-center gap-5 md:flex">
              <motion.button
                type="button"
                onClick={() => setCartOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="group relative flex items-center gap-2 text-white transition-all duration-300 hover:text-gray-300"
                aria-label="Shopping Cart"
              >
                <motion.div
                  data-cart-target
                  key={totalItems}
                  initial={totalItems ? { scale: 1.45, rotate: -14 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                >
                  <ShoppingCart size={20} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                </motion.div>
                <span>Cart</span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#15181a]"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {currentUser ? (
                <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/5 px-3 py-2 text-white backdrop-blur-sm">
                  {currentUser.picture ? (
                    <img src={currentUser.picture} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#15181a]">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium">Hi, {currentUser.name.split(" ")[0]}</span>
                  <button type="button" onClick={signOut} className="rounded-full p-1 text-white/80 hover:text-white" aria-label="Sign out">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="group flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
                >
                  <User size={17} strokeWidth={1.8} className="transition-transform duration-300 group-hover:scale-110" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              data-cart-target
              className="relative flex h-10 w-10 items-center justify-center text-white md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={25} strokeWidth={1.8} /> : <Menu size={25} strokeWidth={1.8} />}
              <AnimatePresence>
                {totalItems > 0 && !menuOpen && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16 }}
                    className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#15181a]"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile menu: solid black panel, opens by height, links stagger in */}
          <MobileMenu
            open={menuOpen}
            onClose={closeMenu}
            totalItems={totalItems}
            currentUser={currentUser}
            onCart={() => setCartOpen(true)}
            onSignIn={() => setAuthOpen(true)}
            onSignOut={signOut}
          />
        </div>
      </nav>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-end bg-black/50 p-4 sm:p-6"
          >
            <motion.aside
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="h-full w-full max-w-md overflow-y-auto rounded-3xl bg-[#f5f5f1] p-5 text-[#15181a] shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button type="button" onClick={() => setCartOpen(false)} className="rounded-full bg-[#15181a] p-2 text-white" aria-label="Close cart">
                  <X size={18} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <ShoppingCart size={48} className="mb-4 text-[#15181a]/40" />
                  <p className="text-lg font-semibold">Your cart is empty</p>
                  <p className="mt-2 text-sm text-[#15181a]/60">Add a few pairs to get started.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* AnimatePresence so removed items actually play their exit animation */}
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          className="flex gap-3 rounded-2xl border border-[#15181a]/10 bg-white p-3 shadow-sm"
                        >
                          {/* AddButton saves the photo as `img`; older items may use `image` */}
                          <img
                            src={item.img ?? item.image}
                            alt={item.name}
                            style={{ filter: `hue-rotate(${item.hue ?? 0}deg)` }}
                            className="h-20 w-20 rounded-xl bg-[#d3d8d9] object-contain p-1"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-bold leading-tight">{item.name}</p>
                              <button type="button" onClick={() => removeFromCart(item.id)} className="text-[#15181a]/60 hover:text-red-600" aria-label={`Remove ${item.name}`}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="mt-1 text-sm text-[#15181a]/60">₹{(item.price).toLocaleString("en-IN")}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 rounded-full border border-[#15181a]/15 bg-[#f3f3f3] px-2 py-1">
                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="rounded-full p-1 hover:bg-[#15181a]/5" aria-label={`Decrease quantity for ${item.name}`}>
                                  <Minus size={14} />
                                </button>
                                <span className="min-w-5 text-center text-sm font-semibold">{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="rounded-full p-1 hover:bg-[#15181a]/5" aria-label={`Increase quantity for ${item.name}`}>
                                  <Plus size={14} />
                                </button>
                              </div>
                              <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <motion.div layout className="mt-6 rounded-2xl bg-[#15181a] p-4 text-white">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>Subtotal</span>
                      <span>{totalDisplay}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{totalDisplay}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-[#15181a] hover:bg-[#e5e5e5]"
                    >
                      Checkout
                    </button>
                    <button type="button" onClick={clearCart} className="mt-3 w-full rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5">
                      Clear cart
                    </button>
                  </motion.div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default Navbar;