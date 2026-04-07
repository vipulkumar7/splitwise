export default function AddMember({ selectedGroupId, memberEmail, setMemberEmail, onAdd }: any) {
    if (!selectedGroupId) return null;

    return (
        <div className="mt-4 flex gap-2">
            <input
                placeholder="Enter email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="border p-2 w-full"
            />
            <button onClick={onAdd} className="bg-blue-500 text-white px-3 rounded">
                Add
            </button>
        </div>
    );
}