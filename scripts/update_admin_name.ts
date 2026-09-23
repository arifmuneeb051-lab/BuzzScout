import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Supabase to update user display name...");
  try {
    const updated = await prisma.user.update({
      where: { email: "arifmuneeb81@gmail.com" },
      data: { name: "Muneeb" },
    });
    console.log("SUCCESS! User updated:", updated.name, updated.email);
  } catch (err) {
    console.error("Error updating user:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
