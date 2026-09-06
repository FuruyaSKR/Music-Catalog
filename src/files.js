export const AUDIO_ACCEPT = ".mp3,.wav,.aif,.aiff,.ogg,audio/mpeg,audio/wav,audio/x-wav,audio/aiff,audio/ogg";
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

export function getAudioFileError(file) {
  if (!file) return "Selecione um arquivo de áudio.";
  if (!/\.(mp3|wav|aif|aiff|ogg)$/i.test(file.name)) return "Use um arquivo MP3, WAV, AIFF ou OGG.";
  if (file.size > MAX_AUDIO_SIZE) return "O arquivo deve ter no máximo 25 MB.";
  return "";
}

export function toFileMetadata(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}
