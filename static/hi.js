(() => {
  function g(t) {
    const e = history.pushState;
    history.pushState = function (r, c) {
      (e.apply(this, arguments), t());
    };
    const n = () => {
      t();
    };
    return (
      addEventListener("popstate", n),
      () => {
        ((history.pushState = e), removeEventListener("popstate", n));
      }
    );
  }
  function w(t) {
    return /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(t);
  }
  function P(t, e = !1) {
    if (e && typeof document < "u") {
      const n = document.createElement("a");
      n.href = t;
      const r = n.protocol + "//" + n.hostname,
        c = n.pathname;
      return { hostname: r, path: c };
    } else {
      const n = new URL(t),
        r = n.protocol + "//" + n.hostname,
        c = n.pathname;
      return { hostname: r, path: c };
    }
  }
  function l(t, e) {
    return !e || e.indexOf(t) >= 0 ? "" : e.split("?")[0] || "";
  }
  function y(t) {
    const e = {},
      n = t.indexOf("?");
    if (n === -1) return e;
    const r = t.substring(n + 1),
      c = new URLSearchParams(r),
      o = c.get("utm_source"),
      s = c.get("utm_medium"),
      u = c.get("utm_campaign"),
      i = c.get("utm_term"),
      a = c.get("utm_content");
    return (o && (e.us = o), s && (e.um = s), u && (e.uc = u), i && (e.ut = i), a && (e.uco = a), e);
  }
  function S(t, e = !1) {
    return (
      "?" +
      Object.keys(t)
        .filter((n) => !(t[n] === void 0 || (e && t[n] === "")))
        .map(function (n) {
          return encodeURIComponent(n) + "=" + encodeURIComponent(t[n]);
        })
        .join("&")
    );
  }
  function U(t, e, n, r, c = {}, o) {
    const s = {
      p: n,
      h: e,
      r,
      sid: t,
    };
    return (o && (s.ht = o), Object.assign(s, c), s);
  }
  function L(t, e, n = !1) {
    return t + S(e, n);
  }
  const p = 1e3;
  function T(t, e) {
    return new Promise((n) => {
      const r = {
          ht: 1,
          // Assume first hit (new visit)
        },
        c = `${t.replace(/\/collect$/, "/cache")}?sid=${encodeURIComponent(e)}`,
        o = new XMLHttpRequest();
      (o.open("GET", c, !0),
        (o.timeout = p),
        o.setRequestHeader("Content-Type", "text/plain"),
        (o.onload = function () {
          if (o.status === 200)
            try {
              const s = JSON.parse(o.responseText);
              n(s);
            } catch {
              n(r);
            }
          else n(r);
        }),
        (o.onerror = () => n(r)),
        (o.ontimeout = () => n(r)),
        o.send());
    });
  }
  function v(t, e) {
    const n = new XMLHttpRequest(),
      r = L(t, e);
    (n.open("GET", r, !0), n.setRequestHeader("Content-Type", "text/plain"), (n.timeout = p), n.send());
  }
  function O(t) {
    const e = g(() => {
      f(t);
    });
    return (f(t), e);
  }
  function R() {
    const t = document.querySelector('link[rel="canonical"][href]');
    if (!t) return null;
    const e = document.createElement("a");
    return ((e.href = t.href), e);
  }
  function I(t, e) {
    if (e) return l(t, e);
    if (document.referrer) return l("", document.referrer);
    const n = new URLSearchParams(window.location.search),
      r = ["ref", "referer", "referrer", "source", "utm_source"];
    for (const c of r) {
      const o = n.get(c);
      if (o) return l(t, o);
    }
    return l(t, "");
  }
  async function f(t, e = {}) {
    const r = R() ?? window.location;
    if (
      (!t.reportOnLocalhost && w(window.location.hostname)) ||
      (r.host === "" && navigator.userAgent.indexOf("Electron") < 0)
    )
      return;
    const c = e.url || r.pathname + r.search || "/",
      { hostname: o, path: s } = P(c, !0),
      u = I(o, e.referrer || ""),
      i = y(c);
    let a;
    try {
      a = (await T(t.reporterUrl, t.siteId)).ht.toString();
    } catch {}
    const h = U(t.siteId, o, s, u, i, a);
    v(t.reporterUrl, h);
  }
  class q {
    siteId;
    reporterUrl;
    reportOnLocalhost = !1;
    _cleanupAutoTrackPageviews;
    constructor(e) {
      ((this.siteId = e.siteId),
        (this.reporterUrl = e.reporterUrl),
        e.reportOnLocalhost && (this.reportOnLocalhost = e.reportOnLocalhost),
        (e.autoTrackPageviews === void 0 || e.autoTrackPageviews) &&
          setTimeout(() => {
            this._cleanupAutoTrackPageviews = O(this);
          }, 0));
    }
    cleanup() {
      this._cleanupAutoTrackPageviews && this._cleanupAutoTrackPageviews();
    }
  }
  const m = {
    client: void 0,
  };
  function C(t) {
    m.client || (m.client = new q(t));
  }
  function E() {
    return document.getElementById("counterscale-script");
  }
  function k() {
    let t;
    return (
      ((window.counterscale && window.counterscale.q) || []).forEach(function (n) {
        n[0] === "set" && n[1] === "siteId" && (t = n[2]);
      }),
      t
    );
  }
  function d() {
    const t = E(),
      e = t?.getAttribute("data-site-id") || k(),
      n = (t?.hasAttribute("data-report-localhost") && t?.getAttribute("data-report-localhost") !== "false") || !1,
      r = "https://counterscale.d4js2468.workers.dev/collect";
    !e ||
      !r ||
      C({
        siteId: e,
        reportOnLocalhost: n,
        reporterUrl: r,
        autoTrackPageviews: !0,
      });
  }
  (function () {
    if (document.body === null) {
      document.addEventListener("DOMContentLoaded", () => {
        d();
      });
      return;
    }
    d();
  })();
})();
