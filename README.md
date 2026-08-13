# Next.js Chatbot MVP

Ce dépôt contient un MVP pour un chatbot utilisant Next.js + Tailwind CSS.

1) Installer
   npm install

2) Configurer la clé API (dans .env.local)
   HCNSEC_API_KEY=sk-...
   (optionnel) HCNSEC_MODEL=deepseek-v4

   S'inscrire : https://api.hcnsec.cn/sign-up?aff=Auq5

3) Lancer en local
   npm run dev
   Ouvre http://localhost:3000

4) Déployer
   - Pousser sur GitHub puis déployer sur Vercel.
   - Dans Vercel, configure la variable d'environnement `HCNSEC_API_KEY` pour la production.

Sécurité :
- Ne commit jamais ta clé API.
- L'API /api/chat tourne côté serveur et protège la clé.

---

Docker

J'ai ajouté des fichiers Docker (Dockerfile multi-stage, .dockerignore) et des fichiers d'orchestration : `docker-compose.yml` pour la production et `docker-compose.dev.yml` pour le développemen[...]

Pré-requis
- Docker et (optionnel) Docker Compose installés.
- Node recommandé : 18+

Créer le fichier d'environnement (NE PAS COMMIT)

- Copier l'exemple et insérer votre clé HCNSEC :
  - Linux/macOS :
    cp .env.local.example .env.local
    # puis éditez .env.local et remplacez HCNSEC_API_KEY=sk-... par votre clé
  - Windows PowerShell :
    copy .env.local.example .env.local

Build + run (image production)

- Construire l'image :
  docker build -t botchat:latest .

- Lancer le conteneur en production (fournir la clé via .env.local) :
  docker run -p 3000:3000 --env-file .env.local botchat:latest

- Accéder : http://localhost:3000

Utiliser docker-compose (production)

- Lancer en local avec docker-compose :
  docker-compose up --build -d
  docker-compose logs -f
  docker-compose down

Développement (hot-reload)

- Utiliser le compose de dev (monte le code et lance `npm run dev`) :
  docker-compose -f docker-compose.dev.yml up

Notes et dépannage
- .env.local est exclu par .dockerignore ; ne le commitez pas.
- Si l'app signale "missing HCNSEC_API_KEY", vérifiez que `.env.local` est présent à la racine et que le conteneur reçoit bien la variable (via `--env-file` ou `--env`).
- Voir les logs : `docker logs -f <container-id>` ou `docker-compose logs -f`.

Si vous voulez, je peux :
- pousser l'image vers un registre (Docker Hub / GHCR) et ajouter un workflow GitHub Actions,
- ou revoir/élargir la section README (exemples d'options de déploiement),
- ou vous guider pas-à‑pas pendant que vous lancez les commandes sur votre machine.
