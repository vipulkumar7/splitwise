"use client";

export default function GroupDetailsSkeleton() {
    return (
        <div className="p-4 max-w-2xl mx-auto animate-pulse">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                {/* Avatar stack */}
                <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                </div>

                {/* Title */}
                <div className="h-6 w-32 bg-gray-300 rounded-md" />
            </div>

            {/* EXPENSES TITLE */}
            <div className="mb-4">
                <div className="h-5 w-24 bg-gray-300 rounded-md mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded-md" />
            </div>

            {/* EXPENSE CARD LIST */}
            <div className="space-y-3 mb-6">

                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl border bg-white shadow-sm"
                    >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300" />

                            <div>
                                <div className="h-4 w-28 bg-gray-300 rounded mb-2" />
                                <div className="h-3 w-36 bg-gray-200 rounded" />
                            </div>
                        </div>

                        {/* RIGHT AMOUNT */}
                        <div className="h-5 w-14 bg-gray-300 rounded" />
                    </div>
                ))}
            </div>

            {/* BALANCES TITLE */}
            <div className="mb-3">
                <div className="h-5 w-24 bg-gray-300 rounded-md" />
            </div>

            {/* BALANCE CARDS */}
            <div className="space-y-3">

                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl border bg-white shadow-sm"
                    >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300" />

                            <div>
                                <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="h-5 w-12 bg-gray-300 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}