import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] md:h-screen flex items-center justify-center text-center overflow-hidden">
      {/* 背景画像 */}
      <img
        src="/images/mainvisual.png"
        alt="Researchers collaborating in a lab"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      {/* 暗幕 */}
      <div className="absolute inset-0 bg-black opacity-25"></div>

      {/* メインテキスト */}
      <div className="relative z-10 text-white px-6 max-w-4xl mx-auto">
        {/* タイトル */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-2xl tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Break Financial Barriers,
          <br className="hidden md:block" />
          Fuel Scientific Dreams
        </motion.h1>

        {/* サブテキスト */}
        <motion.p
          className="mt-6 text-lg md:text-2xl font-light max-w-2xl mx-auto drop-shadow-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          Connecting underfunded researchers with a global community.
          <br />
          Even the smallest support can unlock the next breakthrough.
        </motion.p>
      </div>
    </section>
  );
}

