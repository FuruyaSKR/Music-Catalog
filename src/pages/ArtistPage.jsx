import { Disc3, Music2, Share2 } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import AlbumCard from "../components/AlbumCard.jsx";
import TrackRow from "../components/TrackRow.jsx";
import { artists } from "../data.js";

export default function ArtistPage() {
  const { artistId } = useParams();
  const { albums, shareProject, showDemoMessage, tracks } = useOutletContext();
  const artist = artists.find(({ id }) => id === artistId);
  const artistAlbums = albums.filter((album) => album.artistId === artistId);
  const artistTracks = tracks.filter((track) => track.artistIds.includes(artistId));

  if (!artist) {
    return (
      <section className="screen-placeholder">
        <span className="screen-placeholder__eyebrow">Artista indisponível</span>
        <h1 className="screen-placeholder__title">Artista não encontrado</h1>
        <p className="screen-placeholder__copy">Este perfil não faz parte do catálogo.</p>
        <Link className="catalog-button catalog-button--primary screen-placeholder__action" to="/">Voltar ao catálogo</Link>
      </section>
    );
  }

  return (
    <section className="artist-page">
      <header className="artist-hero">
        <span className="artist-hero__avatar" aria-hidden="true">{artist.initial}</span>
        <div className="artist-hero__identity">
          <span>Artista</span>
          <h1>{artist.name}</h1>
          <p>{artistAlbums.length} {artistAlbums.length === 1 ? "álbum" : "álbuns"} · {artistTracks.length} {artistTracks.length === 1 ? "faixa" : "faixas"}</p>
        </div>
        <button className="catalog-button" type="button" onClick={() => shareProject(`/artist/${artist.id}`, artist.name)}>
          <Share2 size={17} aria-hidden="true" /> Compartilhar perfil
        </button>
      </header>

      <section className="artist-projects" aria-labelledby="artist-albums-heading">
        <div className="artist-projects__heading">
          <span aria-hidden="true"><Disc3 size={17} /></span>
          <h2 id="artist-albums-heading">Álbuns</h2>
          <small>{artistAlbums.length}</small>
        </div>
        {artistAlbums.length ? (
          <div className="dashboard__album-rail">
            {artistAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                artist={artist}
                onAction={(name) => showDemoMessage(`Ações de ${name} estarão disponíveis futuramente.`)}
                onShare={shareProject}
              />
            ))}
          </div>
        ) : (
          <p className="dashboard__empty">Nenhum álbum deste artista.</p>
        )}
      </section>

      <section className="artist-projects" aria-labelledby="artist-tracks-heading">
        <div className="artist-projects__heading">
          <span aria-hidden="true"><Music2 size={17} /></span>
          <h2 id="artist-tracks-heading">Faixas</h2>
          <small>{artistTracks.length}</small>
        </div>
        {artistTracks.length ? (
          <div className="dashboard__track-list">
            {artistTracks.map((track) => (
              <TrackRow
                key={track.id}
                artistId={artist.id}
                track={track}
                onAction={(name) => showDemoMessage(`Ações de ${name} estarão disponíveis futuramente.`)}
                onShare={shareProject}
              />
            ))}
          </div>
        ) : (
          <p className="dashboard__empty">Nenhuma faixa deste artista.</p>
        )}
      </section>
    </section>
  );
}
