"use client";

export default function Filters({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    members,
    selectedMember,
    setSelectedMember,
}: any) {
    return (
        <div className="flex flex-wrap gap-3 mb-4">
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded"
            />

            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded"
            />

            <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="border p-2 rounded"
            >
                <option value="">All Members</option>
                {members.map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>
                        {m.user.name || m.user.email}
                    </option>
                ))}
            </select>
        </div>
    );
}