type OptionalKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]
type RequiredKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

export type MakeUndefinedOptional<T> = { [P in RequiredKeys<T>]: T[P] } & { [P in OptionalKeys<T>]?: T[P] }