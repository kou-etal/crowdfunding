import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function HowItWorksSection() {
  const [role, setRole] = useState("supporter");
  const reduce = useReducedMotion();

  const roles = [
    { key: "supporter", label: "Supporter" },
    { key: "researcher", label: "Researcher" },
  ];

  const steps = useMemo(() => {
    if (role === "supporter") {
      return [
        { title: "Create an account", desc: "Sign up to start supporting research you believe in. No identity check needed." },
        { title: "Explore projects", desc: "Browse by category or popularity and find work you value." },
        { title: "Support securely", desc: "Choose an amount and check out. Get updates in your dashboard." },
      ];
    }
    return [
      { title: "Create an account", desc: "Register as a researcher." },
      { title: "Verify your identity", desc: "Submit your ID for review." },
      { title: "Apply to post a project", desc: "Send your project draft for review." },
      { title: "Get approved & go live", desc: "Once approved, your project is published automatically." },
    ];
  }, [role]);

  // Variants
  const containerV = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1, y: 0,
      transition: { when: "beforeChildren", staggerChildren: 0.08, ease: "easeOut", duration: 0.4 }
    }
  };
  const itemV = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.45 } },
    exit:   { opacity: 0, y: -12, transition: { ease: "easeIn", duration: 0.25 } },
  };

  return (
    <section className="w-full bg-gradient-to-b from-white to-blue-50 border-blue-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-30">
        {/* heading */}
        <motion.div
          variants={containerV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col items-center text-center gap-4 mb-10"
        >
          <motion.h2
  variants={itemV}
  className="text-3xl md:text-4xl font-extrabold text-gray-600"
  style={{ fontFamily: '"Quicksand", sans-serif' }}
>
  How FundMyThesis Works
</motion.h2>


          <motion.p variants={itemV} className="text-sm md:text-base text-slate-600 max-w-2xl">
            FundMyThesis has two roles: <span className="font-semibold">researchers</span> and <span className="font-semibold">supporters</span>. Choose your role to see the steps.
          </motion.p>
        </motion.div>

        {/* role tabs with animated pill */}
        <div className="relative flex justify-center gap-2 mb-8">
          <div className="relative inline-flex bg-white/70 border border-blue-200 rounded-2xl p-1">
            {roles.map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className={`relative z-10 px-4 py-2 rounded-xl font-semibold transition-colors ${
                    active ? "text-white" : "text-blue-800"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="role-pill"
                      className="absolute inset-0 rounded-xl bg-blue-800"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* steps */}
        <motion.ol
          key={role} // 切替時に再アニメーション
          variants={containerV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.35 }}
          className="space-y-4 max-w-2xl mx-auto"
          role="list"
          aria-label={`${role} steps`}
        >
          <AnimatePresence mode="popLayout">
            {steps.map((s, i) => (
              <motion.li
                key={role + "-" + i}
                variants={itemV}
                initial="hidden"
                animate="show"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm will-change-transform"
                whileHover={!reduce ? { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" } : undefined}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-lg">{s.title}</p>
                  <p className="text-slate-600 text-sm mt-1">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ol>
      </div>
    </section>
  );
}
