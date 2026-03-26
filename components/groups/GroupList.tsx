export default function GroupList({ groups, onSelect, onAddExpense, onDelete, selectedGroupId }: any) {
    return (
        <div className="space-y-3">
            {groups.map((g: any) => (
                <div
                    key={g.id}
                    className={`p-4 border rounded ${selectedGroupId === g.id ? "bg-gray-100" : ""
                        }`}
                >
                    <div className="flex justify-between items-center">
                        <p
                            className="font-medium cursor-pointer"
                            onClick={() => onSelect(g.id)}
                        >
                            {g.name}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onAddExpense(g.id)}
                                className="text-blue-500 text-sm"
                            >
                                Add Expense
                            </button>

                            <button
                                onClick={() => onDelete(g.id)}
                                className="text-red-500 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}