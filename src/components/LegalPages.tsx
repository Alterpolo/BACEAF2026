import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Building2, Server, Shield, CreditCard, Scale } from "lucide-react";

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-slate-50 py-12">
    <div className="max-w-4xl mx-auto px-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à l'accueil
      </Link>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none">{children}</div>
      </div>
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>Dernière mise à jour : Décembre 2024</p>
      </div>
    </div>
  </div>
);

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode
}> = ({ icon, title, children }) => (
  <section className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="text-slate-600 space-y-3 ml-13 pl-4 border-l-2 border-slate-100">
      {children}
    </div>
  </section>
);

export const MentionsLegales: React.FC = () => (
  <LegalLayout title="Mentions Légales">
    <Section icon={<Building2 size={20} />} title="Éditeur du site">
      <p>
        <strong>Neodromes</strong><br />
        Forme juridique : Auto-entrepreneur<br />
        Siège social : [Adresse à compléter]<br />
        SIRET : [Numéro à compléter]<br />
        Responsable de publication : [Nom à compléter]
      </p>
      <p>
        Contact : <a href="mailto:contact@neodromes.eu" className="text-indigo-600 hover:underline">contact@neodromes.eu</a>
      </p>
    </Section>

    <Section icon={<Server size={20} />} title="Hébergement">
      <p>
        Le site est hébergé par :<br />
        <strong>Hostinger International Ltd</strong><br />
        61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
        <a href="https://www.hostinger.fr" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.hostinger.fr</a>
      </p>
    </Section>

    <Section icon={<Shield size={20} />} title="Protection des données personnelles">
      <p>
        Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au
        Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants
        concernant vos données personnelles :
      </p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Droit d'accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l'effacement (« droit à l'oubli »)</li>
        <li>Droit à la limitation du traitement</li>
        <li>Droit à la portabilité des données</li>
        <li>Droit d'opposition</li>
      </ul>
      <p className="mt-3">
        Pour exercer ces droits, contactez-nous à : <a href="mailto:rgpd@neodromes.eu" className="text-indigo-600 hover:underline">rgpd@neodromes.eu</a>
      </p>
      <p className="mt-3">
        Les données collectées sont :<br />
        - Données d'identification (nom, prénom, email)<br />
        - Données de connexion (historique de navigation, adresse IP)<br />
        - Données d'utilisation (exercices générés, progression)<br />
        - Données de paiement (traitées par Stripe, non stockées sur nos serveurs)
      </p>
      <p className="mt-3">
        Durée de conservation : vos données sont conservées pendant toute la durée de votre
        compte actif, puis 3 ans après votre dernière connexion.
      </p>
    </Section>

    <Section icon={<Scale size={20} />} title="Propriété intellectuelle">
      <p>
        L'ensemble des contenus présents sur le site (textes, images, logos, interface) sont
        protégés par le droit d'auteur et sont la propriété exclusive de Neodromes, sauf
        mention contraire.
      </p>
      <p className="mt-3">
        Les exercices générés par l'intelligence artificielle sont mis à disposition des
        utilisateurs pour un usage personnel et éducatif uniquement. Toute reproduction ou
        redistribution à des fins commerciales est interdite.
      </p>
      <p className="mt-3">
        Les œuvres littéraires mentionnées dans le programme officiel sont la propriété de
        leurs auteurs respectifs.
      </p>
    </Section>

    <Section icon={<Mail size={20} />} title="Cookies">
      <p>
        Ce site utilise des cookies strictement nécessaires au fonctionnement du service :
      </p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong>Cookies d'authentification</strong> : maintien de votre session</li>
        <li><strong>Cookies de préférences</strong> : stockage de vos paramètres</li>
        <li><strong>Cookies analytiques</strong> : amélioration du service (anonymisés)</li>
      </ul>
      <p className="mt-3">
        Vous pouvez paramétrer votre navigateur pour refuser les cookies. Cependant,
        certaines fonctionnalités du site pourraient ne plus être disponibles.
      </p>
    </Section>

    <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600">
        En cas de litige, les tribunaux français seront seuls compétents.
        Pour toute réclamation, vous pouvez également saisir la plateforme de résolution
        des litiges en ligne de l'Union européenne : {" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          className="text-indigo-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>
      </p>
    </div>
  </LegalLayout>
);

export const CGV: React.FC = () => (
  <LegalLayout title="Conditions Générales de Vente">
    <Section icon={<Building2 size={20} />} title="Article 1 - Objet">
      <p>
        Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
        entre Neodromes et l'utilisateur (ci-après « le Client ») dans le cadre de la vente
        d'abonnements au service de préparation au Bac Français 2026.
      </p>
      <p className="mt-3">
        Le service propose :<br />
        - Des exercices générés par intelligence artificielle<br />
        - Des corrections et analyses personnalisées<br />
        - Un accès au programme officiel de l'EAF<br />
        - Des cours particuliers avec des enseignants certifiés (formule Tutoring)
      </p>
    </Section>

    <Section icon={<CreditCard size={20} />} title="Article 2 - Prix et paiement">
      <p>
        Les prix sont indiqués en euros TTC. La TVA applicable est la TVA française.
      </p>

      <div className="mt-4 space-y-3">
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Formule Gratuite</strong>
          <p className="text-sm mt-1">3 exercices par semaine, fonctionnalités limitées</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Formule Premium</strong>
          <p className="text-sm mt-1">
            9,99€/mois ou 79,99€/an (soit 33% d'économie)<br />
            Exercices illimités, corrections détaillées, suivi de progression
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Formule Tutoring</strong>
          <p className="text-sm mt-1">
            29,99€/mois ou 239,99€/an<br />
            Tous les avantages Premium + cours particuliers
          </p>
        </div>
      </div>

      <p className="mt-4">
        Le paiement est effectué via la plateforme sécurisée Stripe. Les moyens de paiement
        acceptés sont : carte bancaire (Visa, Mastercard).
      </p>
    </Section>

    <Section icon={<Shield size={20} />} title="Article 3 - Période d'essai">
      <p>
        Une période d'essai gratuite de 1 jour est offerte pour toute première souscription
        aux formules Premium ou Tutoring. Pendant cette période, l'utilisateur peut annuler
        sans frais. À l'issue de la période d'essai, l'abonnement sera automatiquement renouvelé
        selon la formule choisie.
      </p>
    </Section>

    <Section icon={<Scale size={20} />} title="Article 4 - Droit de rétractation">
      <p>
        Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
        ne peut être exercé pour les contrats de fourniture de contenus numériques non fournis
        sur un support matériel dont l'exécution a commencé avec l'accord du consommateur.
      </p>
      <p className="mt-3">
        En acceptant ces CGV et en commençant à utiliser le service, vous reconnaissez
        expressément renoncer à votre droit de rétractation.
      </p>
      <p className="mt-3">
        Toutefois, nous offrons une garantie « satisfait ou remboursé » de 14 jours après
        le premier paiement. Si le service ne vous convient pas, contactez-nous et nous vous
        rembourserons intégralement.
      </p>
    </Section>

    <Section icon={<CreditCard size={20} />} title="Article 5 - Renouvellement et résiliation">
      <p>
        Les abonnements sont renouvelés automatiquement à chaque échéance (mensuelle ou annuelle).
        Vous pouvez résilier votre abonnement à tout moment depuis votre espace personnel
        (Portail client Stripe).
      </p>
      <p className="mt-3">
        La résiliation prend effet à la fin de la période en cours. Vous conservez l'accès
        au service jusqu'à cette date. Aucun remboursement prorata temporis n'est effectué.
      </p>
    </Section>

    <Section icon={<Server size={20} />} title="Article 6 - Disponibilité du service">
      <p>
        Neodromes s'engage à assurer la disponibilité du service 24h/24, 7j/7, sous réserve
        des opérations de maintenance programmées ou d'événements de force majeure.
      </p>
      <p className="mt-3">
        En cas d'indisponibilité prolongée (plus de 48 heures consécutives), les utilisateurs
        Premium seront automatiquement crédités d'une prolongation équivalente.
      </p>
    </Section>

    <Section icon={<Shield size={20} />} title="Article 7 - Responsabilité">
      <p>
        Les exercices et corrections générés par l'intelligence artificielle sont fournis à
        titre indicatif et pédagogique. Ils ne sauraient se substituer à un enseignement
        officiel ni garantir les résultats à l'examen.
      </p>
      <p className="mt-3">
        Neodromes décline toute responsabilité en cas de :<br />
        - Mauvaise utilisation du service par le Client<br />
        - Résultats obtenus à l'examen<br />
        - Perte de données due à une négligence du Client (mot de passe compromis, etc.)
      </p>
    </Section>

    <Section icon={<Mail size={20} />} title="Article 8 - Service client">
      <p>
        Pour toute question ou réclamation, notre service client est disponible :<br />
        - Par email : <a href="mailto:support@neodromes.eu" className="text-indigo-600 hover:underline">support@neodromes.eu</a><br />
        - Délai de réponse : 48 heures ouvrées
      </p>
    </Section>

    <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <p className="text-sm text-slate-700">
        <strong>Médiation :</strong> En cas de litige non résolu à l'amiable, vous pouvez
        recourir gratuitement au service de médiation FEVAD (Fédération du e-commerce et
        de la vente à distance) : <a href="https://www.mediateurfevad.fr" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.mediateurfevad.fr</a>
      </p>
    </div>

    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600 text-center">
        En utilisant notre service, vous acceptez les présentes Conditions Générales de Vente.
      </p>
    </div>
  </LegalLayout>
);

export const PolitiqueConfidentialite: React.FC = () => (
  <LegalLayout title="Politique de Confidentialité">
    <Section icon={<Shield size={20} />} title="1. Responsable du traitement">
      <p>
        Le responsable du traitement des données personnelles est :<br />
        <strong>Neodromes</strong><br />
        Email : <a href="mailto:rgpd@neodromes.eu" className="text-indigo-600 hover:underline">rgpd@neodromes.eu</a>
      </p>
    </Section>

    <Section icon={<Server size={20} />} title="2. Données collectées">
      <p>Nous collectons les données suivantes :</p>

      <div className="mt-4 space-y-3">
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Données d'identification</strong>
          <p className="text-sm mt-1">Nom, prénom, adresse email, niveau scolaire</p>
          <p className="text-xs text-slate-500 mt-1">Finalité : création et gestion de votre compte</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Données d'utilisation</strong>
          <p className="text-sm mt-1">Exercices générés, corrections, notes personnelles, progression</p>
          <p className="text-xs text-slate-500 mt-1">Finalité : personnalisation de l'expérience pédagogique</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Données techniques</strong>
          <p className="text-sm mt-1">Adresse IP, navigateur, appareil, cookies de session</p>
          <p className="text-xs text-slate-500 mt-1">Finalité : sécurité et amélioration du service</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <strong>Données de paiement</strong>
          <p className="text-sm mt-1">Traitées directement par Stripe (PCI-DSS)</p>
          <p className="text-xs text-slate-500 mt-1">Nous ne stockons pas vos données bancaires</p>
        </div>
      </div>
    </Section>

    <Section icon={<Building2 size={20} />} title="3. Base légale du traitement">
      <p>Le traitement de vos données repose sur :</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong>L'exécution du contrat</strong> : fourniture du service commandé</li>
        <li><strong>Le consentement</strong> : pour les newsletters et communications marketing</li>
        <li><strong>L'intérêt légitime</strong> : amélioration du service, prévention de la fraude</li>
        <li><strong>L'obligation légale</strong> : conservation des données de facturation</li>
      </ul>
    </Section>

    <Section icon={<Server size={20} />} title="4. Destinataires des données">
      <p>Vos données peuvent être partagées avec :</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong>Supabase</strong> (hébergement base de données) - Localisation : EU</li>
        <li><strong>Stripe</strong> (paiements) - Certifié PCI-DSS</li>
        <li><strong>DeepSeek</strong> (IA) - Traitement anonymisé des exercices</li>
        <li><strong>Hostinger</strong> (hébergement) - Serveurs EU</li>
      </ul>
      <p className="mt-3">
        Nous ne vendons jamais vos données personnelles à des tiers.
      </p>
    </Section>

    <Section icon={<Shield size={20} />} title="5. Durée de conservation">
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Données de compte</strong> : durée de vie du compte + 3 ans après suppression</li>
        <li><strong>Données d'utilisation</strong> : 3 ans après dernière activité</li>
        <li><strong>Données de facturation</strong> : 10 ans (obligation légale)</li>
        <li><strong>Logs techniques</strong> : 1 an</li>
      </ul>
    </Section>

    <Section icon={<Scale size={20} />} title="6. Vos droits">
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li><strong>Accès</strong> : obtenir une copie de vos données</li>
        <li><strong>Rectification</strong> : corriger des données inexactes</li>
        <li><strong>Effacement</strong> : supprimer vos données (« droit à l'oubli »)</li>
        <li><strong>Limitation</strong> : restreindre le traitement</li>
        <li><strong>Portabilité</strong> : recevoir vos données dans un format structuré</li>
        <li><strong>Opposition</strong> : vous opposer au traitement</li>
      </ul>
      <p className="mt-3">
        Pour exercer ces droits : <a href="mailto:rgpd@neodromes.eu" className="text-indigo-600 hover:underline">rgpd@neodromes.eu</a>
      </p>
      <p className="mt-3">
        Vous pouvez également introduire une réclamation auprès de la CNIL : {" "}
        <a href="https://www.cnil.fr" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
      </p>
    </Section>

    <Section icon={<Mail size={20} />} title="7. Cookies">
      <p>Nous utilisons les cookies suivants :</p>

      <table className="w-full mt-4 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left">Cookie</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Durée</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="px-3 py-2">sb-*-auth-token</td>
            <td className="px-3 py-2">Essentiel (session)</td>
            <td className="px-3 py-2">Session</td>
          </tr>
          <tr>
            <td className="px-3 py-2">preferences</td>
            <td className="px-3 py-2">Fonctionnel</td>
            <td className="px-3 py-2">1 an</td>
          </tr>
          <tr>
            <td className="px-3 py-2">analytics_session</td>
            <td className="px-3 py-2">Analytique</td>
            <td className="px-3 py-2">30 min</td>
          </tr>
        </tbody>
      </table>
    </Section>

    <Section icon={<Server size={20} />} title="8. Sécurité">
      <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>Chiffrement HTTPS/TLS pour toutes les communications</li>
        <li>Hashage des mots de passe (bcrypt)</li>
        <li>Authentification à deux facteurs disponible</li>
        <li>Audits de sécurité réguliers</li>
        <li>Accès aux données limité au personnel autorisé</li>
      </ul>
    </Section>

    <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <p className="text-sm text-slate-700">
        Cette politique peut être mise à jour. Toute modification significative vous sera
        notifiée par email. La date de dernière mise à jour figure en bas de cette page.
      </p>
    </div>
  </LegalLayout>
);
