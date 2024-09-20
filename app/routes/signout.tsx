import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { deleteSessionCookie } from "~/model/auth";
import { auth } from "~/model/firebase";

const SignOut = () => {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      auth.signOut();
      await deleteSessionCookie();
      navigate("/");
    })();
  }, [navigate]);

  return null;
};

export default SignOut;
