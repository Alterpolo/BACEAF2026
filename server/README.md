# Backend API - Bac Français 2026

API proxy sécurisé pour les appels DeepSeek (V3.2).

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` :

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=3001
```

Obtenir une clé API sur https://platform.deepseek.com/

## Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`.

## Production

```bash
npm run build
npm start
```

## Endpoints

### POST /api/ai/generate-subject

Génère un sujet d'examen.

```json
{
  "type": "Dissertation",
  "work": {
    "author": "Abbé Prévost",
    "title": "Manon Lescaut",
    "parcours": "Personnages en marge, plaisirs du romanesque"
  }
}
```

### POST /api/ai/generate-subject-list

Génère 3 sujets au choix.

```json
{
  "work": { "author": "...", "title": "...", "parcours": "..." },
  "type": "Dissertation"
}
```

### POST /api/ai/evaluate

Corrige le travail d'un élève.

```json
{
  "type": "Dissertation",
  "subject": "Le sujet de l'exercice...",
  "studentInput": "Problématique : ... \nI. ..."
}
```

### POST /api/ai/work-analysis

Génère une fiche de révision complète.

```json
{
  "work": { "author": "...", "title": "...", "parcours": "..." }
}
```

### GET /health

Health check.

## Rate Limiting

20 requêtes par minute par IP sur `/api/ai/*`.
