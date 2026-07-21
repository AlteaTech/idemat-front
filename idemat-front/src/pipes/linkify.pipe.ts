import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({name: 'linkify', standalone: true})
export class LinkifyPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    // Un admin peut déjà écrire ses propres balises <a> (mentions légales) — la conversion
    // automatique d'URL brute ne doit s'appliquer qu'en l'absence de tout lien existant,
    // sinon elle réinjecte un <a> à l'intérieur du href="..." et casse le HTML.
    const contientDejaUnLien = /<a\s/i.test(value);
    const linked = contientDejaUnLien
      ? value
      : value.replace(
          /(https?:\/\/[^\s<>"]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
    return this.sanitizer.bypassSecurityTrustHtml(linked);
  }
}
