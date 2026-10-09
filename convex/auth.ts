import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const testLoginEnabled = process.env.AUTH_TEST_LOGIN === "true";

const TestLogin = Password({
  profile: (params) => ({
    email: params.email as string,
    name: params.name as string,
  }),
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: testLoginEnabled ? [Google, TestLogin] : [Google],
});
