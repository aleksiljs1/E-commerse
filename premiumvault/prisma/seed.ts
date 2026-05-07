import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("aleks00110011", 12);

  const adminUsers = [
    { email: "legendx27@gmail.com", name: "Legend" },
    { email: "aleks@gmail.com", name: "Aleks" },
    { email: "drini@mail.com", name: "Drini" },
  ];

  for (const admin of adminUsers) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  }

  const products = [
    {
      title: "Spotify Premium — Personal",
      description:
        "Upgrade your Spotify account to Premium. Ad-free listening, offline downloads, high quality audio. Submit your Spotify email and password after purchase. Your account will be upgraded within 4–5 days.",
      price: 9.99,
      stock: 50,
      serviceType: "spotify",
      featured: true,
      logoUrl: null,
    },
    {
      title: "Netflix Standard — Personal",
      description:
        "Upgrade your Netflix account to Standard plan (1080p HD, 2 screens). Submit your Netflix email and password after purchase. Your account will be upgraded within 4–5 days.",
      price: 14.99,
      stock: 30,
      serviceType: "netflix",
      featured: true,
      logoUrl: null,
    },
    {
      title: "YouTube Premium — Personal",
      description:
        "Upgrade your YouTube account to Premium. Ad-free videos, background play, YouTube Music included. Submit your Google email and password after purchase. Upgraded within 4–5 days.",
      price: 11.99,
      stock: 40,
      serviceType: "youtube",
      featured: true,
      logoUrl: null,
    },
    {
      title: "Disney+ Standard — Personal",
      description:
        "Upgrade your Disney+ account to Standard (ad-free). Access to all Disney, Marvel, Star Wars and Pixar content. Submit credentials after purchase. Upgraded within 4–5 days.",
      price: 7.99,
      stock: 20,
      serviceType: "disney",
      featured: false,
      logoUrl: null,
    },
    {
      title: "Apple Music — Personal",
      description:
        "Upgrade your Apple Music account to Individual plan. 100 million songs ad-free, lossless audio, Dolby Atmos spatial audio. Submit credentials after purchase.",
      price: 10.99,
      stock: 25,
      serviceType: "applemusic",
      featured: false,
      logoUrl: null,
    },
  ];

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    for (const product of products) {
      await prisma.product.create({ data: { ...product, active: true } });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
