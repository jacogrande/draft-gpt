import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { useToast } from "~/hooks/useToast";

const UsernameForm = ({ suggested }: { suggested: string }) => {
  const setUsername = useMutation(api.identity.users.setUsername);
  const { toast } = useToast();
  const [username, setValue] = useState(suggested);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await setUsername({ username });
    } catch {
      toast("Usernames must be 1 to 24 characters", "error");
    }
  };

  return (
    <Page>
      <Heading>Choose a username</Heading>
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <input
          className="input input-bordered"
          name="username"
          aria-label="Username"
          placeholder="Username"
          maxLength={24}
          value={username}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="btn btn-primary" disabled={!username.trim()}>
          Continue
        </button>
      </form>
    </Page>
  );
};

export default UsernameForm;
