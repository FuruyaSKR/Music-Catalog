export function filterProjects({ albums, artists, query, tracks, type }) {
  const term = query.trim().toLocaleLowerCase("pt-BR");
  const artistNames = new Map(artists.map((artist) => [artist.id, artist.name]));
  const matches = (...values) => !term || values.some((value) => value.toLocaleLowerCase("pt-BR").includes(term));

  return {
    albums: type === "tracks"
      ? []
      : albums.filter((album) => matches(album.name, artistNames.get(album.artistId) ?? album.artistName ?? "")),
    tracks: type === "albums"
      ? []
      : tracks.filter((track) => matches(track.name, track.artistDisplay)),
  };
}

export function findArtistId(artists, name) {
  const normalizedName = name.trim().toLocaleLowerCase("pt-BR");
  return artists.find((artist) => artist.name.toLocaleLowerCase("pt-BR") === normalizedName)?.id ?? null;
}
