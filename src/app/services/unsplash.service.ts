import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, map, of } from 'rxjs';
import { savedPages } from './saved-requests';

interface UnsplashImage {
  width: number;
  height: number;
  urls: {
    regular: string;
  };
  description: string | null;
}

export interface Image {
  url: string;
  heightToWidthRatio: number;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  private readonly unsplashApiUrl = 'https://api.unsplash.com/';
  private readonly authHeaders = new HttpHeaders(
    'Authorization: Client-ID YOUR_ACCESS_KEY'
  );
  private readonly imagesPerPage = 20;

  constructor(private httpClient: HttpClient) {}

  getPhotos(page: number): Observable<Image[]> {
    const endpoint = 'photos';
    const params = new HttpParams({
      fromObject: {
        page: page,
        per_page: this.imagesPerPage,
      },
    });
    return this.httpClient
      .get<UnsplashImage[]>(`${this.unsplashApiUrl}${endpoint}`, {
        headers: this.authHeaders,
        params: params,
      })
      .pipe(
        map((result) =>
          result.map((i) => ({
            url: i.urls.regular,
            heightToWidthRatio: i.height / i.width,
            description: i.description,
          }))
        )
      );
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
          description: i.description,
        }))
      )
    );
  }
}
