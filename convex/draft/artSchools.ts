export type School = {
  name: string;
  lineage: string;
  light: string;
  palette: string;
};

export const SCHOOLS: School[] = [
  {
    name: "Weird tales",
    lineage:
      "1930s weird-fiction magazine covers, in the spirit of Margaret Brundage and Hannes Bok: stylised figures, chalky pastel and gouache, an eerie stillness",
    light: "soft and even, with one gentle glow of coloured light from an unseen source",
    palette: "dusty rose, pale jade, and cream against a flat field of deep teal or plum",
  },
  {
    name: "Sword and planet",
    lineage:
      "sword-and-planet paperback covers, in the spirit of J. Allen St. John, Roy Krenkel and Frank Frazetta: loose brushy oils, murky backgrounds, edges that dissolve into the paint",
    light: "a warm light on the subject against a dim, smoky background, most of the picture left in soft shadow",
    palette: "raw umber, olive, and ochre, with a small touch of dull red",
  },
  {
    name: "Newsstand pulp",
    lineage:
      "lurid newsstand pulp covers, in the spirit of Norman Saunders and Earle Bergey: bold simple shapes, poster-like colour, a flat single-colour backdrop",
    light: "flat and bright like a poster, with simple hard-edged shadows",
    palette: "cadmium yellow, tomato red, and black, with one cool blue-green",
  },
  {
    name: "Surreal paperback",
    lineage:
      "surreal science-fantasy paperback covers of the 1950s and 60s, in the spirit of Richard Powers: strange simplified forms, empty space, smooth dreamlike gradients",
    light: "diffuse and sourceless, with slow gradients across large empty areas",
    palette: "mustard, rust, and sea green fading into a pale, washed-out sky",
  },
  {
    name: "Quiet fantasy",
    lineage:
      "moody 1970s fantasy paperback covers, in the spirit of Jeffrey Catherine Jones: thin tonal paint, quiet poses, shapes half lost in mist",
    light: "overcast and hazy, low contrast, the subject a soft silhouette against a lighter ground",
    palette: "grey-green, tan, and muted violet, close in value",
  },
  {
    name: "Gadget age",
    lineage:
      "1920s scientifiction magazine covers, in the spirit of Frank R. Paul: naive, stiff little figures, toy-like machines and towers, everything drawn with earnest clarity",
    light: "bright and shadowless, like a tinted diagram",
    palette: "flat lemon yellow, brick red, and sky blue",
  },
  {
    name: "Digest covers",
    lineage:
      "1950s science fiction digest covers, in the spirit of Ed Emshwiller and Kelly Freas: characterful faces, a touch of humour, casual painterly gouache",
    light: "warm and friendly, with a soft spotlight on the subject",
    palette: "pumpkin orange, turquoise, and warm grey",
  },
  {
    name: "Ace paperback",
    lineage:
      "1960s double-novel paperback covers, in the spirit of Jack Gaughan: sketchy ink line under loose washes, half abstract, jagged decorative shapes",
    light: "patchy, with washes of colour standing in for light and shade",
    palette: "magenta, orange, and ink black on off-white paper",
  },
  {
    name: "Luminous futures",
    lineage:
      "1970s science fiction paperback covers, in the spirit of Paul Lehr: smooth egg and dome shapes, tiny figures, soft glowing horizons",
    light: "a low glowing horizon, with everything else in smooth soft shade",
    palette: "deep cobalt and violet with one band of hot orange",
  },
  {
    name: "Dry brush",
    lineage:
      "1960s magazine science fiction illustration, in the spirit of John Schoenherr: scratchy dry-brush texture, weathered creatures, wind-worn rock",
    light: "harsh overhead daylight bleached by dust",
    palette: "sand, bone white, and burnt sienna, with a hard blue shadow",
  },
  {
    name: "Slab brush",
    lineage:
      "loose painterly science fiction covers, in the spirit of John Berkey: broad slabs of paint, forms built from a handful of strokes, nothing outlined",
    light: "bright specular flashes on a few edges, the rest merging into shadow",
    palette: "chalk white, steel blue, and a streak of orange",
  },
  {
    name: "Whimsical ink",
    lineage:
      "1940s fantasy magazine illustration, in the spirit of Edd Cartier: bouncy brush-and-ink line, mischievous gnomes and beasts, light watercolour tint",
    light: "simple, with a few dark ink shadows grounding the figure",
    palette: "black ink with washes of sepia, moss green, and faded red",
  },
  {
    name: "Macabre scratch",
    lineage:
      "macabre weird-fiction illustration, in the spirit of Lee Brown Coye: gaunt crooked figures, scratchy cross-hatching, an unsettling folk-art awkwardness",
    light: "dim and sickly, as if by a single candle",
    palette: "bone, soot black, and a stain of dull green",
  },
  {
    name: "Storybook map",
    lineage:
      "mid-century children's fantasy illustration, in the spirit of Pauline Baynes: small neat figures, flattened perspective like a medieval miniature, decorative patterning",
    light: "even and clear, with no cast shadows",
    palette: "heraldic red, blue, and gold on parchment",
  },
  {
    name: "Fairy-tale gouache",
    lineage:
      "golden age fairy-tale books, in the spirit of Kay Nielsen and Edmund Dulac: elongated elegant figures, large quiet areas of night sky, delicate ornament used sparingly",
    light: "moonlit, with a soft pearly glow on pale shapes",
    palette: "midnight blue, pearl grey, and small points of gold",
  },
  {
    name: "Gnarled wash",
    lineage:
      "Edwardian fairy-tale illustration, in the spirit of Arthur Rackham: wiry ink line, twisted roots and branches, thin tea-coloured watercolour",
    light: "grey and wintry, flat and diffuse",
    palette: "sepia, grey-brown, and faded olive",
  },
  {
    name: "Folk-tale outline",
    lineage:
      "Russian folk-tale illustration, in the spirit of Ivan Bilibin: firm black outlines, flat fills, stylised trees and clouds like a woodcut",
    light: "flat, with no modelling at all",
    palette: "ochre, madder red, forest green, and black outline",
  },
  {
    name: "Decadent black and white",
    lineage:
      "fin-de-siècle book illustration, in the spirit of Aubrey Beardsley and Harry Clarke: stark black and white masses, sinuous line, elegant and sinister",
    light: "none: pure black shapes against white",
    palette: "black and ivory, with at most one flat accent of red",
  },
  {
    name: "Dunsany gloom",
    lineage:
      "Edwardian weird fantasy illustration, in the spirit of Sidney Sime: murky monochrome wash, small odd creatures in huge dim spaces, dry humour",
    light: "a faint glow in deep gloom",
    palette: "charcoal, grey-brown, and a pale smoky yellow",
  },
  {
    name: "Rulebook ink",
    lineage:
      "1970s role-playing rulebook illustration, in the spirit of David A. Trampier and David C. Sutherland III: bold black ink, heavy outlines, earnest amateur energy",
    light: "hard black shadows, as in a woodcut",
    palette: "black ink with one or two flat spot colours, like cheap two-colour printing",
  },
  {
    name: "Early card game",
    lineage:
      "the first collectible card game art of the early 1990s, in the spirit of Quinton Hoover and Christopher Rush: clean ink outline, flat bright colour, simple gradients, a plain backdrop",
    light: "simple and frontal, with a soft gradient behind the subject",
    palette: "clear primary colours on a plain gradient of blue or violet",
  },
  {
    name: "Eighties paperback",
    lineage:
      "1980s fantasy paperback covers, in the spirit of Darrell K. Sweet: bright, plainly painted, slightly stiff figures in tidy costume, sunny outdoor scenes",
    light: "clear midday sun, cheerful and even",
    palette: "grass green, sky blue, and russet brown",
  },
  {
    name: "Historical gouache",
    lineage:
      "illustrated history and gaming books, in the spirit of Angus McBride: matte gouache, weathered travellers and soldiers observed plainly, as if from life",
    light: "overcast natural daylight",
    palette: "muddy green, leather brown, and dull steel",
  },
  {
    name: "Horror comic",
    lineage:
      "1950s horror comic covers, in the spirit of Graham Ingels and Johnny Craig: heavy brush inking, exaggerated ghoulish faces, flat printed colour with visible dots",
    light: "lit from below, with thick black shadows",
    palette: "sickly green, purple, and yellow, with solid black",
  },
  {
    name: "Clear line",
    lineage:
      "European science-fantasy comics of the 1970s, in the spirit of Moebius: thin even line, flat colour, wide empty ground, a calm deadpan strangeness",
    light: "shadowless desert daylight",
    palette: "pale pink, turquoise, and sand yellow",
  },
  {
    name: "Polish poster",
    lineage:
      "the Polish poster school, in the spirit of Franciszek Starowieyski and Jan Lenica: one strange hand-painted emblem, distorted anatomy, thick expressive outline",
    light: "none to speak of; flat poster shapes",
    palette: "black, off-white, and one strong colour such as blood orange",
  },
  {
    name: "Warrior print",
    lineage:
      "Japanese woodblock prints of warriors and monsters, in the spirit of Utagawa Kuniyoshi: flowing outline, flat colour blocks, patterned cloth, stylised waves and smoke",
    light: "flat, with soft graded bands of colour in the sky",
    palette: "indigo, vermilion, and soft grey on cream paper",
  },
  {
    name: "Bestiary margin",
    lineage:
      "medieval bestiaries and manuscript marginalia: wobbly outlined creatures drawn by someone who has never seen one, flat tints, no perspective",
    light: "none: flat pigment on vellum",
    palette: "red lead, verdigris green, and brown ink on yellowed vellum",
  },
];

export const pickSchool = (roll: number): School =>
  SCHOOLS[Math.min(SCHOOLS.length - 1, Math.floor(roll * SCHOOLS.length))];
