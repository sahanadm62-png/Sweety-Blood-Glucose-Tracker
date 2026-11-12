import { useState } from "react";
import API from "../services/api";

function Reports() {
    const getToday = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();

        return new Date(today.getTime() - offset * 60000)
            .toISOString()
            .slice(0, 10);
    };

    const [reportType, setReportType] = useState("daily");
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [report, setReport] = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchReport = async (type = reportType, date = selectedDate) => {
        setLoading(true);
        setError("");
        setReport(null);
        setReadings([]);

        try {
            let response;

            if (type === "daily") {
                response = await API.get(
                    `/readings/daily-report?date=${date}`
                );
            } else if (type === "month") {
                response = await API.get(
                    "/readings/month-to-date-report"
                );
            } else {
                response = await API.get(
                    "/readings/previous-month-report"
                );
            }

            setReport(response.data.report);
            setReadings(response.data.readings || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load report."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReportChange = (type) => {
        setReportType(type);
        fetchReport(type);
    };

    return (
        <section className="reports-section">

            <h2>Glucose Reports</h2>

            <div className="report-buttons">

                <button onClick={() => handleReportChange("daily")}>
                    Daily Report
                </button>

                <button onClick={() => handleReportChange("month")}>
                    Month-to-Date
                </button>

                <button onClick={() => handleReportChange("previous")}>
                    Previous Month
                </button>

            </div>

            {reportType === "daily" && (
                <div className="report-date">
                    <label>Select Date</label>

                    <input
                        type="date"
                        value={selectedDate}
                        max={getToday()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />

                    <button onClick={() => fetchReport("daily", selectedDate)}>
                        View Report
                    </button>
                </div>
            )}

            {loading && <p>Loading report...</p>}

            {error && (
                <div className="error-message">{error}</div>
            )}

            {report && !loading && (
                <>
                    <div className="report-cards">

                        <div className="report-card">
                            <h3>Highest</h3>
                            <p>{report.highest ?? "N/A"}</p>
                            <span>mg/dL</span>
                        </div>

                        <div className="report-card">
                            <h3>Lowest</h3>
                            <p>{report.lowest ?? "N/A"}</p>
                            <span>mg/dL</span>
                        </div>

                        <div className="report-card">
                            <h3>Average</h3>
                            <p>{report.average ?? "N/A"}</p>
                            <span>mg/dL</span>
                        </div>

                        <div className="report-card">
                            <h3>Total Readings</h3>
                            <p>{report.total_readings}</p>
                        </div>

                    </div>

                    <h3 className="report-list-title">
                        Reading History
                    </h3>

                    {readings.length === 0 ? (
                        <p>No readings found for this period.</p>
                    ) : (
                        <div className="readings-list">

                            {readings.map((reading) => (
                                <div
                                    className="reading-card"
                                    key={reading.id}
                                >
                                    <h3>{reading.slot}</h3>

                                    <h2>{reading.value} mg/dL</h2>

                                    <p>
                                        Date:{" "}
                                        {String(reading.reading_date).slice(0, 10)}
                                    </p>
                                </div>
                            ))}

                        </div>
                    )}

                </>
            )}

        </section>
    );
}

export default Reports;