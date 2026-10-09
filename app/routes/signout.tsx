import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

const SignOut = () => {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  useEffect(() => {
    void signOut().then(() => navigate("/join"));
  }, [signOut, navigate]);

  return null;
};

export default SignOut;
