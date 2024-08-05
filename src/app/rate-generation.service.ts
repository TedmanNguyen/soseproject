import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RateGenerationService {
  private jsonUrl = 'assets/shiny-methods.json';

  constructor(private http: HttpClient) {}

  // obtains rates and outputs as a TS object
  getRates(): Observable<{ data: any }> {
    return this.http.get<any>(this.jsonUrl).pipe(
      map(response => ({ data: response }))
    );
  }

// returns the string corresponding to the selected rate from JSON
  getSelectedRate(userMethod: string, userGen: string) {
    // load rates fron JSON
    this.getRates().subscribe(rates => {
      // get the correct generation
      let generation = rates.data[userGen];

      // find correct method in generation and get its rate
      let rate = generation.find((method: { name: string }) => method.name === userMethod); 
      
      // sanity check once this function is in use
      console.log(rate);
      return rate;
    });
  }
}