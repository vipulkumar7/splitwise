export default function GroupSkeleton() {
    return (
        <div className="space-y-3 animate-pulse mt-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded-xl">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2 w-full">
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>

                        <div className="h-4 w-10 bg-gray-300 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}