import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";

const TEST_PASSWORD = "draftgpt-test-login";

const TestLogin = () => {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [name, setName] = useState("");

  const credentials = (flow: "signIn" | "signUp") => ({
    flow,
    name,
    email: `${name.toLowerCase()}@test.local`,
    password: TEST_PASSWORD,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await signIn("password", credentials("signIn"));
    } catch {
      await signIn("password", credentials("signUp")).catch(() =>
        toast("Test sign-in failed", "error")
      );
    }
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <input
        className="input input-bordered input-sm"
        name="test-user"
        aria-label="Test user"
        placeholder="Test user"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button className="btn btn-sm" disabled={!name.trim()}>
        Sign in as test user
      </button>
    </form>
  );
};

export default TestLogin;
