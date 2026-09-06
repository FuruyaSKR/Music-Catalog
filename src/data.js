export const currentUser = {
  name: "Victor",
  email: "victor@example.com",
  initial: "V",
};

export const artists = [
  {
    id: "furuya",
    name: "Furuya",
    initial: "F",
  },
];

export const albums = [
  {
    id: "xjeok9wp",
    name: "Duality Dust",
    artistId: "furuya",
    type: "EP",
    year: 2026,
    description: "",
    cover: null,
    trackIds: ["albmsemd"],
  },
];

export const tracks = [
  {
    id: "duality-dust",
    name: "Duality Dust",
    artistIds: ["furuya"],
    artistDisplay: "Furuya",
    albumId: null,
    version: "Versão inicial",
    durationSeconds: 0,
    notesCount: 1,
    pollsCount: 0,
    remainingDays: 168,
  },
  {
    id: "04kihnnd",
    name: "GT Mode",
    artistIds: ["furuya"],
    artistDisplay: "Furuya",
    albumId: null,
    version: "GT Mode 5.wav",
    durationSeconds: 89.825,
    notesCount: 0,
    pollsCount: 0,
    remainingDays: 14,
  },
  {
    id: "albmsemd",
    name: "Roda Gigante",
    artistIds: ["furuya"],
    artistDisplay: "Furuya, Branvi, LM",
    albumId: "xjeok9wp",
    version: "Roda Gigante Remake (beat gustavin) Premix tester.mp3",
    durationSeconds: 178.965,
    notesCount: 0,
    pollsCount: 0,
    remainingDays: 14,
  },
];

export const updates = [
  {
    id: "gt-mode-version",
    type: "version",
    title: "Nova versão de GT Mode",
    description: "GT Mode 5.wav foi adicionada.",
    target: "/room/04kihnnd",
    occurredAt: "2026-09-01T00:19:15.687Z",
  },
  {
    id: "duality-dust-note",
    type: "note",
    title: "Nova nota em Duality Dust",
    description: "Uma nota foi adicionada à faixa.",
    target: "/",
    occurredAt: "2026-09-01T00:18:00.198Z",
  },
  {
    id: "roda-gigante-album",
    type: "track",
    title: "Roda Gigante adicionada ao álbum",
    description: "A faixa agora faz parte de Duality Dust.",
    target: "/space/xjeok9wp",
    occurredAt: "2026-09-01T00:17:08.063Z",
  },
];
