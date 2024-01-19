type OptionalKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]
type RequiredKeys<T> = {
    [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

export type MakeUndefinedOptional<T> = { [P in RequiredKeys<T>]: T[P] } & { [P in OptionalKeys<T>]?: T[P] }

export type UnionToIntersection<U> = 
(U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never