# Para você, meu amor

Site romântico estático em HTML, CSS e JavaScript puro. Sem build, sem dependências, sem
servidor: basta abrir o `index.html`.

Tem uma capa, uma galeria de fotos, poemas, um **quebra-cabeça da foto** e uma área secreta
que só abre quando o retrato é montado.

## Como usar

Abra o `index.html` no navegador (duplo clique). Tudo funciona em `file://`.

Se preferir servir por HTTP (alguns navegadores restringem `file://`), use:

```bash
npm start        # sobe um servidor local com npx serve
```

## O quebra-cabeça

A imagem `assets/img/puzzle/retrato.svg` é cortada em 4, 9 ou 16 peças, embaralhadas.
Cada peça é um `<button>` com o recorte certo da foto, então a montagem reconstitui a
fotografia sem transição. Para montar, use qualquer um destes modos:

- **Toque/clique**: toque na peça que quer levantar, depois na peça com que ela troca de lugar.
- **Arrastar**: arraste a peça até o destino.
- **Teclado**: `Tab` para focar, `Enter` para levantar, setas para mover o foco, `Enter`
  de novo para trocar. `Esc` desfaz a seleção.
- **Dica**: destaca a peça e o lugar certo (3 por jogo).

Quando todas as peças ficam no lugar, a foto aparece inteira, chove coração e os segredos
destravam. O estado fica salvo no `localStorage` (chave `site.state.v1`), então recarregar a
página não desmonta o que já foi montado.

Para recomeçar do zero, limpe o estado no console do navegador:

```js
localStorage.removeItem('site.state.v1');
location.reload();
```

## Como personalizar

Quase tudo está em `assets/js/data.js`:

| Chave | O que é |
| --- | --- |
| `meta` | título e descrição da página |
| `hero` | chamador, título e texto de capa |
| `chips` | os três destaques da capa |
| `gallery` | as 6 fotos da galeria (`src`, `alt`, `caption`) |
| `poems` | os poemas (cada verso é uma linha do array) |
| `puzzle` | foto do quebra-cabeça, legenda e nível inicial |
| `secrets` | o que aparece quando o quebra-cabeça é montado |
| `finale` | a mensagem do final |

### Trocar as fotos

1. colocar as imagens em `assets/img/photos/`
2. apontar `gallery[].src` (e `secrets[].gallery[].src`) para o novo arquivo
3. deixar `alt` e `caption` escritos de verdade — são lidos em voz alta por leitores de tela

Os arquivos atuais são SVG placeholders com fotos e legendas fictícias. PNG e JPG funcionam
igual; basta atualizar os caminhos.

### Trocar a foto do quebra-cabeça

A imagem precisa ser **quadrada** (o site usa a proporção da imagem para o tabuleiro).
Qualquer tamanho serve, mas 1200×1200 ou mais deixa as peças nítidas:

```js
puzzle: {
  photo: { src: 'assets/img/puzzle/retrato.svg', alt: '...' }
}
```

A foto do quebra-cabeça não pode ser a mesma da galeria se a ideia é revelar algo novo —
a galeria mostra as fotos, o quebra-cabeça é a surpresa.

## Estrutura

```
index.html               estrutura da página
assets/css/base.css      reset, tipografia, tema escuro
assets/css/layout.css    seções, grade, responsivo
assets/css/components.css polaróides, selos, botões, diálogos
assets/css/puzzle.css    tabuleiro, peças, fantasma, vitória
assets/js/data.js        todo o conteúdo do site
assets/js/utils.js       helpers de DOM
assets/js/state.js       estado persistente
assets/js/heartstorm.js  partículas de coração
assets/js/gallery.js     grade e lightbox
assets/js/poems.js       versos com quebra de linha
assets/js/puzzle.js      peças, embaralhamento, dica, teclado, arrastar
assets/js/secrets.js     área secreta e cartas
assets/js/main.js        inicialização, tema, navegação, Forms
```

## Detalhes que já funcionam

- `prefers-reduced-motion` desliga corações, transições e animações.
- Tema escuro, claro e automático (sistema), com botão de alternância.
- Navegação marca a seção visível e rola suavemente.
- Lightbox das fotos com teclado, foco preso e `Esc`.
- Sem espaço de rolagem em nenhum tamanho de tela; toque alvo confortável no celular.
- Marcas de acessibilidade: um `h1`, hierarquia de títulos sem pulos, nomes acessíveis em
  todo botão e link, `alt` em toda imagem, e link para pular o menu.

## Publicar

Como é tudo estático, qualquer hospedagem de arquivos serve: GitHub Pages, Netlify,
Cloudflare Pages, Vercel. Suba a pasta inteira e pronto.
