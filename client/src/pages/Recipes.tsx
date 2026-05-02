import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Clock, Users } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type Recipe = {
  slug: string;
  name: string;
  tagline: string;
  servings: string;
  time: string;
  image: string;
  ingredients: string[];
  steps: string[];
};

const RECIPES: Recipe[] = [
  {
    slug: "classic-zobo-mocktail",
    name: "Classic Zobo Mocktail",
    tagline: "The cleanest way to enjoy KEMZOBO — just ice, lime, and a sprig of mint.",
    servings: "1 glass",
    time: "2 min",
    image: "/images/gallery%205.jpeg",
    ingredients: [
      "1 can (16 fl oz) KEMZOBO Original Zobo, chilled",
      "Ice cubes",
      "1/2 lime, sliced",
      "Fresh mint sprig",
    ],
    steps: [
      "Fill a tall glass with ice.",
      "Pour KEMZOBO over the top until the glass is three-quarters full.",
      "Squeeze in half a lime and drop the spent rind into the glass.",
      "Garnish with a fresh mint sprig and serve immediately.",
    ],
  },
  {
    slug: "hibiscus-margarita",
    name: "Hibiscus Margarita",
    tagline: "Tequila + KEMZOBO + lime. Bright, balanced, and ready for the patio.",
    servings: "1 cocktail",
    time: "5 min",
    image: "/images/gallery%201.jpeg",
    ingredients: [
      "1 1/2 oz tequila blanco",
      "4 oz KEMZOBO Original Zobo, chilled",
      "1 oz fresh lime juice",
      "1/2 oz orange liqueur (optional)",
      "Ice + flaky sea salt for the rim",
    ],
    steps: [
      "Run a lime wedge around the rim of a rocks glass and dip in flaky salt.",
      "Fill the glass with ice.",
      "Add tequila, lime juice, and orange liqueur. Stir briefly.",
      "Top with chilled KEMZOBO and stir once more. Garnish with a lime wheel.",
    ],
  },
  {
    slug: "zobo-spritz",
    name: "Zobo Spritz",
    tagline: "An effortless Friday-night sipper — equal parts bubbly, hibiscus, and citrus.",
    servings: "1 spritz",
    time: "3 min",
    image: "/images/gallery%202.jpeg",
    ingredients: [
      "3 oz KEMZOBO Original Zobo, chilled",
      "3 oz dry sparkling wine (prosecco or cava)",
      "1 oz soda water",
      "Orange peel for garnish",
      "Ice",
    ],
    steps: [
      "Fill a wine glass two-thirds with ice.",
      "Pour in KEMZOBO, then sparkling wine, then soda water.",
      "Express an orange peel over the glass and drop it in. Stir once gently.",
    ],
  },
  {
    slug: "zobo-slushie",
    name: "Frozen Zobo Slushie",
    tagline: "Pour, freeze, blend. The cookout drink that disappears in five minutes.",
    servings: "2 glasses",
    time: "10 min + freeze",
    image: "/images/gallery%204.jpeg",
    ingredients: [
      "1 can (16 fl oz) KEMZOBO Original Zobo",
      "1 cup ice cubes",
      "1 tbsp simple syrup or honey (optional, to taste)",
      "Lime wedges",
    ],
    steps: [
      "Pour KEMZOBO into a freezer-safe shallow tray and freeze for 2-3 hours, until slushy but not solid.",
      "Scoop the slush into a blender, add the ice and simple syrup, and pulse until smooth.",
      "Pour into chilled glasses, squeeze a lime wedge over each, and serve with a wide straw.",
    ],
  },
  {
    slug: "warm-hibiscus-toddy",
    name: "Warm Hibiscus Toddy",
    tagline: "Cool-night comfort with ginger, honey, and a twist of lemon.",
    servings: "1 mug",
    time: "5 min",
    image: "/images/gallery%203.jpeg",
    ingredients: [
      "1 can (16 fl oz) KEMZOBO Original Zobo",
      "1 thin slice fresh ginger",
      "1 cinnamon stick",
      "1 tbsp honey",
      "1 lemon wedge",
    ],
    steps: [
      "Pour KEMZOBO into a small saucepan with the ginger and cinnamon stick.",
      "Warm gently over low heat for 4-5 minutes — do not boil.",
      "Stir in honey until dissolved. Pour into a mug, squeeze in a lemon wedge, and serve.",
    ],
  },
];

export default function Recipes() {
  return (
    <div>
      <PageMeta
        title="Recipes"
        description="Five ways to make the most of KEMZOBO Original Zobo — mocktails, cocktails, spritzes, and a frozen slushie."
        path="/recipes"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "KEMZOBO recipes",
          itemListElement: RECIPES.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: r.name,
            url: `https://kemzobo.com/recipes#${r.slug}`,
          })),
        }}
      />

      {/* Header */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] mb-4">
            Recipes
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How to make every can count
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Five quick ways to serve KEMZOBO — straight, mixed, frozen, warm, or somewhere in
            between. Each one takes 5 minutes or less.
          </p>
        </div>
      </section>

      {/* Recipes */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="space-y-16 lg:space-y-24">
          {RECIPES.map((r, i) => (
            <motion.article
              key={r.slug}
              id={r.slug}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Image */}
              <div className="rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-[3/4] ring-1 ring-[#CC2936]/10 shadow-lg shadow-black/5">
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="lg:pt-6">
                <p className="text-[#CC2936] text-xs uppercase tracking-[0.3em] font-bold mb-3">
                  Recipe {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
                  {r.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-5">{r.tagline}</p>

                <div className="flex items-center gap-5 text-xs uppercase tracking-wider font-bold text-muted-foreground mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {r.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {r.servings}
                  </span>
                </div>

                <div className="rounded-xl bg-white border border-[#CC2936]/10 p-5 mb-4">
                  <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2">
                    Ingredients
                  </p>
                  <ul className="space-y-1.5 text-sm text-foreground/85">
                    {r.ingredients.map((ing) => (
                      <li key={ing} className="flex gap-2">
                        <span className="text-[#CC2936]">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-white border border-[#CC2936]/10 p-5">
                  <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2">
                    Steps
                  </p>
                  <ol className="space-y-2 text-sm text-foreground/85">
                    {r.steps.map((step, n) => (
                      <li key={step} className="flex gap-3">
                        <span className="font-display font-bold text-[#CC2936] flex-shrink-0 w-5">
                          {n + 1}.
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#CC2936] text-white text-center py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Ready to make one?</h2>
          <p className="text-white/85 mb-8">Stock up on cans — case discounts kick in at 24+.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white text-[#CC2936] px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
