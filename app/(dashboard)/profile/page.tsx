import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="border p-6 rounded space-y-4">
                <h1 className="text-xl font-bold">Profile</h1>

                <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{session?.user?.name}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{session?.user?.email}</p>
                </div>

                {session?.user?.image && (
                    <img
                        src={session.user.image}
                        alt="profile"
                        className="w-16 h-16 rounded-full"
                    />
                )}
            </div>
        </div>
    );
}