import assert from "node:assert/strict";
import test from "node:test";
import { getAudioFileError, MAX_AUDIO_SIZE, toFileMetadata } from "../src/files.js";

test("valida somente os metadados aceitos de áudio", () => {
  const audio = { name: "demo.wav", size: 1024, type: "audio/wav", contents: "ignored" };

  assert.equal(getAudioFileError(audio), "");
  assert.match(getAudioFileError({ ...audio, name: "demo.txt" }), /MP3/);
  assert.match(getAudioFileError({ ...audio, size: MAX_AUDIO_SIZE + 1 }), /25 MB/);
  assert.deepEqual(toFileMetadata(audio), { name: "demo.wav", size: 1024, type: "audio/wav" });
});
