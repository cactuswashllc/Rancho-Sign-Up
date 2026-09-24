/**
 * Pre-built event themes. Every theme keeps the school's navy-and-white base;
 * a theme only changes the accent color, the banner motif, and a tagline.
 * Accents are used for decoration (banner pattern, progress bars, rules) —
 * text stays navy/white so contrast never depends on the theme.
 */
export type MotifKey =
  | "star"
  | "apple"
  | "leaf"
  | "pumpkin"
  | "snowflake"
  | "candle"
  | "lantern"
  | "heart"
  | "shamrock"
  | "flower"
  | "sun"
  | "mortarboard";

export interface Theme {
  key: string;
  name: string;
  /** Typical month(s), shown in the theme picker. */
  season: string;
  accent: string;
  /** Pale tint of the accent for backgrounds. */
  accentSoft: string;
  motif: MotifKey;
  tagline: string;
}

export const THEMES: readonly Theme[] = [
  {
    key: "classic",
    name: "Classic",
    season: "Any time",
    accent: "#8DA9C4",
    accentSoft: "#EEF3F8",
    motif: "star",
    tagline: "Thank you for supporting our students.",
  },
  {
    key: "back-to-school",
    name: "Back to School",
    season: "August",
    accent: "#B22234",
    accentSoft: "#FBEFF0",
    motif: "apple",
    tagline: "Welcome back — let's make it a great year.",
  },
  {
    key: "fall-festival",
    name: "Fall Festival",
    season: "October",
    accent: "#C0692B",
    accentSoft: "#FBF1E9",
    motif: "leaf",
    tagline: "Celebrate the season together.",
  },
  {
    key: "halloween",
    name: "Halloween",
    season: "October",
    accent: "#E8720C",
    accentSoft: "#FDF0E4",
    motif: "pumpkin",
    tagline: "Help us make the party spooktacular.",
  },
  {
    key: "thanksgiving",
    name: "Thanksgiving",
    season: "November",
    accent: "#9A5B2E",
    accentSoft: "#F7EFE8",
    motif: "leaf",
    tagline: "Grateful for our school community.",
  },
  {
    key: "winter-holidays",
    name: "Winter Holidays",
    season: "December",
    accent: "#2F7D5B",
    accentSoft: "#ECF5F0",
    motif: "snowflake",
    tagline: "Spreading cheer across campus.",
  },
  {
    key: "hanukkah",
    name: "Hanukkah",
    season: "December",
    accent: "#4A7FC1",
    accentSoft: "#EDF3FA",
    motif: "candle",
    tagline: "Celebrating the Festival of Lights.",
  },
  {
    key: "lunar-new-year",
    name: "Lunar New Year",
    season: "January – February",
    accent: "#C8102E",
    accentSoft: "#FCEDEF",
    motif: "lantern",
    tagline: "Wishing everyone good fortune in the new year.",
  },
  {
    key: "100th-day",
    name: "100th Day of School",
    season: "February",
    accent: "#6B4FA0",
    accentSoft: "#F2EEF8",
    motif: "star",
    tagline: "100 days smarter!",
  },
  {
    key: "valentines",
    name: "Valentine's Day",
    season: "February",
    accent: "#C2185B",
    accentSoft: "#FCEDF3",
    motif: "heart",
    tagline: "Sharing kindness with our classmates.",
  },
  {
    key: "st-patricks",
    name: "St. Patrick's Day",
    season: "March",
    accent: "#2E8B57",
    accentSoft: "#EAF6EF",
    motif: "shamrock",
    tagline: "Feeling lucky to be part of this community.",
  },
  {
    key: "spring",
    name: "Spring / Easter",
    season: "March – April",
    accent: "#D98BB5",
    accentSoft: "#FBF0F6",
    motif: "flower",
    tagline: "Spring into fun with us.",
  },
  {
    key: "teacher-appreciation",
    name: "Teacher Appreciation",
    season: "May",
    accent: "#B8862B",
    accentSoft: "#FAF4E8",
    motif: "apple",
    tagline: "Honoring the teachers who inspire us.",
  },
  {
    key: "field-day",
    name: "Field Day / End of Year",
    season: "May",
    accent: "#E0A100",
    accentSoft: "#FDF7E3",
    motif: "sun",
    tagline: "Finish the year strong — and have fun doing it.",
  },
  {
    key: "graduation",
    name: "Graduation",
    season: "May – June",
    accent: "#B8962E",
    accentSoft: "#FAF6EA",
    motif: "mortarboard",
    tagline: "Congratulations to our graduates.",
  },
] as const;

export const DEFAULT_THEME_KEY = "classic";

export function getTheme(key: string | null | undefined): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0]!;
}

export function isThemeKey(key: string): boolean {
  return THEMES.some((t) => t.key === key);
}
