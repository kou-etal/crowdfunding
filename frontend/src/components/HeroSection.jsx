


export function HeroSection() {
  return (
    <section className="relative h-screen bg-lumina-light-gray flex items-center justify-center text-center overflow-hidden">
  <img
    src="/images/mainvisual.png"
    alt="Hero Image"
    className="absolute inset-0 w-full h-full object-cover opacity-80"
  />
  <div className="absolute inset-0 bg-black opacity-30"></div>

  <div className="relative z-10 text-white px-4">
    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-2xl tracking-tight">
      Break Financial Barriers,<br className="hidden md:block" />
      Fuel Scientific Dreams
    </h1>
    <p className="mt-6 text-xl md:text-2xl font-light max-w-2xl mx-auto drop-shadow-lg leading-normal">
      Connecting underfunded researchers with a global community.<br />
      Even the smallest support can unlock the next breakthrough.
    </p>
  </div>
</section>

   
    );
}