import { Subject } from 'rxjs';

export function streamToObservable(stream) {
  const subject = new Subject();
  stream.on('end', () => subject.complete());
  stream.on('error', e => subject.error(e));
  stream.on('data', data => subject.next(data));
  return subject;
}
