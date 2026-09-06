import { Bell, ChevronRight, MessageSquare, Music2, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { updates } from "../data.js";
import { formatRelativeDate } from "../updates.js";

const filters = [
  { value: "all", label: "Todas" },
  { value: "note", label: "Notas" },
  { value: "version", label: "Versões" },
];

const updateIcons = {
  note: MessageSquare,
  track: Music2,
  version: Upload,
};

export default function UpdatesPage() {
  const [filter, setFilter] = useState("all");
  const visibleUpdates = updates.filter((update) => filter === "all" || update.type === filter);

  return (
    <section className="updates-page">
      <header className="updates-page__header">
        <span className="updates-page__header-icon" aria-hidden="true"><Bell size={22} /></span>
        <div>
          <h1>Atualizações</h1>
          <p>Atividade recente dos seus projetos</p>
        </div>
      </header>

      <div className="updates-page__filters" role="group" aria-label="Filtrar atualizações">
        {filters.map(({ label, value }) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{visibleUpdates.length} atualizações exibidas.</p>

      {visibleUpdates.length ? (
        <ol className="updates-list">
          {visibleUpdates.map((update) => {
            const Icon = updateIcons[update.type];
            const fullDate = new Date(update.occurredAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });

            return (
              <li key={update.id}>
                <Link className="updates-list__item catalog-card" to={update.target}>
                  <span className="updates-list__icon" data-type={update.type} aria-hidden="true"><Icon size={18} /></span>
                  <span className="updates-list__content">
                    <strong>{update.title}</strong>
                    <span>{update.description}</span>
                  </span>
                  <time dateTime={update.occurredAt} title={fullDate}>{formatRelativeDate(update.occurredAt)}</time>
                  <ChevronRight className="updates-list__arrow" size={17} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="updates-page__empty">
          <MessageSquare size={22} aria-hidden="true" />
          <p>Nenhuma atualização neste filtro.</p>
        </div>
      )}
    </section>
  );
}
