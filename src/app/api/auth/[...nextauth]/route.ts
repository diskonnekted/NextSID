// Konfigurasi NextAuth (v4) untuk App Router.
//
// Pakai Credentials provider dengan 1 akun admin hardcoded dari env
// (ADMIN_EMAIL / ADMIN_PASSWORD). Cocok untuk scaffolding single-desa.
//
// Endpoint: /api/auth/* (signin, signout, session, csrf, callback).

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@desa.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Administrator Desa";

const handler = NextAuth({
  // JWT session (tanpa adapter DB) — cukup untuk 1 akun hardcoded.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Kredensial Admin",
      credentials: {
        email: { label: "Surel", type: "email" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (
          credentials.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()
        ) {
          return null;
        }
        if (credentials.password !== ADMIN_PASSWORD) {
          return null;
        }
        return {
          id: "admin",
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) session.user = { ...session.user, email: token.email as string };
      return session;
    },
  },
});

export { handler as GET, handler as POST };