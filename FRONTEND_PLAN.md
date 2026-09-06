# Music Catalog - Plano Frontend

## Objetivo

Recriar em React e Vite a estrutura visual dos HTMLs capturados, incluindo catálogo, álbum, sala de faixa, artista, atualizações e modais. Toda interação será local e temporária nesta fase.

Este documento registra o primeiro checkpoint visual. A evolução do catálogo, reprodução WAV, Google Drive, Cloudflare R2, versões e administração está definida em [`MEDIA_ARCHITECTURE.md`](MEDIA_ARCHITECTURE.md).

## Fora do escopo deste checkpoint

- Backend e APIs
- Autenticação ou token de acesso
- Google Drive
- Upload ou armazenamento real
- Reprodução real de áudio
- Persistência no navegador

## Estrutura planejada

```text
src/
  components/
    AlbumCard.jsx
    AppShell.jsx
    Dialog.jsx
    ProjectDialogs.jsx
    RoomPlayer.jsx
    TrackRow.jsx
  pages/
    AlbumPage.jsx
    ArtistPage.jsx
    DashboardPage.jsx
    RoomPage.jsx
    UpdatesPage.jsx
  App.jsx
  data.js
  main.jsx
  styles.css
```

## Rotas

| Rota | Tela |
| --- | --- |
| `/#/` | Meus Álbuns |
| `/#/space/xjeok9wp` | Álbum Duality Dust |
| `/#/room/albmsemd` | Sala Roda Gigante |
| `/#/room/04kihnnd` | Sala GT Mode |
| `/#/room/duality-dust` | Sala Duality Dust |
| `/#/artist/furuya` | Perfil do artista |
| `/#/updates` | Atualizações |

## Etapa 1 - Fundação Vite

- [x] Criar o projeto React com Vite.
- [x] Instalar `react-router-dom` e `lucide-react`.
- [x] Configurar `base: "/Music-Catalog/"`.
- [x] Configurar `HashRouter`.
- [x] Definir o documento como `pt-BR`.
- [x] Adicionar `noindex,nofollow`.
- [x] Criar scripts de desenvolvimento, build e preview.
- [x] Ignorar dependências, builds e novos snapshots exportados.
- [x] Confirmar `npm run build`.

### Critérios de aceite

- `npm run dev` inicia uma página React.
- `npm run build` gera o diretório `dist/`.
- Os assets de produção usam `/Music-Catalog/`.
- A aplicação não importa snapshots nem código da extensão.

## Etapa 2 - Dados e identidade visual

- [x] Criar os dados estáticos de artistas, álbuns, faixas e atualizações.
- [x] Definir tokens de cores, tipografia, bordas e espaçamento.
- [x] Criar estilos base de botões, formulários, cards e estados.
- [x] Adicionar suporte a `prefers-reduced-motion`.

## Etapa 3 - Shell e navegação

- [x] Criar sidebar desktop e drawer mobile.
- [x] Criar header, breadcrumbs e região de mensagens.
- [x] Implementar todas as rotas e a tela de rota inexistente.
- [x] Atualizar o título do documento conforme a rota.

## Etapa 4 - Catálogo

- [x] Criar busca, filtros e contagem de resultados.
- [x] Criar a seção Meus Álbuns.
- [x] Criar a seção Minhas Faixas.
- [x] Implementar `AlbumCard` e `TrackRow` reutilizáveis.
- [x] Conectar catálogo, álbum, faixa e artista por links.

## Etapa 5 - Modais

- [x] Criar a base acessível com `<dialog>`.
- [x] Criar Novo Álbum.
- [x] Criar Nova Faixa.
- [x] Criar Nova Versão.
- [x] Criar Nota de Áudio simulada.
- [x] Criar Enquete simulada.
- [x] Validar formulários e metadados dos arquivos localmente.

## Etapa 6 - Página do álbum

- [x] Criar hero, capa, artista e metadados.
- [x] Criar toolbar e filtro de faixas.
- [x] Reutilizar o modal Nova Faixa com álbum selecionado.
- [x] Ligar Roda Gigante à sua sala.

## Etapa 7 - Sala da faixa

- [x] Criar barra de versões.
- [x] Criar área de feedback e seus filtros.
- [x] Criar estados de notas e enquetes da sessão.
- [x] Criar player e waveform simulados.
- [x] Adaptar a sala para desktop e mobile.

## Etapa 8 - Perfil do artista

- [x] Criar hero e resumo do artista.
- [x] Reutilizar cards de álbuns e linhas de faixas.
- [x] Ligar projetos às suas rotas.

## Etapa 9 - Atualizações

- [x] Criar lista semântica de atividade.
- [x] Criar filtros de notas e versões.
- [x] Ligar atividades às entidades relacionadas.

## Etapa 10 - Responsividade e acessibilidade

- [x] Validar larguras de 320, 375, 768, 1280 e 1440 pixels.
- [x] Validar navegação por teclado e foco dos modais.
- [x] Conferir labels, mensagens, contraste e alvos de toque.
- [x] Eliminar rolagem horizontal e falhas de overflow.

## Etapa 11 - GitHub Pages

- [ ] Criar workflow de deploy para a branch `primary`.
- [ ] Publicar somente o diretório `dist/`.
- [ ] Verificar assets e rotas hash no ambiente publicado.
- [ ] Confirmar ausência de requisições de API ou mídia.

## Definição de pronto

- As cinco páginas e os cinco modais estão implementados.
- As interações funcionam apenas durante a sessão.
- O layout funciona em desktop e mobile.
- O fluxo principal funciona por teclado.
- O build e o deploy no GitHub Pages passam sem erros.
- Nenhuma integração externa está presente.

## Próximo ciclo

As próximas mudanças não fazem parte deste checkpoint. Elas começam pelos experimentos de mídia descritos em [`MEDIA_ARCHITECTURE.md`](MEDIA_ARCHITECTURE.md), antes da substituição dos dados temporários.
