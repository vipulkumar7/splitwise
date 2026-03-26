export default function Insights({ expenses }: any) {
    if (!expenses.length) return null;

    const categoryMap: any = {};

    expenses.forEach((e: any) => {
        const key = e.description.toLowerCase();
        categoryMap[key] = (categoryMap[key] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryMap).sort(
        (a: any, b: any) => b[1] - a[1]
    )[0];

    const userMap: any = {};

    expenses.forEach((e: any) => {
        const name = e.paidBy?.email;
        userMap[name] = (userMap[name] || 0) + e.amount;
    });

    const topUser = Object.entries(userMap).sort(
        (a: any, b: any) => b[1] - a[1]
    )[0];

    return (
        <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">AI Insights 🤖</h2>

            <p>🔥 Most spending on: {topCategory?.[0]}</p>
            <p>💸 Top spender: {topUser?.[0]}</p>
        </div>
    );
}