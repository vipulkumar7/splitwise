import { IProfile } from "@/types/models/profile";

export default function Profile({ user }: IProfile) {
  return (
    <div className="text-white px-4">
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md" style={{ marginBottom: "100px" }}>
          {/* CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl mb-4">
            {/* HEADER */}
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-xl font-semibold text-white">
                {user?.name?.[0] || user?.email?.[0]}
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-black truncate">
                  {user?.name}
                </h1>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="my-5 h-px bg-gray-200" />

            {/* DETAILS */}
            <div className="space-y-3 mt-2">
              <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium mt-1 text-black break-all">
                  {user?.name}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium mt-1 text-black break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled
              className="mt-6 w-full p-3 rounded-lg border border-gray-300 text-gray-400 text-sm font-medium cursor-not-allowed bg-gray-100"
            >
              Edit Profile
            </button>
          </div>

          {/* FOOTER */}
          <p className="text-center text-sm text-white/40">
            Profile settings, security & preferences coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
