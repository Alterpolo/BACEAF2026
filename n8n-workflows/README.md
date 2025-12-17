# n8n Workflows for Bac Français 2026

Ces workflows permettent de générer des exercices pédagogiques via n8n + DeepSeek.

## Installation

### 1. Créer les credentials DeepSeek dans n8n

1. Aller dans **Settings → Credentials → Add Credential**
2. Choisir **Header Auth**
3. Configurer:
   - **Name**: `DeepSeek API Key`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer sk-your-deepseek-api-key`

### 2. Importer les workflows

1. Aller dans **Workflows → Import from File**
2. Importer chaque fichier JSON:
   - `generate-exercise.json` - Génération d'un exercice
   - `batch-generate.json` - Génération en lot
   - `generate-analysis.json` - Fiche de révision

### 3. Lier les credentials

Après import, ouvrir chaque workflow et:
1. Cliquer sur le node **DeepSeek API**
2. Dans **Credential to connect with**, sélectionner `DeepSeek API Key`
3. Sauvegarder

### 4. Activer les workflows

Cliquer sur le toggle **Active** en haut à droite de chaque workflow.

## Endpoints

| Workflow | Endpoint | Méthode |
|----------|----------|---------|
| Generate Exercise | `/webhook/generate-exercise` | POST |
| Batch Generate | `/webhook/batch-generate` | POST |
| Generate Analysis | `/webhook/generate-analysis` | POST |

## Test avec curl

```bash
# Générer un exercice
curl -X POST https://n8n.srv831064.hstgr.cloud/webhook/generate-exercise \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Dissertation",
    "work": {
      "author": "Molière",
      "title": "Le Malade imaginaire",
      "parcours": "Spectacle et comédie"
    }
  }'

# Génération en lot
curl -X POST https://n8n.srv831064.hstgr.cloud/webhook/batch-generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Dissertation",
    "exercisesPerWork": 3,
    "works": [
      {"author": "Molière", "title": "Le Malade imaginaire", "parcours": "Spectacle et comédie"},
      {"author": "La Fontaine", "title": "Fables", "parcours": "Imagination et pensée"}
    ]
  }'

# Fiche de révision
curl -X POST https://n8n.srv831064.hstgr.cloud/webhook/generate-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "work": {
      "author": "Molière",
      "title": "Le Malade imaginaire",
      "parcours": "Spectacle et comédie"
    }
  }'
```

## Sécurité (Production)

Pour sécuriser les webhooks en production:

### Option 1: Basic Auth
Dans n8n, activer l'authentification sur le node Webhook:
- Authentication: Basic Auth
- User/Password à configurer

### Option 2: Header Auth
Ajouter un header secret et le vérifier dans le workflow.

### Option 3: IP Whitelist
Configurer au niveau reverse proxy (nginx/Coolify).
