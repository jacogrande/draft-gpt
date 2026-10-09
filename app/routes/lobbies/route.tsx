import { Outlet, useParams } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import LobbyList from "~/routes/lobbies/LobbyList";

const Lobbies = () => {
  const params = useParams();
  const lobbyId = params.lobbyId;
  if (lobbyId) return <Outlet />;
  return (
    <Page>
      <header className="flex flex-col items-center gap-9">
        <Heading>Active Lobbies</Heading>
      </header>
      <LobbyList />
    </Page>
  );
};

export default requireAuth(Lobbies);
