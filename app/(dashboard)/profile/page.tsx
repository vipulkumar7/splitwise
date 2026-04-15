import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br p-6 bg-zinc-950 text-white">
      {/* CENTER CARD */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            {/* AVATAR */}
            {user?.image ? (
              <img
                src={user.image}
                alt="profile"
                className="w-20 h-20 rounded-full border shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
            )}

            {/* NAME + EMAIL */}
            <div>
              <h1 className="text-xl font-semibold text-white">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-6 border-t" />

          {/* DETAILS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-black">Name</span>
              <span className="font-medium text-black">{user?.name}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-black text-sm">Email</span>
              <span className="font-medium text-black">{user?.email}</span>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="mt-6">
            <button className="w-full py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition shadow-sm">
              Edit Profile (Coming Soon)
            </button>
          </div>
        </div>

        {/* EXTRA CARD (OPTIONAL FUTURE USE) */}
        <div className="mt-6 bg-white rounded-xl border p-4 shadow-sm text-sm text-gray-500 text-center">
          More features like profile edit, password, and settings coming soon 🚀
        </div>
      </div>
    </div>
  );
}
