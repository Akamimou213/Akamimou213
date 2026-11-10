#!/bin/sh
# Copy the shared modules into api/_lib/ (Vercel deploys this folder on its own, so it can't import from ../).
# Run after changing them in memecoin-scanner/ or memecoin-desk/, then commit api/_lib/.
set -e
here=$(cd "$(dirname "$0")" && pwd)
cp "$here/../memecoin-scanner/sources.py" "$here/../memecoin-scanner/rules.py" "$here/../memecoin-scanner/devhist.py" \
   "$here/../memecoin-scanner/scanner.py" "$here/api/_lib/"
cp "$here/../memecoin-desk/core.py" "$here/../memecoin-desk/risk.py" "$here/../memecoin-desk/config.json" "$here/api/_lib/"
cp "$here/../memecoin-desk/static/lightweight-charts.js" "$here/static/"
echo "api/_lib synced"
