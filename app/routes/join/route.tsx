import { useAuthActions } from "@convex-dev/auth/react";
import { Navigate } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import UsernameForm from "~/components/UsernameForm";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import TestLogin from "~/routes/join/TestLogin";

const TEST_LOGIN_ENABLED = import.meta.env.VITE_TEST_LOGIN === "true";

const Join = () => {
  const { signIn } = useAuthActions();
  const { user, profile, loading } = useUser();
  const { toast } = useToast();

  const handleGoogle = async () => {
    try {
      await signIn("google");
    } catch {
      toast("Unable to sign in with Google", "error");
    }
  };

  if (user) return <Navigate to="/" replace />;
  if (profile) return <UsernameForm suggested={profile.suggestedUsername} />;
  return (
    <Page>
      <Heading>Join DraftGPT</Heading>
      {loading ? (
        <span className="loading loading-dots loading-lg"></span>
      ) : (
        <button className="btn btn-primary" onClick={handleGoogle}>
          Continue with Google
        </button>
      )}
      {TEST_LOGIN_ENABLED && <TestLogin />}
    </Page>
  );
};

export default Join;
