import {
  BarChart3,
  Check,
  Grid2X2,
  List,
  Lock,
  MessageSquare,
  Mic,
  Plus,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { AudioNoteDialog, NewVersionDialog, PollDialog } from "../components/ProjectDialogs.jsx";
import RoomPlayer from "../components/RoomPlayer.jsx";
import { formatTime } from "../player.js";

const filters = [
  { value: "all", label: "Todas" },
  { value: "notes", label: "Notas" },
  { value: "polls", label: "Enquete" },
];

function FeedbackItem({ item }) {
  const Icon = item.type === "poll" ? BarChart3 : item.type === "audio" ? Mic : MessageSquare;

  return (
    <article className="feedback-item catalog-card">
      <span className="feedback-item__icon" aria-hidden="true"><Icon size={17} /></span>
      <div className="feedback-item__body">
        <div className="feedback-item__heading">
          <strong>{item.type === "poll" ? item.question : item.type === "audio" ? "Nota de áudio" : "Nota"}</strong>
          <span>{item.position}</span>
        </div>
        {item.text && <p>{item.text}</p>}
        {item.type === "poll" && (
          <ul className="feedback-item__options">
            {item.options.map((option, index) => <li key={`${index}-${option}`}>{option}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function RoomPage() {
  const { roomId } = useParams();
  const { addRoomItem, roomItems, shareProject, showDemoMessage, tracks, updateTrack } = useOutletContext();
  const [activeDialog, setActiveDialog] = useState(null);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("cards");
  const [note, setNote] = useState("");
  const [position, setPosition] = useState(0);
  const track = tracks.find(({ id }) => id === roomId);
  const items = roomItems[roomId] ?? [];
  const visibleItems = items.filter((item) => filter === "all" || (filter === "polls" ? item.type === "poll" : item.type !== "poll"));
  const formattedPosition = formatTime(position);

  if (!track) {
    return (
      <section className="screen-placeholder">
        <span className="screen-placeholder__eyebrow">Faixa indisponível</span>
        <h1 className="screen-placeholder__title">Sala não encontrada</h1>
        <p className="screen-placeholder__copy">Esta faixa não existe ou a sessão foi reiniciada.</p>
        <Link className="catalog-button catalog-button--primary screen-placeholder__action" to="/">Voltar ao catálogo</Link>
      </section>
    );
  }

  const createItem = (item) => {
    addRoomItem(track.id, item);
    showDemoMessage(item.type === "poll" ? "Enquete criada nesta sessão." : "Nota adicionada nesta sessão.");
  };

  return (
    <section className="room-page">
      <header className="room-heading">
        <div>
          <h1>{track.name}</h1>
          <p>{track.artistDisplay}</p>
        </div>
        <span className="room-heading__expiry catalog-status">{track.remainingDays}d restantes</span>
        <button className="catalog-button" type="button" onClick={() => shareProject(`/room/${track.id}`, track.name)}>
          <Share2 size={17} aria-hidden="true" /> Compartilhar
        </button>
      </header>

      <section className="version-bar" aria-labelledby="versions-heading">
        <div className="version-bar__identity">
          <h2 id="versions-heading">Versões</h2>
          <strong className="catalog-truncate">{track.version}</strong>
        </div>
        <div className="version-bar__actions">
          <button
            className={track.approved ? "version-bar__approved" : ""}
            type="button"
            onClick={() => {
              updateTrack(track.id, { approved: !track.approved });
              showDemoMessage(track.approved ? "A aprovação foi removida." : "Versão aprovada nesta sessão.");
            }}
          >
            <Check size={16} aria-hidden="true" /> {track.approved ? "Aprovada" : "Aprovar"}
          </button>
          <button type="button" onClick={() => showDemoMessage("Exclusão simulada; nada foi removido.")}>
            <Trash2 size={16} aria-hidden="true" /> Excluir
          </button>
          <button className="version-bar__new" type="button" onClick={() => setActiveDialog("version")}>
            <Upload size={16} aria-hidden="true" /> Nova versão
          </button>
        </div>
      </section>

      <section className="room-feedback" aria-labelledby="feedback-heading">
        <header className="room-feedback__header">
          <div className="room-feedback__title">
            <h2 id="feedback-heading">Feedback</h2>
            <span aria-label={`${items.length} feedbacks`}>{items.length}</span>
            <span className="room-feedback__privacy" title="Feedback privado"><Lock size={14} aria-hidden="true" /><span className="visually-hidden">Feedback privado</span></span>
          </div>
          <div className="room-feedback__controls">
            <div className="room-feedback__filters" role="group" aria-label="Filtrar feedbacks">
              {filters.map(({ label, value }) => (
                <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
              ))}
            </div>
            <div className="room-feedback__views" role="group" aria-label="Modo de exibição">
              <button type="button" aria-label="Exibir em cards" aria-pressed={view === "cards"} onClick={() => setView("cards")}><Grid2X2 size={16} aria-hidden="true" /></button>
              <button type="button" aria-label="Exibir em lista" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={17} aria-hidden="true" /></button>
            </div>
          </div>
        </header>
        <p className="visually-hidden" role="status" aria-live="polite">{visibleItems.length} feedbacks exibidos.</p>

        {visibleItems.length ? (
          <div className="room-feedback__items" data-view={view}>
            {visibleItems.map((item) => <FeedbackItem key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="room-feedback__empty">
            <span aria-hidden="true"><MessageSquare size={24} /></span>
            <strong>{items.length ? "Nenhum feedback neste filtro" : "Nenhuma nota ainda"}</strong>
            <p>{items.length ? "Escolha outro tipo de feedback." : "Pause o áudio e clique em ‘Nova nota’ para comentar um momento da faixa."}</p>
          </div>
        )}

        <div className="room-composer">
          <label className="visually-hidden" htmlFor="room-note">Adicionar nota</label>
          <textarea
            className="catalog-input"
            id="room-note"
            value={note}
            onChange={({ target }) => setNote(target.value)}
            placeholder={`Adicionar nota em ${formattedPosition}...`}
          />
          <div className="room-composer__actions">
            <button type="button" onClick={() => setActiveDialog("audio")}><Mic size={16} aria-hidden="true" /> Nota de áudio</button>
            <button type="button" onClick={() => setActiveDialog("poll")}><BarChart3 size={16} aria-hidden="true" /> Enquete</button>
            <button
              className="catalog-button catalog-button--primary"
              type="button"
              disabled={!note.trim()}
              onClick={() => {
                createItem({ type: "note", text: note.trim(), position: formattedPosition });
                setNote("");
              }}
            >
              <Plus size={16} aria-hidden="true" /> Adicionar nota · {formattedPosition}
            </button>
          </div>
        </div>
      </section>

      <RoomPlayer key={track.id} track={track} onTimeChange={setPosition} />

      <NewVersionDialog
        open={activeDialog === "version"}
        onClose={() => setActiveDialog(null)}
        onUpload={({ name }) => {
          updateTrack(track.id, { version: name, approved: false });
          showDemoMessage(`${name} foi definida como versão atual nesta sessão.`);
        }}
      />
      <AudioNoteDialog
        open={activeDialog === "audio"}
        position={formattedPosition}
        onClose={() => setActiveDialog(null)}
        onSend={createItem}
      />
      <PollDialog
        open={activeDialog === "poll"}
        position={formattedPosition}
        onClose={() => setActiveDialog(null)}
        onCreate={(poll) => createItem({ ...poll, type: "poll" })}
        onNotify={showDemoMessage}
      />
    </section>
  );
}
