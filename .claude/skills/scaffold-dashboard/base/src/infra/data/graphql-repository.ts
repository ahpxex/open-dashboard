import type { ListParams, ListResult, Repository } from "./repository";

/** Raw GraphQL `data` payload (shape is endpoint-specific). */
type GraphqlData = Record<string, unknown>;

interface ListOp<TRaw> {
  document: string;
  variables?: (params: ListParams) => Record<string, unknown>;
  extract: (data: GraphqlData) => { rows: TRaw[]; total: number };
}
interface GetOneOp<TRaw> {
  document: string;
  variables?: (id: string) => Record<string, unknown>;
  extract: (data: GraphqlData) => TRaw | null;
}
interface CreateOp<TInput, TRaw> {
  document: string;
  variables?: (input: TInput) => Record<string, unknown>;
  extract: (data: GraphqlData) => TRaw;
}
interface UpdateOp<TInput, TRaw> {
  document: string;
  variables?: (id: string, input: Partial<TInput>) => Record<string, unknown>;
  extract: (data: GraphqlData) => TRaw;
}
interface RemoveOp {
  document: string;
  variables?: (id: string) => Record<string, unknown>;
}

export interface GraphqlRepositoryConfig<T, TInput, TRaw = unknown> {
  endpoint: string;
  /** Static headers (e.g. an auth token). Set server-side; never reaches the client. */
  headers?: Record<string, string>;
  /** Map a raw GraphQL node to the resource type. */
  map: (raw: TRaw) => T;
  /** GraphQL documents + variable builders + result extractors, one per op. */
  operations: {
    list: ListOp<TRaw>;
    getOne: GetOneOp<TRaw>;
    create: CreateOp<TInput, TRaw>;
    update: UpdateOp<TInput, TRaw>;
    remove: RemoveOp;
  };
}

/**
 * GraphQL implementation of {@link Repository}. The contract is identical to the
 * Drizzle and REST adapters — a resource that swaps to GraphQL changes only its
 * `server.ts` binding. GraphQL operations are inherently bespoke, so each op
 * supplies its document, a variable builder, and a result extractor.
 *
 * Runs inside server fns, so the endpoint/token stay server-side.
 *
 * ```ts
 * export const articlesRepository = graphqlRepository<Article, ArticleInput, RawArticle>({
 *   endpoint: "https://api.example.com/graphql",
 *   headers: { authorization: `Bearer ${process.env.API_TOKEN}` },
 *   map: (raw) => ({ id: raw.id, title: raw.title }),
 *   operations: {
 *     list: {
 *       document: `query($limit:Int!,$offset:Int!,$q:String){ articles(limit:$limit,offset:$offset,search:$q){ nodes{ id title } totalCount } }`,
 *       variables: (p) => ({ limit: p.pageSize, offset: (p.page-1)*p.pageSize, q: p.search }),
 *       extract: (d) => ({ rows: d.articles.nodes, total: d.articles.totalCount }),
 *     },
 *     getOne: { document: `query($id:ID!){ article(id:$id){ id title } }`, extract: (d) => d.article ?? null },
 *     create: { document: `mutation($input:ArticleInput!){ createArticle(input:$input){ id title } }`, extract: (d) => d.createArticle },
 *     update: { document: `mutation($id:ID!,$input:ArticleInput!){ updateArticle(id:$id,input:$input){ id title } }`, extract: (d) => d.updateArticle },
 *     remove: { document: `mutation($id:ID!){ deleteArticle(id:$id) }` },
 *   },
 * });
 * ```
 */
export function graphqlRepository<T, TInput, TRaw = unknown>(
  config: GraphqlRepositoryConfig<T, TInput, TRaw>,
): Repository<T, TInput> {
  const { operations: ops } = config;

  async function execute(
    document: string,
    variables: Record<string, unknown>,
  ): Promise<GraphqlData> {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...config.headers },
      body: JSON.stringify({ query: document, variables }),
    });
    if (!res.ok) throw new Error(`GraphQL request failed (${res.status})`);
    const json = (await res.json()) as {
      data?: GraphqlData;
      errors?: { message: string }[];
    };
    if (json.errors?.length) {
      throw new Error(json.errors[0]?.message ?? "GraphQL error");
    }
    return json.data ?? {};
  }

  return {
    async list(params: ListParams): Promise<ListResult<T>> {
      const data = await execute(
        ops.list.document,
        ops.list.variables?.(params) ?? { ...params },
      );
      const { rows, total } = ops.list.extract(data);
      return { rows: rows.map(config.map), total };
    },

    async getOne(id) {
      const data = await execute(
        ops.getOne.document,
        ops.getOne.variables?.(id) ?? { id },
      );
      const raw = ops.getOne.extract(data);
      return raw ? config.map(raw) : null;
    },

    async create(input) {
      const data = await execute(
        ops.create.document,
        ops.create.variables?.(input) ?? { input },
      );
      return config.map(ops.create.extract(data));
    },

    async update(id, input) {
      const data = await execute(
        ops.update.document,
        ops.update.variables?.(id, input) ?? { id, input },
      );
      return config.map(ops.update.extract(data));
    },

    async remove(id) {
      await execute(ops.remove.document, ops.remove.variables?.(id) ?? { id });
    },
  };
}
