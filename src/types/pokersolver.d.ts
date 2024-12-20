declare module 'pokersolver' {
  export class Hand {
    static solve(cards: string[]): Hand;
    rank: number;
    cards: string[];
    name: string;
    toString(): string;
  }
}
