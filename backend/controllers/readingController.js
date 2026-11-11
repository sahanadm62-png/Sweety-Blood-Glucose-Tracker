const pool = require("../config/db");

// Allowed reading slots
const validSlots = [
    "Morning fasting",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// Create a new glucose reading
const createReading = async (req, res) => {
    try {
        const { reading_date, slot, value } = req.body;

        // Check required fields
        if (!reading_date || !slot || value === undefined || value === null) {
            return res.status(400).json({
                success: false,
                message: "Date, slot and glucose value are required."
            });
        }

        // Validate date format and actual calendar date
        if (
            typeof reading_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(reading_date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Date must be in YYYY-MM-DD format."
            });
        }

        const parsedDate = new Date(`${reading_date}T00:00:00Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date."
            });
        }

        // Prevent future dates
        const today = new Date().toISOString().slice(0, 10);

        if (reading_date > today) {
            return res.status(400).json({
                success: false,
                message: "Future dates are not allowed."
            });
        }

        // Validate reading slot
        if (!validSlots.includes(slot)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reading slot."
            });
        }

        // Validate glucose value
        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                success: false,
                message: "Glucose value must be an integer between 40 and 600 mg/dL."
            });
        }

        // Insert reading for logged-in user
        const result = await pool.query(
            `INSERT INTO readings (user_id, reading_date, slot, value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, reading_date, slot, value]
        );

        res.status(201).json({
            success: true,
            message: "Glucose reading added successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A reading already exists for this slot and date."
            });
        }

        console.error("Create reading error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while adding reading."
        });
    }
};
// Get all readings for the logged-in user
const getReadings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, reading_date, slot, value, created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch glucose readings."
        });
    }
};
// Update an existing glucose reading
const updateReading = async (req, res) => {
    try {
        const { id } = req.params;
        const { reading_date, slot, value } = req.body;

        const validSlots = [
            "Morning fasting",
            "After breakfast",
            "After lunch",
            "After dinner"
        ];

        // Validate required fields
        if (!reading_date || !slot || value === undefined || value === null) {
            return res.status(400).json({
                success: false,
                message: "Reading date, slot and value are required."
            });
        }

        // Validate date format and actual date
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const parsedDate = new Date(`${reading_date}T00:00:00Z`);

        if (
            !datePattern.test(reading_date) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date in YYYY-MM-DD format."
            });
        }

        // Prevent future dates (India time)
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        if (reading_date > today) {
            return res.status(400).json({
                success: false,
                message: "Future dates are not allowed."
            });
        }

        // Validate slot
        if (!validSlots.includes(slot)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reading slot."
            });
        }

        // Validate glucose value
        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                success: false,
                message: "Glucose value must be an integer between 40 and 600."
            });
        }

        // Update only the logged-in user's reading
        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1, slot = $2, value = $3
             WHERE id = $4 AND user_id = $5
             RETURNING id, user_id, reading_date, slot, value`,
            [reading_date, slot, value, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Reading not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Glucose reading updated successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A reading already exists for this date and slot."
            });
        }

        console.error("Update reading error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update glucose reading."
        });
    }
};
// Delete a glucose reading
const deleteReading = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Reading not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Glucose reading deleted successfully!"
        });

    } catch (error) {
        console.error("Delete reading error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete glucose reading."
        });
    }
};
// Get daily glucose report
const getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;

        // Use today's date in India if no date is provided
        const reportDate = date ||
            new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata"
            }).format(new Date());

        // Validate date format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const parsedDate = new Date(`${reportDate}T00:00:00Z`);

        if (
            !datePattern.test(reportDate) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== reportDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date in YYYY-MM-DD format."
            });
        }

        // Calculate daily statistics
        const stats = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value)::numeric, 1) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
            [req.user.id, reportDate]
        );

        // Get all readings for that day
        const readings = await pool.query(
            `SELECT id, reading_date, slot, value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE slot
                    WHEN 'Morning fasting' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [req.user.id, reportDate]
        );

        res.status(200).json({
            success: true,
            date: reportDate,
            report: stats.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error("Daily report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate daily report."
        });
    }
};
// Get Month-to-Date Report
const getMonthToDateReport = async (req, res) => {
    try {
        // Get today's date according to Indian time
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        // Calculate the first day of the current month
        const monthStart = today.substring(0, 7) + "-01";

        // Calculate monthly statistics
        const stats = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value)::numeric, 1) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date <= $3`,
            [req.user.id, monthStart, today]
        );

        // Get individual readings
        const readings = await pool.query(
            `SELECT id, reading_date, slot, value, created_at
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date <= $3
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id, monthStart, today]
        );

        res.status(200).json({
            success: true,
            period: "Month-to-Date",
            startDate: monthStart,
            endDate: today,
            report: stats.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error("Month-to-date report error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to generate month-to-date report."
        });
    }
};
// Get Previous Month Report
const getPreviousMonthReport = async (req, res) => {
    try {
        // Get today's date according to Indian time
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        const [year, month] = today.split("-").map(Number);

        // Calculate previous month's date range
        const currentMonthStart =
            `${year}-${String(month).padStart(2, "0")}-01`;

        const previousMonthStartDate = new Date(
            Date.UTC(year, month - 2, 1)
        );

        const previousMonthStart =
            previousMonthStartDate.toISOString().slice(0, 10);

        const previousMonthEndDate = new Date(
            Date.UTC(year, month - 1, 0)
        );

        const previousMonthEnd =
            previousMonthEndDate.toISOString().slice(0, 10);

        // Calculate statistics
        const stats = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value)::numeric, 1) AS average,
                COUNT(*) AS total_readings
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date < $3`,
            [req.user.id, previousMonthStart, currentMonthStart]
        );

        // Get individual readings
        const readings = await pool.query(
            `SELECT id, reading_date, slot, value, created_at
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date < $3
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id, previousMonthStart, currentMonthStart]
        );

        res.status(200).json({
            success: true,
            period: "Previous Month",
            startDate: previousMonthStart,
            endDate: previousMonthEnd,
            report: stats.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error("Previous month report error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to generate previous month report."
        });
    }
};
module.exports = { createReading, getReadings, updateReading, deleteReading, getDailyReport, getMonthToDateReport, getPreviousMonthReport };