import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Magic token login: password field carries the token prefixed with "magic:"
                if (credentials.password.startsWith('magic:')) {
                    const token = credentials.password.slice(6);
                    try {
                        const res = await sql`
                            SELECT * FROM users
                            WHERE email = ${credentials.email}
                              AND magic_token = ${token}
                              AND magic_token_expires_at > NOW()
                            LIMIT 1
                        `;
                        const user = res[0];
                        if (!user) return null;

                        // Burn the token (one-time use)
                        await sql`
                            UPDATE users
                            SET magic_token = NULL, magic_token_expires_at = NULL
                            WHERE id = ${user.id}
                        `;

                        return {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            listingId: user.listing_id ?? null,
                        };
                    } catch {
                        return null;
                    }
                }

                // Standard password login
                try {
                    const res = await sql`SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1`;
                    const user = res[0];

                    if (!user) return null;

                    // SMB users created via claim have no password — password login not allowed
                    if (!user.password_hash) return null;

                    const pwValid = await bcrypt.compare(credentials.password, user.password_hash);
                    if (!pwValid) return null;

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        listingId: user.listing_id ?? null,
                    };
                } catch (e) {
                    console.error("Auth Error", e);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.listingId = (user as any).listingId ?? null;
            }
            if (trigger === "update" && session?.name) {
                token.name = session.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).listingId = token.listingId ?? null;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-local-dev-only",
};
