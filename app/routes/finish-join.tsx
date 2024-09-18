import { AtSymbolIcon } from "@heroicons/react/16/solid";
import { Link, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useToast } from "~/hooks/useToast";
import {
  createUserDoc,
  getStoredEmail,
  signInWithJoinLink,
  validateJoinLink,
} from "~/model/auth";
import sleep from "~/util/sleep";
import { validateEmail } from "~/util/validateEmail";

const FinishJoin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [emailRequired, setEmailRequired] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");

  /**
   * Attempt to sign in on page load
   * Uses the email stored in local storage if available, and triggers a prompt for email if not
   */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setSuccess(false);
      if (!validateUsername(username)) {
        toast("No username provided", "error");
        return;
      }
      const { error } = await signIn(username);
      if (error === ERRORS.NO_EMAIL) {
        setEmailRequired(true);
      } else if (error !== null) {
        toast(error, "error");
      } else {
        setSuccess(true);
      }
      setLoading(false);
    })();
  }, [toast, username]);

  /**
   * Handle email confirmation
   * On valid email, attempt to sign in using the current join link
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      // NOTE: This makes the page feel like it's doing something
      await sleep(1000);
      if (!validateUsername(username)) {
        toast("No username provided", "error");
        return;
      }
      await signInWithJoinLink(email);
      await createUserDoc(username);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      toast(ERRORS.DEFAULT, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <header className="flex flex-col items-center">
          <h1 className="leading text-2xl font-bold text-gray-800">
            Finish Registration
          </h1>
        </header>
        {emailRequired && (
          <form
            className="flex flex-col items-center gap-4"
            onSubmit={handleSubmit}
          >
            <p className="prose">
              Please confirm your email address to continue.
            </p>
            <label className="input input-bordered input-primary flex items-center gap-2 w-full">
              <AtSymbolIcon className="h-5 w-5" />
              <input
                placeholder="Email"
                className="grow"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button
              className="btn btn-primary self-end"
              disabled={loading || !validateEmail(email)}
            >
              {loading ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                "Join"
              )}
            </button>
          </form>
        )}
        {loading && !emailRequired && (
          <span className="loading loading-dots loading-lg"></span>
        )}
        {success && (
          <div className="flex flex-col items-center gap-4">
            <p className="prose">
              You have successfully created an account.{" "}
              <Link to="/">Go Back Home</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const signIn = async (username: string): Promise<{ error: string | null }> => {
  try {
    await sleep(1000);
    const isValidJoinLink = validateJoinLink();
    if (!isValidJoinLink) return { error: ERRORS.INVALID_JOIN_LINK };
    const email = getStoredEmail();
    if (!email) return { error: ERRORS.NO_EMAIL };
    await signInWithJoinLink(email);
    await createUserDoc(username);
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: ERRORS.DEFAULT };
  }
};

const validateUsername = (username: unknown): username is string => {
  return typeof username === "string" && username.length > 0;
};

/******** CONSTANTS ********/
const ERRORS = {
  INVALID_JOIN_LINK: "Invalid join link",
  NO_EMAIL: "No email found",
  DEFAULT: "Something went wrong signing in. Please try again.",
};

export default FinishJoin;
