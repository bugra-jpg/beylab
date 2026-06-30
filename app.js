// beylab — basit, derleme gerektirmeyen blog motoru
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Tarihi Türkçe biçimle (2026-06-30 -> 30 Haziran 2026)
function formatDate(iso) {
  if (!iso) return "";
  var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  var p = String(iso).split("-");
  if (p.length !== 3) return iso;
  var g = parseInt(p[2], 10), a = parseInt(p[1], 10) - 1, yil = p[0];
  if (isNaN(g) || isNaN(a) || !aylar[a]) return iso;
  return g + " " + aylar[a] + " " + yil;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

// --- Ana sayfa: yazı listesi ---
function renderIndex() {
  var list = document.getElementById("post-list");
  fetch("posts.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("posts.json bulunamadı"); return r.json(); })
    .then(function (posts) {
      if (!posts.length) { list.innerHTML = '<li class="state">Henüz yazı yok.</li>'; return; }
      list.innerHTML = posts.map(function (p) {
        return '<li><a class="post-card" href="post.html?p=' + encodeURIComponent(p.slug) + '">' +
          '<div class="meta">' + formatDate(p.date) + '</div>' +
          '<h2>' + escapeHtml(p.title) + '</h2>' +
          (p.excerpt ? '<p>' + escapeHtml(p.excerpt) + '</p>' : '') +
          '</a></li>';
      }).join("");
    })
    .catch(function (e) {
      list.innerHTML = '<li class="state">Liste yüklenemedi: ' + escapeHtml(e.message) + '</li>';
    });
}

// Markdown dosyasından front matter (--- ... ---) ayıkla
function parseFrontMatter(text) {
  var meta = {}, body = text;
  var m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (m) {
    m[1].split(/\r?\n/).forEach(function (line) {
      var idx = line.indexOf(":");
      if (idx > -1) {
        var k = line.slice(0, idx).trim();
        var v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (k) meta[k] = v;
      }
    });
    body = m[2];
  }
  return { meta: meta, body: body };
}

// --- Tekil yazı sayfası ---
function renderPost() {
  var el = document.getElementById("article");
  var slug = new URLSearchParams(location.search).get("p");
  if (!slug || !/^[a-zA-Z0-9._-]+$/.test(slug)) {
    el.innerHTML = '<div class="state">Yazı bulunamadı. <a href="index.html">Ana sayfaya dön</a></div>';
    return;
  }
  fetch("posts/" + slug + ".md", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("yazı bulunamadı"); return r.text(); })
    .then(function (text) {
      var parsed = parseFrontMatter(text);
      var title = parsed.meta.title || slug;
      var date = parsed.meta.date || "";
      document.title = title + " — beylab";
      marked.setOptions({ breaks: false, gfm: true });
      el.innerHTML =
        '<a class="back" href="index.html">← Tüm yazılar</a>' +
        '<h1>' + escapeHtml(title) + '</h1>' +
        '<div class="meta">' + formatDate(date) + '</div>' +
        '<div class="content">' + marked.parse(parsed.body) + '</div>';
    })
    .catch(function (e) {
      el.innerHTML = '<div class="state">Yazı yüklenemedi. <a href="index.html">Ana sayfaya dön</a></div>';
    });
}
