import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service'; 
import { HuntInstanceComponent } from '../hunt-instance/hunt-instance.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RateGenerationService } from '../rate-generation.service';

interface HuntCard {
  game: string;
  generation: string;
  pokemon: Pokemon;
  method: string;
  found: boolean;
  incrementer: Incrementer;
}

interface Incrementer {
  encounters: number;
  rate: string;
  rateMethod: any;
  hasCharm: boolean;
}

interface Pokemon {
  name: string;
  sprite: string;
  spriteShiny: string;
}

@Component({
  selector: 'app-hunt-counter',
  standalone: true,
  imports: [CommonModule, HuntInstanceComponent, MatCardModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hunt-counter.component.html',
  styleUrl: './hunt-counter.component.css'
})
export class HuntCounterComponent {
  huntInstances: any[] = [];  // array of hunt instances from cookie
  huntCards: HuntCard[] = []; // array of hunt cards to display

  constructor(private cookieService: CookieService,
              private rateGenerationService: RateGenerationService
  ) {}

  // loads hunt instances from cookie and initializes all cards
  ngOnInit(): void {
    this.huntInstances = this.loadHuntInstances();
    for (let huntInstance of this.huntInstances) {
      this.huntCards.push(this.initializeCard(huntInstance));
    }
  }

  loadHuntInstances(): any {
    const huntInstanceCookie = this.cookieService.get('huntInstances');
    if (huntInstanceCookie) {
      return JSON.parse(huntInstanceCookie);
    }
    return [];
  }

  increment(incrementer: Incrementer): void {
    incrementer.encounters++;
    if (incrementer.rateMethod) {
      incrementer.rate = incrementer.rateMethod(incrementer.encounters, incrementer.hasCharm);
    }
  }

  initializeCard(huntInstance: any): HuntCard {
    return {
      game: huntInstance.game,
      generation: huntInstance.generation,
      method: huntInstance.method,
      found: huntInstance.found,
      incrementer: this.createIncrementer(huntInstance),
      pokemon: {
        name: huntInstance.pokemon.name,
        sprite: huntInstance.pokemon.spriteUrl,
        spriteShiny: huntInstance.pokemon.spriteShinyUrl
      }
    };
  }

  // gets rate from info passed by cookie, using rate-generation-service
  getRate(method: string, gen: string) {
    let rate = this.rateGenerationService.getSelectedRate(method, gen)
    if (!rate.includes('/')) {
      switch (method) {
        case 'chain-fishing':
        case 'chain-fishing-charm':
          return this.rateGenerationService.getChainFishingRate;
        case 'sos-battle':
        case 'sos-battle-charm':
          return this.rateGenerationService.getSOSRate;
        case 'poke-radar':
        case 'poke-radar-charm':
          return this.rateGenerationService.getRadarRate;
        default:
          return 'Invalid Method';
      }
    }
    else {
      return rate;
      };

  }

  // creates incrementer object for each hunt instance
  createIncrementer(huntInstance: any): Incrementer {
    let rate = this.getRate(huntInstance.method, huntInstance.generation);
    let hasCharm = huntInstance.method.includes('charm');

    if (typeof rate === 'string') {
      return {
        encounters: 0,
        rate: rate,
        rateMethod: null,
        hasCharm: hasCharm
      };
    }
    else {
      return {
        encounters: 0,
        rate: rate(0, hasCharm),
        rateMethod: rate,
        hasCharm: hasCharm
      };
    }
  }
}

