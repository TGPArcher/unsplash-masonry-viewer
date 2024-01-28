import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { UnsplashService, Image } from './services/unsplash.service';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { ToSpanPipe } from './to-span.pipe';
import { ObserveVisibilityDirective } from './observe-visibility.directive';
import {
  BehaviorSubject,
  Subject,
  concatMap,
  distinctUntilChanged,
  interval,
  map,
  merge,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    NgStyle,
    ToSpanPipe,
    ObserveVisibilityDirective,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private pagesLoaded = 0;
  private loadPage = new Subject<number>();
  protected images$ = new BehaviorSubject<Image[]>([]);

  constructor(private unsplashService: UnsplashService) {}

  ngOnInit(): void {
    const loadPagesToFillViewport$ = interval().pipe(
      takeWhile(this.viewportIsNotFull),
      map(() => this.pagesLoaded + 1)
    );

    merge(loadPagesToFillViewport$, this.loadPage)
      .pipe(
        distinctUntilChanged(),
        tap(() => console.log('Loading next page')),
        concatMap((page) => this.unsplashService.getSavedPhotos(page)),
        withLatestFrom(this.images$),
        map(([newImages, loadedImages]) => [...loadedImages, ...newImages]),
        tap((updatedImages) => {
          this.pagesLoaded++;
          this.images$.next(updatedImages);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected loadNextPage() {
    this.loadPage.next(this.pagesLoaded + 1);
  }

  private viewportIsNotFull() {
    return (
      (document.scrollingElement?.scrollHeight ?? 0) <=
      (document.scrollingElement?.clientHeight ?? 0)
    );
  }
}
