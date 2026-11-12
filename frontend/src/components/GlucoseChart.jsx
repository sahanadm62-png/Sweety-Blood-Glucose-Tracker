import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function GlucoseChart({ readings }) {

    const chartData = [...readings]
        .sort((a, b) =>
            new Date(a.reading_date) - new Date(b.reading_date)
        )
        .map((reading) => ({
            date: String(reading.reading_date).slice(0, 10),
            slot: reading.slot,
            glucose: reading.value
        }));

    return (
        <section className="chart-section">

            <h2>Glucose Trend</h2>

            {chartData.length === 0 ? (
                <p>Add readings to see your glucose trend.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="date"
                            angle={-20}
                            textAnchor="end"
                            height={60}
                        />

                        <YAxis
                            domain={["auto", "auto"]}
                            label={{
                                value: "mg/dL",
                                angle: -90,
                                position: "insideLeft"
                            }}
                        />

                        <Tooltip
                            formatter={(value) => [`${value} mg/dL`, "Glucose"]}
                            labelFormatter={(label) => `Date: ${label}`}
                        />

                        <Line
                            type="monotone"
                            dataKey="glucose"
                            stroke="#07877e"
                            strokeWidth={3}
                            activeDot={{ r: 7 }}
                        />

                    </LineChart>
                </ResponsiveContainer>
            )}

        </section>
    );
}

export default GlucoseChart;