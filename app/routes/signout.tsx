import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { auth } from "~/model/firebase";

const SignOut = () => {
  const navigate = useNavigate();
  useEffect(() => {
    auth.signOut();
    navigate("/");
  }, [navigate]);

  return null;
};

export default SignOut;
