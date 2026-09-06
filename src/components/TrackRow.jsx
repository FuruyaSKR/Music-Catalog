import { BarChart3, Clock3, MessageCircle, MoreHorizontal, Music2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrackRow({ artistId, onAction, onShare, track }) {
  const roomUrl = `/room/${track.id}`;

  return (
    <article className="track-row catalog-card">
      <span className="track-row__rail" aria-hidden="true" />
      <Link className="track-row__artwork" to={roomUrl} aria-label={`Abrir faixa ${track.name}`}>
        <Music2 size={20} aria-hidden="true" />
      </Link>
      <div className="track-row__identity">
        <Link className="track-row__title catalog-truncate" to={roomUrl}>{track.name}</Link>
        {artistId ? (
          <Link className="track-row__artist catalog-truncate" to={`/artist/${artistId}`}>{track.artistDisplay}</Link>
        ) : (
          <span className="track-row__artist catalog-truncate">{track.artistDisplay}</span>
        )}
      </div>
      <div className="track-row__metrics" aria-label="Métricas da faixa">
        <span><MessageCircle size={15} aria-hidden="true" /><span className="visually-hidden">Notas:</span> {track.notesCount}</span>
        <span><BarChart3 size={15} aria-hidden="true" /><span className="visually-hidden">Enquetes:</span> {track.pollsCount}</span>
      </div>
      <span className="track-row__expiry catalog-status">
        <Clock3 size={14} aria-hidden="true" />
        {track.remainingDays} dias restantes
      </span>
      <div className="track-row__actions">
        <button className="track-row__action" type="button" onClick={() => onShare(roomUrl, track.name)} aria-label={`Compartilhar ${track.name}`}>
          <Share2 size={17} aria-hidden="true" />
        </button>
        <button className="track-row__action" type="button" onClick={() => onAction(track.name)} aria-label={`Mais ações para ${track.name}`}>
          <MoreHorizontal size={19} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
