# Music Catalog - Arquitetura de Mídia e Evolução do Catálogo

## Status

Documento de planejamento para o ciclo posterior ao protótipo visual.

Nenhuma integração descrita aqui está implementada. As decisões serão validadas por experimentos antes da alteração do modelo principal da aplicação.

## Objetivo

Evoluir o Music Catalog para uma aplicação administrável em produção, capaz de:

- Cadastrar artistas, álbuns, faixas e versões.
- Reproduzir o WAV original completo sem transcodificação.
- Exibir uma waveform calculada a partir do WAV completo.
- Manter histórico de versões e uma única versão aprovada por faixa.
- Vincular notas e enquetes à versão correta.
- Usar Google Drive como primeira opção de armazenamento.
- Avaliar Cloudflare R2 somente se o Drive não atender à reprodução.
- Manter visitantes em modo somente leitura.

## Decisões Confirmadas

- Não haverá áudio reduzido ou trecho de preview.
- A reprodução deverá usar o WAV original completo.
- Uma faixa poderá pertencer a vários álbuns ou EPs.
- Álbuns e faixas poderão ter vários artistas.
- Apenas uma versão poderá estar aprovada por faixa.
- Notas, enquetes e timestamps pertencerão a uma versão específica.
- O primeiro experimento usará um WAV real fornecido pelo proprietário.
- O primeiro experimento será validado em Chrome, Edge e Firefox no desktop.
- Google Drive será testado antes de qualquer outro provedor.
- Segurança de visualização será tratada depois da arquitetura de catálogo e mídia.

## Distinção Importante

Reproduzir o WAV completo não significa baixar o arquivo inteiro antes do primeiro play.

Com suporte a HTTP Range, o navegador pode solicitar somente os blocos necessários:

```text
WAV completo remoto
        |
        +-- metadados e duração
        +-- bytes necessários para iniciar
        +-- novos intervalos durante o seek
        `-- restante dos bytes conforme a reprodução avança
```

Se o usuário ouvir a faixa inteira, o volume completo do arquivo será transferido. Um WAV de 100 MB representa aproximadamente 100 MB de tráfego por reprodução completa.

## Arquitetura Pretendida

```text
GitHub Pages
  React + Vite
  modo visitante por padrão
  modo administrador após Google OAuth
        |
        +-- catalog.json
        +-- imagens
        +-- peaks da waveform
        `-- WAVs das versões
                  |
                  +-- Google Drive: primeira opção
                  `-- Cloudflare R2: fallback
```

O GitHub Pages continuará hospedando apenas a aplicação. O catálogo e as mídias serão carregados em runtime.

Um JSON empacotado pelo Vite não pode ser alterado em produção. Para permitir administração sem novo deploy, o `catalog.json` também precisará ficar no provedor remoto.

## Reprodução Lossless

O player deverá usar um elemento `<audio>` real:

```html
<audio preload="metadata" src="URL_DO_WAV"></audio>
```

Regras:

- Não usar `fetch(...).arrayBuffer()` para a reprodução normal.
- Não decodificar o WAV completo no navegador do visitante.
- Manter somente um elemento de áudio ativo na aplicação.
- Pausar o áudio anterior ao selecionar outra faixa ou versão.
- Usar `currentTime` para seek e posicionamento das notas.
- Liberar referências e listeners ao trocar de versão.
- Exibir erro e opção de tentar novamente quando o stream falhar.

## Waveform

A waveform será derivada do WAV completo, mas armazenada separadamente como uma coleção pequena de picos.

```text
Admin seleciona WAV
        |
        +-- lê duração e formato
        +-- calcula min/max por janela
        +-- gera peaks.json
        +-- envia master.wav
        `-- envia peaks.json
```

Isso permite exibir a waveform antes de transferir os 100 MB do WAV.

Formato inicial proposto:

```json
{
  "format": "minmax-v1",
  "durationSeconds": 178.965,
  "pointsPerSecond": 100,
  "channels": 1,
  "min": [-4, -8, -21],
  "max": [5, 12, 25]
}
```

Para o primeiro experimento, `decodeAudioData()` é suficiente para calcular os picos no dispositivo do administrador. Essa operação acontece uma vez por upload.

Se o WAV real consumir memória excessiva, o próximo passo será um parser PCM em Web Worker que leia o `File` em blocos. Essa complexidade só será adicionada se o experimento justificar.

WaveSurfer poderá consumir picos pré-calculados e controlar um media element. Ele só será adicionado se o player próprio não atender a zoom, regiões, timeline e sincronização.

## Tracklist

A tracklist não carregará vários WAVs ao mesmo tempo.

```text
Tracklist
  carrega metadados
  carrega arquivos pequenos de picos
  seleciona uma faixa
        |
        `-- player global recebe uma única versão WAV
```

Mini-waveforms podem ser desenhadas usando os picos. A mídia só será conectada ao player quando o usuário selecionar a faixa.

## Modelo De Dados Proposto

```json
{
  "schemaVersion": 1,
  "artists": [],
  "albums": [],
  "tracks": [],
  "albumTracks": [],
  "versions": [],
  "feedback": [],
  "changes": []
}
```

### Artist

```json
{
  "id": "artist-id",
  "name": "Furuya",
  "biography": "",
  "avatar": { "provider": "drive", "fileId": "" },
  "cover": { "provider": "drive", "fileId": "" }
}
```

### Album

```json
{
  "id": "album-id",
  "name": "Duality Dust",
  "type": "ep",
  "year": 2026,
  "description": "",
  "artistIds": ["artist-id"],
  "cover": { "provider": "drive", "fileId": "" }
}
```

### Track

```json
{
  "id": "track-id",
  "name": "Roda Gigante",
  "artistIds": ["artist-id", "collaborator-id"],
  "artwork": { "provider": "drive", "fileId": "" },
  "approvedVersionId": "version-id"
}
```

### AlbumTrack

```json
{
  "albumId": "album-id",
  "trackId": "track-id",
  "position": 1
}
```

`AlbumTrack` será a única fonte de vínculo entre faixas e álbuns. Não serão mantidos simultaneamente `album.trackIds` e `track.albumId`.

### Version

```json
{
  "id": "version-id",
  "trackId": "track-id",
  "ordinal": 2,
  "name": "Premix 2",
  "changeNotes": "Vocal +1 dB e compressão no bus",
  "createdAt": "2026-09-06T12:00:00.000Z",
  "audio": {
    "provider": "drive",
    "fileId": "drive-file-id",
    "fileName": "roda-gigante-premix-2.wav",
    "mimeType": "audio/wav",
    "sizeBytes": 104857600,
    "durationSeconds": 178.965
  },
  "waveform": {
    "provider": "drive",
    "fileId": "drive-peaks-id",
    "pointsPerSecond": 100
  }
}
```

Versões serão imutáveis. Um novo upload criará uma nova entidade em vez de sobrescrever a anterior.

### Feedback

```json
{
  "id": "feedback-id",
  "versionId": "version-id",
  "type": "note",
  "positionSeconds": 42.5,
  "content": "Rever o vocal neste trecho."
}
```

## Organização No Drive

```text
Music Catalog/
  catalog.json
  artists/
    {artistId}/
      avatar.webp
      cover.webp
  albums/
    {albumId}/
      cover.webp
  tracks/
    {trackId}/
      artwork.webp
      versions/
        {versionId}/
          master.wav
          peaks.json
```

O catálogo armazenará `fileId`, não o caminho da pasta. Pastas serão usadas apenas para organização no Drive.

## Administração Em Produção

O administrador entrará com Google OAuth. O Drive será responsável por autorizar operações de escrita.

Regras:

- Usar o escopo mais restrito possível, inicialmente `drive.file`.
- Não incluir client secret no bundle.
- Manter access token somente em memória.
- Não armazenar refresh token no frontend.
- Usar upload resumível para WAVs grandes.
- Publicar uma versão no catálogo somente após WAV e peaks terminarem de subir.
- Visitantes não receberão controles de criação ou edição.
- Forçar a interface admin pelo DevTools não concederá permissão de escrita no Drive.

## Leitura Pública E Segurança

O plano inicial considera arquivos do Drive públicos para leitura. Isso simplifica `<img>`, `<audio>` e o carregamento do catálogo.

Consequências:

- URLs e `fileId` poderão ser vistos na aba Network.
- Um visitante autorizado poderá repassar a URL.
- Uma senha implementada somente no React não protege os arquivos.
- CORS controla quais páginas leem respostas via JavaScript, mas não impede download.

A segurança de visualização continuará como uma etapa posterior. Opções futuras incluem Cloudflare Access, login Google com allowlist ou serviço de autenticação.

## Google Drive

O Drive será aprovado como provedor de reprodução somente se o endpoint público:

- Entregar o WAV original sem transcodificação.
- Aceitar requisições com header `Range`.
- Responder intervalos válidos com `206 Partial Content`.
- Expor `Content-Range`, `Content-Length` e `Content-Type` corretamente.
- Permitir seek sem reiniciar o download no byte zero.
- Não retornar página HTML de confirmação.
- Não bloquear o fluxo normal por quota ou proteção contra download automatizado.
- Funcionar em Chrome, Edge e Firefox.

A API oficial do Drive documenta downloads com `files.get?alt=media` e suporte a downloads parciais com `Range`.

O Drive não é documentado como CDN de mídia. O experimento é obrigatório antes de adotá-lo.

## Cloudflare R2

O R2 será avaliado apenas se o Drive falhar nos critérios de reprodução.

Características relevantes do plano Standard na documentação atual:

- 10 GB-mês gratuitos de armazenamento.
- 10 milhões de leituras mensais gratuitas.
- Tráfego de saída para a internet sem cobrança.
- Suporte a HTTP Range.
- CORS configurável.
- Domínio público para mídia.

Dez gigabytes comportam aproximadamente cem arquivos de 100 MB. O histórico de versões consumirá essa franquia progressivamente.

No experimento, os arquivos podem ser enviados manualmente pelo painel. Upload administrativo seguro em produção exigirá posteriormente um Worker mínimo para emitir URLs temporárias sem expor credenciais.

Os limites e preços devem ser conferidos novamente antes da adoção em produção.

## Provedores Não Recomendados

### SoundCloud

O SoundCloud aceita WAV como origem, mas transcodifica o arquivo para formatos de streaming, como AAC. O player não entrega o WAV original.

Também exige aplicação registrada, autenticação, atribuição ao SoundCloud e pode restringir streams. Não atende ao requisito lossless.

### YouTube

O YouTube transcodifica o áudio e não oferece o controle necessário sobre waveform, versões e arquivos. Não atende ao requisito lossless.

### GitHub Pages

O GitHub bloqueia arquivos comuns acima de 100 MiB, recomenda repositórios abaixo de 1 GB e limita o site publicado a 1 GB. O histórico Git também manteria versões antigas dos WAVs.

O Pages continuará hospedando somente código e assets pequenos.

## Experimento 1 - WAV Local

- [ ] Receber um WAV real sem adicioná-lo ao Git.
- [ ] Criar uma rota experimental isolada.
- [ ] Selecionar o arquivo com `<input type="file">`.
- [ ] Criar URL temporária com `URL.createObjectURL`.
- [ ] Reproduzir usando `<audio preload="metadata">`.
- [ ] Validar play, pause, duração, volume e seek.
- [ ] Gerar peaks a partir do arquivo completo.
- [ ] Renderizar waveform navegável.
- [ ] Medir tempo de geração e uso aproximado de memória.
- [ ] Revogar object URLs ao trocar ou fechar o arquivo.
- [ ] Validar Chrome, Edge e Firefox desktop.

### Critérios De Aceite

- A música toca do início ao fim.
- A reprodução usa o WAV original.
- Seek funciona em 10%, 50% e 90%.
- A waveform representa a duração completa.
- Clicar na waveform altera `currentTime` corretamente.
- A interface não trava permanentemente durante a geração dos picos.
- Trocar o arquivo libera o player anterior.

## Experimento 2 - Drive Público

- [ ] Fazer upload manual do mesmo WAV.
- [ ] Configurar o arquivo para leitura pública.
- [ ] Registrar `fileId` e URL de download usada.
- [ ] Testar requisição comum.
- [ ] Testar `Range: bytes=0-1`.
- [ ] Confirmar `206 Partial Content`.
- [ ] Confirmar `Content-Range` e `Content-Type: audio/wav`.
- [ ] Reproduzir no `<audio>` sem baixar previamente para memória.
- [ ] Testar seek em 10%, 50% e 90%.
- [ ] Verificar a aba Network durante seeks repetidos.
- [ ] Validar Chrome, Edge e Firefox desktop.

### Critérios De Reprovação

- O stream é transcodificado.
- Um Range retorna sempre o arquivo completo.
- O seek reinicia constantemente no byte zero.
- O endpoint retorna HTML ou exige confirmação manual.
- O navegador exige token que não pode ser enviado por `<audio>`.
- CORS impede os recursos necessários.
- O Drive bloqueia rapidamente os testes por quota.

## Experimento 3 - Peaks No Drive

- [ ] Fazer upload do `peaks.json` gerado localmente.
- [ ] Renderizar waveform antes de carregar o WAV.
- [ ] Comparar duração dos peaks com duração reportada pelo áudio.
- [ ] Manter diferença máxima de 50 ms.
- [ ] Vincular waveform e player durante play e seek.
- [ ] Confirmar que o visitante não decodifica o WAV completo.

## Experimento 4 - Cloudflare R2

Executar somente se o Drive for reprovado.

- [ ] Criar bucket de teste no plano gratuito.
- [ ] Fazer upload manual do mesmo WAV e peaks.
- [ ] Configurar CORS para localhost e GitHub Pages.
- [ ] Configurar domínio público de teste.
- [ ] Repetir os testes de Range, reprodução e seek.
- [ ] Comparar tempo de início, estabilidade e cache com o Drive.
- [ ] Estimar armazenamento considerando o histórico de versões.

## Evolução Funcional Antes Da Integração Final

- [ ] Corrigir hover dos botões primários.
- [ ] Remover outline duplo dos campos de arquivo.
- [ ] Remover `remainingDays` do modelo e das telas.
- [ ] Separar tokens visuais em `theme.css`.
- [ ] Criar estado normalizado e operações testáveis.
- [ ] Remover dados dummy da aplicação e mantê-los somente nos testes.
- [ ] Criar navegação e CRUD de artistas.
- [ ] Adicionar avatar, capa e biografia do artista.
- [ ] Substituir artista em texto livre por seletor múltiplo de IDs.
- [ ] Permitir criar artista sem perder o formulário atual.
- [ ] Permitir adicionar faixa nova ou existente a um álbum.
- [ ] Permitir a mesma faixa em vários álbuns.
- [ ] Implementar edição e exclusão seguras.
- [ ] Transformar versões em entidades históricas.
- [ ] Gerar changelog a partir de operações reais.
- [ ] Substituir botões simulados por ações reais ou removê-los.

## Testes De Domínio Necessários

- Criar, editar e excluir artista não referenciado.
- Bloquear exclusão de artista usado por álbum ou faixa.
- Criar álbum com múltiplos artistas.
- Criar faixa com múltiplos artistas.
- Vincular a mesma faixa a mais de um álbum.
- Impedir vínculo duplicado no mesmo álbum.
- Reordenar e remover faixas sem excluir a faixa.
- Criar nova versão sem alterar versões anteriores.
- Aprovar uma versão e desmarcar a anterior.
- Vincular notas e enquetes à versão selecionada.
- Excluir versão e selecionar fallback quando necessário.
- Gerar changelog somente após operações válidas.
- Rejeitar referências para entidades inexistentes.

## Ordem De Execução

1. Criar checkpoint do frontend atual.
2. Aplicar as correções visuais independentes.
3. Executar o experimento com WAV local.
4. Executar o experimento com o mesmo WAV no Drive.
5. Aceitar Drive ou executar comparação com R2.
6. Normalizar o catálogo e criar testes de domínio.
7. Implementar artistas e seletores múltiplos.
8. Implementar vínculos entre álbuns e faixas.
9. Implementar imagens reais.
10. Implementar histórico de versões e changelog.
11. Integrar o provedor de mídia aprovado.
12. Implementar administração OAuth em produção.
13. Tratar segurança de visualização.

## Questões Em Aberto

- Qual URL pública do Drive atende melhor a `<audio>` e Range?
- O endpoint público do Drive manterá CORS e seek de forma estável?
- `decodeAudioData()` suportará o WAV real no computador administrador?
- Será necessário gerar peaks em Web Worker?
- Qual resolução de waveform será suficiente para o nível de zoom desejado?
- Quantas versões antigas deverão permanecer disponíveis?
- Quando versões poderão ser arquivadas ou excluídas?
- Como conflitos de edição do `catalog.json` serão detectados?
- Como a visualização será protegida sem tornar as mídias públicas?

## Referências

- [Google Drive - download e Range](https://developers.google.com/workspace/drive/api/guides/manage-downloads)
- [Google Drive - escopos OAuth](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Cloudflare R2 - compatibilidade S3 e Range](https://developers.cloudflare.com/r2/api/s3/api/)
- [Cloudflare R2 - preços](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare R2 - CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [WaveSurfer](https://wavesurfer.xyz/docs/)
- [SoundCloud - uploads e transcodificação](https://developers.soundcloud.com/docs/api/guide)
- [GitHub - arquivos grandes](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [GitHub Pages - limites](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
