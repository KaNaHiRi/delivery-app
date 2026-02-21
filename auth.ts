import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// デモ用ユーザー（実際のクリニック案件ではDBに移行）
const DEMO_USERS = [
  {
    id: '1',
    name: '管理者',
    email: 'admin@clinic.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: '田中 太郎',
    email: 'tanaka@clinic.com',
    password: 'user123',
    role: 'user',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = DEMO_USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});