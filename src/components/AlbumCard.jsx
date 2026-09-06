import { Disc3, MoreHorizontal, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AlbumCard({ album, artist, onAction, onShare }) {
  const albumUrl = `/space/${album.id}`;

  return (
    <article className="album-card">
      <Link className="album-card__cover catalog-cover-placeholder" to={albumUrl} aria-label={`Abrir álbum ${album.name}`}>
        <Disc3 size={38} aria-hidden="true" />
      </Link>
      <div className="album-card__body">
        <Link className="album-card__title catalog-truncate" to={albumUrl}>{album.name}</Link>
        {artist.id ? (
          <Link className="album-card__artist catalog-truncate" to={`/artist/${artist.id}`}>{artist.name}</Link>
        ) : (
          <span className="album-card__artist catalog-truncate">{artist.name}</span>
        )}
        <span className="album-card__meta">{album.trackIds.length} {album.trackIds.length === 1 ? "faixa" : "faixas"}</span>
      </div>
      <div className="album-card__actions">
        <button className="album-card__action" type="button" onClick={() => onShare(albumUrl, album.name)} aria-label={`Compartilhar ${album.name}`}>
          <Share2 size={16} aria-hidden="true" />
        </button>
        <button className="album-card__action" type="button" onClick={() => onAction(album.name)} aria-label={`Mais ações para ${album.name}`}>
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
