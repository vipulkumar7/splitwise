// components/dashboard/SpendingPieChart.tsx

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function SpendingPieChart({ expenses }: any) {
    const data = Object.values(
        expenses.reduce((acc: any, e: any) => {
            const name = e.paidBy?.name || e.paidBy?.email;
            acc[name] = (acc[name] || 0) + e.amount;
            return acc;
        }, {})
    ).map((value: any, i) => ({
        name: Object.keys(
            expenses.reduce((acc: any, e: any) => {
                const name = e.paidBy?.name || e.paidBy?.email;
                acc[name] = true;
                return acc;
            }, {})
        )[i],
        value,
    }));

    return (
        <div className="mt-6">
            <h2 className="font-semibold mb-2">Spending Distribution</h2>

            <PieChart width={300} height={250}>
                <Pie
                    data={data}
                    dataKey="value"
                    outerRadius={80}
                    isAnimationActive={true}
                />
                <Tooltip />
            </PieChart>
        </div>
    );
}