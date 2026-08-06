# Next.js Chatbot MVP

Ce dépôt contient un MVP pour un chatbot utilisant Next.js + Tailwind CSS.

1) Installer
   npm install

2) Configurer la clé API (dans .env.local)
   OPENAI_API_KEY=sk-...
   (optionnel) OPENAI_MODEL=gpt-4

3) Lancer en local
   npm run dev
   Ouvre http://localhost:3000

4) Déployer
   - Pousser sur GitHub puis déployer sur Vercel.
   - Dans Vercel, configure la variable d'environnement `OPENAI_API_KEY` pour la production.

Sécurité :
- Ne commit jamais ta clé API.
- L'API /api/chat tourne côté serveur et protège la clé.
