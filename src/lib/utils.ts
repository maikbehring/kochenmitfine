import { clsx, type ClassValue } from "clsx";
import { writeFile } from "fs/promises";
import path from "path";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

export async function saveUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = path.join(process.cwd(), "public", "uploads", safeName);
  await writeFile(filePath, buffer);
  return `/uploads/${safeName}`;
}
