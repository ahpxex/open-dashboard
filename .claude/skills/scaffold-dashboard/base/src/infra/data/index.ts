// This barrel is isomorphic-safe: it must NOT pull in a server-only backend
// (e.g. `@/db`/`pg`), so any resource — including REST-backed ones — can import
// from it without leaking a DB client into the browser bundle. The Drizzle
// adapter touches `@/db`, so it is imported directly from
// "@/infra/data/drizzle-repository" by the resources that use it.
export {
  type GraphqlRepositoryConfig,
  graphqlRepository,
} from "./graphql-repository";
export type {
  ListParams,
  ListResult,
  Repository,
  SortDir,
} from "./repository";
export {
  type RestRepositoryConfig,
  restRepository,
} from "./rest-repository";
