import prismaPkg from "@prisma/client";
import bcrypt from "bcrypt";

const { PrismaClient, Role } = prismaPkg;
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "fine@kochenmitfine.de";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "FineAdmin123!";
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { username: "Fine", role: Role.ADMIN, password: hash },
    create: {
      email: adminEmail,
      username: "Fine",
      role: Role.ADMIN,
      password: hash,
    },
  });

  await prisma.menuCombo.upsert({
    where: { id: "starter-main-dessert" },
    update: {},
    create: {
      id: "starter-main-dessert",
      name: "Drei-Gänge-Menü",
      description: "Vorspeise, Hauptgang und Dessert",
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
