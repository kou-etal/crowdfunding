import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function HowItWorksSection() {
  const [role, setRole] = useState("supporter");

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

  return (
    <section className="w-full bg-gradient-to-b from-white to-blue-50 border-y border-blue-700">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900">How FundMyThesis Works</h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            FundMyThesis has two roles: <span className="font-semibold">researchers</span> and <span className="font-semibold">supporters</span>. Choose your role to see the steps.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              className={`px-4 py-2 rounded-xl font-semibold ${role === r.key ? "bg-blue-800 text-white" : "bg-white text-blue-800 border border-blue-200"}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {steps.map((s, i) => (
              <motion.li
                key={role + i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
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
