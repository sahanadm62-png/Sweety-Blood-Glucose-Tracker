import { useState } from "react";
import API from "../services/api";

function ReadingForm({ onReadingAdded }) {

    // Get today's date in local timezone
    const getToday = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();

        return new Date(today.getTime() - offset * 60000)
            .toISOString()
            .slice(0, 10);
    };

    const [formData, setFormData] = useState({
        reading_date: getToday(),
        slot: "",
        value: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Submit glucose reading
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const glucoseValue = Number(formData.value);

        if (!formData.slot || !formData.reading_date || formData.value === "") {
            setError("Please fill in all fields.");
            return;
        }

        if (!Number.isInteger(glucoseValue) ||
            glucoseValue < 40 ||
            glucoseValue > 600) {
            setError("Enter a whole number between 40 and 600 mg/dL.");
            return;
        }

        setLoading(true);

        try {
            const response = await API.post("/readings", {
                ...formData,
                value: glucoseValue
            });

            if (response.data.success) {
                setSuccess("Glucose reading saved successfully!");

                setFormData({
                    reading_date: getToday(),
                    slot: "",
                    value: ""
                });

                onReadingAdded();
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save reading. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reading-form-card">

            <h2>Add Glucose Reading</h2>

            <form onSubmit={handleSubmit}>

                <label>Reading Date</label>

                <input
                    type="date"
                    name="reading_date"
                    value={formData.reading_date}
                    max={getToday()}
                    onChange={handleChange}
                    required
                />

                <label>Reading Slot</label>

                <select
                    name="slot"
                    value={formData.slot}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a reading slot</option>
                    <option value="Morning fasting">Morning fasting</option>
                    <option value="After breakfast">After breakfast</option>
                    <option value="After lunch">After lunch</option>
                    <option value="After dinner">After dinner</option>
                </select>

                <label>Glucose Value (mg/dL)</label>

                <input
                    type="number"
                    name="value"
                    placeholder="Enter value (40–600)"
                    min="40"
                    max="600"
                    step="1"
                    value={formData.value}
                    onChange={handleChange}
                    required
                />

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {success && (
                    <div className="success-message">{success}</div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Reading"}
                </button>

            </form>

        </div>
    );
}

export default ReadingForm;