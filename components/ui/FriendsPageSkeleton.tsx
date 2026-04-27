export default function FriendsPageSkeleton() {
  return (
    <div className="h-full w-full max-w-md mx-auto text-white px-4 py-8 animate-pulse">
      {/* HEADER */}
      <div className="space-y-2 mt-4">
        <div className="h-6 w-40 bg-white/10 rounded-md" />
        <div className="h-4 w-64 bg-white/5 rounded-md" />
      </div>

      {/* SUMMARY CARDS */}
      <div className="flex gap-4 mt-6 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-w-[140px] flex-1 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur"
          >
            <div className="h-3 w-20 bg-white/10 rounded mb-3" />
            <div className="h-5 w-24 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="mt-6">
        <div className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/10" />
      </div>

      {/* FRIEND LIST */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />

              <div>
                <div className="h-4 w-28 bg-white/10 rounded mb-2" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-white/10 rounded" />
              <div className="h-9 w-16 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
