import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const images = [
  { src: "/images/hero-can.png", alt: "KEMZOBO can and glass", span: "col-span-2 row-span-2" },
  { src: "/images/lifestyle-friends.jpg", alt: "Friends sharing KEMZOBO", span: "col-span-1 row-span-1" },
  { src: "/images/tropical-glass.jpg", alt: "KEMZOBO in tropical setting", span: "col-span-1 row-span-1" },
  { src: "/images/heritage-glass.jpg", alt: "KEMZOBO with traditional elements", span: "col-span-1 row-span-1" },
  { src: "/images/bar-glass.jpg", alt: "KEMZOBO at a bar", span: "col-span-1 row-span-1" },
];

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="text-center mb-14">
        <p className="text-hibiscus text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Lifestyle
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
          KEMZOBO in the Wild
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          From cookouts to celebrations — see how KEMZOBO fits into real-life moments.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[250px]">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className={`${img.span} rounded-xl overflow-hidden`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
