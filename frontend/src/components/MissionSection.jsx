import { motion } from "framer-motion";

export function MissionSection() {
  return (
    <section className="bg-blue-50 py-16 px-6">
      <motion.div
        className="max-w-5xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-cf-science-blue mb-6">
          Breaking Financial Barriers for Scientific Progress
        </h2>

        <div className="text-lg text-gray-700 leading-relaxed space-y-5">
          <p>
            FundMyThesis is a crowdfunding platform designed to help graduate
            students — especially those in developing countries — secure
            funding for their research projects. We believe that brilliant ideas
            and groundbreaking discoveries should never be limited by lack of
            resources.
          </p>

          <p>
            Many students face severe challenges accessing essential lab
            equipment, chemicals, or tools for their work. FundMyThesis bridges
            this gap by connecting these students with a global community of
            supporters who care about knowledge, science, and fairness.
          </p>

          <p>
            A small percentage of funds raised helps sustain the platform and
            supports a scholarship program for outstanding students who excel
            academically but face financial hardship.
          </p>

          <p>
            Imagine if Einstein had grown up without access to labs or scientific
            equipment — how many great contributions to science would have been
            lost? Today, lack of funding still prevents countless talented minds
            from achieving their potential, especially in underserved regions.
          </p>

          <p>
            Through the power of the internet, community support, and a shared
            commitment to human progress, we aim to give every great mind a fair
            chance — no matter where they are born or what they can afford.
          </p>

          <p className="font-semibold text-cf-science-blue">
            Even the smallest contribution can create lasting impact — because
            when many come together, change becomes possible.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
