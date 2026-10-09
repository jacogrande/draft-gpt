import { Navigate } from "@remix-run/react";
import { ComponentType } from "react";
import Page from "~/components/Page";
import UsernameForm from "~/components/UsernameForm";
import { useUser } from "~/hooks/useUser";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useUser();
  if (loading)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (!profile) return <Navigate to="/join" replace />;
  if (!user) return <UsernameForm suggested={profile.suggestedUsername} />;
  return <>{children}</>;
};

export const requireAuth = (Route: ComponentType) => {
  const Protected = () => (
    <RequireAuth>
      <Route />
    </RequireAuth>
  );
  return Protected;
};

export default RequireAuth;
