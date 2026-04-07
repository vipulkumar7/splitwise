import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        // ✅ Called on login
        async signIn({ user }) {
            if (!user.email) return false;

            // ✅ Ensure user exists in DB
            await prisma.user.upsert({  
                where: { email: user.email },
                update: {
                    name: user.name || "",
                },
                create: {
                    email: user.email,
                    name: user.name || "",
                },
            });

            return true;
        },

        // ✅ Attach userId to session
        async session({ session }) {
            if (session.user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email },
                });

                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                }
            }

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};