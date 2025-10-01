import type * as Self from "~/src/mod.ts";

export * as Result from "~/src/mod.ts";

export type Success<T = unknown> = T extends never ? never : { ok: true; value: T };
export type Failure<T = unknown> = T extends never ? never : { ok: false; error: T };

export type Result<T = unknown, E = unknown> = Success<T> | Failure<E>;

export namespace Case {
    export type Success<T = unknown> = T extends Self.Success<infer U> ? Self.Success<U> : never;
    export type Failure<T = unknown> = T extends Self.Failure<infer U> ? Self.Failure<U> : never;
}

export type Inspect<T> = Case.Success<T>["value"] | Case.Failure<T>["error"];

export type From<T extends boolean = boolean, U = unknown> = T extends true ? Success<U> : Failure<U>;

export type Invert<T> = Success<Inspect<Case.Failure<T>>> | Failure<Inspect<Case.Success<T>>>;

export type Unwrap<T, U = never> = T extends Success<infer V> ? V : U;

export function success(): Success<null>;
export function success<const T>(value: T): Success<T>;
export function success(value: unknown = null): Success {
    return { ok: true, value };
}

export function failure(): Failure<null>;
export function failure<const E>(error: E): Failure<E>;
export function failure(error: unknown = null): Failure {
    return { ok: false, error };
}

export function from<const T extends boolean>(test: T): From<T, undefined>;
export function from<const T extends boolean, const U>(test: T, data: U): From<T, U>;
export function from(test: boolean, data: unknown = undefined): From {
    return test ? success(data) : failure(data);
}

export function inspect<const T = never, const E = never>(result: Result<T, E>): Inspect<typeof result> {
    return result.ok ? result.value : result.error;
}

export function invert<const T = never, const E = never>(result: Result<T, E>): Invert<typeof result> {
    return result.ok ? failure(result.value) : success(result.error);
}

export function unwrap<const T = never, const E = never, const U = never>(
    result: Result<T, E>,
    cb: unwrap.Callback<E, U>,
): T | U
{
    return result.ok ? result.value : cb(result.error);
}

export namespace unwrap {
    export type Callback<T, U> = (error: T) => U;
}
