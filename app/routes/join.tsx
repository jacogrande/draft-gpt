import { AtSymbolIcon, UserIcon } from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { useToast } from "~/hooks/useToast";
import { sendJoinLink } from "~/services/auth";
import { validateEmail } from "~/util/validateEmail";

type FormData = {
  username: string;
  email: string;
};

const Join = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
  });
  const isValidEmail = useMemo(
    () => validateEmail(formData.email),
    [formData.email]
  );
  const disabled = !formData.username || !isValidEmail;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // await sendJoinLink(formData.email, formData.username);
      throw new Error("Not implemented");
    } catch (error) {
      console.error(error);
      toast("Something went wrong", "error");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Join the game
          </h1>
        </header>
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
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;
