import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo } from "react";

export function HeroSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();

  const handleExploreClick = useCallback(() => {
    const scrollToExplore = () => {
      const el = document.getElementById("explore");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(scrollToExplore, 250);
    } else {
      scrollToExplore();
    }
  }, [navigate, location.pathname]);

  // ===== Variants =====
  const container = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { when: "beforeChildren", staggerChildren: 0.05, ease: "easeOut", duration: 0.5 }
    }
  };
  const word = {
    hidden: { opacity: 0, y: 22 },
    show:   { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }
  };
  const subcopy = {
    hidden: { opacity: 0, y: 12, filter: reduce ? "blur(0px)" : "blur(6px)" },
    show:   { opacity: 1, y: 0, filter: "blur(0px)", transition: { ease: "easeOut", duration: 0.6, delay: 0.3 } }
  };
  const cta = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5, delay: 0.6 } }
  };

  const line1 = useMemo(() => "Break Financial Barriers,".split(" "), []);
  const line2 = useMemo(() => "Fuel Scientific Dreams".split(" "), []);

  return (
    <section
      className="relative min-dvh md:h-dvh flex items-center justify-center text-center overflow-hidden mb-24 md:mb-32"
      aria-label="FundMyThesis hero"
    >
      {/* 背景：Ken Burns */}
      <motion.img
        src="/images/mainvisual.png"
        alt="Researchers collaborating in a lab"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        loading="eager"
        decoding="async"
        aria-hidden="true"
        initial={{ scale: reduce ? 1 : 1.06, opacity: 0.85 }}
        animate={{ scale: 1.0, opacity: 0.9 }}
        transition={{ duration: 3.2, ease: "easeOut" }}
      />
      {/* スクリーン / ビネット */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)" }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 text-white px-6 max-w-4xl mx-auto"
        style={{ fontFamily: '"Quicksand", sans-serif' }}
      >
        {/* 見出し */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold leading-snug drop-shadow-2xl tracking-normal"
          variants={container}
          initial="hidden"
          animate="show"
          role="heading"
          aria-level={1}
        >
          <span className="inline-block">
            {line1.map((w, i) => (
              <motion.span key={`l1-${i}`} variants={word} className="inline-block mr-2">
                {w}
              </motion.span>
            ))}
          </span>
          <br className="hidden md:block" />
          <span className="inline-block">
            {line2.map((w, i) => (
              <motion.span key={`l2-${i}`} variants={word} className="inline-block mr-2">
                {w}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* サブコピー（各文を一行化：MD以上でnowrap） */}
        <div className="mt-6 space-y-2">
          <motion.p
            className="text-lg md:text-2xl font-light mx-auto drop-shadow-lg leading-relaxed md:whitespace-nowrap md:max-w-none"
            variants={subcopy}
            initial="hidden"
            animate="show"
          >
            Connecting underfunded researchers with a global community.
          </motion.p>
          <motion.p
            className="text-lg md:text-2xl font-light mx-auto drop-shadow-lg leading-relaxed md:whitespace-nowrap md:max-w-none"
            variants={subcopy}
            initial="hidden"
            animate="show"
          >
            Even the smallest support can unlock the next breakthrough.
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div className="mt-10" variants={cta} initial="hidden" animate="show">
          <Button
            size="lg"
            className="bg-blue-800 hover:bg-blue-500 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-lg"
            onClick={handleExploreClick}
          >
            Start Supporting
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

