import { Check, Disc3, ImagePlus, Pencil, Plus, Search, Share2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { filterProjects } from "../catalog.js";
import { NewTrackDialog } from "../components/ProjectDialogs.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { artists } from "../data.js";

export default function AlbumPage() {
  const { spaceId } = useParams();
  const { albums, createTrack, setAlbums, shareProject, showDemoMessage, tracks } = useOutletContext();
  const [query, setQuery] = useState("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const descriptionButtonRef = useRef(null);
  const album = albums.find(({ id }) => id === spaceId);
  const artist = artists.find(({ id }) => id === album?.artistId) ?? { id: null, name: album?.artistName };
  const albumTracks = tracks.filter(({ albumId }) => albumId === spaceId);
  const visibleTracks = filterProjects({ albums: [], artists, query, tracks: albumTracks, type: "tracks" }).tracks;

  if (!album) {
    return (
      <section className="screen-placeholder">
        <span className="screen-placeholder__eyebrow">Álbum indisponível</span>
        <h1 className="screen-placeholder__title">Álbum não encontrado</h1>
        <p className="screen-placeholder__copy">Este álbum não existe ou a sessão foi reiniciada.</p>
        <Link className="catalog-button catalog-button--primary screen-placeholder__action" to="/">Voltar ao catálogo</Link>
      </section>
    );
  }

  const updateAlbum = (changes) => {
    setAlbums((items) => items.map((item) => item.id === album.id ? { ...item, ...changes } : item));
  };

  return (
    <section className="album-page">
      <header className="album-hero">
        <label className="album-hero__cover catalog-cover-placeholder" htmlFor="album-cover">
          <input
            className="visually-hidden"
            id="album-cover"
            type="file"
            accept="image/*"
            aria-label={`Alterar capa do álbum ${album.name}`}
            onChange={({ target }) => {
              const cover = target.files[0]?.name;
              target.value = "";
              if (!cover) return;
              updateAlbum({ cover });
              showDemoMessage(`Capa ${cover} selecionada nesta sessão.`);
            }}
          />
          <Disc3 size={52} aria-hidden="true" />
          {album.cover && <small className="catalog-truncate">{album.cover}</small>}
          <span className="album-hero__cover-action"><ImagePlus size={16} aria-hidden="true" /> Alterar</span>
        </label>

        <div className="album-hero__identity">
          <span className="album-hero__type">{album.type}</span>
          <h1>{album.name}</h1>
          {artist.id ? (
            <Link className="album-hero__artist" to={`/artist/${artist.id}`}>{artist.name}</Link>
          ) : (
            <span className="album-hero__artist">{artist.name}</span>
          )}

          {isDescriptionOpen ? (
            <div className="album-hero__description-editor">
              <label className="visually-hidden" htmlFor="album-description">Descrição do álbum</label>
              <textarea
                className="catalog-input"
                id="album-description"
                value={descriptionDraft}
                onChange={({ target }) => setDescriptionDraft(target.value)}
                placeholder="Conte um pouco sobre este projeto..."
                autoFocus
              />
              <div>
                <button
                  type="button"
                  onClick={() => {
                    updateAlbum({ description: descriptionDraft.trim() });
                    setIsDescriptionOpen(false);
                    showDemoMessage("Descrição atualizada nesta sessão.");
                    window.requestAnimationFrame(() => descriptionButtonRef.current?.focus());
                  }}
                >
                  <Check size={15} aria-hidden="true" /> Salvar
                </button>
                <button type="button" onClick={() => {
                  setIsDescriptionOpen(false);
                  window.requestAnimationFrame(() => descriptionButtonRef.current?.focus());
                }}>
                  <X size={15} aria-hidden="true" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={descriptionButtonRef}
              className="album-hero__description"
              type="button"
              onClick={() => {
                setDescriptionDraft(album.description);
                setIsDescriptionOpen(true);
              }}
            >
              <Pencil size={14} aria-hidden="true" />
              {album.description || "Adicionar descrição..."}
            </button>
          )}

          <span className="album-hero__meta">{album.year} · {albumTracks.length} {albumTracks.length === 1 ? "faixa" : "faixas"}</span>
        </div>
      </header>

      <div className="album-toolbar">
        <button className="catalog-button catalog-button--primary" type="button" onClick={() => setIsTrackDialogOpen(true)}>
          <Plus size={17} aria-hidden="true" /> Adicionar faixa
        </button>
        <button className="catalog-button" type="button" onClick={() => shareProject(`/space/${album.id}`, album.name)}>
          <Share2 size={17} aria-hidden="true" /> Compartilhar álbum
        </button>
        <div className="album-toolbar__search">
          <Search size={17} aria-hidden="true" />
          <label className="visually-hidden" htmlFor="album-track-filter">Filtrar faixas</label>
          <input
            id="album-track-filter"
            type="search"
            value={query}
            onChange={({ target }) => setQuery(target.value)}
            placeholder="Filtrar faixas..."
          />
        </div>
      </div>

      <section className="album-tracks" aria-labelledby="album-tracks-heading">
        <div className="album-tracks__heading">
          <h2 id="album-tracks-heading">Faixas</h2>
          <span>{visibleTracks.length}</span>
          <span className="visually-hidden" role="status" aria-live="polite">{visibleTracks.length} faixas exibidas.</span>
        </div>
        {visibleTracks.length ? (
          <div className="album-tracks__list">
            {visibleTracks.map((track) => (
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
          <p className="dashboard__empty">{albumTracks.length ? "Nenhuma faixa encontrada." : "Este álbum ainda não possui faixas."}</p>
        )}
      </section>

      <NewTrackDialog
        key={album.id}
        open={isTrackDialogOpen}
        albumId={album.id}
        albumOptions={albums}
        onClose={() => setIsTrackDialogOpen(false)}
        onCreate={({ albumId, artist: artistName, audio, name }) => {
          createTrack({ albumId, artist: artistName, audio, name });
          showDemoMessage(`${name} foi adicionada a ${album.name} nesta sessão.`);
        }}
      />
    </section>
  );
}
