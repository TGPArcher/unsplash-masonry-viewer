import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface UnsplashPhoto {
  urls: {
    regular: string;
  };
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
}