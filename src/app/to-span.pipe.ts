import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ToSpan',
  standalone: true,
})
export class ToSpanPipe implements PipeTransform {
  transform(value: number): string {
    const span = Math.floor((250 * value) / 10);
    return `span ${span}`;
  }
}
