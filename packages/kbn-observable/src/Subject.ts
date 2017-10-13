import {
  Observable,
  Subscription,
  PartialObserver,
  Observer
} from './Observable';
import { ObjectUnsubscribedError } from './errors';

const noop = () => {};

export class Subject<T> extends Observable<T> implements Subscription {
  observers: Observer<T>[] = [];
  closed: boolean = false;
  isStopped: boolean = false;
  hasError: boolean = false;
  thrownError: Error;

  constructor() {
    super(() => {});
  }

  next(value: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }

    if (this.isStopped) {
      return;
    }

    for (const observer of this.observers) {
      observer.next!(value);
    }
  }

  error(err: any) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }

    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;

    for (const observer of this.observers) {
      observer.error!(err);
    }
    this.observers.length = 0;
  }

  complete() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }

    this.isStopped = true;

    for (const observer of this.observers) {
      observer.complete!();
    }
    this.observers.length = 0;
  }

  // Subscribes to the sequence with an observer
  subscribe(): Subscription;
  subscribe(observer: PartialObserver<T>): Subscription;

  // Subscribes to the sequence with callbacks
  subscribe(
    onNext: (val: T) => void,
    onError?: (err: Error) => void,
    onComplete?: () => void
  ): Subscription;

  subscribe(
    observerOrOnNext?: PartialObserver<T> | ((value: T) => void),
    onError?: (err: Error) => void,
    onComplete?: () => void
  ): Subscription {
    const observer = toSubscriber(observerOrOnNext, onError, onComplete);
    return this._subscribe(observer);
  }

  protected _subscribe(observer: Observer<T>): Subscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }

    if (this.hasError) {
      observer.error!(this.thrownError);
      return SubjectSubscription.EMPTY;
    }

    if (this.isStopped) {
      observer.complete!();
      return SubjectSubscription.EMPTY;
    }

    this.observers.push(observer);

    return new SubjectSubscription(() => {
      this.observers.splice(this.observers.indexOf(observer), 1);
    });
  }

  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers.length = 0;
  }

  asObservable(): Observable<T> {
    return new Observable(observer => {
      return this.subscribe({
        next(val) {
          observer.next(val);
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        }
      });
    });
  }
}

class SubjectSubscription implements Subscription {
  closed: boolean = false;

  static EMPTY = new SubjectSubscription(noop);

  constructor(private unsubscribeFn: () => void) {}

  unsubscribe() {
    this.unsubscribeFn();
  }
}

function toSubscriber<T>(
  observerOrOnNext?: PartialObserver<T> | ((value: T) => void),
  onError?: (err: Error) => void,
  onComplete?: () => void
): Observer<T> {
  if (typeof observerOrOnNext === 'function') {
    return {
      start: noop,
      next: observerOrOnNext,
      error: onError || noop,
      complete: onComplete || noop
    };
  }

  if (typeof observerOrOnNext !== 'object') {
    return {
      start: noop,
      next: noop,
      error: noop,
      complete: noop
    };
  }

  return {
    start: observerOrOnNext.start || noop,
    next: observerOrOnNext.next || noop,
    error: observerOrOnNext.error || noop,
    complete: observerOrOnNext.complete || noop
  };
}
