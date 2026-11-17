# Pièges, patterns et règles d'écrans IDemat

> Extrait du `CLAUDE.md` le 2026-11-17 (découpage de la KB), contenu déplacé tel quel. Voir l'index dans `CLAUDE.md`.

## Piège — message d'erreur "mot de passe oublié" toujours faux (repéré 2026-08-06, non corrigé)

`mot-de-passe-oublie-idemat.component.html:38` affiche un texte fixe **"Il n'existe pas de compte avec cet e-mail"** pour **n'importe quelle** erreur renvoyée par le backend (`.ts` : `error: (err) => this.erreurEmail.set(true)`, sans distinguer la cause). Or côté back, `MotDePasseIdmService.demanderReset()` ne renvoie **jamais** d'erreur quand le compte n'existe pas — il répond `200 OK` silencieusement (anti-énumération volontaire, voir CLAUDE.md idbatv7). Conséquence : ce message ne peut littéralement jamais s'afficher pour la bonne raison — il ne sort QUE quand il y a une vraie panne technique (repéré via un vrai compte existant `rrosier@altea-si.com` tombant sur un SMTP local injoignable, voir CLAUDE.md idbatv7 pour la saga SMTP), et ment alors à l'usager en lui disant que son compte n'existe pas alors qu'il existe. **Pas encore corrigé** — proposition faite (remplacer par un message générique "Une erreur est survenue, merci de réessayer plus tard"), en attente de décision.

## Piège — fichiers générés orphelins après un renommage de classe côté back (découvert 2026-08-03)

`npm run generate-client-local` **n'efface jamais** les fichiers d'une génération précédente qui ne correspondent plus au spec actuel — il ajoute/écrase, mais ne nettoie pas. Repéré sur `mot-de-passe-idm-controller.service.ts` (+ son modèle `ResetPasswordIdmRequest`) : ancien nom de classe (`MotDePasseIdmControllerService`), généré avant le retrait du suffixe "Idm" côté back, jamais supprimé du disque — le code (`UsagerIdematServiceAgents`) l'importait toujours au lieu du bon service à jour (`MotDePasseControllerService`, `mot-de-passe-controller.service.ts`), avec un type de requête périmé (sans `contratId`).

**Réflexe généralisable** : après toute régénération suite à un renommage de controller/DTO côté back, vérifier `git status` sur `src/core/api/` pour repérer d'éventuels fichiers **orphelins non modifiés** (ancien nom encore présent sur disque, non référencé dans `api.ts`/`models.ts` régénérés) — ils compilent souvent silencieusement (l'ancien code les importe toujours) sans qu'on remarque qu'on tape sur une version obsolète du contrat d'API.

## Piège — validation "live" vs "lostfocus" cohabitant sur un même formulaire (#292, 2026-07-22)

Un `ErrorStateMatcher` fourni au niveau du `@Component` (`providers: [{provide: ErrorStateMatcher, useClass: ...}]`) s'applique à **tous** les champs du formulaire. Si un seul champ doit se comporter différemment (ex. SIRET : validation en direct dès la frappe, comme le fait le BO par défaut — sans `ErrorStateMatcher` custom, Material utilise `dirty || touched`), ne pas changer le matcher global : donner un `[errorStateMatcher]` **local** à ce seul `<input matInput>`, avec une classe dédiée (`dirty || touched`), en laissant le matcher global (`touched` seul, demande Bertrand) pour tout le reste du formulaire.

## Pattern — icônes SVG statiques (`<img src>`) : pas d'accès aux variables SCSS

Les icônes du dossier `public/*.svg` (`Carte.svg`, `Code barres.svg`, `User.svg`…) sont chargées via `<img src="...">`, des fichiers statiques totalement isolés d'Angular — **impossible** d'y référencer une variable SCSS (`$text-color-muted` etc.), même en théorie. La couleur est codée en dur (`fill="..."`) dans le fichier SVG lui-même. Pour uniformiser la couleur de plusieurs icônes d'un même écran, comparer et aligner les valeurs `fill` des fichiers SVG un par un — pas de solution CSS.

Pour qu'une icône suive vraiment une variable SCSS, il faudrait l'inliner en `<svg>` dans le template (`fill="currentColor"`, couleur héritée via `color` CSS du parent) au lieu de `<img src>` — refactor plus large, pas fait à ce jour (#295).

## Pattern — couleur d'un `mat-slide-toggle` (ou tout composant Material) qui ne rend pas la vraie couleur de marque

Le thème M3 global (`mat.theme()` dans `styles.scss`) utilise une palette Material générique (`mat.$rose-palette`) qui ne correspond pas à `$primary-color` (#ED6E57) réel. **Ne jamais changer le thème global pour corriger ça** (risque de casser d'autres composants app-wide) — utiliser les overrides ciblés par composant Material, ex. pour les toggles :

```scss
@include mat.slide-toggle-overrides((
  selected-track-color: $primary-color,
  unselected-track-color: white,
  // ...
));
```
Pattern déjà en place côté BO (`idbatv7-front/styles.scss`) pour les mêmes raisons — reproduit à l'identique côté IDemat (#294).

## Pattern — centrage horizontal : toujours `max-width` sur `.page-container`, jamais sur un enfant

`.page-container` (global, `_common.scss`) se centre lui-même via `width: 50%; margin: 0 auto` (`width: 100%; margin: 0` sous 900px). Si un écran a besoin d'une largeur différente, poser le `max-width` **sur `.page-container` lui-même** (surcharge locale dans le composant), jamais sur un `div.contenu` enfant — sinon ce dernier ne se centre pas (il colle au bord gauche de la boîte large du parent), créant un désalignement horizontal entre écrans qui devraient pourtant être visuellement cohérents (repéré sur "Modifier le profil"/"Paramètres du compte" vs "Mon compte", 2026-07-22).

⚠️ **Convention tranchée (#388, 2026-08-12)** : ce piège touchait en réalité 9 écrans à la fois, pas un cas isolé — `achat-passages`, `modification-email`, `modification-mot-de-passe`, `mentions-legales` avaient un `max-width` sur `.contenu`/`.succes-bloc`/`.message-resultat` (enfant, jamais centré) ; `carte-acces`, `parametres-compte`, `modification-profil`, `informations-personnelles` avaient un `max-width: 720px` correctement posé sur `.page-container` mais **délibérément plus étroit** que le reste de l'app (harmonisation volontaire antérieure entre ces 4 écrans uniquement, commentaires explicites dans le code) ; `home` n'utilise même pas `.page-container` (structure `.home-container` dédiée) et plafonnait son contenu à `640px`. Décision Ronald après QA visuelle : **tous les écrans authentifiés doivent utiliser la largeur par défaut** (50%/100%), aucune exception — les 4 `max-width:720px` et le plafond `640px` de `home` ont été retirés, `home.component.scss` répliquant manuellement le comportement `width:50%/100%` de `.page-container` (structure différente, pas de refonte pour éviter le risque de régression). **Seul `/inscription` (`creation-compte`, écran public pré-connexion) garde son `max-width:720px` sur `.contenu`** — laissé de côté volontairement (hors périmètre de la demande, flux différent du reste de l'app authentifiée). Toute nouvelle exception de largeur doit désormais être justifiée explicitement, pas copiée d'un ancien écran.

## Écran "Mes accès" (`carte-acces`) — ajout/suppression de véhicule (2026-07-22)

Déplacé depuis "Modifier le profil" (accord Ronald, anticipation des tickets à venir annoncés par Bertrand sur cet écran — voir issue #296). Même logique exacte que l'ancien emplacement (dialog `AjouterVehiculeDialogComponent`, `usagerService.addVehicule()`/`deleteVehicule()`) : "Modifier le profil" ne gère plus les véhicules du tout. Bloc "Véhicules" toujours gaté par `allowImmatriculationsParticuliers`/`allowImmatriculationsProfessionnels`, mais affiché même à 0 véhicule (pour permettre le premier ajout).

⚠️ **Bug corrigé le 2026-07-22 (même PR #41)** : après ajout/suppression, la liste ne se rafraîchissait pas fiablement. Le code patchait localement le signal `usager` (concat/filter manuel sur `vehicules`) au lieu de relire la source de vérité — fragile et sans gestion d'erreur (un échec HTTP silencieux donnait l'impression que rien ne s'était passé). **Pattern à privilégier pour toute mutation de liste (ajout/suppression) : recharger l'entité complète depuis le back (`usagerService.getUsager().subscribe(u => this.usager.set(u))`) plutôt que patcher l'état local à la main**, et toujours ajouter un handler `error` (même juste `console.error`) sur les `subscribe()` de mutation — son absence est indétectable côté UI (pas d'erreur visible, juste "rien ne se passe").

## Pattern — dialog de confirmation dédié par action destructrice (#308, 2026-07-23)

Pas de service de confirmation générique côté IDemat (contrairement à `ConfirmationService` du BO idbatv7-front) — chaque action destructrice a son propre petit composant dialog, calqué sur `ConfirmationSuppressionCompteComponent` (`dialog-container`/`dialog-header`/`actions-row`/`btn-annuler`+`btn-supprimer`, classes déjà globales via `_common.scss` sauf `.btn-supprimer` à redéfinir). `ConfirmationSuppressionVehiculeComponent` reprend ce pattern à l'identique avec un message paramétré via `MAT_DIALOG_DATA` (`{immatriculation: string}`). Pour toute nouvelle action de suppression : dupliquer ce pattern (nouveau composant, pas de service partagé à créer sauf si un 3e cas identique apparaît).

## Écran "Mon compte" (`informations-personnelles`) — bypassé (#306, 2026-07-23)

Avec un seul lien restant après le masquage de "Modifier le profil" (#306), l'écran intermédiaire ne se justifiait plus : le profil (header desktop, `top-bar-user`) et l'item "Mon compte" (menu mobile) mènent maintenant directement à `parametresCompte` (retitré "Mon compte"). Route/composant `informations-personnelles` conservés (rollback possible), juste plus liés nulle part — même pattern que "écran livré en avance sur son sprint" mais pour un écran devenu inutile plutôt que pas encore prêt. Retour de Paramètres du compte → accueil (pas vers l'écran bypassé).

## Piège — `ng serve` qui ne recharge plus après des opérations git (stash/checkout) mi-session

Le serveur dev peut cesser de rebuilder silencieusement après des changements de branche/stash sur le même repo pendant qu'il tourne — repéré en cherchant pourquoi un fix (rafraîchissement véhicule, ci-dessus) semblait "ne pas fonctionner" alors que le code était correct : le dernier rebuild du log datait de plus de 2h, avant l'édition. **Réflexe** : après tout `git stash`/`checkout`/`branch` sur un repo dont le dev server tourne, vérifier le timestamp du dernier "Application bundle generation complete" dans son log avant de conclure à un bug applicatif — si le serveur n'a pas rebuild depuis l'édition, le redémarrer (`kill` + `nohup npm start &`) avant de chercher plus loin. Même famille de piège que le `bootRun` backend resté stale (cf. CLAUDE.md idbatv7), côté frontend cette fois.

⚠️ **Récidive (#388, 2026-08-12)** : le process `ng serve (idemat-front)` tournait depuis le **4 août** (8 jours), largement avant toute la session — Ronald a signalé "Mes accès n'a pas pris la largeur / Mentions légales non plus / Mon compte non plus" alors que le code corrigeant ces 3 écrans était bien correct sur disque. `ps aux` a confirmé un PID actif depuis `Mon09AM`/`4Aug26` — kill + `nohup npm start &` a immédiatement résolu les 3 écrans signalés. **Réflexe renforcé** : sur une session longue ou reprise après plusieurs jours, vérifier l'âge du process dev server (`ps aux | grep "ng serve"`) en préventif dès le premier changement de branche, pas seulement après qu'un fix semble "ne pas marcher" — ce piège s'est déjà reproduit plusieurs fois côté back (voir "Récidives" CLAUDE.md idbatv7) et touche maintenant aussi le front de façon récurrente.

## Squelette WIP sprint 10 — reverté (2026-07-10)

La route `home` a pointé temporairement vers `WipComponent` (page plein écran "IDemat en cours de développement", hors shell) entre PR #28 et son revert par Jérémie (`cfa084d`) — **entièrement retiré du code**, `HomeComponent` est de nouveau la route active. Ne pas réintroduire ce pattern sans redemander.

## Règle métier — zones J1/F3 et carte grise (ajout de véhicule)

- **zoneJ1/zoneF3** : affichés et obligatoires **uniquement** si `contrat.demandeZoneJ1F3` est actif — **jamais** lié à PART/PRO (erreur corrigée par PR #25, ne pas réintroduire ce raccourci).
- **carteGrise** (fichier) : obligatoire côté front pour **tout** ajout de véhicule (PART et PRO, indépendamment du flag J1/F3) — bloqué par `erreurFichier` dans `AjouterVehiculeDialogComponent`. ⚠️ Aucun contrôle équivalent côté back (champ nullable dans les DTOs `AjouterVehiculeDioRequest`/`VehiculeInscriptionDioRequest`) — gap de validation identifié, pas corrigé, décision à prendre.

## TODO prod (avant mise en production)

- Remplacer les adresses email hardcodées de test (`rrosier@altea-si.com`) par les vraies adresses dans le backend (`InscriptionIdmService.inscrire()` et `DemandeInscriptionService.valider()`)
- Payfip (#276, mergé 2026-07-30) : checklist bascule prod détaillée dans `idbatv7/CLAUDE.md` et la mémoire `project_payfip_chantier.md` (numcli/saisie réels par contrat, endpoint SOAP à reconfirmer avec Bertrand, accès sortant back jamais vérifié depuis un vrai serveur de prod)

## Pattern — réconciliation Payfip à la consultation du solde (#276, 2026-07-30)

`PassagesPointsComponent.ngOnInit()` appelle `AchatPassagesIdematServiceAgents.reconcilierMesAchatsEnAttente()` (`POST /api/achat-passages/reconcilier`, filtré sur l'usager connecté) **avant** de charger `getPassagesInfo()`/`getStats()`, pour garantir la fraîcheur du solde affiché — le job Quartz global côté back (toutes les 20 min) ne suffit pas seul, sa cadence introduit un décalage. Appel best-effort (`catchError(() => of(void 0))`) : un échec ne doit jamais empêcher l'affichage de l'écran. Pas de déclencheur équivalent à la connexion/accueil — jugé redondant après discussion (voir `project_payfip_chantier.md` pour le raisonnement complet).

## Piège — écran de retour Payfip doit reproduire le legacy dédié, pas superposer au formulaire (#368, résolu 2026-08-07)

`AchatPassagesComponent` réutilise le même écran/route pour le formulaire d'achat **et** le retour Payfip (query param `?resultat=P/A`, `resultatPaiement` signal) — contrairement au legacy .NET où `RetourPayfip.cshtml` est une page **entièrement séparée** de `AchatPassages.cshtml`, qui n'affiche jamais que l'en-tête + le message (`@Html.Raw(@Model.Variables.texteRetourPayfip)`), jamais la liste d'achat ni de bouton. Le composant v7 affichait le message de résultat (succès/échec) **en plus** de l'offre et du bouton "Valider" au lieu de les masquer — RG1 du ticket demandait explicitement de ne pas les afficher.

**Fix** : dans `achat-passages.component.html`, le `<p class="subtitle">` + `.contenu` (offre + bouton Valider) ne s'affichent que `@if (!resultatPaiement())` — sinon seul le message s'affiche, dans le même `@else if (options())` (les options restent chargées en tâche de fond, juste non rendues).

**Réflexe généralisable** : quand le legacy `.NET` a une page dédiée pour un état particulier (ici le retour d'un paiement), le fait qu'on regroupe cet état dans un composant Angular partagé (plus simple à router) ne dispense pas de reproduire le comportement "vue exclusive" — soit une route séparée, soit un `@if`/`@else` qui masque complètement l'autre état, jamais une simple superposition. Toujours vérifier l'archive `_ARCHIVE_DotNet_IDbat_Legacy/` pour la page correspondante avant d'improviser l'agencement d'un écran de confirmation/retour.

## Piège CSS — `min-height:100vh` + padding vertical sans `box-sizing:border-box` (#334/#337, 2026-07-30)

Plusieurs écrans plein écran (`.page`/`.overlay`, hors layout applicatif — login, mot de passe oublié, création de compte, confirmation, lien invalide) ont `min-height: 100vh` en `box-sizing: content-box` (comportement par défaut CSS) combiné à un `padding` vertical non nul. Le padding s'ajoute alors **par-dessus** les 100vh au lieu d'être compris dedans, provoquant une barre de scroll vertical inutile quel que soit le contenu réel de la page.

**Fix systématique** : ajouter `box-sizing: border-box;` au conteneur concerné (aucun changement des valeurs de padding elles-mêmes nécessaire).

⚠️ **Repéré deux fois de suite** (#334 sur `connexion-idemat`, puis #337 sur 5 autres écrans avec le même bloc copié-collé) — dès qu'un de ces deux symptômes apparaît sur un nouvel écran, vérifier immédiatement tous les autres via :
```bash
grep -rl "min-height:\s*100vh" src/app --include="*.scss"
```
et corriger tous les fichiers remontés d'un coup, plutôt que d'attendre un ticket séparé par écran.
