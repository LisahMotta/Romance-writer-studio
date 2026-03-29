# ✍️ Romance Writer Studio

App PWA de escrita criativa para romances comerciais (Amazon KDP).

**Desenvolvido por Elisabeth Faria (AOE)**

---

## ✨ Funcionalidades

- 📚 **Gerenciamento de Livros** — múltiplos projetos com gênero, trope, logline e sinopse
- 👤 **Fichas de Personagens** — backstory, motivação, conflito, arco, voz e relacionamentos
- 🎬 **Construtor de Cenas** — POV, conflito, batida emocional e texto integrado
- 📐 **Beat Sheet para Romance** — guia de 13 beats do Gancho ao HEA
- ✏️ **Escrita Livre** — espaço sem julgamento com contagem de palavras
- 🤖 **Musa IA** — mentora criativa integrada via API Anthropic
- ⏱️ **Timer de Escrita** — metas configuráveis para criar hábito
- 💡 **20 Prompts de Romance** — gatilhos criativos para desbloqueio
- 📱 **PWA** — instalável no celular, funciona offline
- 💾 **Dados locais** — tudo salvo no navegador (localStorage)

## 🚀 Deploy no Vercel

### Opção 1: Via GitHub (recomendado)

1. Crie um repositório no GitHub:
```bash
cd romance-writer-studio
git init
git add .
git commit -m "Romance Writer Studio v1.0"
git branch -M main
git remote add origin https://github.com/LisahMotta/romance-writer-studio.git
git push -u origin main
```

2. Vá em [vercel.com](https://vercel.com)
3. Clique em **"Add New Project"**
4. Importe o repositório `romance-writer-studio`
5. O Vercel detecta automaticamente o Vite — clique **Deploy**
6. Pronto! Seu app estará online em ~1 minuto

### Opção 2: Via Vercel CLI

```bash
npm install -g vercel
cd romance-writer-studio
vercel
```

## 🛠️ Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## 📁 Estrutura do Projeto

```
romance-writer-studio/
├── public/
│   ├── favicon.svg        # Ícone do app
│   ├── icon-192.png       # Ícone PWA 192x192
│   └── icon-512.png       # Ícone PWA 512x512
├── src/
│   ├── App.jsx            # Componente principal
│   └── main.jsx           # Entry point React
├── index.html             # HTML base
├── package.json           # Dependências
├── vite.config.js         # Config Vite + PWA
├── vercel.json            # Config Vercel
└── README.md
```

## 📊 Gêneros e Tropes Incluídos

**12 Gêneros:** Romance Contemporâneo, Histórico, Paranormal, Romantic Suspense, Dark Romance, Comédia Romântica, Erótico, de Época, Fantasia, Sci-Fi, New Adult, YA Romance

**20 Tropes:** Enemies to Lovers, Friends to Lovers, Fake Dating, Second Chance, Forbidden Love, Grumpy x Sunshine, Forced Proximity, e mais...

## 🤖 Sobre a Musa IA

A Musa é uma mentora de escrita integrada que usa a API Anthropic (Claude) para:
- Desenvolver trama e conflitos
- Criar tensão entre personagens
- Sugerir cenas de virada
- Ajudar com bloqueios criativos
- Dar feedback sobre estrutura

A IA tem contexto do livro atual (título, gênero, trope, personagens, progresso).

## 📱 Instalação como App (PWA)

**No celular:**
1. Acesse o site pelo navegador
2. Toque em "Adicionar à tela inicial"
3. O app funciona como nativo!

**No desktop:**
1. Acesse o site no Chrome
2. Clique no ícone de instalar na barra de endereço
3. Pronto!
