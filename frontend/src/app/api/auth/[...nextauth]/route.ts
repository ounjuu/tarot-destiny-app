import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return true;

      // Supabase에 사용자 저장 (이미 있으면 업데이트)
      const { error } = await supabase
        .from("users")
        .upsert({
          id: `${account.provider}_${user.id}`,
          provider: account.provider,
          name: user.name,
          email: user.email,
          image: user.image,
        }, { onConflict: "id" });

      if (error) console.error("사용자 저장 실패:", error.message);
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = `${token.provider}_${token.sub}`;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
