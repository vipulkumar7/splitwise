export default function LoadingGroup() {
    return (
        <div className="mx-w-md mx-auto p-4 space-y-4 animate-pulse">
            {/* Title */}
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            {/* Avatar */}
            <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            </div>
            {/* Expenses */}
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
        </div>
    );
}
