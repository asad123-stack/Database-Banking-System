require("dotenv").config();

const bcrypt = require("bcryptjs");
const { connectDb } = require("./config/db");
const User = require("./models/User");
const Account = require("./models/Account");

async function seed() {
  await connectDb();

  const adminEmail = "admin@fraud.local";
  const customerEmail = "customer@fraud.local";
  const pass = await bcrypt.hash("Password123!", 10);

  const [admin, customer] = await Promise.all([
    User.findOneAndUpdate(
      { email: adminEmail },
      { fullName: "Admin User", email: adminEmail, passwordHash: pass, role: "admin" },
      { upsert: true, returnDocument: "after" },
    ),
    User.findOneAndUpdate(
      { email: customerEmail },
      { fullName: "Customer User", email: customerEmail, passwordHash: pass, role: "customer" },
      { upsert: true, returnDocument: "after" },
    ),
  ]);

  const existing = await Account.countDocuments({ userId: customer._id });
  if (existing === 0) {
    await Account.create([
      {
        userId: customer._id,
        accountNumber: "ACC-00000001",
        type: "checking",
        balance: 25000,
      },
      {
        userId: customer._id,
        accountNumber: "ACC-00000002",
        type: "savings",
        balance: 50000,
      },
    ]);
  }

  const adminAccountExists = await Account.countDocuments({ userId: admin._id });
  if (adminAccountExists === 0) {
    await Account.create({
      userId: admin._id,
      accountNumber: "ACC-99999999",
      type: "business",
      balance: 100000,
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete");
  process.exit(0);
}

seed();

