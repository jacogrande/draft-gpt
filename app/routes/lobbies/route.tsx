import { Outlet, useParams } from "@remix-run/react";
import { verifySession } from "~/.server/session";
import Page from "~/components/Page";
import LobbyList from "~/routes/lobbies/LobbyList";

export const loader = verifySession;

const Lobbies = () => {
  const params = useParams();
  const lobbyId = params.lobbyId;
  if (lobbyId) return <Outlet />;
  return (
    <Page>
      <header className="flex flex-col items-center gap-9">
        <h1 className="leading text-2xl font-bold text-gray-800 dark:text-slate-200">
          Active Lobbies
        </h1>
      </header>
      <LobbyList />
    </Page>
  );
};

export default Lobbies;
