import { AtSymbolIcon, UserIcon } from "@heroicons/react/16/solid";
import { Navigate, useNavigate } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { sendJoinLink } from "~/model/auth";
import { auth } from "~/model/firebase";
import { validateEmail } from "~/util/validateEmail";

type FormData = {
  username: string;
  email: string;
};

const Join = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const isValidEmail = useMemo(
    () => validateEmail(formData.email),
    [formData.email]
  );
  const disabled = !formData.username || !isValidEmail || loading;

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccess(false);
      await sendJoinLink(formData.email, formData.username);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      toast(
        "Unable to send email verification link. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // check if the user is already logged in
  const isLoggedIn = auth.currentUser !== null;
  if (isLoggedIn) return <Navigate to="/" replace />;

  return (
    <Page>
      <div className="flex flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-9">
          <Heading>Join the game</Heading>
        </header>
        {success ? (
          <div className="flex flex-col items-center gap-4">
            <p className="prose">
              A verification email has been sent to your email address. Follow
              the link in the email to finish joining.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col items-center gap-4"
            onSubmit={handleSubmit}
          >
            <label className="input input-bordered input-primary flex items-center gap-2 min-w-72">
              <UserIcon className="h-5 w-5" />
              <input
                placeholder="Username"
                className="grow"
                name="username"
                onChange={handleChange}
              />
            </label>
            <label className="input input-bordered input-primary flex items-center gap-2 min-w-72">
              <AtSymbolIcon className="h-5 w-5" />
              <input
                placeholder="Email"
                className="grow"
                name="email"
                onChange={handleChange}
              />
            </label>
            <button className="btn btn-primary self-end" disabled={disabled}>
              {loading ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
};

export default Join;
