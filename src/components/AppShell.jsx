import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  House,
  Menu,
  MessageSquareText,
  Music2,
  X,
} from "lucide-react";
import { Link, matchPath, NavLink, Outlet, useLocation } from "react-router-dom";
import { findArtistId } from "../catalog.js";
import { albums as seedAlbums, artists, currentUser, tracks as seedTracks } from "../data.js";

function Brand({ onNavigate }) {
  return (
    <Link className="app-shell__brand" to="/" onClick={onNavigate} aria-label="Music Catalog, início">
      <span className="app-shell__brand-mark" aria-hidden="true">
        <Music2 size={18} strokeWidth={2.4} />
      </span>
      <span className="app-shell__brand-copy">
        <strong>Music Catalog</strong>
        <small>Workspace</small>
      </span>
    </Link>
  );
}

function PrimaryNavigation({ onNavigate }) {
  return (
    <nav className="app-shell__navigation" aria-label="Navegação principal">
      <span className="app-shell__navigation-label">Plataforma</span>
      <NavLink
        className={({ isActive }) => `app-shell__navigation-link${isActive ? " app-shell__navigation-link--active" : ""}`}
        to="/"
        end
        onClick={onNavigate}
        aria-label="Início"
      >
        <House size={18} aria-hidden="true" />
        <span className="app-shell__navigation-text">Início</span>
      </NavLink>
    </nav>
  );
}

function UserControl({ onClick }) {
  return (
    <button className="app-shell__user" type="button" onClick={onClick} title={currentUser.name}>
      <span className="app-shell__avatar" aria-hidden="true">{currentUser.initial}</span>
      <span className="app-shell__user-copy">
        <strong>{currentUser.name}</strong>
        <small>{currentUser.email}</small>
      </span>
    </button>
  );
}

export default function AppShell({ routes }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [albums, setAlbums] = useState(seedAlbums);
  const [tracks, setTracks] = useState(seedTracks);
  const [roomItems, setRoomItems] = useState({});
  const mainRef = useRef(null);
  const mobileDialogRef = useRef(null);
  const isInitialRoute = useRef(true);
  const statusTimerRef = useRef(null);
  const matchedRoute = routes
    .map((route) => ({ route, match: matchPath({ path: route.path, end: true }, location.pathname) }))
    .find(({ match }) => match);
  const { artistId, roomId, spaceId } = matchedRoute?.match.params ?? {};
  const dynamicTitle = spaceId
    ? albums.find(({ id }) => id === spaceId)?.name
    : roomId
      ? tracks.find(({ id }) => id === roomId)?.name
      : artists.find(({ id }) => id === artistId)?.name;
  const pageTitle = dynamicTitle ?? matchedRoute?.route.label ?? "Página não encontrada";

  useEffect(() => {
    document.title = `${pageTitle} • Music Catalog`;
    if (isInitialRoute.current) {
      isInitialRoute.current = false;
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => mainRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, pageTitle]);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (isMobileOpen && !dialog.open) dialog.showModal();
    if (!isMobileOpen && dialog.open) dialog.close();
  }, [isMobileOpen]);

  useEffect(() => () => window.clearTimeout(statusTimerRef.current), []);

  const showDemoMessage = (message) => {
    window.clearTimeout(statusTimerRef.current);
    setStatus("");
    window.requestAnimationFrame(() => setStatus(message));
    statusTimerRef.current = window.setTimeout(() => setStatus(""), 4000);
  };

  const createAlbum = ({ artist, name }) => {
    const artistId = findArtistId(artists, artist);
    const album = {
      id: crypto.randomUUID(),
      name,
      artistId,
      artistName: artist,
      type: "Álbum",
      year: new Date().getFullYear(),
      description: "",
      cover: null,
      trackIds: [],
    };
    setAlbums((items) => [...items, album]);
    return album;
  };

  const createTrack = ({ albumId, artist, audio, name }) => {
    const artistId = findArtistId(artists, artist);
    const track = {
      id: crypto.randomUUID(),
      name,
      artistIds: artistId ? [artistId] : [],
      artistDisplay: artist,
      albumId,
      version: audio.name,
      durationSeconds: 0,
      notesCount: 0,
      pollsCount: 0,
      remainingDays: 14,
    };
    setTracks((items) => [...items, track]);
    if (albumId) {
      setAlbums((items) => items.map((album) => album.id === albumId ? { ...album, trackIds: [...album.trackIds, track.id] } : album));
    }
    return track;
  };

  const updateTrack = (trackId, changes) => {
    setTracks((items) => items.map((track) => track.id === trackId ? { ...track, ...changes } : track));
  };

  const addRoomItem = (trackId, item) => {
    const roomItem = { ...item, id: crypto.randomUUID() };
    setRoomItems((items) => ({ ...items, [trackId]: [...(items[trackId] ?? []), roomItem] }));
    setTracks((items) => items.map((track) => {
      if (track.id !== trackId) return track;
      return item.type === "poll"
        ? { ...track, pollsCount: track.pollsCount + 1 }
        : { ...track, notesCount: track.notesCount + 1 };
    }));
    return roomItem;
  };

  const shareProject = async (target, name) => {
    const url = `${window.location.origin}${window.location.pathname}#${target}`;

    try {
      await navigator.clipboard.writeText(url);
      showDemoMessage(`Link de ${name} copiado.`);
    } catch {
      showDemoMessage("Não foi possível copiar o link neste navegador.");
    }
  };

  return (
    <div className="app-shell" data-collapsed={isCollapsed}>
      <a
        className="app-shell__skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Ir para o conteúdo
      </a>

      <aside className="app-shell__sidebar">
        <Brand />
        <PrimaryNavigation />
        <UserControl onClick={() => showDemoMessage("Gerenciamento da conta estará disponível futuramente.")} />
      </aside>

      <dialog
          ref={mobileDialogRef}
          id="mobile-navigation"
          className="app-shell__mobile-dialog"
          aria-label="Menu principal"
          onClose={() => setIsMobileOpen(false)}
          onMouseDown={({ currentTarget, target }) => {
            if (currentTarget === target) currentTarget.close();
          }}
        >
          <aside className="app-shell__mobile-drawer">
            <div className="app-shell__mobile-heading">
              <Brand onNavigate={() => setIsMobileOpen(false)} />
              <button
                className="app-shell__icon-button"
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <PrimaryNavigation onNavigate={() => setIsMobileOpen(false)} />
            <UserControl onClick={() => {
              setIsMobileOpen(false);
              showDemoMessage("Gerenciamento da conta estará disponível futuramente.");
            }} />
          </aside>
      </dialog>

      <div className="app-shell__frame">
        <header className="app-shell__topbar">
          <div className="app-shell__context">
            <button
              className="app-shell__icon-button app-shell__desktop-toggle"
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight size={19} aria-hidden="true" /> : <ChevronLeft size={19} aria-hidden="true" />}
            </button>
            <button
              className="app-shell__icon-button app-shell__mobile-toggle"
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <nav aria-label="Breadcrumb">
              <ol className="app-shell__breadcrumbs">
                {location.pathname === "/" ? (
                  <li aria-current="page">Início</li>
                ) : (
                  <>
                    <li><Link to="/">Início</Link></li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page">{pageTitle}</li>
                  </>
                )}
              </ol>
            </nav>
          </div>

          <div className="app-shell__actions">
            <button
              className="app-shell__header-action"
              type="button"
              onClick={() => showDemoMessage("Feedback indisponível nesta demonstração.")}
              aria-label="Feedback"
            >
              <MessageSquareText size={17} aria-hidden="true" />
              <span>Feedback</span>
            </button>
            <NavLink
              className={({ isActive }) => `app-shell__icon-button${isActive ? " app-shell__icon-button--active" : ""}`}
              to="/updates"
              aria-label="Atualizações"
            >
              <Bell size={19} aria-hidden="true" />
            </NavLink>
          </div>
        </header>

        <main ref={mainRef} className="app-shell__content" id="main-content" tabIndex="-1">
          <Outlet context={{ addRoomItem, albums, createAlbum, createTrack, roomItems, setAlbums, shareProject, showDemoMessage, tracks, updateTrack }} />
        </main>
      </div>

      <div className="app-shell__status" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  );
}
