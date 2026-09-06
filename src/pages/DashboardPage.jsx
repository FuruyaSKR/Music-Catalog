import { CircleHelp, FolderPlus, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { filterProjects } from "../catalog.js";
import AlbumCard from "../components/AlbumCard.jsx";
import { NewAlbumDialog, NewTrackDialog } from "../components/ProjectDialogs.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { artists } from "../data.js";

const filters = [
  { value: "all", label: "Todos" },
  { value: "albums", label: "Álbuns" },
  { value: "tracks", label: "Faixas" },
];

export default function DashboardPage() {
  const { albums, createAlbum, createTrack, shareProject, showDemoMessage, tracks } = useOutletContext();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);
  const filterButtonRef = useRef(null);
  const dashboardTracks = tracks.filter(({ albumId }) => !albumId);
  const visible = filterProjects({ albums, artists, query, tracks: dashboardTracks, type });
  const resultCount = visible.albums.length + visible.tracks.length;

  return (
    <section className="dashboard">
      <h1 className="visually-hidden">Meus projetos</h1>

      <div className="dashboard__toolbar">
        <div className="dashboard__search">
          <Search size={18} aria-hidden="true" />
          <label className="visually-hidden" htmlFor="project-search">Buscar projetos</label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={({ target }) => setQuery(target.value)}
            placeholder="Buscar faixa, álbum ou artista..."
          />
        </div>

        <div className="dashboard__filter-wrap">
          <button
            ref={filterButtonRef}
            className="dashboard__icon-button"
            type="button"
            onClick={() => setAreFiltersOpen((value) => !value)}
            aria-label="Filtrar projetos"
            aria-expanded={areFiltersOpen}
            aria-controls="project-filters"
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
          </button>
          {areFiltersOpen && (
            <div className="dashboard__filters catalog-card" id="project-filters" role="group" aria-label="Tipo de projeto">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setType(filter.value);
                    setAreFiltersOpen(false);
                    window.requestAnimationFrame(() => filterButtonRef.current?.focus());
                  }}
                  aria-pressed={type === filter.value}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="dashboard__icon-button dashboard__tutorial"
          type="button"
          onClick={() => showDemoMessage("O tutorial será adicionado futuramente.")}
          aria-label="Abrir tutorial"
        >
          <CircleHelp size={18} aria-hidden="true" />
        </button>

        <span className="dashboard__result-count">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </span>
        <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {resultCount} {resultCount === 1 ? "resultado exibido" : "resultados exibidos"}
        </span>

        <span className="dashboard__toolbar-spacer" />

        <button
          className="catalog-button dashboard__create-album"
          type="button"
          onClick={() => setActiveDialog("album")}
        >
          <FolderPlus size={17} aria-hidden="true" />
          Criar Álbum
        </button>
        <button
          className="catalog-button catalog-button--primary"
          type="button"
          onClick={() => setActiveDialog("track")}
        >
          <Plus size={17} aria-hidden="true" />
          Criar Faixa
        </button>
      </div>

      {type !== "tracks" && (
        <section className="dashboard__section" aria-labelledby="albums-heading">
          <div className="dashboard__section-heading">
            <h2 id="albums-heading">Meus Álbuns</h2>
            <span>{visible.albums.length}</span>
          </div>
          {visible.albums.length ? (
            <div className="dashboard__album-rail">
              {visible.albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  artist={artists.find(({ id }) => id === album.artistId) ?? { id: null, name: album.artistName }}
                  onAction={(name) => showDemoMessage(`Ações de ${name} estarão disponíveis futuramente.`)}
                  onShare={shareProject}
                />
              ))}
            </div>
          ) : (
            <p className="dashboard__empty">Nenhum álbum encontrado.</p>
          )}
        </section>
      )}

      {type !== "albums" && (
        <section className="dashboard__section" aria-labelledby="tracks-heading">
          <div className="dashboard__section-heading">
            <h2 id="tracks-heading">Minhas Faixas</h2>
            <span>{visible.tracks.length}</span>
          </div>
          {visible.tracks.length ? (
            <div className="dashboard__track-list">
              {visible.tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  artistId={track.artistIds[0]}
                  track={track}
                  onAction={(name) => showDemoMessage(`Ações de ${name} estarão disponíveis futuramente.`)}
                  onShare={shareProject}
                />
              ))}
            </div>
          ) : (
            <p className="dashboard__empty">Nenhuma faixa encontrada.</p>
          )}
        </section>
      )}

      <NewAlbumDialog
        open={activeDialog === "album"}
        onClose={() => setActiveDialog(null)}
        onCreate={({ artist, name }) => {
          createAlbum({ artist, name });
          showDemoMessage(`${name} foi criado nesta sessão.`);
        }}
      />
      <NewTrackDialog
        open={activeDialog === "track"}
        albumOptions={albums}
        onClose={() => setActiveDialog(null)}
        onCreate={({ albumId, artist, audio, name }) => {
          createTrack({ albumId, artist, audio, name });
          showDemoMessage(`${name} foi criada nesta sessão.`);
        }}
      />
    </section>
  );
}
