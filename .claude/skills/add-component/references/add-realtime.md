# Add live / realtime updates

Make any query self-refresh without changing the data layer. `useLiveQuery`
wraps `useQuery`, setting `refetchInterval` when `live` is true (and pausing when
false), and exposes `lastUpdated` for a staleness label. The hook ships in
`templates/use-live-query.ts`; the wired demo (live metrics + activity feed +
Live/Paused toggle) is `templates/realtime.tsx`.

## Make a resource list live

Two equivalent ways — pick the wrapper if you want the pause switch + timestamp:

```tsx
// (a) Plain useQuery — just add refetchInterval:
useQuery({ ...productsListQuery(params), refetchInterval: 5000 });

// (b) useLiveQuery — adds a pause control and lastUpdated:
const [live, setLive] = useState(true);
const { data, lastUpdated } = useLiveQuery(productsListQuery(params), {
  intervalMs: 5000,
  live,
});
```

- The **pause control** flips `live`; `refetchInterval: false` stops polling and
  freezes the data until resumed. Surface it as a Live/Paused toggle.
- Render `lastUpdated` through a relative-time helper for an "updated Ns ago"
  indicator (re-render it on a 1s `setInterval`).
- Keep `intervalMs` honest: a few seconds for dashboards; don't poll faster than
  the data actually changes.

## Upgrade path: server push (SSE / websocket)

Polling is portable and fine up to a few seconds' latency. For lower latency or
high fan-out, push from the server and write the cache from the event — same
query key, drop the `refetchInterval`:

```tsx
useEffect(() => {
  const es = new EventSource("/api/events/orders");
  es.onmessage = (e) =>
    queryClient.setQueryData(["orders", "list"], (prev) =>
      merge(prev, JSON.parse(e.data)),
    );
  return () => es.close();
}, [queryClient]);
```

A websocket follows the same shape (subscribe on mount, write to the cache per
message, close on unmount). The UI binding is unchanged — only the transport is.
The full sketch lives in the hook's header comment.

(Only open the templates if you need to customise them — copying costs no context.)

## Foundation it assumes

`@tanstack/react-query` (`useQuery`), `@/components/charts` (`StatCard`),
`@/components/ui/{card,badge,button}`, `@phosphor-icons/react`, the page-shell
heading, and theme tokens — all provided by the base.

## Invariants

- Live polling is a *fetch-cadence* change only; the server fn + Repository are
  untouched. Never reach around the query to mutate UI state directly.
- Pausing must actually stop network traffic (`refetchInterval: false`).
- The cache is the single source of truth — SSE/websocket writes go through
  `setQueryData`/`invalidateQueries`, not separate component state.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — watch the metrics and
feed change on the interval; Pause freezes them, Resume restarts; the timestamp
counts up.
