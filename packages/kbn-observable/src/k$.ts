import { pipeFromArray } from './lib';
import { UnaryFunction } from './interfaces';

export function k$<T, A>(source: T, op1: UnaryFunction<T, A>): A;
export function k$<T, A, B>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>
): B;
export function k$<T, A, B, C>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>
): C;
export function k$<T, A, B, C, D>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>
): D;
export function k$<T, A, B, C, D, E>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>,
  op5: UnaryFunction<D, E>
): E;
export function k$<T, A, B, C, D, E, F>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>,
  op5: UnaryFunction<D, E>,
  op6: UnaryFunction<E, F>
): F;
export function k$<T, A, B, C, D, E, F, G>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>,
  op5: UnaryFunction<D, E>,
  op6: UnaryFunction<E, F>,
  op7: UnaryFunction<F, G>
): G;
export function k$<T, A, B, C, D, E, F, G, H>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>,
  op5: UnaryFunction<D, E>,
  op6: UnaryFunction<E, F>,
  op7: UnaryFunction<F, G>,
  op8: UnaryFunction<G, H>
): H;
export function k$<T, A, B, C, D, E, F, G, H, I>(
  source: T,
  op1: UnaryFunction<T, A>,
  op2: UnaryFunction<A, B>,
  op3: UnaryFunction<B, C>,
  op4: UnaryFunction<C, D>,
  op5: UnaryFunction<D, E>,
  op6: UnaryFunction<E, F>,
  op7: UnaryFunction<F, G>,
  op8: UnaryFunction<G, H>,
  op9: UnaryFunction<H, I>
): I;

export function k$<T, R>(source: T, ...operations: UnaryFunction<T, R>[]): R {
  return pipeFromArray(operations)(source);
}
