import bcrypt from "bcrypt";
import User from "../models/UserModel";
import sequelize from "../connections/db";

const seedAdmin = async () => {
  await sequelize.authenticate();

  const existing = await User.findOne({
    where: { email: "tekdhami49@test.com" },
  });

  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("tek@1234", 10);

  await User.create({
    firstName: "Tek",
    lastName: "Dhami",
    email: "tekdhami49@test.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin created successfully");
  process.exit(0);
};

seedAdmin();
