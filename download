#!/usr/bin/env python3
"""posts/ klasorundeki tum .md dosyalarini tarar, front matter okur ve
posts.json dosyasini olusturur. Hicbir harici kutuphane gerektirmez."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_DIR = os.path.join(ROOT, "posts")
OUT = os.path.join(ROOT, "posts.json")

FM_RE = re.compile(r'^﻿?---\s*\n(.*?)\n---\s*\n?(.*)$', re.S)

def parse_front_matter(text):
    meta = {}
    m = FM_RE.match(text)
    body = text
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip().strip('"').strip("'")
        body = m.group(2)
    return meta, body

def first_paragraph(body):
    for block in body.strip().split("\n\n"):
        b = block.strip()
        if b and not b.startswith(("#", ">", "-", "*", "`")):
            return re.sub(r'\s+', ' ', b)[:180]
    return ""

def main():
    posts = []
    if not os.path.isdir(POSTS_DIR):
        print("posts/ klasoru yok"); sys.exit(0)
    for fn in os.listdir(POSTS_DIR):
        if not fn.endswith(".md"):
            continue
        slug = fn[:-3]
        with open(os.path.join(POSTS_DIR, fn), encoding="utf-8") as f:
            text = f.read()
        meta, body = parse_front_matter(text)
        title = meta.get("title") or slug
        date = meta.get("date") or ""
        excerpt = meta.get("excerpt") or first_paragraph(body)
        posts.append({"slug": slug, "title": title, "date": date, "excerpt": excerpt})
    # Tarihe gore yeniden eskiye sirala
    posts.sort(key=lambda p: p["date"], reverse=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"{len(posts)} yazi -> posts.json")

if __name__ == "__main__":
    main()
