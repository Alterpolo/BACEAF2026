import { Genre, ProgramObject, MethodCard, WorkAnalysis } from './types';

export const PROGRAM_2026: ProgramObject[] = [
  {
    genre: Genre.LITTERATURE_IDEES,
    works: [
      { author: "Étienne de La Boétie", title: "Discours de la servitude volontaire", parcours: "« Défendre » et « entretenir » la liberté." },
      { author: "Bernard Le Bouyer de Fontenelle", title: "Entretiens sur la pluralité des mondes", parcours: "Le goût de la science." },
      { author: "Françoise de Graffigny", title: "Lettres d'une Péruvienne", parcours: "« Un nouvel univers s’est offert à mes yeux »." }
    ]
  },
  {
    genre: Genre.POESIE,
    works: [
      { author: "Arthur Rimbaud", title: "Cahier de Douai", parcours: "Émancipations créatrices." },
      { author: "Francis Ponge", title: "La rage de l'Expression", parcours: "Dans l'atelier du poète." },
      { author: "Hélène Dorion", title: "Mes forêts", parcours: "La poésie, la nature, l'intime." }
    ]
  },
  {
    genre: Genre.ROMAN,
    works: [
      { author: "Abbé Prévost", title: "Manon Lescaut", parcours: "Personnages en marge, plaisirs du romanesque." },
      { author: "Honoré de Balzac", title: "La Peau de chagrin", parcours: "Les romans de l'énergie : création et destruction." },
      { author: "Colette", title: "Sido suivi de Les Vrilles de la vigne", parcours: "La célébration du monde." }
    ]
  },
  {
    genre: Genre.THEATRE,
    works: [
      { author: "Pierre Corneille", title: "Le Menteur", parcours: "Mensonge et comédie." },
      { author: "Alfred de Musset", title: "On ne badine pas avec l'amour", parcours: "Les jeux du coeur et de la parole." },
      { author: "Nathalie Sarraute", title: "Pour un oui ou pour un non", parcours: "Théâtre et dispute." }
    ]
  }
];

export const METHOD_DISSERTATION: MethodCard[] = [
  {
    title: "Introduction",
    content: "L'introduction est la vitrine de votre devoir. Elle doit capter l'attention et poser les bases de la réflexion.",
    steps: [
      { title: "Amorce (ou accroche)", description: "Un contexte littéraire ou historique, une citation, ou un constat général (évitez 'De tout temps...')." },
      { title: "Citation du sujet", description: "Si le sujet est une citation, recopiez-la. Sinon, reformulez la question." },
      { title: "Analyse des termes", description: "Définissez les mots-clés pour justifier la problématique." },
      { title: "Problématique", description: "La question centrale qui découle de la tension du sujet." },
      { title: "Annonce du plan", description: "Annoncez clairement vos 3 grandes parties (I, II, III)." }
    ]
  },
  {
    title: "Développement (Le Plan)",
    content: "Le plan doit être dynamique et progressif. Chaque partie apporte une réponse partielle à la problématique.",
    steps: [
      { title: "Plan Dialectique", description: "I. Thèse (Oui) / II. Antithèse (Mais/Nuance) / III. Synthèse (Dépassement)." },
      { title: "Plan Thématique", description: "Exploration de différents aspects de la question (I. Aspect A / II. Aspect B / III. Aspect C)." },
      { title: "Structure interne", description: "Chaque partie contient 2 ou 3 sous-parties. Chaque sous-partie = 1 idée + 1 argument + 1 exemple précis." }
    ]
  },
  {
    title: "Conclusion",
    content: "Ne jamais bâcler la conclusion. C'est la dernière impression laissée au correcteur.",
    steps: [
      { title: "Bilan", description: "Récapitulez synthétiquement le cheminement de votre pensée." },
      { title: "Réponse ferme", description: "Répondez clairement à la problématique posée." },
      { title: "Ouverture", description: "Élargissez la réflexion vers une autre œuvre, un autre art ou une époque voisine." }
    ]
  }
];

export const METHOD_COMMENTAIRE: MethodCard[] = [
  {
    title: "Introduction",
    content: "Elle présente le texte et le projet de lecture qui guidera l'analyse.",
    steps: [
      { title: "Amorce", description: "Présentation rapide de l'auteur, du mouvement et de l'œuvre." },
      { title: "Situation de l'extrait", description: "Où se situe le passage ? De quoi parle-t-il ?" },
      { title: "Lecture à voix haute", description: "Uniquement à l'oral, mais gardez-le en tête pour le rythme." },
      { title: "Problématique (Projet de lecture)", description: "Qu'est-ce qui fait l'intérêt singulier de ce texte ?" },
      { title: "Annonce du plan", description: "Les 2 ou 3 axes (mouvements) qui structurent votre analyse." }
    ]
  },
  {
    title: "Le Cœur de l'Analyse",
    content: "Le commentaire n'est pas une paraphrase. Il explique CE qui est dit et COMMENT c'est dit.",
    steps: [
      { title: "Citation", description: "Citez le texte entre guillemets." },
      { title: "Identification", description: "Nommez le procédé (métaphore, allitération, champ lexical, temps...)." },
      { title: "Interprétation", description: "C'est l'étape cruciale : quel est l'effet produit ? Quel sens cela ajoute-t-il ?" },
      { title: "Structure", description: "Organisez par thèmes (axes) ou suivez la progression du texte (linéaire pour l'oral, composé pour l'écrit)." }
    ]
  },
  {
    title: "Conclusion",
    content: "Elle referme l'analyse en confirmant le projet de lecture.",
    steps: [
      { title: "Bilan", description: "Synthèse des découvertes faites dans les axes." },
      { title: "Réponse", description: "Comment a-t-on répondu au projet de lecture ?" },
      { title: "Ouverture", description: "Lien avec une autre œuvre du parcours ou un texte du même auteur." }
    ]
  }
];

// Base de données statique des résumés et analyses
export const WORKS_ANALYSIS_DB: Record<string, WorkAnalysis> = {
  "Manon Lescaut": {
    biography: "L'Abbé Prévost (1697-1763) mène une vie aussi aventureuse que ses personnages. Moine bénédictin, il fuit son couvent, voyage en Angleterre et aux Pays-Bas. Auteur prolifique, il est surtout connu pour ce roman qui mêle classicisme et préromantisme.",
    context: "Publié en 1731, le roman fait scandale. Il s'inscrit dans la période de la Régence, marquée par un relâchement des mœurs et une montée du libertinage. C'est l'histoire d'une passion dévastatrice.",
    summary: [
      { partTitle: "La Rencontre", content: "Des Grieux, jeune chevalier promis à un bel avenir, rencontre Manon à Amiens. C'est le coup de foudre immédiat. Ils s'enfuient ensemble à Paris, trompant la vigilance de Tiberge, l'ami vertueux." },
      { partTitle: "Premières Trahisons", content: "À Paris, l'argent manque vite. Manon, qui aime le luxe, accepte les avances de M. de B... Des Grieux, aveuglé par l'amour, pardonne mais est enlevé par sa famille sur ordre de son père." },
      { partTitle: "Saint-Sulpice et Retrouvailles", content: "Deux ans plus tard, Des Grieux étudie la théologie. Manon vient le chercher au parloir de Saint-Sulpice. Il retombe sous son charme instantanément et renonce à l'Église pour elle." },
      { partTitle: "La Déchéance", content: "Les amants multiplient les escroqueries (épisode du fils de G... M...). Ils sont arrêtés et emprisonnés au Châtelet et à Saint-Lazare. Ils s'évadent mais tuent un portier." },
      { partTitle: "L'Exil et la Mort", content: "Manon est déportée en Louisiane comme fille de joie. Des Grieux la suit. En Amérique, ils tentent de vivre vertueusement, mais un duel force Des Grieux à fuir dans le désert avec Manon. Elle meurt d'épuisement; il l'enterre de ses mains." }
    ],
    characters: [
      { name: "Des Grieux", description: "Narrateur et protagoniste. Jeune noble vertueux corrompu par la passion. Il incarne le héros sensible et faible." },
      { name: "Manon Lescaut", description: "Personnage énigmatique, elle aime Des Grieux mais ne peut vivre sans luxe. Elle représente la femme fatale et insaisissable." },
      { name: "Tiberge", description: "L'ami fidèle et vertueux, la conscience morale de Des Grieux qui l'aide malgré ses fautes." }
    ]
  },
  "La Peau de chagrin": {
    biography: "Honoré de Balzac (1799-1850) est le créateur de La Comédie humaine. Forçat de l'écriture, il peint la société de son temps avec un réalisme visionnaire.",
    context: "Publié en 1831, ce 'roman philosophique' marque l'entrée de Balzac dans le succès. Il illustre sa théorie de l'énergie vitale : 'Vouloir nous brûle et Pouvoir nous détruit'.",
    summary: [
      { partTitle: "Le Talisman", content: "Raphaël de Valentin, jeune homme ruiné et désespéré, entre chez un antiquaire pour attendre l'heure de se suicider. Il y reçoit une Peau de chagrin qui exauce tous les vœux mais rétrécit à chaque désir, raccourcissant sa vie." },
      { partTitle: "La Femme sans cœur", content: "Raphaël raconte sa vie passée : sa vie studieuse dans une mansarde, son amour pur pour Pauline, puis sa passion dévorante et non réciproque pour Foedora, la comtesse froide, qui l'a mené à la ruine." },
      { partTitle: "L'Agonie", content: "Devenu riche grâce au talisman, Raphaël vit reclus pour ne rien désirer. Il retrouve Pauline, devenue riche. L'amour renaît, mais le désir pour Pauline fait rétrécir la peau inexorablement." },
      { partTitle: "La Fin", content: "Raphaël tente par tous les moyens scientifiques d'étirer la peau, en vain. Il meurt dans un dernier élan de désir pour Pauline, consumé par sa propre énergie." }
    ],
    characters: [
      { name: "Raphaël de Valentin", description: "Jeune ambitieux, il représente l'homme moderne déchiré entre volonté et pouvoir." },
      { name: "La Peau", description: "Symbole de la vie qui s'amenuise à mesure qu'on la dépense. Le véritable antagoniste." },
      { name: "Foedora", description: "La 'femme sans cœur', allégorie de la société parisienne froide et brillante." },
      { name: "Pauline", description: "L'amour pur et désintéressé, l'antithèse de Foedora." }
    ]
  },
  "Sido suivi de Les Vrilles de la vigne": {
    biography: "Colette (1873-1954) est une immense écrivaine de la sensation et de la nature. Son style est marqué par une liberté de ton et une sensualité précise.",
    context: "Publié en 1930 (Sido) et 1908 (Les Vrilles). Colette y célèbre le monde, l'enfance et la figure maternelle, s'éloignant des douleurs de l'amour pour retrouver l'unité avec la nature.",
    summary: [
      { partTitle: "Sido - Sido", content: "Évocation mythifiée de la mère, figure solaire et terrienne, qui initie sa fille aux merveilles du jardin et du vent. Sido est la prêtresse du monde naturel." },
      { partTitle: "Sido - Le Capitaine", content: "Portrait du père, Jules Colette, homme unijambiste, rêveur et poète raté, dont l'amour pour Sido est absolu mais qui reste une figure plus effacée." },
      { partTitle: "Sido - Les Sauvages", content: "Les frères et la sœur de Colette, êtres libres et étranges, vivant en marge des conventions." },
      { partTitle: "Les Vrilles de la vigne", content: "Recueil de textes courts. Le texte titre est une fable sur la liberté conquise (le rossignol qui ne dort pas pour ne pas être prisonnier des vrilles). D'autres textes évoquent la forêt, les animaux (Nonoche), la mer." }
    ],
    characters: [
      { name: "Sido", description: "La mère, figure centrale, omnisciente sur la nature, boussole morale et esthétique de Colette." },
      { name: "Colette (Narratrice)", description: "Elle se cherche à travers ses souvenirs, célébrant son héritage familial et sa soif d'indépendance." },
      { name: "La Nature", description: "Plus qu'un décor, c'est un personnage vivant, vibrant, avec lequel Colette dialogue." }
    ]
  },
  "Cahier de Douai": {
    biography: "Arthur Rimbaud (1854-1891), le génie précoce. Adolescent révolté, il écrit l'essentiel de son œuvre entre 15 et 20 ans avant de se taire. Il cherche à 'changer la vie'.",
    context: "Écrit en 1870, lors des fugues de Rimbaud à travers la France en guerre. Ces poèmes de jeunesse marquent la transition entre le Parnasse et une poésie visionnaire.",
    summary: [
      { partTitle: "La Satire", content: "Poèmes critiquant la bourgeoisie, la religion et Napoléon III (ex: 'Vénus Anadyomène', 'À la musique', 'Le Mal'). Rimbaud y est mordant et caricatural." },
      { partTitle: "La Liberté et l'Errance", content: "Célébration de la nature et de la marche (ex: 'Sensation', 'Ma Bohème'). Une sensualité joyeuse se dégage de ces textes." },
      { partTitle: "L'Éveil Sensuel", content: "Découverte des femmes et des émois amoureux, souvent avec humour ou timidité (ex: 'Première soirée', 'Les Réparties de Nina')." },
      { partTitle: "Le Pacifisme", content: "Dénonciation de la guerre de 1870 et compassion pour les soldats (ex: 'Le Dormeur du val')." }
    ],
    characters: [
      { name: "Le Je poétique", description: "Un adolescent vagabond, sensuel, révolté contre l'ordre établi, avide de liberté." },
      { name: "La Nature", description: "Refuge maternel et amante, elle accueille le poète dans ses fuites." },
      { name: "Le Bourgeois", description: "Figure repoussoir, grotesque et mesquine." }
    ]
  },
  "La rage de l'Expression": {
    biography: "Francis Ponge (1899-1988), poète du 'parti pris des choses'. Il refuse le lyrisme traditionnel pour décrire les objets du quotidien avec une précision scientifique et ludique.",
    context: "Publié en 1952. Ponge ouvre ici son atelier d'écriture. Il ne montre pas le poème fini, mais le processus de création, les ratures, les reprises.",
    summary: [
      { partTitle: "Le projet", content: "Ponge veut 'rendre compte' du monde muet. Il refuse la poésie sentimentale pour une poésie de la définition et de la description." },
      { partTitle: "Berges de la Loire", content: "Tentative de décrire le fleuve. Ponge accumule les notes, se corrige, cherche le mot juste pour saisir la fluidité." },
      { partTitle: "La Guêpe", content: "Observation minutieuse de l'insecte. Le texte bourdonne, hésite, pique. Ponge montre que l'expression est un combat (une 'rage')." },
      { partTitle: "Le Mimosa", content: "Texte célèbre où Ponge tente de saisir la fragilité et le parfum du mimosa, oscillant entre prose poétique et définition botanique." }
    ],
    characters: [
      { name: "L'Objet", description: "Le véritable héros (la guêpe, le carnet, le bois de pins). Il résiste à la description." },
      { name: "Le Poète-Artisan", description: "Celui qui travaille la langue comme une matière, sans inspiration divine, avec labeur." }
    ]
  },
  "Mes forêts": {
    biography: "Hélène Dorion (née en 1958) est une poétesse québécoise contemporaine. Son œuvre, intime et universelle, interroge notre rapport au monde et au temps.",
    context: "Publié en 2021. Recueil de la maturité, il résonne avec les inquiétudes écologiques actuelles mais reste profondément ancré dans une quête intérieure.",
    summary: [
      { partTitle: "La forêt intérieure", content: "La forêt n'est pas seulement un paysage extérieur, c'est une métaphore de l'âme humaine, avec ses ombres, ses racines et ses clairières." },
      { partTitle: "Le temps et la trace", content: "Réflexion sur ce qui reste, sur la fragilité de l'existence face à la permanence des arbres." },
      { partTitle: "La blessure et la guérison", content: "La nature est vue comme un lieu de réparation. L'écriture poétique permet de cicatriser les failles de l'intime." },
      { partTitle: "Une écologie spirituelle", content: "Le recueil invite à une reconnexion humble avec le vivant, sans discours militant agressif, mais par la contemplation." }
    ],
    characters: [
      { name: "La Voix poétique", description: "Une conscience qui s'interroge, s'apaise et cherche sa place dans le vaste monde." },
      { name: "L'Arbre", description: "Témoin silencieux, figure de sagesse et d'ancrage." }
    ]
  },
  "Le Menteur": {
    biography: "Pierre Corneille (1606-1684), grand dramaturge classique. Connu pour ses tragédies (Le Cid), il excelle aussi dans la comédie baroque.",
    context: "Créée en 1644. Comédie de l'illusion et du langage, elle adapte une pièce espagnole. Elle interroge la vérité et le masque social.",
    summary: [
      { partTitle: "L'Arrivée à Paris", content: "Dorante, jeune provincial étudiant en droit, arrive à Paris. Il décide de s'inventer une vie de guerrier galant pour séduire." },
      { partTitle: "Les Quiproquos", content: "Dorante ment à tout le monde : à son père Géronte (il invente un mariage forcé), à Clarice et Lucrèce (il confond les deux jeunes femmes)." },
      { partTitle: "L'Engrenage", content: "Chaque mensonge en appelle un autre pour ne pas être découvert. Dorante fait preuve d'une imagination débordante et théâtrale." },
      { partTitle: "Le Dénouement", content: "Les masques tombent. Dorante se rend compte qu'il aimait l'autre jeune femme (Lucrèce) et finit par l'épouser. Le mensonge a paradoxalement conduit à la vérité du cœur." }
    ],
    characters: [
      { name: "Dorante", description: "Le menteur. Il ment par jeu, par plaisir de créer. C'est un poète de l'action, un comédien né." },
      { name: "Géronte", description: "Le père crédule, figure de l'autorité bafouée mais aimante." },
      { name: "Cliton", description: "Le valet, contrepoint comique et moral, qui s'effraie des audaces de son maître." }
    ]
  },
  "On ne badine pas avec l'amour": {
    biography: "Alfred de Musset (1810-1857), l'enfant terrible du romantisme. Son théâtre (spectacle dans un fauteuil) mêle fantaisie et drame profond.",
    context: "Publié en 1834. Drame romantique né de la liaison orageuse avec George Sand. La pièce commence comme une comédie et finit en tragédie.",
    summary: [
      { partTitle: "Le Retour", content: "Perdican (21 ans, docteur) et Camille (18 ans, sortant du couvent) reviennent au château familial. Le Baron veut les marier." },
      { partTitle: "Le Refus", content: "Camille, marquée par l'éducation religieuse et la peur de la souffrance, refuse l'amour de Perdican. Elle veut retourner au couvent." },
      { partTitle: "Le Jeu Cruel", content: "Piqué au vif, Perdican décide de rendre Camille jalouse en séduisant Rosette, une jeune paysanne naïve. Camille cache des témoins pour entendre Perdican se moquer de Rosette." },
      { partTitle: "La Tragédie", content: "Camille et Perdican s'avouent enfin leur amour passionné. Mais Rosette, qui a tout entendu, meurt d'émotion (ou se suicide). Cet amour est maudit par la mort de l'innocente. 'Elle est morte. Adieu, Perdican'." }
    ],
    characters: [
      { name: "Perdican", description: "Jeune libertin mais sincère, il joue avec le feu et provoque le drame sans le vouloir." },
      { name: "Camille", description: "Orgueilleuse et absolue, elle a peur d'aimer et se protège derrière Dieu." },
      { name: "Rosette", description: "La victime innocente, sacrifiée sur l'autel de l'amour-propre des protagonistes." }
    ]
  },
  "Pour un oui ou pour un non": {
    biography: "Nathalie Sarraute (1900-1999), figure du Nouveau Roman. Elle s'intéresse aux 'tropismes', ces mouvements intérieurs imperceptibles qui dictent nos réactions.",
    context: "Créée en 1982. Pièce dépouillée, presque abstraite, centrée sur le pouvoir des mots et l'agressivité souterraine dans les relations humaines.",
    summary: [
      { partTitle: "La Rupture", content: "Deux amis, H.1 et H.2, s'éloignent. H.2 demande des explications. H.1 finit par avouer : c'est à cause de la façon dont H.2 a dit 'C'est bien, ça' à propos d'une réussite de H.1." },
      { partTitle: "L'Analyse", content: "Ils décortiquent cette intonation. Était-ce condescendant ? Ironique ? Le 'non-dit' explose." },
      { partTitle: "L'Escalade", content: "La dispute s'envenime. D'autres souvenirs de phrases anodines remontent. Ils font appel à des témoins (Voisins) qui ne comprennent pas la violence de leur conflit." },
      { partTitle: "L'Impasse", content: "La pièce se termine sans véritable réconciliation. Elle montre l'incommunicabilité et la violence enfouie dans la banalité." }
    ],
    characters: [
      { name: "H.1 et H.2", description: "Personnages sans nom ni identité sociale précise. Ils sont des consciences qui s'affrontent. L'un est peut-être plus sensible aux non-dits (H.1) que l'autre." }
    ]
  },
  "Discours de la servitude volontaire": {
    biography: "Étienne de La Boétie (1530-1563), ami de Montaigne. Humaniste précoce, mort très jeune.",
    context: "Écrit vers 18 ans. Texte fulgurant qui questionne la légitimité du pouvoir politique. Pourquoi obéit-on ?",
    summary: [
      { partTitle: "Le Paradoxe", content: "La Boétie s'étonne qu'un peuple entier se soumette à un seul homme (le Tyran), alors que ce tyran n'a de pouvoir que celui qu'on lui donne." },
      { partTitle: "La Cause", content: "Ce n'est pas la peur, mais l'habitude (la coutume) qui crée la servitude. Les hommes naissent libres mais s'habituent aux fers." },
      { partTitle: "La Pyramide du Tyran", content: "Le tyran ne tient pas seul. Il a 5 complices, qui en ont 100, qui en ont 1000. C'est une chaîne de profit qui maintient le système." },
      { partTitle: "Le Remède", content: "Il ne faut pas tuer le tyran, il suffit de ne plus le servir. 'Soyez résolus de ne servir plus, et vous voilà libres'." }
    ],
    characters: [
      { name: "Le Tyran", description: "L'Un. Il est souvent faible et lâche, mais puissant par l'obéissance des autres." },
      { name: "Le Peuple", description: "Victime consentante, qui a oublié sa liberté naturelle." }
    ]
  },
  "Entretiens sur la pluralité des mondes": {
    biography: "Fontenelle (1657-1757), centenaire, secrétaire de l'Académie des sciences. Il fait le pont entre le XVIIe classique et les Lumières.",
    context: "Publié en 1686. Ouvrage de vulgarisation scientifique. Il explique la cosmologie de Copernic et Descartes à un public mondain.",
    summary: [
      { partTitle: "Le Cadre", content: "Un philosophe discute le soir, dans un parc, avec une Marquise curieuse et intelligente." },
      { partTitle: "La Terre est une planète", content: "Il explique que la Terre tourne autour du Soleil (héliocentrisme) et tourne sur elle-même. Il utilise des analogies simples (le théâtre, les blonds et les bruns)." },
      { partTitle: "Les autres mondes habités", content: "Par analogie, si la Terre est comme les autres planètes, alors la Lune, Mercure ou Vénus peuvent être habitées. Il imagine les habitants selon le climat." },
      { partTitle: "L'Univers infini", content: "Il ouvre la perspective sur les étoiles fixes qui sont autant de soleils avec leurs propres planètes. Vertige de l'infini, mais maîtrisé par la raison." }
    ],
    characters: [
      { name: "Le Philosophe", description: "Pédagogue, galant, cartésien. Il incarne la science aimable." },
      { name: "La Marquise", description: "Femme d'esprit, sans préjugés, elle représente le public éclairé capable de comprendre la science." }
    ]
  },
  "Lettres d'une Péruvienne": {
    biography: "Françoise de Graffigny (1695-1758). Salonnière célèbre, elle connaît un immense succès européen avec ce roman épistolaire.",
    context: "Publié en 1747. S'inspire de la mode de l'exotisme (comme les Lettres persanes) pour critiquer la société française et la condition des femmes.",
    summary: [
      { partTitle: "L'Enlèvement", content: "Zilia, princesse inca, est enlevée par les Espagnols le jour de ses noces avec Aza. Puis capturée par les Français (Déterville)." },
      { partTitle: "L'Observation", content: "Zilia arrive en France. Elle décrit les mœurs bizarres des Français (politesse hypocrite, superficialité) à travers ses quipos (nœuds incas) puis par écrit." },
      { partTitle: "La Critique", content: "Elle critique l'éducation des femmes et le mariage. Elle reste fidèle à Aza malgré l'amour de Déterville." },
      { partTitle: "Le Dénouement original", content: "Aza, retrouvé, est devenu infidèle (christianisé et marié à une Espagnole). Zilia refuse d'épouser Déterville et choisit de vivre seule, dans l'étude et l'amitié. Une fin féministe pour l'époque." }
    ],
    characters: [
      { name: "Zilia", description: "L'étrangère lucide. Elle passe de l'objet de curiosité au sujet pensant et indépendant." },
      { name: "Déterville", description: "L'aristocrate français généreux mais qui attend de la gratitude (amour) en retour." }
    ]
  }
};