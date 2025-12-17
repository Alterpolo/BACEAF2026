/**
 * DeepSeek Mock Service
 * Simule les réponses de l'API DeepSeek pour les démos
 */

export type ExerciseType = 'Dissertation' | 'Commentaire' | 'Oral';

export interface Work {
  author: string;
  title: string;
  parcours: string;
}

export interface WorkAnalysis {
  biography: string;
  context: string;
  summary: { partTitle: string; content: string }[];
  characters: { name: string; description: string }[];
}

// Délai simulé pour rendre la démo plus réaliste
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateSubject(type: ExerciseType, work?: Work): Promise<string> {
  await delay(800);

  if (type === 'Dissertation' && work) {
    const subjects: Record<string, string> = {
      'Les Fleurs du Mal': `« La poésie doit avoir pour but la vérité pratique », écrivait Baudelaire dans ses Fusées. Dans quelle mesure cette affirmation éclaire-t-elle votre lecture des Fleurs du Mal ?

Vous répondrez à cette question en vous appuyant sur votre connaissance de l'œuvre de Baudelaire, en particulier dans le cadre du parcours "Alchimie poétique : la boue et l'or".`,

      'Gargantua': `Rabelais écrit dans le prologue de Gargantua : « rompre l'os et sucer la substantifique moelle ». En quoi cette invitation à chercher un sens caché éclaire-t-elle votre lecture de Gargantua ?

Vous répondrez à cette question dans le cadre du parcours "Rire et savoir".`,

      'Les Caractères': `La Bruyère affirme : « Je rends au public ce qu'il m'a prêté ». Comment cette formule éclaire-t-elle votre lecture des Caractères ?

Vous traiterez ce sujet dans le cadre du parcours "La comédie sociale".`,

      'Déclaration des droits de la femme et de la citoyenne': `Olympe de Gouges écrit : « La femme a le droit de monter sur l'échafaud ; elle doit avoir également celui de monter à la Tribune. » Comment cette affirmation reflète-t-elle l'ensemble de son combat dans la Déclaration des droits de la femme et de la citoyenne ?

Parcours : Écrire et combattre pour l'égalité.`,
    };

    return subjects[work.title] || `Dans quelle mesure l'œuvre "${work.title}" de ${work.author} illustre-t-elle le parcours "${work.parcours}" ? Vous appuierez votre réflexion sur des exemples précis tirés de l'œuvre.`;
  }

  if (type === 'Commentaire') {
    if (work) {
      return `**Extrait de "${work.title}" de ${work.author}**

---

[Extrait situé au cœur de l'œuvre, représentatif des thématiques du parcours "${work.parcours}"]

« Ici, l'auteur déploie son art avec une maîtrise remarquable. Le style caractéristique de ${work.author} se manifeste pleinement dans ce passage où se mêlent réflexion profonde et expression poétique.

Le lecteur est invité à contempler les multiples facettes de l'existence humaine, entre grandeur et misère, espoir et désillusion. Chaque mot semble pesé, chaque image soigneusement choisie pour créer un effet de miroir où le lecteur se reconnaît.

La construction même du passage, avec ses rythmes alternés et ses figures de style, révèle l'intention de l'auteur : toucher l'âme autant que l'esprit. »

---

**Consigne :** Vous ferez le commentaire de cet extrait en montrant comment ${work.author} met en œuvre son art pour servir le propos de l'œuvre.`;
    }

    return `**Texte : Victor Hugo, "Demain, dès l'aube..." (Les Contemplations, 1856)**

Demain, dès l'aube, à l'heure où blanchit la campagne,
Je partirai. Vois-tu, je sais que tu m'attends.
J'irai par la forêt, j'irai par la montagne.
Je ne puis demeurer loin de toi plus longtemps.

Je marcherai les yeux fixés sur mes pensées,
Sans rien voir au dehors, sans entendre aucun bruit,
Seul, inconnu, le dos courbé, les mains croisées,
Triste, et le jour pour moi sera comme la nuit.

Je ne regarderai ni l'or du soir qui tombe,
Ni les voiles au loin descendant vers Harfleur,
Et quand j'arriverai, je mettrai sur ta tombe
Un bouquet de houx vert et de bruyère en fleur.

**Consigne :** Vous ferez le commentaire de ce poème en montrant comment Hugo exprime le deuil et l'amour paternel.`;
  }

  if (type === 'Oral' && work) {
    return `**Question pour l'oral - ${work.title}**

1. **Question de grammaire :** Analysez la proposition subordonnée dans la phrase suivante tirée de l'œuvre : "Il comprit alors que tout était perdu." Identifiez sa nature et sa fonction.

2. **Question d'interprétation :** Comment ${work.author} utilise-t-il ce passage pour illustrer le thème central du parcours "${work.parcours}" ?

Préparez une réponse structurée de 2-3 minutes pour chaque question.`;
  }

  return 'Sujet de démonstration généré avec succès.';
}

export async function generateSubjectList(work: Work, type: ExerciseType = 'Dissertation'): Promise<string[]> {
  await delay(1000);

  if (type === 'Commentaire') {
    return [
      `**Extrait 1 - L'incipit**\n\nCe passage d'ouverture de "${work.title}" pose les bases thématiques de l'œuvre. ${work.author} y établit le ton et introduit les enjeux principaux qui traverseront l'ensemble du texte. L'écriture, à la fois précise et évocatrice, invite le lecteur à entrer dans l'univers de l'œuvre.`,

      `**Extrait 2 - Le moment de crise**\n\nAu cœur de "${work.title}", ce passage représente un tournant décisif. L'intensité dramatique atteint son paroxysme tandis que ${work.author} déploie toute sa maîtrise stylistique. Les procédés d'écriture convergent pour créer un effet saisissant sur le lecteur.`,

      `**Extrait 3 - La conclusion**\n\nCe passage final de "${work.title}" offre une résolution aux tensions accumulées. ${work.author} y condense les thèmes du parcours "${work.parcours}" avec une force particulière. La dimension réflexive du texte invite à une relecture de l'ensemble de l'œuvre.`,
    ];
  }

  return [
    `Dans quelle mesure "${work.title}" de ${work.author} illustre-t-il(elle) le parcours "${work.parcours}" ? Vous appuierez votre réflexion sur des exemples précis tirés de l'œuvre.`,

    `Peut-on dire que ${work.author}, dans "${work.title}", cherche autant à instruire qu'à émouvoir ? Vous répondrez en vous appuyant sur le parcours "${work.parcours}".`,

    `"L'art véritable réside dans la capacité à révéler ce qui demeure invisible au regard ordinaire." Cette affirmation vous semble-t-elle éclairer votre lecture de "${work.title}" dans le cadre du parcours "${work.parcours}" ?`,
  ];
}

export async function evaluateStudentWork(
  type: ExerciseType,
  subject: string,
  studentInput: string
): Promise<string> {
  await delay(1200);

  const wordCount = studentInput.split(/\s+/).length;
  const hasIntro = studentInput.toLowerCase().includes('introduction') || studentInput.includes('I.');
  const hasPlan = studentInput.includes('I.') || studentInput.includes('1)') || studentInput.includes('Première partie');
  const hasExamples = studentInput.toLowerCase().includes('exemple') || studentInput.includes('citation') || studentInput.includes('«');

  let score = 12;
  if (wordCount > 100) score += 1;
  if (wordCount > 200) score += 1;
  if (hasIntro) score += 1;
  if (hasPlan) score += 2;
  if (hasExamples) score += 2;
  score = Math.min(score, 20);

  return `## 📝 Évaluation de votre ${type}

### Note indicative : ${score}/20

---

### ✅ Points forts

${hasIntro ? '- **Bonne structuration** : Votre travail présente une organisation claire qui facilite la lecture.' : '- **Effort de réflexion** : Vous avez cherché à répondre au sujet de manière personnelle.'}

${hasPlan ? '- **Plan apparent** : La progression de votre argumentation est visible et logique.' : '- **Idées pertinentes** : Vos réflexions montrent une compréhension du sujet.'}

${hasExamples ? '- **Références au texte** : Vous appuyez votre propos sur des éléments concrets.' : '- **Tentative d\'analyse** : Vous cherchez à dépasser la simple paraphrase.'}

${wordCount > 150 ? '- **Développement satisfaisant** : Votre réponse est suffisamment étoffée.' : ''}

---

### 📈 Points à améliorer

${!hasIntro ? '- **Structurer l\'introduction** : Commencez par une amorce, présentez le sujet, formulez une problématique et annoncez votre plan.' : ''}

${!hasPlan ? '- **Organiser en parties** : Divisez clairement votre réflexion en 2-3 parties avec des sous-parties.' : ''}

${!hasExamples ? '- **Intégrer des citations** : Appuyez chaque argument sur un exemple précis tiré de l\'œuvre. Utilisez des guillemets et analysez les citations.' : ''}

${wordCount < 100 ? '- **Développer davantage** : Votre réponse mériterait d\'être plus approfondie. Visez au moins 300 mots pour un exercice d\'entraînement.' : ''}

- **Affiner l'analyse stylistique** : Identifiez les procédés littéraires (métaphores, champs lexicaux, rythme...) et expliquez leurs effets.

---

### 💡 Suggestions concrètes

**Pour la problématique :**
Une bonne problématique reformule le sujet sous forme de question et met en tension les termes clés. Essayez : "Comment [l'auteur] parvient-il à [effet recherché] tout en [contrainte ou paradoxe] ?"

**Pour le plan :**
Un plan dialectique (thèse / antithèse / synthèse) fonctionne bien pour les sujets de réflexion. Un plan thématique convient mieux pour les commentaires.

**Pour les transitions :**
Entre chaque partie, faites le bilan de ce qui précède et annoncez ce qui suit. Exemple : "Après avoir montré que..., nous verrons maintenant comment..."

---

### 🎯 Prochaine étape

Reprenez votre travail en vous concentrant sur **un seul point d'amélioration** à la fois. La progression vient avec la pratique régulière !

*Continuez ainsi, vous êtes sur la bonne voie ! 🌟*`;
}

export async function generateWorkAnalysis(work: Work): Promise<WorkAnalysis> {
  await delay(1500);

  const analyses: Record<string, WorkAnalysis> = {
    'Les Fleurs du Mal': {
      biography: "Charles Baudelaire (1821-1867) est un poète français majeur du XIXe siècle. Précurseur du symbolisme, il incarne la figure du poète maudit. Son œuvre explore le spleen, la beauté et la modernité urbaine. Il a également été critique d'art et traducteur d'Edgar Allan Poe.",
      context: "Publiées en 1857, Les Fleurs du Mal paraissent sous le Second Empire. L'œuvre est condamnée pour outrage aux bonnes mœurs (6 poèmes censurés). Baudelaire y développe une esthétique nouvelle qui transforme la laideur en beauté, la \"boue\" en \"or\".",
      summary: [
        { partTitle: "Spleen et Idéal", content: "Section la plus longue, elle oppose l'aspiration vers le beau et l'idéal à l'ennui existentiel (spleen). Le poète oscille entre élévation spirituelle et chute dans le désespoir." },
        { partTitle: "Tableaux parisiens", content: "Baudelaire devient le poète de la ville moderne. Il observe les marginaux, les vieillards, les aveugles, et trouve la beauté dans la laideur urbaine." },
        { partTitle: "Le Vin", content: "Le vin apparaît comme un refuge contre le spleen, un moyen d'évasion pour les déshérités et les artistes." },
        { partTitle: "Fleurs du Mal", content: "Section la plus transgressive, elle explore le mal, la débauche et les amours interdites. C'est ici que se trouvaient les poèmes censurés." },
        { partTitle: "Révolte et La Mort", content: "La révolte contre Dieu précède l'ultime refuge : la mort, perçue comme voyage vers l'inconnu et possible délivrance." }
      ],
      characters: [
        { name: "Le Poète", description: "Figure centrale, albatros maladroit sur terre mais prince des nuées, il incarne le génie incompris." },
        { name: "La Femme", description: "Multiple : Jeanne Duval (sensuelle), Madame Sabatier (idéalisée), Marie Daubrun (ambiguë). Elle est muse et bourreau." },
        { name: "Le Spleen", description: "Entité abstraite personnifiée, il représente l'ennui existentiel, l'angoisse métaphysique qui écrase le poète." }
      ]
    },
    'Gargantua': {
      biography: "François Rabelais (1494-1553) est un écrivain humaniste de la Renaissance. Moine, médecin et érudit, il crée une œuvre satirique qui mêle érudition et culture populaire. Son rire subversif cache une réflexion profonde sur l'éducation et la société.",
      context: "Publié en 1534 sous le règne de François Ier, Gargantua s'inscrit dans l'effervescence humaniste. L'œuvre critique l'éducation scolastique médiévale et prône un savoir joyeux. Elle fut condamnée par la Sorbonne pour son audace.",
      summary: [
        { partTitle: "Naissance et enfance", content: "Naissance extraordinaire de Gargantua, fils de Grandgousier et Gargamelle. Son enfance illustre les méfaits de l'éducation scolastique." },
        { partTitle: "L'éducation humaniste", content: "Ponocrates transforme Gargantua par une éducation complète : corps et esprit, théorie et pratique, lecture des Anciens et observation de la nature." },
        { partTitle: "La guerre picrocholine", content: "Conflit absurde déclenché pour des fouaces. Satire de la guerre et des tyrans à travers Picrochole face au sage Grandgousier." },
        { partTitle: "Frère Jean des Entommeures", content: "Moine guerrier et bon vivant, il incarne un idéal de vie active opposé à la religion hypocrite." },
        { partTitle: "L'abbaye de Thélème", content: "Utopie finale où règne la devise \"Fais ce que voudras\". Anti-monastère pour êtres libres et bien nés." }
      ],
      characters: [
        { name: "Gargantua", description: "Géant au bon appétit, il évolue d'enfant mal éduqué à prince humaniste éclairé." },
        { name: "Grandgousier", description: "Père de Gargantua, roi pacifique et sage, il incarne l'idéal du bon souverain." },
        { name: "Frère Jean", description: "Moine atypique, guerrier et joyeux drille, il représente une religion vivante opposée à l'hypocrisie." },
        { name: "Picrochole", description: "Roi belliqueux et orgueilleux, il symbolise la folie des conquérants et des tyrans." }
      ]
    }
  };

  return analyses[work.title] || {
    biography: `${work.author} est un auteur majeur de la littérature française. Son œuvre s'inscrit dans un contexte historique et littéraire riche qui a profondément influencé la création de "${work.title}".`,
    context: `"${work.title}" s'inscrit dans le parcours "${work.parcours}". Cette œuvre reflète les préoccupations de son époque tout en proposant une vision singulière qui continue de résonner aujourd'hui.`,
    summary: [
      { partTitle: "Première partie", content: "L'œuvre s'ouvre sur une exposition qui pose les enjeux principaux et introduit les thèmes centraux." },
      { partTitle: "Développement", content: "Le cœur de l'œuvre développe la réflexion de l'auteur à travers des épisodes significatifs." },
      { partTitle: "Dénouement", content: "La conclusion apporte une résolution aux tensions tout en ouvrant sur des questionnements plus larges." }
    ],
    characters: [
      { name: "Personnage principal", description: "Figure centrale de l'œuvre, il/elle incarne les valeurs et questionnements de l'auteur." },
      { name: "Personnages secondaires", description: "Ils enrichissent la réflexion en offrant des contrepoints ou des échos au personnage principal." }
    ]
  };
}
