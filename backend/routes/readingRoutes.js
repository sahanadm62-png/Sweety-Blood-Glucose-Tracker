const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
    createReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport

} = require("../controllers/readingController");

// Protected route: Add glucose reading
router.post("/", authMiddleware, createReading);

// Protected route: Get all glucose readings
router.get("/", authMiddleware, getReadings);

// Protected route: Update a glucose reading
router.put("/:id", authMiddleware, updateReading);

// Delete a glucose reading
router.delete("/:id", authMiddleware, deleteReading);
// Get daily glucose report
router.get("/daily-report", authMiddleware, getDailyReport);
// Get month-to-date glucose report
router.get("/month-to-date-report", authMiddleware, getMonthToDateReport);
// Get previous month glucose report
router.get("/previous-month-report", authMiddleware, getPreviousMonthReport);

module.exports = router;