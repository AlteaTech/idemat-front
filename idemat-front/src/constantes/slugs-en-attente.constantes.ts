import {environment} from '../environments/environment';
import {SlugEnAttente} from '../models/idemat/slug-en-attente.model';

// Format : "slug:AAAA-MM-JJ;slug2:AAAA-MM-JJ". Comparaison insensible à la casse : slugs normalisés en minuscules.
// Entrée sans date valide ignorée (chaque slug en attente doit avoir une date de fin).
export const SLUGS_EN_ATTENTE: readonly SlugEnAttente[] = environment.slugsEnAttente
  .split(';')
  .map(entree => entree.split(':').map(partie => partie.trim()))
  .filter(([slug, date]) => !!slug && /^\d{4}-\d{2}-\d{2}$/.test(date ?? ''))
  .map(([slug, date]) => {
    const [annee, mois, jour] = date.split('-').map(Number);
    return {slug: slug.toLowerCase(), dateFin: new Date(annee, mois - 1, jour)};
  });
