import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { UnsplashService, Image } from './services/unsplash.service';
import {
  AsyncPipe,
  NgFor,
  NgIf,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
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

interface Page {
  images: Image[];
  pageStartHidden: boolean;
  pageEndHidden: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
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
  protected pages$ = new BehaviorSubject<Page[]>([]);

  constructor(private unsplashService: UnsplashService) {}

  ngOnInit(): void {
    const loadPagesToFillViewport$ = interval().pipe(
      takeWhile(this.viewportIsNotFull),
      map(() => this.pagesLoaded + 1)
    );

    merge(loadPagesToFillViewport$, this.loadPage)
      .pipe(
        distinctUntilChanged(),
        concatMap((page) => this.unsplashService.getSavedPhotos(page)),
        map((newImages) => ({
          images: newImages,
          pageStartHidden: false,
          pageEndHidden: false,
        })),
        withLatestFrom(this.pages$),
        map(([newPage, loadedPages]) => [...loadedPages, newPage]),
        tap((updatedPages) => {
          this.pages$.next(updatedPages);
          this.pagesLoaded++;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  protected loadNextPage() {
    this.loadPage.next(this.pagesLoaded + 1);
  }

  protected pageTrackBy(index: number, page: Page) {
    return `${index}_${page.pageStartHidden && page.pageEndHidden}`;
  }

  protected changePageStartVisibility(pageIndex: number, hidden: boolean) {
    const newPagesArray = [...this.pages$.value];
    newPagesArray[pageIndex] = {
      ...newPagesArray[pageIndex],
      pageStartHidden: hidden,
    };
    this.pages$.next(newPagesArray);
  }

  protected changePageEndVisibility(pageIndex: number, hidden: boolean) {
    const newPagesArray = [...this.pages$.value];
    newPagesArray[pageIndex] = {
      ...newPagesArray[pageIndex],
      pageEndHidden: hidden,
    };
    this.pages$.next(newPagesArray);
  }

  private viewportIsNotFull() {
    return (
      (document.scrollingElement?.scrollHeight ?? 0) <=
      (document.scrollingElement?.clientHeight ?? 0)
    );
  }
}
