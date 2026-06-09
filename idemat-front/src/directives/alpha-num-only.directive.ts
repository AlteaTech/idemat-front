import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[AlphaNumOnly]',
  standalone: true
})
export class AlphaNumOnlyDirective {
  private readonly regex = /[^a-zA-Z0-9]/g;

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement as HTMLInputElement;
    const valeurNettoyee = input.value.replace(this.regex, '');
    if (input.value !== valeurNettoyee) {
      const supprimés = input.value.length - valeurNettoyee.length;
      const position = Math.max(0, (input.selectionStart ?? 0) - supprimés);
      input.value = valeurNettoyee;
      this.control.control?.setValue(valeurNettoyee, {emitEvent: false});
      input.setSelectionRange(position, position);
    }
  }
}
