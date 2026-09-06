import assert from "node:assert/strict";
import test from "node:test";
import { filterProjects, findArtistId } from "../src/catalog.js";

const artists = [{ id: "furuya", name: "Furuya" }];
const albums = [{ id: "album", name: "Duality Dust", artistId: "furuya" }];
const tracks = [{ id: "track", name: "GT Mode", artistDisplay: "Furuya" }];

test("filtra projetos por texto e tipo", () => {
  assert.deepEqual(filterProjects({ albums, artists, query: "duality", tracks, type: "all" }), {
    albums,
    tracks: [],
  });
  assert.deepEqual(filterProjects({ albums, artists, query: "furuya", tracks, type: "tracks" }), {
    albums: [],
    tracks,
  });
});

test("vincula nomes de artistas existentes", () => {
  assert.equal(findArtistId(artists, " furuya "), "furuya");
  assert.equal(findArtistId(artists, "Outro Artista"), null);
});
