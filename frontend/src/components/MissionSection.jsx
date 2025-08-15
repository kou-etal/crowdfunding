import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function MissionSection() {
  const container = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.12 }
    }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };
  const zoomIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="bg-blue-50 pt-50 px-6 pb-30">
      <motion.div
        className="max-w-5xl mx-auto text-center"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* メイン見出し */}
        <motion.h2
          variants={zoomIn}
          className="text-3xl md:text-4xl font-extrabold text-cf-science-blue mb-3"
           style={{ fontFamily: '"Quicksand", sans-serif' }}
        >
          Breaking Financial Barriers for Scientific Progress
        </motion.h2>

        {/* 要旨 */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg font-extrabold text-gray-700 mb-8"
  style={{ fontFamily: '"Quicksand", sans-serif' }}
        >
          FundMyThesis connects underfunded graduate researchers with a global community so ideas can become discoveries.
        </motion.p>

        {/* 小見出し */}
        <motion.h3
          variants={fadeUp}
          className="text-xl md:text-2xl font-semibold text-gray-900 mb-4"
        >
          What We Do
        </motion.h3>

        {/* 箇条書き */}
        <motion.ul
          variants={container}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-10"
        >
          {[
            {
              title: "Bridge the gap",
              desc: "Access to lab tools and materials through community-backed funding."
            },
            {
              title: "Back great work",
              desc: "Transparent projects and progress updates in your dashboard."
            },
            {
              title: "Sustain impact",
              desc: "A small platform fee keeps scholarships and operations running."
            }
          ].map((item, idx) => (
            <motion.li
              key={idx}
              variants={zoomIn}
              className="bg-white/70 rounded-xl p-5 shadow-sm"
            >
              <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </motion.li>
          ))}
        </motion.ul>

        {/* 締めの一文 */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg font-semibold text-cf-science-blue mb-6"
        >
          Even a small contribution can unlock the next breakthrough.
        </motion.p>

        {/* CTAボタン */}
        <div className="pt-12">
        <motion.div variants={fadeUp}>
          <Link
            to="/register"
            className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-500 transition-colors"
          >
            Start FundMyThesis
          </Link>
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

