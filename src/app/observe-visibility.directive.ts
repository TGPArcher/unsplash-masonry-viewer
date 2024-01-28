import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({ selector: '[observeVisibility]', standalone: true })
export class ObserveVisibilityDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  @Output() visible = new EventEmitter<void>();

  private observer: IntersectionObserver | undefined;

  constructor(private element: ElementRef) {}

  ngOnInit() {
    this.createObserver();
  }

  ngAfterViewInit() {
    this.startObserving();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private createObserver() {
    const options = {
      rootMargin: '0px',
      threshold: 1,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting;

    this.observer = new IntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (isIntersecting(entry)) {
          this.visible.emit();
        }
      });
    }, options);
  }

  private startObserving() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);
  }
}
