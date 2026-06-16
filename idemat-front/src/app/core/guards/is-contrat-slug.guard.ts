import {CanMatchFn} from '@angular/router';
import {routesConstantes} from '../../../constantes/routes.constantes';

export const isContratSlugGuard: CanMatchFn = (route, segments) => {
  const knownPaths = Object.values(routesConstantes)
    .flatMap(v => v.split('/'))
    .filter(s => !!s && !s.startsWith(':'));
  const slug = segments[0]?.path;
  return !!slug && !knownPaths.includes(slug);
};
