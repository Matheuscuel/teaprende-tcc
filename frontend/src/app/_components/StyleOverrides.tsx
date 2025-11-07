"use client";
import { useEffect } from "react";

export default function StyleOverrides() {
  useEffect(() => {
    const css = `
.hero.haven-hero .hero-right .orbit-wrap > .float,
.hero.haven-hero .hero-right .orbit-wrap > .card,
.hero.haven-hero .hero-right .orbit-wrap > .f1,
.hero.haven-hero .hero-right .orbit-wrap > .f2,
.hero.haven-hero .hero-right .orbit-wrap > .f3 { display:none!important; }
.hero.haven-hero .hero-right * { animation:none!important; transition:none!important; }
`;
    const s = document.createElement("style");
    s.id = "tea-kill-floats";
    s.textContent = css;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {}
    };
  }, []);
  return null;
}