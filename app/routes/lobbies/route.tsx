import { Outlet, useParams } from "@remix-run/react";
import Page from "~/components/Page";
import LobbyList from "~/routes/lobbies/LobbyList";

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
