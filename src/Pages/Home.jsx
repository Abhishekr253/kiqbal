import React from "react";
import Hero from "../components/Hero";
import ShoeCollection from "../components/ShoeCollection";
import ShopAll from "../components/ShopAll";

function Home() {
  return (
    <div>
      {/* hide scrollbars on the whole page; scrolling still works */}
      <style>{`
        html, body, * { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar { display: none; }
      `}</style>

      <Hero />
      <ShoeCollection />
      <ShopAll />
      
    </div>
  );
}

export default Home;