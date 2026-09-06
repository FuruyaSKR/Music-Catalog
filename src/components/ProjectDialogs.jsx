import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BarChart3,
  FileAudio,
  FolderPlus,
  ImagePlus,
  Mic,
  Pause,
  Play,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Dialog from "./Dialog.jsx";
import { AUDIO_ACCEPT, getAudioFileError, toFileMetadata } from "../files.js";

function AudioDropzone({ autoFocus = false, error, file, id, inputRef, onFile }) {
  const errorId = `${id}-error`;
  const instructionsId = `${id}-instructions`;

  return (
    <div className="catalog-field">
      <span className="catalog-field__label">Arquivo de áudio <span aria-hidden="true">*</span></span>
      <label
        className={`file-dropzone${error ? " file-dropzone--error" : ""}`}
        htmlFor={id}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          id={id}
          type="file"
          accept={AUDIO_ACCEPT}
          autoFocus={autoFocus}
          aria-label="Arquivo de áudio"
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={`${instructionsId}${error ? ` ${errorId}` : ""}`}
          onChange={({ target }) => {
            onFile(target.files[0]);
            target.value = "";
          }}
        />
        <span className="file-dropzone__icon" aria-hidden="true"><Upload size={21} /></span>
        {file ? (
          <strong className="file-dropzone__filename catalog-truncate">{file.name}</strong>
        ) : (
          <strong>Arraste e solte ou clique para enviar áudio</strong>
        )}
        <small id={instructionsId} className={file ? "visually-hidden" : undefined}>Suporta MP3, WAV, AIFF, OGG (Máx 25MB)</small>
      </label>
      {error && <span className="catalog-field__error" id={errorId} role="alert">{error}</span>}
    </div>
  );
}

export function NewAlbumDialog({ onClose, onCreate, open }) {
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");

  const close = () => {
    setName("");
    setArtist("");
    onClose();
  };

  return (
    <Dialog
      title="Novo Álbum"
      description="Agrupe várias faixas em um EP ou Álbum."
      icon={FolderPlus}
      open={open}
      onClose={close}
    >
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          const albumName = name.trim();
          const artistName = artist.trim();
          if (!albumName || !artistName) return;
          onCreate({ name: albumName, artist: artistName });
          close();
        }}
      >
        <label className="catalog-field">
          <span className="catalog-field__label">Nome do álbum <span aria-hidden="true">*</span></span>
          <input className="catalog-input" value={name} onChange={({ target }) => setName(target.value)} placeholder="Ex: Mixes de Verão 2026" pattern=".*\S.*" autoFocus required />
        </label>
        <label className="catalog-field">
          <span className="catalog-field__label">Nome do artista <span aria-hidden="true">*</span></span>
          <input className="catalog-input" value={artist} onChange={({ target }) => setArtist(target.value)} placeholder="Ex: Luna Wave" pattern=".*\S.*" required />
        </label>
        <footer className="project-form__footer">
          <button className="catalog-button" type="button" onClick={close}>Cancelar</button>
          <button className="catalog-button catalog-button--primary" type="submit">Criar Álbum</button>
        </footer>
      </form>
    </Dialog>
  );
}

export function NewTrackDialog({ albumId = "", albumOptions, onClose, onCreate, open }) {
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState(albumId);
  const [cover, setCover] = useState("");
  const [audio, setAudio] = useState(null);
  const [audioError, setAudioError] = useState("");
  const audioInputRef = useRef(null);

  const selectAudio = (file) => {
    const error = getAudioFileError(file);
    setAudioError(error);
    setAudio(error ? null : toFileMetadata(file));
  };

  const close = () => {
    setName("");
    setArtist("");
    setSelectedAlbumId(albumId);
    setCover("");
    setAudio(null);
    setAudioError("");
    onClose();
  };

  return (
    <Dialog
      title="Nova Faixa"
      description="Envie uma única música para receber feedback com timestamps."
      icon={AudioLines}
      open={open}
      onClose={close}
      size="large"
    >
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          const trackName = name.trim();
          const artistName = artist.trim();
          if (!trackName || !artistName) return;
          if (!audio) {
            setAudioError("Selecione um arquivo de áudio.");
            audioInputRef.current?.focus();
            return;
          }
          onCreate({ name: trackName, artist: artistName, albumId: selectedAlbumId || null, cover, audio });
          close();
        }}
      >
        <label className="catalog-field">
          <span className="catalog-field__label">Nome da faixa <span aria-hidden="true">*</span></span>
          <input className="catalog-input" value={name} onChange={({ target }) => setName(target.value)} placeholder="Ex: Noites de Verão" pattern=".*\S.*" autoFocus required />
        </label>
        <label className="catalog-field">
          <span className="catalog-field__label">Nome do artista <span aria-hidden="true">*</span></span>
          <input className="catalog-input" value={artist} onChange={({ target }) => setArtist(target.value)} placeholder="Ex: Luna Wave" pattern=".*\S.*" required />
        </label>
        <label className="catalog-field">
          <span className="catalog-field__label">Álbum (opcional)</span>
          <select className="catalog-input" value={selectedAlbumId} onChange={({ target }) => setSelectedAlbumId(target.value)}>
            <option value="">Sem álbum (Faixa avulsa)</option>
            {albumOptions.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
          </select>
        </label>
        <div className="catalog-field">
          <span className="catalog-field__label">Capa (opcional)</span>
          <label className="file-picker" htmlFor="new-track-cover">
            <ImagePlus size={18} aria-hidden="true" />
            <span className="catalog-truncate">{cover || "Adicionar capa"}</span>
            <input
              className="visually-hidden"
              id="new-track-cover"
              type="file"
              accept="image/*"
              aria-label="Capa da faixa"
              onChange={({ target }) => {
                setCover(target.files[0]?.name ?? "");
                target.value = "";
              }}
            />
          </label>
        </div>
        <AudioDropzone id="new-track-audio" file={audio} error={audioError} inputRef={audioInputRef} onFile={selectAudio} />
        <footer className="project-form__footer">
          <button className="catalog-button" type="button" onClick={close}>Cancelar</button>
          <button className="catalog-button catalog-button--primary" type="submit">Criar Faixa</button>
        </footer>
      </form>
    </Dialog>
  );
}

export function NewVersionDialog({ onClose, onUpload, open }) {
  const [audio, setAudio] = useState(null);
  const [audioError, setAudioError] = useState("");
  const audioInputRef = useRef(null);

  const selectAudio = (file) => {
    const error = getAudioFileError(file);
    setAudioError(error);
    setAudio(error ? null : toFileMetadata(file));
  };

  const close = () => {
    setAudio(null);
    setAudioError("");
    onClose();
  };

  return (
    <Dialog
      title="New version"
      description="Upload a new version of the audio for this room"
      icon={Upload}
      open={open}
      onClose={close}
    >
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!audio) {
            setAudioError("Selecione um arquivo de áudio.");
            audioInputRef.current?.focus();
            return;
          }
          onUpload(audio);
          close();
        }}
      >
        <AudioDropzone id="new-version-audio" file={audio} error={audioError} inputRef={audioInputRef} onFile={selectAudio} autoFocus />
        <footer className="project-form__footer">
          <button className="catalog-button" type="button" onClick={close}>Cancel</button>
          <button className="catalog-button catalog-button--primary" type="submit">Upload version</button>
        </footer>
      </form>
    </Dialog>
  );
}

export function AudioNoteDialog({ onClose, onSend, open, position = "0:00" }) {
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setTimeout(() => setIsPlaying(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isPlaying]);

  const close = () => {
    setText("");
    setIsPlaying(false);
    onClose();
  };

  return (
    <Dialog
      title="Enviar nota de áudio?"
      description="Ouça sua gravação antes de enviar"
      icon={Mic}
      open={open}
      onClose={close}
    >
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSend({ position, text: text.trim(), type: "audio" });
          close();
        }}
      >
        <span className="audio-note__position">{position}</span>
        <div className="audio-note__preview">
          <button type="button" autoFocus onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? "Pausar prévia" : "Reproduzir prévia"}>
            {isPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
          </button>
          <span className="audio-note__timeline">
            <span key={String(isPlaying)} data-playing={isPlaying} />
          </span>
          <small>0:02</small>
        </div>
        <label className="catalog-field">
          <span className="catalog-field__label">Texto complementar (opcional)</span>
          <textarea className="catalog-input project-form__textarea" value={text} onChange={({ target }) => setText(target.value)} placeholder="Adicione um comentário..." />
        </label>
        <footer className="project-form__footer">
          <button className="catalog-button catalog-button--danger" type="button" onClick={close}>Descartar</button>
          <button className="catalog-button catalog-button--primary" type="submit">Enviar</button>
        </footer>
      </form>
    </Dialog>
  );
}

const initialPollOptions = () => [
  { id: crypto.randomUUID(), text: "" },
  { id: crypto.randomUUID(), text: "" },
];

export function PollDialog({ onClose, onCreate, onNotify, open, position = "0:00" }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(initialPollOptions);
  const [multiple, setMultiple] = useState(false);
  const [mediaStatus, setMediaStatus] = useState("");
  const addOptionRef = useRef(null);
  const isValid = question.trim() && options.every(({ text }) => text.trim());

  const close = () => {
    setQuestion("");
    setOptions(initialPollOptions());
    setMultiple(false);
    setMediaStatus("");
    onClose();
  };

  return (
    <Dialog
      title="Criar Enquete"
      description="Compare ideias e receba votos em um ponto específico da faixa."
      icon={BarChart3}
      open={open}
      onClose={close}
      size="wide"
    >
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          onCreate({ question: question.trim(), options: options.map(({ text }) => text.trim()), multiple, position });
          close();
        }}
      >
        <label className="catalog-field">
          <span className="catalog-field__label">Pergunta <span aria-hidden="true">*</span></span>
          <input className="catalog-input" value={question} onChange={({ target }) => setQuestion(target.value)} placeholder="Qual versão funciona melhor?" pattern=".*\S.*" autoFocus required />
          <small className="project-form__hint">Posição: {position}</small>
        </label>

        <div className="poll-options__heading">
          <span className="catalog-field__label">Opções ({options.length}/6)</span>
          <button ref={addOptionRef} className="poll-options__add" type="button" disabled={options.length === 6} onClick={() => setOptions((items) => [...items, { id: crypto.randomUUID(), text: "" }])}>
            <Plus size={15} aria-hidden="true" /> Adicionar opção
          </button>
        </div>

        <div className="poll-options">
          {options.map((option, index) => (
            <div className="poll-option" key={option.id}>
              <span className="poll-option__number" aria-hidden="true">{index + 1}</span>
              <label className="visually-hidden" htmlFor={`poll-option-${option.id}`}>Opção {index + 1}</label>
              <input
                className="catalog-input"
                id={`poll-option-${option.id}`}
                value={option.text}
                onChange={({ target }) => setOptions((items) => items.map((item) => item.id === option.id ? { ...item, text: target.value } : item))}
                placeholder={`Opção ${index + 1}`}
                pattern=".*\S.*"
                required
              />
              <div className="poll-option__media">
                <button type="button" onClick={() => { const message = "Gravação simulada; o microfone não foi ativado."; setMediaStatus(message); onNotify(message); }}><Mic size={14} aria-hidden="true" /> Gravar</button>
                <button type="button" onClick={() => { const message = "Upload simulado; nenhum arquivo foi lido."; setMediaStatus(message); onNotify(message); }}><Upload size={14} aria-hidden="true" /> Upload</button>
                <button type="button" onClick={() => { const message = "Prévia de clip indisponível nesta demonstração."; setMediaStatus(message); onNotify(message); }}><FileAudio size={14} aria-hidden="true" /> Clip</button>
              </div>
              <button
                className="poll-option__remove"
                type="button"
                disabled={options.length === 2}
                onClick={() => {
                  setOptions((items) => items.filter(({ id }) => id !== option.id));
                  window.requestAnimationFrame(() => addOptionRef.current?.focus());
                }}
                aria-label={`Remover opção ${index + 1}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">{mediaStatus}</p>

        <label className="project-form__checkbox">
          <input type="checkbox" checked={multiple} onChange={({ target }) => setMultiple(target.checked)} />
          Permitir múltiplas escolhas
        </label>

        <footer className="project-form__footer">
          <button className="catalog-button" type="button" onClick={close}>Cancelar</button>
          <button className="catalog-button catalog-button--primary" type="submit">Criar Enquete</button>
        </footer>
      </form>
    </Dialog>
  );
}
