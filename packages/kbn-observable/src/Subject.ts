import { Observable, SubscriptionObserver } from './Observable';

export class Subject<T> extends Observable<T> {
  protected observers: Set<SubscriptionObserver<T>> = new Set();
  protected isStopped = false;
  protected thrownError?: Error;

  constructor() {
    super(observer => this.registerObserver(observer));
  }

  protected registerObserver(observer: SubscriptionObserver<T>) {
    if (this.isStopped) {
      if (this.thrownError !== undefined) {
        observer.error(this.thrownError);
      } else {
        observer.complete();
      }
    } else {
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    }
  }

  next(value: T) {
    for (const observer of this.observers) {
      observer.next(value);
    }
  }

  error(error: Error) {
    this.thrownError = error;
    this.isStopped = true;

    for (const observer of this.observers) {
      observer.error(error);
    }

    this.observers.clear();
  }

  complete() {
    this.isStopped = true;

    for (const observer of this.observers) {
      observer.complete();
    }

    this.observers.clear();
  }

  /**
   * Returns an observable, so the observer methods are hidden.
   */
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
