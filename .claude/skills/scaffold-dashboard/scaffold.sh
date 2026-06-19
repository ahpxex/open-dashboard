#!/usr/bin/env bash
# Materialize the bundled dashboard foundation into a new project.
#   bash scaffold.sh <target-dir>
set -euo pipefail

TARGET="${1:?usage: scaffold.sh <target-dir>}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$SKILL_DIR/base" ]; then
  echo "error: $SKILL_DIR/base not found (run \`bun run build-base\` in the source repo)." >&2
  exit 1
fi

mkdir -p "$TARGET"
rsync -a "$SKILL_DIR/base/" "$TARGET/"
cd "$TARGET"
bun install

cat <<EOF

Dashboard foundation ready at: $TARGET
Next:
  cd $TARGET
  bun run dev            # zero-config (in-memory auth + data; no Postgres needed)
Then "Dev quick login" (dev@example.com / password) for an empty branded dashboard.
Add screens by copying templates from the add-* skills.
EOF
