import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const LOCAL_HOST = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/;

const isLocalDeployment = (url: string | undefined) =>
  url === undefined || LOCAL_HOST.test(url);

const testLoginEnabled =
  process.env.AUTH_TEST_LOGIN === "true" &&
  isLocalDeployment(process.env.CONVEX_CLOUD_URL);

const TestLogin = Password({
  profile: (params) => ({
    email: params.email as string,
    name: params.name as string,
  }),
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: testLoginEnabled ? [Google, TestLogin] : [Google],
});
