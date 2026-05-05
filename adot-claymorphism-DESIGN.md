# Adot Claymorphism Design System

## Objetivo

O design system do Adot deve transmitir acolhimento, conforto e cuidado. A interface precisa parecer amigavel, macia e tatil, como se os elementos fossem feitos de argila fosca: arredondados, levemente inflados e convidativos ao toque.

Este guia usa a tendencia Claymorphism com moderacao. O volume deve ajudar a orientar a interface, nao competir com o conteudo principal: animais, usuarios, fotos e pedidos de adocao.

## Principios Visuais

- **Acolhimento antes de impacto**: telas claras, quentes e tranquilas.
- **Volume macio**: cards, botoes e inputs parecem levemente moldados.
- **Verde com proposito**: o verde principal aparece em acoes importantes, sucesso e estados ativos.
- **Pessego como afeto visual**: usado para destaques, chamadas e pequenas areas de apoio.
- **Texto sempre legivel**: textos de corpo devem priorizar `#232820` sobre fundos claros para manter contraste.
- **Menos efeitos, mais conforto**: sombras suaves e foscas, sem brilho plastico.

## Paleta

### Base

- **Background Base**: `#FAF7F2`
  Usado no fundo geral da aplicacao e paginas.
- **Surface Clara**: `#FFFFFF`
  Usado em cards principais, modais, formularios e paineis elevados.
- **Creme Suave**: `#F3EFE8`
  Usado em secoes, separadores visuais e areas de descanso.
- **Bordas**: `#E4DDD3`
  Usado em linhas finas, inputs e contornos de cards.

### Marca e Estados

- **Primaria Verde**: `#4F9F6E`
  CTAs, links importantes, estados ativos e sucesso.
- **Hover Verde**: `#3F875D`
  Hover/pressed de botoes primarios.
- **Acento Pessego**: `#F2B880`
  Chamadas visuais, badges, detalhes afetivos e destaques leves.
- **Erro**: `#D95F5F`
  Alertas destrutivos, falhas e validacoes negativas.

### Texto

- **Texto Primario**: `#232820`
  Titulos, corpo de texto e labels importantes.
- **Texto Secundario**: `#62675F`
  Descricoes, metadados e textos auxiliares.
- **Texto Auxiliar**: `#8A8F86`
  Placeholders, hints e informacoes de menor prioridade.

## Background

O fundo deve usar camadas quentes e suaves:

- Base principal em `#FAF7F2`.
- Secoes alternadas em `#F3EFE8`.
- Formas organicas desfocadas usando:
  - `rgba(242, 184, 128, 0.08)` para pessego.
  - `rgba(79, 159, 110, 0.08)` para verde.

As formas organicas devem ficar atras do conteudo, com blur alto e baixa opacidade. Elas criam atmosfera sem prejudicar leitura.

Exemplo de fundo:

```css
background:
  radial-gradient(circle at 12% 18%, rgba(242, 184, 128, 0.12), transparent 28%),
  radial-gradient(circle at 88% 8%, rgba(79, 159, 110, 0.1), transparent 26%),
  linear-gradient(180deg, #faf7f2, #f3efe8);
```

## Sombras Clay

O Claymorphism do Adot usa uma combinacao de sombra externa suave e sombras internas discretas.

### Token Recomendado

```css
--shadow-clay:
  0 16px 34px rgba(116, 94, 67, 0.12),
  inset 0 2px 5px rgba(255, 255, 255, 0.9),
  inset 0 -6px 12px rgba(116, 94, 67, 0.08);
```

### Variações

```css
--shadow-clay-soft:
  0 10px 22px rgba(116, 94, 67, 0.09),
  inset 0 1px 4px rgba(255, 255, 255, 0.85),
  inset 0 -4px 10px rgba(116, 94, 67, 0.06);

--shadow-clay-pressed:
  0 6px 14px rgba(116, 94, 67, 0.08),
  inset 0 4px 10px rgba(116, 94, 67, 0.1),
  inset 0 -2px 5px rgba(255, 255, 255, 0.65);
```

Evite `rgba(0, 0, 0, ...)`. As sombras devem usar tons quentes derivados da paleta.

## Bordas e Formas

- Pequenos botoes e inputs: `16px` a `18px`.
- Cards e paineis: `24px` a `32px`.
- Avatares, chips e pills: `999px`.
- Modais: `28px`.

O arredondamento deve ser generoso. A sensacao esperada e de componentes macios, nao caixas tecnicas.

## Tipografia

### Fonte Recomendada

Use uma sans-serif geometrica com terminais arredondados:

- **Nunito Sans** como primeira escolha.
- Alternativas: **Quicksand**, **Plus Jakarta Sans**, **Inter**.

Recomendacao para o projeto:

```css
font-family: "Nunito Sans", "Plus Jakarta Sans", system-ui, sans-serif;
```

### Escala

- Hero title: `56px` a `64px`, peso `800`.
- Page title: `40px` a `48px`, peso `800`.
- Section title: `28px` a `36px`, peso `800`.
- Card title: `20px` a `24px`, peso `800`.
- Body: `16px`, peso `500`, line-height `1.65`.
- Small/meta: `13px` a `14px`, peso `600`.
- Eyebrow/badge: `11px` a `12px`, peso `800`, uppercase opcional.

Letter spacing deve permanecer `0`. O conforto vem das formas e da fonte, nao de tracking exagerado.

## Buttons

### Botao Primario

Uso: acoes essenciais como publicar, salvar, solicitar adocao, criar conta.

```css
.button-primary {
  min-height: 46px;
  border: 0;
  border-radius: 999px;
  padding: 0 22px;
  background: #4f9f6e;
  color: #ffffff;
  font-weight: 800;
  box-shadow:
    0 14px 26px rgba(79, 159, 110, 0.22),
    inset 0 2px 5px rgba(255, 255, 255, 0.35),
    inset 0 -5px 10px rgba(47, 109, 74, 0.28);
}
```

Hover:

- Trocar background para `#3F875D`.
- Reduzir um pouco a elevacao.
- Manter sensacao de "pressionavel".

```css
.button-primary:hover {
  background: #3f875d;
  box-shadow:
    0 9px 18px rgba(79, 159, 110, 0.18),
    inset 0 2px 5px rgba(255, 255, 255, 0.3),
    inset 0 -4px 9px rgba(47, 109, 74, 0.24);
}
```

### Botao Secundario

Uso: voltar, cancelar, ver detalhes, abrir opcoes.

- Fundo `#FFFFFF`.
- Texto `#232820`.
- Borda `#E4DDD3`.
- Shadow clay soft.

### Botao Destrutivo

Uso: remover, cancelar pedido, deletar post.

- Fundo branco ou erro com opacidade baixa.
- Texto `#D95F5F`.
- Borda `rgba(217, 95, 95, 0.35)`.
- Hover pode preencher com vermelho suave, sem agressividade visual excessiva.

## Cards

Cards devem parecer pecas macias elevadas sobre o fundo creme.

```css
.card-clay {
  border: 1px solid rgba(228, 221, 211, 0.9);
  border-radius: 28px;
  background: #ffffff;
  box-shadow:
    0 16px 34px rgba(116, 94, 67, 0.12),
    inset 0 2px 5px rgba(255, 255, 255, 0.9),
    inset 0 -6px 12px rgba(116, 94, 67, 0.08);
}
```

Aplicacoes:

- Animal card.
- Feed post.
- Perfil.
- Forms.
- Cards de atalhos.

Regras:

- Use espaco interno generoso: `20px` a `28px`.
- Evite cards dentro de cards.
- Fotos podem ter `border-radius: 22px`, mas com `overflow: hidden`.

## Inputs

Inputs devem parecer levemente escavados na argila.

```css
.input-clay {
  min-height: 46px;
  border: 1px solid #e4ddd3;
  border-radius: 18px;
  padding: 0 16px;
  background: #fdfbf7;
  color: #232820;
  box-shadow:
    inset 0 3px 8px rgba(116, 94, 67, 0.1),
    inset 0 -2px 5px rgba(255, 255, 255, 0.8);
}
```

Focus:

```css
.input-clay:focus {
  border-color: #4f9f6e;
  outline: 4px solid rgba(79, 159, 110, 0.14);
}
```

Textarea:

- `min-height: 130px`.
- `border-radius: 22px`.
- `padding: 14px 16px`.
- `resize: vertical`.

## Chips e Badges

Usar para status e pequenas categorias.

- Disponivel: verde com `rgba(79, 159, 110, 0.14)`.
- Aguardando: pessego com `rgba(242, 184, 128, 0.22)`.
- Rejeitado/erro: vermelho com `rgba(217, 95, 95, 0.12)`.
- Texto sempre forte o suficiente para leitura.

Border radius: `999px`.

## Navigation

A navbar deve ser leve, superior e centralizada:

- Logo a esquerda.
- Navegacao principal no centro.
- Avatar/menu do usuario a direita.

Itens com icone devem ser circulares/puffy:

- `42px` a `46px`.
- `border-radius: 999px`.
- Fundo branco translúcido.
- Shadow clay soft.
- Estado ativo com verde em baixa opacidade.

Dropdown do usuario:

- Fundo `#FFFFFF`.
- `border-radius: 22px`.
- Sombra clay mais elevada.
- Deve sobrepor a pagina com `z-index` alto.

## Feed

O Feed deve parecer uma conversa acolhedora, nao uma rede social agressiva.

Composer:

- Card clay grande.
- Avatar do usuario visivel.
- Textarea escavada.
- Tipo de post e upload de foto como controles secundarios.
- Botao publicar em verde.

Post:

- Card branco puffy.
- Avatar e nome do usuario em destaque.
- Foto do post grande, com bordas arredondadas.
- Acoes editar/remover discretas, sem dominar o card.

Empty state:

- Fundo creme/pessego suave.
- Texto acolhedor.
- Chamada para primeira publicacao.

## Acessibilidade

- Corpo de texto deve usar `#232820` sobre `#FFFFFF`, `#FAF7F2` ou `#F3EFE8`.
- Texto secundario `#62675F` apenas para metadados e descricoes curtas.
- Evite usar `#8A8F86` em textos longos.
- Verde `#4F9F6E` em texto pequeno deve ser usado com peso alto ou fundo claro controlado.
- Inputs precisam de foco visivel.
- Elementos clicaveis devem ter pelo menos `40px` de altura/largura.

## Do's

- Use sombras quentes derivadas de marrom/creme/verde.
- Use cards arredondados e espacamento generoso.
- Reserve verde para acoes reais e estados ativos.
- Use pessego para reforcar acolhimento.
- Mantenha fotos como elemento principal em animais e feed.

## Don'ts

- Nao usar preto puro em sombras.
- Nao exagerar em brilho ou reflexos plasticos.
- Nao aplicar efeito 3D em todos os elementos ao mesmo tempo.
- Nao usar verde em excesso.
- Nao reduzir contraste de texto para ficar "fofinho"; legibilidade vem primeiro.

