#!/usr/bin/env python3
"""Rebuild public/index.html and styles/lantern.css from base64 parts."""
from pathlib import Path
import base64, json, hashlib
root = Path(__file__).resolve().parent
manifest = json.loads((root / "asset-manifest.json").read_text())
def join(prefix, n):
    return base64.b64decode("".join((root / f"{prefix}.part{i:03d}.b64").read_text() for i in range(n)))
html = join("html", manifest["html_chunks"])
css = join("css", manifest["css_chunks"])
assert hashlib.sha256(html).hexdigest() == manifest["html_sha256"]
assert hashlib.sha256(css).hexdigest() == manifest["css_sha256"]
out = root.parent
(out / "public").mkdir(exist_ok=True)
(out / "styles").mkdir(exist_ok=True)
(out / "public" / "index.html").write_bytes(html)
(out / "styles" / "lantern.css").write_bytes(css)
print("Restored public/index.html and styles/lantern.css")
