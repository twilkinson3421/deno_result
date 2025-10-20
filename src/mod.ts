/**
 * Keys used to access the data properties of a `Success` or `Failure` result.
 *
 * Used internally to ease refactoring; should not be used by consumers -
 * use dot notation instead.
 */
export enum DataKey
{
    Success = "value",
    Failure = "error",
}

/** Represents a successful result. */
export type Success<T = null> = T extends never ? never : { ok: true } & { [k in DataKey.Success]: T };
/** Represents a failed result. */
export type Failure<E = null> = E extends never ? never : { ok: false } & { [k in DataKey.Failure]: E };
/** Represents either a successful or failed result. */
export type Either<T = null, E = null> = Success<T> | Failure<E>;

namespace Self
{
    export type __Success<T = null> = Success<T>;
    export type __Failure<E = null> = Failure<E>;
}

/** Type helpers for isolating the `Success` or `Failure` type from a result. */
export namespace Case
{
    /** Isolates the `Success` type from a result. */
    export type Success<T = null> = T extends Self.__Success<infer U> ? Self.__Success<U> : never;
    /** Isolates the `Failure` type from a result. */
    export type Failure<E = null> = E extends Self.__Failure<infer U> ? Self.__Failure<U> : never;
}

/** Represents a result whose success/failure status is determined by a boolean value. */
export type From<T extends boolean = boolean, U = null> = T extends true ? Success<U> : Failure<U>;

/** Inspect the data property of a result. */
export type Inspect<T> = Case.Success<T>[DataKey.Success] | Case.Failure<T>[DataKey.Failure];

/** Inverts a result. */
export type Invert<T> = Success<Inspect<Case.Failure<T>>> | Failure<Inspect<Case.Success<T>>>;

/** Represents the result of unwrapping a result. */
export type Unwrap<T, U = never> = T extends Success<infer V> ? V : U;

/** Creates a successful result. */
export function success(): Success<null>;
export function success<const T>(value: T): Success<T>;
export function success(value: unknown = null): Success<unknown> {
    return { ok: true, [DataKey.Success]: value };
}

/** Creates a failed result. */
export function failure(): Failure<null>;
export function failure<const E>(error: E): Failure<E>;
export function failure(error: unknown = null): Failure<unknown> {
    return { ok: false, [DataKey.Failure]: error };
}

/** Creates a result whose success/failure status is determined by a boolean value. */
export function from<const T extends boolean>(test: T): From<T, null>;
export function from<const T extends boolean, const U>(test: T, data: U): From<T, U>;
export function from(test: boolean, data: unknown = null): From<boolean, unknown> {
    return test ? success(data) : failure(data);
}

/** Inspect the data property of a result. */
export function inspect<const T = never, const E = never>(result: Either<T, E>): Inspect<Either<T, E>> {
    return result.ok ? result[DataKey.Success] : result[DataKey.Failure];
}

/** Invert a result. */
export function invert<const T = never, const E = never>(result: Either<T, E>): Invert<Either<T, E>> {
    return result.ok ? failure(result[DataKey.Success]) : success(result[DataKey.Failure]);
}

/**
 * Unwrap a result. Returns the data property of a successful result,
 * or the result of a callback function for a failed result.
 */
export function unwrap<const T = never>(result: Success<T>): T;
export function unwrap<const E = never, const U = never>(result: Failure<E>, callback: (error: E) => U): U;
export function unwrap<const T = never, const E = never, const U = never>(
    result: Either<T, E>,
    callback: (error: E) => U,
): T | U;
export function unwrap(result: Either<unknown, unknown>, callback?: (error: unknown) => unknown): unknown {
    return result.ok ? result[DataKey.Success] : callback?.(result[DataKey.Failure]);
}
