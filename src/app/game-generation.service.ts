import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameGenerationService {
  private jsonUrl = 'assets/game-generation.json';

  constructor(private http: HttpClient) {}

  getGameGenerations(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}
