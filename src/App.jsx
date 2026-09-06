import { Link, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import AlbumPage from "./pages/AlbumPage.jsx";
import ArtistPage from "./pages/ArtistPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import UpdatesPage from "./pages/UpdatesPage.jsx";

const routes = [
  { path: "/", label: "Meus Álbuns", description: "Catálogo de álbuns e faixas." },
  { path: "/updates", label: "Atualizações", description: "Atividade recente dos projetos." },
  { path: "/space/:spaceId", label: "Álbum", description: "Álbum criado durante esta sessão." },
  { path: "/room/:roomId", label: "Faixa", description: "Faixa criada durante esta sessão." },
  { path: "/artist/:artistId", label: "Artista", description: "Perfil, álbuns e faixas do artista." },
];

function ScreenPlaceholder({ description, label }) {
  return (
    <section className="screen-placeholder">
      <span className="screen-placeholder__eyebrow">Estrutura preparada</span>
      <h1 className="screen-placeholder__title">{label}</h1>
      <p className="screen-placeholder__copy">{description}</p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="screen-placeholder">
      <span className="screen-placeholder__eyebrow">Erro 404</span>
      <h1 className="screen-placeholder__title">Página não encontrada</h1>
      <p className="screen-placeholder__copy">O endereço informado não pertence ao catálogo.</p>
      <Link className="catalog-button catalog-button--primary screen-placeholder__action" to="/">Voltar ao início</Link>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell routes={routes} />}>
        {routes.map(({ description, label, path }) => (
          <Route
            key={path}
            path={path}
            element={
              path === "/"
                ? <DashboardPage />
                : path.startsWith("/space/")
                  ? <AlbumPage />
                : path.startsWith("/room/")
                  ? <RoomPage />
                  : path.startsWith("/artist/")
                    ? <ArtistPage />
                    : path === "/updates"
                      ? <UpdatesPage />
                  : <ScreenPlaceholder description={description} label={label} />
            }
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
