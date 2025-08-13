import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function HowItWorksSection() {
  const [role, setRole] = useState("supporter");
  const prefersReducedMotion = useReducedMotion();

  const roles = [
    { key: "supporter", label: "Supporter" },
    { key: "researcher", label: "Researcher" },
  ];

  const steps = useMemo(() => {
    if (role === "supporter") {
      return [
        { title: "Create an account", desc: "Sign up to start supporting research you believe in. No identity verification is required." },
        { title: "Explore projects", desc: "Browse projects by category or popularity." },
        { title: "Support securely", desc: "Choose an amount and complete checkout. Receive updates in your dashboard." },
      ];
    }
    return [
      { title: "Create an account", desc: "Register as a researcher." },
      { title: "Verify your identity", desc: "Submit your ID for review." },
      { title: "Apply to post a project", desc: "After approval, submit your project for review." },
      { title: "Get approved & go live", desc: "Once approved, your project will be published automatically." },
    ];
  }, [role]);

  // アニメ設定（低速端末や低電力モードでは最小化）
  const itemTransition = prefersReducedMotion
    ? { duration: 0.001 }
    : { type: "spring", stiffness: 300, damping: 24 };

  return (
    <section className="w-full bg-gradient-to-b from-white to-blue-50 border-y border-blue-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14 min-w-0">
        <div className="flex flex-col items-center text-center gap-4 mb-10 min-w-0">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 break-words [overflow-wrap:anywhere] [hyphens:auto]">
            How FundMyThesis Works
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl break-words [overflow-wrap:anywhere] [hyphens:auto]">
            FundMyThesis has two roles: <span className="font-semibold">researchers</span> and <span className="font-semibold">supporters</span>. Choose your role to see the steps.
          </p>
        </div>

        {/* トグル：Galaxy のタップ連打でも安定（aria付き & touchAction） */}
        <div
          role="tablist"
          aria-label="Select role"
          className="flex justify-center gap-2 mb-6"
          style={{ touchAction: "manipulation" }}
        >
          {roles.map((r) => {
            const selected = role === r.key;
            return (
              <button
                key={r.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setRole(r.key)}
                className={`px-4 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-800 ${
                  selected ? "bg-blue-800 text-white" : "bg-white text-blue-800 border border-blue-800"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* アドレスバー出入りでの再発火抑制：once:true/amountを控えめに */}
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-4 max-w-2xl mx-auto min-w-0"
        >
          <AnimatePresence mode="wait">
            {steps.map((s, i) => (
              <motion.li
                key={role + i}
                initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
                transition={itemTransition}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-w-0"
                style={{ willChange: prefersReducedMotion ? "auto" : "transform" }} // Galaxyのチラつき抑止
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold flex-shrink-0 select-none">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-lg break-words [overflow-wrap:anywhere] [hyphens:auto]">
                    {s.title}
                  </p>
                  <p className="text-slate-600 text-sm mt-1 break-words [overflow-wrap:anywhere] [hyphens:auto]">
                    {s.desc}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ol>
      </div>
    </section>
  );
}
