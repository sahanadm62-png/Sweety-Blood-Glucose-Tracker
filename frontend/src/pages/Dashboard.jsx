import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ReadingForm from "../components/ReadingForm";
import Reports from "../components/Reports";
import GlucoseChart from "../components/GlucoseChart";


function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({
        reading_date: "",
        slot: "",
        value: ""
    });

    const getToday = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();

        return new Date(today.getTime() - offset * 60000)
            .toISOString()
            .slice(0, 10);
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!token || !savedUser) {
            navigate("/login");
            return;
        }

        setUser(JSON.parse(savedUser));
        fetchReadings();
    }, []);

    const fetchReadings = async () => {
        try {
            const response = await API.get("/readings");
            setReadings(response.data.readings || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load readings."
            );
        } finally {
            setLoading(false);
        }
    };

    // Start editing a reading
    const handleEditClick = (reading) => {
        setEditingId(reading.id);

        setEditForm({
            reading_date: String(reading.reading_date).slice(0, 10),
            slot: reading.slot,
            value: reading.value
        });

        setError("");
    };

    // Handle edit form changes
    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    // Save updated reading
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        const glucoseValue = Number(editForm.value);

        if (
            !Number.isInteger(glucoseValue) ||
            glucoseValue < 40 ||
            glucoseValue > 600
        ) {
            setError("Enter a whole number between 40 and 600 mg/dL.");
            return;
        }

        try {
            await API.put(`/readings/${editingId}`, {
                ...editForm,
                value: glucoseValue
            });

            setEditingId(null);

            alert("Reading updated successfully!");

            await fetchReadings();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update reading."
            );
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingId(null);
        setError("");
    };

    // Delete a reading
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this reading?"
        );

        if (!confirmDelete) return;

        try {
            await API.delete(`/readings/${id}`);

            alert("Reading deleted successfully!");

            await fetchReadings();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete reading."
            );
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return <h2>Loading your dashboard...</h2>;
    }

    return (
        <div className="dashboard-container">

            <header className="dashboard-header">
                <div>
                    <h1>Sweety</h1>
                    <p>Your Blood Glucose Tracker</p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <section className="welcome-section">
                <h2>Welcome, {user?.name}!</h2>

                <p>
                    Keep track of your health, one reading at a time.
                </p>
            </section>

            <section>
                <ReadingForm onReadingAdded={fetchReadings} />
            </section>

            <section className="readings-section">
                <h2>Your Glucose Readings</h2>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {readings.length === 0 ? (
                    <p>
                        No readings available. Start by adding your first reading!
                    </p>
                ) : (
                    <div className="readings-list">

                        {readings.map((reading) => (
                            <div
                                className="reading-card"
                                key={reading.id}
                            >

                                {editingId === reading.id ? (

                                    <form onSubmit={handleUpdate}>

                                        <h3>Edit Reading</h3>

                                        <label>Reading Date</label>

                                        <input
                                            type="date"
                                            name="reading_date"
                                            value={editForm.reading_date}
                                            max={getToday()}
                                            onChange={handleEditChange}
                                            required
                                        />

                                        <label>Reading Slot</label>

                                        <select
                                            name="slot"
                                            value={editForm.slot}
                                            onChange={handleEditChange}
                                            required
                                        >
                                            <option value="Morning fasting">
                                                Morning fasting
                                            </option>

                                            <option value="After breakfast">
                                                After breakfast
                                            </option>

                                            <option value="After lunch">
                                                After lunch
                                            </option>

                                            <option value="After dinner">
                                                After dinner
                                            </option>
                                        </select>

                                        <label>Glucose Value (mg/dL)</label>

                                        <input
                                            type="number"
                                            name="value"
                                            min="40"
                                            max="600"
                                            step="1"
                                            value={editForm.value}
                                            onChange={handleEditChange}
                                            required
                                        />

                                        <button type="submit">
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>

                                    </form>

                                ) : (

                                    <>
                                        <h3>{reading.slot}</h3>

                                        <h2>{reading.value} mg/dL</h2>

                                        <p>
                                            Date:{" "}
                                            {String(reading.reading_date).slice(0, 10)}
                                        </p>

                                        <button
                                              className="edit-button"
                                              onClick={() => handleEditClick(reading)}
                                          >
                                           Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(reading.id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </>

                                )}

                            </div>
                        ))}

                    </div>
                )}
            </section>
            {/* Glucose Trend Chart */}
            <GlucoseChart readings={readings} />
            <Reports />
        </div>
    );
}

export default Dashboard;