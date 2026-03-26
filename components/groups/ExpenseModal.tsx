export default function ExpenseModal({
    show,
    onClose,
    onSubmit,
    members,
    payerId,
    setPayerId,
    expenseAmount,
    setExpenseAmount,
    expenseDesc,
    setExpenseDesc,
    splitType,
    setSplitType,
    customSplits,
    setCustomSplits,
}: any) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded space-y-3 w-[320px]">
                <h2 className="font-semibold">Add Expense</h2>

                {/* Description */}
                <input
                    placeholder="Description"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="border p-2 w-full"
                />

                {/* Amount */}
                <input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="border p-2 w-full"
                />

                {/* ✅ PAYER DROPDOWN */}
                <select
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="border p-2 w-full"
                >
                    <option value="">Select payer</option>

                    {members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>
                            {m.user.name || m.user.email}
                        </option>
                    ))}
                </select>

                {/* SPLIT TYPE */}
                <select
                    value={splitType}
                    onChange={(e) => setSplitType(e.target.value)}
                    className="border p-2 w-full"
                >
                    <option value="equal">Equal</option>
                    <option value="custom">Custom</option>
                </select>

                {/* ✅ CUSTOM SPLIT UI */}
                {splitType === "custom" &&
                    members.map((m: any) => (
                        <div
                            key={m.user.id}
                            className="flex justify-between items-center"
                        >
                            <span>{m.user.name || m.user.email}</span>

                            <input
                                type="number"
                                className="border w-20 p-1"
                                value={customSplits[m.user.id] || ""}
                                onChange={(e) =>
                                    setCustomSplits({
                                        ...customSplits,
                                        [m.user.id]: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                    ))}

                {/* ACTIONS */}
                <div className="flex justify-between mt-3">
                    <button onClick={onClose}>Cancel</button>

                    <button
                        onClick={onSubmit}
                        className="bg-black text-white px-4 py-1 rounded"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}