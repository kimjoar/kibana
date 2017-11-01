// This adds a symbol type for `Symbol.observable`, which doesn't exist globally
// in TypeScript yet.
declare global {
  export interface SymbolConstructor {
    readonly observable: symbol;
  }
}

type UnaryFunction<T, R> = (source: T) => R;

// These types are based on the Observable proposal readme, see
// https://github.com/tc39/proposal-observable#api, with the addition of using
// generics to define the type of the `value`.

declare namespace Observable {
  interface Subscription {
    // Cancels the subscription
    unsubscribe(): void;

    // A boolean value indicating whether the subscription is closed
    closed: boolean;
  }

  interface Subscribable<T> {
    subscribe(
      observerOrNext?: SubscriptionObserver<T> | ((value: T) => void),
      error?: (error: any) => void,
      complete?: () => void
    ): Subscription;
  }

  type ObservableInput<T> = Subscribable<T> | Iterable<T>;

  interface SubscriptionObserver<T> {
    // Sends the next value in the sequence
    next(value: T): void;

    // Sends the sequence error
    error(errorValue: Error): void;

    // Sends the completion notification
    complete(): void;

    // A boolean value indicating whether the subscription is closed
    closed: boolean;
  }

  export interface StartObserver<T> {
    start(subscription: Subscription): void;
    next?(value: T): void;
    error?(err: any): void;
    complete?(): void;
  }

  export interface NextObserver<T> {
    start?(subscription: Subscription): void;
    next(value: T): void;
    error?(err: any): void;
    complete?(): void;
  }

  interface ErrorObserver<T> {
    start?(subscription: Subscription): void;
    next?(value: T): void;
    error(err: any): void;
    complete?(): void;
  }

  interface CompletionObserver<T> {
    start?(subscription: Subscription): void;
    next?(value: T): void;
    error?(err: any): void;
    complete(): void;
  }

  type PartialObserver<T> =
    | StartObserver<T>
    | NextObserver<T>
    | ErrorObserver<T>
    | CompletionObserver<T>;

  interface Observer<T> {
    // Receives the subscription object when `subscribe` is called
    start(subscription: Subscription): void;

    // Receives the next value in the sequence
    next(value: T): void;

    // Receives the sequence error
    error(errorValue: Error): void;

    // Receives a completion notification
    complete(): void;
  }

  type SubscriberFunction<T> = (
    observer: SubscriptionObserver<T>
  ) => void | null | undefined | (() => void) | Subscription;

  class Observable<T> {
    constructor(subscriber: SubscriberFunction<T>);

    // Subscribes to the sequence with an observer
    subscribe(): Subscription;
    subscribe(observer: PartialObserver<T>): Subscription;

    // Subscribes to the sequence with callbacks
    subscribe(
      onNext: (val: T) => void,
      onError?: (err: Error) => void,
      onComplete?: () => void
    ): Subscription;

    // pipe
    pipe(): Observable<T>;
    pipe<A>(op1: UnaryFunction<Observable<T>, A>): A;
    pipe<A, B>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, B>
    ): B;
    pipe<A, B, C>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, C>
    ): C;
    pipe<A, B, C, D>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, D>
    ): D;
    pipe<A, B, C, D, E>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, Observable<D>>,
      op5: UnaryFunction<Observable<D>, E>
    ): E;
    pipe<A, B, C, D, E, F>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, Observable<D>>,
      op5: UnaryFunction<Observable<D>, Observable<E>>,
      op6: UnaryFunction<Observable<E>, F>
    ): F;
    pipe<A, B, C, D, E, F, G>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, Observable<D>>,
      op5: UnaryFunction<Observable<D>, Observable<E>>,
      op6: UnaryFunction<Observable<E>, Observable<F>>,
      op7: UnaryFunction<Observable<F>, G>
    ): G;
    pipe<A, B, C, D, E, F, G, H>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, Observable<D>>,
      op5: UnaryFunction<Observable<D>, Observable<E>>,
      op6: UnaryFunction<Observable<E>, Observable<F>>,
      op7: UnaryFunction<Observable<F>, Observable<G>>,
      op8: UnaryFunction<Observable<G>, H>
    ): H;
    pipe<A, B, C, D, E, F, G, H, I>(
      op1: UnaryFunction<Observable<T>, Observable<A>>,
      op2: UnaryFunction<Observable<A>, Observable<B>>,
      op3: UnaryFunction<Observable<B>, Observable<C>>,
      op4: UnaryFunction<Observable<C>, Observable<D>>,
      op5: UnaryFunction<Observable<D>, Observable<E>>,
      op6: UnaryFunction<Observable<E>, Observable<F>>,
      op7: UnaryFunction<Observable<F>, Observable<G>>,
      op8: UnaryFunction<Observable<G>, Observable<H>>,
      op9: UnaryFunction<Observable<H>, I>
    ): I;

    // Returns itself
    [Symbol.observable](): Observable<T>;

    static of<T>(...items: T[]): Observable<T>;
    static from<T>(x: ObservableInput<T>): Observable<T>;
  }
}

export = Observable;
