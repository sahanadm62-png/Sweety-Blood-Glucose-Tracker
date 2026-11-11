const pool = require("./config/db");
const bcrypt = require("bcrypt");

// Get today's date in Indian timezone
const getToday = () => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata"
    }).format(new Date());
};

// Calculate yesterday's date
const getYesterday = () => {
    const date = new Date(`${getToday()}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
};

const seedDatabase = async () => {
    try {
        console.log("Starting database seeding...");

        // Create sample user
        const passwordHash = await bcrypt.hash(
            "SweetySeed@123",
            12
        );

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email)
             DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [
                "Sweety Demo User",
                "seed@sweety-demo.com",
                passwordHash
            ]
        );

        const userId = userResult.rows[0].id;

        console.log("Sample user created successfully!");

        // Sample glucose readings
        const readings = [
            {
                date: getToday(),
                slot: "Morning fasting",
                value: 100
            },
            {
                date: getToday(),
                slot: "After breakfast",
                value: 140
            },
            {
                date: getToday(),
                slot: "After lunch",
                value: 120
            },
            {
                date: getToday(),
                slot: "After dinner",
                value: 130
            },
            {
                date: getYesterday(),
                slot: "Morning fasting",
                value: 105
            },
            {
                date: getYesterday(),
                slot: "After breakfast",
                value: 145
            }
        ];

        // Insert readings
        for (const reading of readings) {
            await pool.query(
                `INSERT INTO readings
                 (user_id, reading_date, slot, value)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, reading_date, slot)
                 DO UPDATE SET value = EXCLUDED.value`,
                [
                    userId,
                    reading.date,
                    reading.slot,
                    reading.value
                ]
            );
        }

        console.log("Sample readings inserted successfully!");
        console.log("Database seeding completed!");

        console.log("Demo login:");
        console.log("Email: seed@sweety-demo.com");
        console.log("Password: SweetySeed@123");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await pool.end();
    }
};

seedDatabase();