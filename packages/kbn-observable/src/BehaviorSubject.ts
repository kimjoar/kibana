import { Observer, Subscription } from './Observable';
import { Subject } from './Subject';
import { ObjectUnsubscribedError } from './errors';

export class BehaviorSubject<T> extends Subject<T> {
  constructor(private _value: T) {
    super();
  }

  protected _subscribe(observer: Observer<T>): Subscription {
    const subscription = super._subscribe(observer);

    if (subscription && !subscription.closed) {
      observer.next(this._value);
    }

    return subscription;
  }

  getValue() {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    }

    return this._value;
  }

  get value(): T {
    return this.getValue();
  }

  next(value: T): void {
    this._value = value;
    super.next(value);
  }
}
