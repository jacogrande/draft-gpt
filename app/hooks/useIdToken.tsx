import { useEffect, useState } from "react";
import { useUser } from "~/hooks/useUser";
import { auth } from "~/model/firebase";

const useIdToken = () => {
  const { user } = useUser();
  const [idToken, setIdToken] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const idToken = await auth.currentUser?.getIdToken();
      setIdToken(idToken);
    })();
  }, [user]);

  return idToken;
};

export default useIdToken;
