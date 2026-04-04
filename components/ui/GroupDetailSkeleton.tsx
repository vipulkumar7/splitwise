export default function GroupDetailSkeleton() {
    return (
        <div className="animate-pulse space-y-4">

            {/* Header */}
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>

            {/* Avatar */}
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 bg-gray-300 rounded-full"></div>
                ))}
            </div>

            {/* Invite */}
            <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 w-20 bg-gray-300 rounded"></div>
            </div>

            {/* Expenses */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                ))}
            </div>

            {/* Balance */}
            <div className="space-y-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-3 bg-gray-200 rounded w-1/3"></div>
                ))}
            </div>
        </div>
    );
}