import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { graphqlRepository } from "./graphql-repository";

interface Article {
  id: string;
  title: string;
}
interface RawArticle {
  id: string;
  title: string;
}

const fetchMock = vi.fn();

function gqlResponse(data: unknown, errors?: { message: string }[]) {
  // GraphQL endpoints return HTTP 200 even when the body carries `errors`.
  return {
    ok: true,
    status: 200,
    json: async () => ({ data, errors }),
  };
}

const repo = graphqlRepository<Article, { title: string }, RawArticle>({
  endpoint: "https://api.test/graphql",
  headers: { authorization: "Bearer t" },
  map: (raw) => ({ id: raw.id, title: raw.title.toUpperCase() }),
  operations: {
    list: {
      document: "query($limit:Int!,$offset:Int!){ articles { nodes total } }",
      variables: (p) => ({
        limit: p.pageSize,
        offset: (p.page - 1) * p.pageSize,
      }),
      extract: (d) => {
        const a = d.articles as { nodes: RawArticle[]; totalCount: number };
        return { rows: a.nodes, total: a.totalCount };
      },
    },
    getOne: {
      document: "query($id:ID!){ article(id:$id){ id title } }",
      extract: (d) => (d.article as RawArticle | null) ?? null,
    },
    create: {
      document: "mutation($input:Input!){ createArticle { id title } }",
      extract: (d) => d.createArticle as RawArticle,
    },
    update: {
      document: "mutation($id:ID!,$input:Input!){ updateArticle { id title } }",
      extract: (d) => d.updateArticle as RawArticle,
    },
    remove: { document: "mutation($id:ID!){ deleteArticle(id:$id) }" },
  },
});

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

describe("graphqlRepository", () => {
  it("POSTs query + variables and maps the extracted rows/total", async () => {
    fetchMock.mockResolvedValue(
      gqlResponse({
        articles: { nodes: [{ id: "1", title: "hi" }], totalCount: 5 },
      }),
    );

    const result = await repo.list({ page: 2, pageSize: 10 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/graphql");
    expect(init.method).toBe("POST");
    expect(init.headers.authorization).toBe("Bearer t");
    const body = JSON.parse(init.body);
    expect(body.query).toContain("articles");
    expect(body.variables).toEqual({ limit: 10, offset: 10 });
    expect(result).toEqual({ rows: [{ id: "1", title: "HI" }], total: 5 });
  });

  it("getOne maps a node or returns null", async () => {
    fetchMock.mockResolvedValueOnce(
      gqlResponse({ article: { id: "7", title: "g" } }),
    );
    expect(await repo.getOne("7")).toEqual({ id: "7", title: "G" });

    fetchMock.mockResolvedValueOnce(gqlResponse({ article: null }));
    expect(await repo.getOne("404")).toBeNull();
  });

  it("create sends default { input } variables and maps the result", async () => {
    fetchMock.mockResolvedValue(
      gqlResponse({ createArticle: { id: "9", title: "new" } }),
    );
    const row = await repo.create({ title: "new" });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables).toEqual({ input: { title: "new" } });
    expect(row).toEqual({ id: "9", title: "NEW" });
  });

  it("throws when the response carries GraphQL errors", async () => {
    fetchMock.mockResolvedValue(
      gqlResponse(null, [{ message: "Not authorized" }]),
    );
    await expect(repo.list({ page: 1, pageSize: 10 })).rejects.toThrow(
      "Not authorized",
    );
  });
});
