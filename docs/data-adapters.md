# Data adapters — the portability seam

Every page archetype (CRUD table, detail, card list, …) is written against one
small interface, **not** against Drizzle or `fetch`. A resource picks an
*adapter* that implements that interface for a given backend; swapping backends
means changing only the resource's `server.ts` binding — the queries, table,
forms, and detail pages are untouched. This is what makes the shapes portable.

## The contract

```ts
// src/infra/data/repository.ts
export interface ListParams {
  page: number; pageSize: number;
  search?: string; sortBy?: string; sortDir?: "asc" | "desc";
  filters?: Record<string, string>; // open map, e.g. { status: "active" }
}
export interface ListResult<T> { rows: T[]; total: number; }

export interface Repository<T, TInput> {
  list(params: ListParams): Promise<ListResult<T>>;
  getOne(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T>;
  remove(id: string): Promise<void>;
}
```

**Adapters run server-side only** — they are called inside `createServerFn`
handlers, so DB clients, API origins, and tokens never reach the browser bundle.
(`@/db` is imported lazily inside the Drizzle adapter's methods specifically so
`pg` stays out of the client module graph, even in dev.)

The resource keeps its public params flat (e.g. a `status` field) and maps them
to `filters` in a tiny `toListParams()` before calling the repository.

## `drizzleRepository` — Postgres (the default)

Type-inferred from the table; `products`/`orders` use it.

```ts
import { drizzleRepository } from "@/infra/data/drizzle-repository";

export const productsRepository = drizzleRepository(products, {
  searchColumns: [products.name, products.sku, products.category], // OR ilike %term%
  sortColumns: { name: products.name, price: products.price },     // whitelist
  filterColumns: { status: products.status },                      // eq per filter key
  defaultSort: { column: products.createdAt, dir: "desc" },
  updatedAtKey: "updatedAt",                                       // stamped on update
});
```

Import it from `@/infra/data/drizzle-repository` directly (not the barrel) so a
resource that doesn't use Postgres never pulls `@/db` into its graph.

## `restRepository` — any JSON HTTP API

`posts` uses it against jsonplaceholder. Defaults target a json-server-style API
(`_page`/`_limit`/`_sort`/`_order`/`q` + an `x-total-count` header); override
`params`/`totalHeader` for other shapes.

```ts
import { restRepository } from "@/infra/data";

export const postsRepository = restRepository<Post, PostInput, RawPost>({
  baseUrl: "https://jsonplaceholder.typicode.com",
  path: "/posts",
  map: (raw) => ({ id: String(raw.id), title: raw.title, body: raw.body, userId: raw.userId }),
  // headers: { authorization: `Bearer ${process.env.API_TOKEN}` },
});
```

The `@/infra/data` barrel is isomorphic-safe (no `@/db`), so REST resources can
import `restRepository` from it freely.

> **Numeric filter gotcha:** the router JSON-parses search params, so a filter
> like `userId=5` arrives as the *number* `5`. Declare such params with
> `z.coerce.string()` in the resource's list-params schema.

## `graphqlRepository` — any GraphQL endpoint

Same contract; GraphQL operations are bespoke, so each op supplies its document,
a variable builder, and a result extractor. Ships and is unit-tested, ready to
bind to a real endpoint.

```ts
import { graphqlRepository } from "@/infra/data";

export const articlesRepository = graphqlRepository<Article, ArticleInput, RawArticle>({
  endpoint: "https://api.example.com/graphql",
  headers: { authorization: `Bearer ${process.env.API_TOKEN}` },
  map: (raw) => ({ id: raw.id, title: raw.title }),
  operations: {
    list: {
      document: `query($limit:Int!,$offset:Int!,$q:String){ articles(limit:$limit,offset:$offset,search:$q){ nodes{ id title } totalCount } }`,
      variables: (p) => ({ limit: p.pageSize, offset: (p.page - 1) * p.pageSize, q: p.search }),
      extract: (d) => ({ rows: d.articles.nodes, total: d.articles.totalCount }),
    },
    getOne: { document: `query($id:ID!){ article(id:$id){ id title } }`, extract: (d) => d.article ?? null },
    create: { document: `mutation($input:ArticleInput!){ createArticle(input:$input){ id title } }`, extract: (d) => d.createArticle },
    update: { document: `mutation($id:ID!,$input:ArticleInput!){ updateArticle(id:$id,input:$input){ id title } }`, extract: (d) => d.updateArticle },
    remove: { document: `mutation($id:ID!){ deleteArticle(id:$id) }` },
  },
});
```

## Writing a new adapter

Implement the five methods, returning `{ rows, total }` from `list`. Keep it
server-side. Add a unit test that mocks the transport (see
`rest-repository.test.ts` / `graphql-repository.test.ts` for the fetch-mock
pattern, `drizzle-repository.test.ts` for the DB-mock pattern). Bind a resource's
`server.ts` to it and the rest of the vertical works unchanged.
