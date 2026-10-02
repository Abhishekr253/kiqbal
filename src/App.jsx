import React, { useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import About from "./Pages/About";
import Contact from "./Pages/Contact";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // stop browser restoring old scroll position
    window.history.scrollRestoration = "manual";

    // reset Lenis internal position too, not only window
    // (Lenis remember old spot otherwise → pull page back → footer show)
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);

    // new page height → re-measure ScrollTriggers after layout settle
    const id = requestAnimationFrame(() => {
      window.lenis?.resize();
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />

          <SmoothScroll>
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>

            <Footer />
          </SmoothScroll>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;