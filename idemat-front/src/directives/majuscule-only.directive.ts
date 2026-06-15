import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[MajusculeOnly]',
  standalone: true
})
export class MajusculeOnlyDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement as HTMLInputElement;
    const valeurNettoyee = input.value.toUpperCase();
    if (input.value !== valeurNettoyee) {
      const position = input.selectionStart ?? 0;
      input.value = valeurNettoyee;
      this.control.control?.setValue(valeurNettoyee, {emitEvent: false});
      input.setSelectionRange(position, position);
    }
  }
}
