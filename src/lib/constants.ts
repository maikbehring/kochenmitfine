import { RecipeCategory } from "@prisma/client";

export const categoryLabels: Record<RecipeCategory, string> = {
  MAIN: "Hauptspeise",
  SIDE: "Beilage",
  SOUP: "Suppe",
  DESSERT: "Nachspeise",
  SNACK: "Snack",
};

export const categories = Object.keys(categoryLabels) as RecipeCategory[];
