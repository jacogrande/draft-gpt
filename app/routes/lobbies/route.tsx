import { Outlet, useParams } from "@remix-run/react";
import { verifySession } from "~/.server/session";
import Heading from "~/components/Heading";
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
        <Heading>Active Lobbies</Heading>
      </header>
      <LobbyList />
    </Page>
  );
};

export default Lobbies;
