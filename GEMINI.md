# Analyse du Projet : Bac Français 2026

## Objectif

Créer un site pédagogique d'excellence pour préparer les élèves de Première (Générale et Technologique) aux Épreuves Anticipées de Français (EAF) de la session 2026. Le site doit offrir un design premium, un contenu à jour avec le programme officiel, et des outils d'entraînement efficaces.

## Programme Officiel 2026

Le programme est constitué de 4 objets d'étude, avec 3 œuvres au choix par objet.

### 1. La Poésie du XIXe au XXIe siècle

- **Arthur Rimbaud**, _Cahier de Douai_ (Parcours : Émancipations créatrices)
- **Francis Ponge**, _La rage de l'expression_ (Parcours : Dans l'atelier du poète)
- **Hélène Dorion**, _Mes forêts_ (Parcours : La poésie, la nature, l'intime)

### 2. La Littérature d'idées du XVIe au XVIIIe siècle (Renouvelé 2026)

- **Étienne de La Boétie**, _Discours de la servitude volontaire_ (Parcours : « Défendre » et « entretenir » la liberté)
- **Fontenelle**, _Entretiens sur la pluralité des mondes_ (Parcours : Le goût de la science)
- **Françoise de Graffigny**, _Lettres d'une Péruvienne_ (Parcours : « Un nouvel univers s'est offert à mes yeux »)

### 3. Le Roman et le Récit du Moyen Âge au XXIe siècle

- **Abbé Prévost**, _Manon Lescaut_ (Parcours : Personnages en marge, plaisirs du romanesque)
- **Honoré de Balzac**, _La Peau de chagrin_ (Parcours : Les romans de l'énergie : création et destruction)
- **Colette**, _Sido_ suivi de _Les Vrilles de la vigne_ (Parcours : La célébration du monde)

### 4. Le Théâtre du XVIIe au XXIe siècle

- **Pierre Corneille**, _Le Menteur_ (Parcours : Mensonge et comédie)
- **Alfred de Musset**, _On ne badine pas avec l'amour_ (Parcours : Les jeux du cœur et de la parole)
- **Nathalie Sarraute**, _Pour un oui ou pour un non_ (Parcours : Théâtre et dispute)

## Format des Épreuves

### Écrit (4h - Coeff 5)

- **Voie Générale** : Choix entre Commentaire de texte ou Dissertation sur œuvre.
- **Voie Technologique** : Choix entre Commentaire de texte ou Contraction de texte suivie d'un Essai.

### Oral (20 min - Coeff 5)

1.  **Explication linéaire (12 min, 12 pts)** : Lecture, analyse linéaire d'un extrait, question de grammaire.
2.  **Entretien (8 min, 8 pts)** : Présentation d'une œuvre choisie et échange avec l'examinateur.

## Stratégie Technique & Déploiement

- **Stack** : React + Vite + Tailwind CSS.
- **Hébergement Cible** : VPS Hostinger (existant avec Ghost/n8n).
- **Déploiement** : Build statique (`npm run build`) servi par Nginx (recommandé pour la performance) ou serveur Node léger.

## Améliorations UX/UI Identifiées

- Design "Premium" (adéquation avec l'excellence visée).
- Navigation fluide entre Méthodologie, Programme et Entraînement.
- Mise en avant claire des œuvres au programme.
