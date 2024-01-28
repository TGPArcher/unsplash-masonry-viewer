import { Component } from '@angular/core';
import { UnsplashService } from './services/unsplash.service';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { ToSpanPipe } from './to-span.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, NgStyle, ToSpanPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected images$ = this.unsplashService.getSavedPhotos(1);

  constructor(private unsplashService: UnsplashService) {}
}
