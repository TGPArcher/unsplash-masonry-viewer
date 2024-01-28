import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Directive({ selector: '[observeVisibility]', standalone: true })
export class ObserveVisibilityDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() threshold = 0.01;
  @Output() visible = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

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
      threshold: this.threshold,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting;

    this.observer = new IntersectionObserver(([entry]) => {
      if (isIntersecting(entry)) {
        this.visible.emit();
      } else {
        this.hidden.emit();
      }
    }, options);
  }

  private startObserving() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);
  }
}
