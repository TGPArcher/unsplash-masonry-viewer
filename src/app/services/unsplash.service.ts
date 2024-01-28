import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, map, of } from 'rxjs';
import { savedPages } from './saved-requests';

interface UnsplashPhoto {
  width: number;
  height: number;
  urls: {
    regular: string;
  };
}

interface Image {
  url: string;
  heightToWidthRatio: number;
}

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  private readonly unsplashApiUrl = 'https://api.unsplash.com/';
  private readonly authHeaders = new HttpHeaders(
    'Authorization: Client-ID YOUR_ACCESS_KEY'
  );
  private readonly imagesPerPage = 20;

  constructor(private httpClient: HttpClient) {}

  getPhotos(page: number): Observable<string[]> {
    const endpoint = 'photos';
    const params = new HttpParams({
      fromObject: {
        page: page,
        per_page: this.imagesPerPage,
      },
    });
    return this.httpClient
      .get<UnsplashPhoto[]>(`${this.unsplashApiUrl}${endpoint}`, {
        headers: this.authHeaders,
        params: params,
      })
      .pipe(map((result) => result.map((i) => i.urls.regular)));
  }

  getSavedPhotos(page: number): Observable<Image[]> {
    const pageIndex = page - 1;
    if (pageIndex >= savedPages.length) return EMPTY;

    const pageResponse = savedPages[pageIndex];
    return of(pageResponse).pipe(
      map((result) =>
        result.map((i) => ({
          url: i.urls.regular,
          heightToWidthRatio: i.height / i.width,
        }))
      )
    );
  }
}
