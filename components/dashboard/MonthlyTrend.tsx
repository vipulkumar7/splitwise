// components/dashboard/MonthlyTrend.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function MonthlyTrend({ expenses }: any) {
    const monthly = expenses.reduce((acc: any, e: any) => {
        const month = new Date(e.createdAt).toLocaleString("default", {
            month: "short",
        });

        acc[month] = (acc[month] || 0) + e.amount;
        return acc;
    }, {});

    const data = Object.keys(monthly).map((m) => ({
        month: m,
        amount: monthly[m],
    }));

    return (
        <div className="mt-6">
            <h2 className="font-semibold mb-2">Monthly Trend</h2>

            <LineChart width={350} height={250} data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="amount"
                    isAnimationActive={true}
                    animationDuration={800}
                />
            </LineChart>
        </div>
    );
}