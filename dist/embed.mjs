var b = Object.defineProperty;
var w = (i, t, e) => t in i ? b(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var g = (i, t, e) => (w(i, typeof t != "symbol" ? t + "" : t, e), e);
const y = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8L5 12L9 16"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 8L19 12L15 16"/></svg>';
function x(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
function u(i, t, e) {
  var r, n, s, o, a;
  t == null && (t = 100);
  function d() {
    var l = Date.now() - o;
    l < t && l >= 0 ? r = setTimeout(d, t - l) : (r = null, e || (a = i.apply(s, n), s = n = null));
  }
  var m = function() {
    s = this, n = arguments, o = Date.now();
    var l = e && !r;
    return r || (r = setTimeout(d, t)), l && (a = i.apply(s, n), s = n = null), a;
  };
  return m.clear = function() {
    r && (clearTimeout(r), r = null);
  }, m.flush = function() {
    r && (a = i.apply(s, n), s = n = null, clearTimeout(r), r = null);
  }, m;
}
u.debounce = u;
var v = u;
const _ = /* @__PURE__ */ x(v), h = class h {
  constructor({ data: t, api: e, readOnly: r }) {
    this.api = e, this.nodes = {
      wrapper: null,
      container: null,
      progress: null,
      input: null,
      inputHolder: null
    }, this._data = Object.keys(t).length !== 0 ? t : void 0, this.readOnly = r;
  }
  set data(t) {
    var r;
    if (!(t instanceof Object))
      throw Error("Embed Tool data should be object");
    this._data = t;
    const e = this.nodes.wrapper;
    e && ((r = e.parentNode) == null || r.replaceChild(this.render(), e));
  }
  get data() {
    return this._data;
  }
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: "embed-tool",
      inputEl: "embed-tool__input",
      inputHolder: "embed-tool__input-holder",
      inputError: "embed-tool__input-holder--error",
      linkContent: "embed-tool__content",
      linkContentRendered: "embed-tool__content--rendered",
      linkImage: "embed-tool__image",
      linkTitle: "embed-tool__title",
      linkDescription: "embed-tool__description",
      linkText: "embed-tool__anchor",
      progress: "embed-tool__progress",
      progressLoading: "embed-tool__progress--loading",
      progressLoaded: "embed-tool__progress--loaded",
      caption: "embed-tool__caption",
      content: "embed-tool__content"
    };
  }
  render() {
    return this._data ? this.nodes.wrapper = this.makeEmbed() ?? this.make("div", this.CSS.baseClass) : (this.nodes.wrapper = this.make("div", this.CSS.baseClass), this.nodes.container = this.make("div", this.CSS.container), this.nodes.inputHolder = this.makeInputHolder(), this.nodes.container.appendChild(this.nodes.inputHolder), this.nodes.wrapper.appendChild(this.nodes.container)), this.nodes.wrapper;
  }
  makeEmbed() {
    var o, a;
    if (this.showProgress(), !this.data || !h.services)
      return null;
    const { html: t } = h.services[this.data.service], e = this.make("div", this.CSS.baseClass), r = this.make("div", this.CSS.container), n = document.createElement("template");
    n.innerHTML = t, (o = n.content.firstChild) == null || o.setAttribute("src", this.data.embed), (a = n.content.firstChild) == null || a.classList.add(this.CSS.content), this.nodes.container = r;
    const s = this.embedIsReady(this.nodes.container);
    return n.content.firstChild && r.appendChild(n.content.firstChild), s.then(() => {
      this.hideProgress();
    }), e.appendChild(r), e;
  }
  async embedIsReady(t) {
    let r = null;
    return new Promise((n) => {
      r = new MutationObserver(_(n, 450)), r.observe(t, {
        childList: !0,
        subtree: !0
      });
    }).then(() => {
      r == null || r.disconnect();
    });
  }
  makeInputHolder() {
    const t = this.make("div", this.CSS.inputHolder);
    return this.nodes.progress = this.make("label", this.CSS.progress), this.nodes.input = this.make("div", [this.CSS.input, this.CSS.inputEl], {
      contentEditable: !this.readOnly
    }), this.nodes.input.dataset.placeholder = this.api.i18n.t("Link"), this.nodes.input.addEventListener("keydown", (e) => {
      const [r, n] = [13, 65], s = e.ctrlKey || e.metaKey;
      switch (e.keyCode) {
        case r:
          e.preventDefault(), e.stopPropagation(), e.target && "textContent" in e.target && typeof e.target.textContent == "string" && this.setData(e.target.textContent);
          break;
        case n:
          s && e.target && "textContent" in e.target && typeof e.target.textContent == "string" && this.setData(e.target.textContent);
          break;
      }
    }), t.appendChild(this.nodes.progress), t.appendChild(this.nodes.input), t;
  }
  setData(t) {
    var l, p;
    if (!h.services)
      return;
    const e = (l = Object.entries(h.services).find(([, c]) => c.regex.test(t))) == null ? void 0 : l[1];
    if (!e)
      return;
    const { regex: r, embedUrl: n, width: s, height: o, id: a = (c) => c.shift() } = e, d = (p = r.exec(t)) == null ? void 0 : p.slice(1);
    if (!d)
      return;
    const m = n.replace(/<%= remote_id %>/g, a(d) ?? "");
    this.data = {
      service: e.name,
      source: t,
      embed: m,
      width: s,
      height: o
    };
  }
  static prepare({ config: t = {} }) {
    const { services: e } = t;
    if (!e)
      return;
    let r = Object.entries(k);
    const n = Object.entries(e).filter(([, s]) => typeof s == "boolean" && s === !0).map(([s]) => s);
    n.length && (r = r.filter(([s]) => n.includes(s))), h.services = r.reduce((s, [o, a]) => o in s ? (s[o] = Object.assign({}, s[o], a), s) : (s[o] = a, s), {});
  }
  static checkServiceConfig(t) {
    const { regex: e, embedUrl: r, html: n, height: s, width: o, id: a } = t;
    let d = e && e instanceof RegExp && r && typeof r == "string" && n && typeof n == "string";
    return d = d && (a !== void 0 ? a instanceof Function : !0), d = d && (s !== void 0 ? Number.isFinite(s) : !0), d = d && (o !== void 0 ? Number.isFinite(o) : !0), d;
  }
  save() {
    return this.data;
  }
  static get toolbox() {
    return {
      icon: y,
      title: "Embed"
    };
  }
  showProgress() {
    var t;
    (t = this.nodes.progress) == null || t.classList.add(this.CSS.progressLoading);
  }
  hideProgress() {
    return new Promise((t) => {
      var e, r;
      (e = this.nodes.progress) == null || e.classList.remove(this.CSS.progressLoading), (r = this.nodes.progress) == null || r.classList.add(this.CSS.progressLoaded), setTimeout(t, 500);
    });
  }
  make(t, e, r) {
    const n = document.createElement(t);
    Array.isArray(e) ? n.classList.add(...e) : e && n.classList.add(e);
    for (const s in r) {
      const o = s, a = r[o];
      a !== void 0 && (n[o] = a);
    }
    return n;
  }
  static get enableLineBreaks() {
    return !0;
  }
};
g(h, "services");
let f = h;
const k = {
  vimeo: {
    name: "vimeo",
    regex: /(?:http[s]?:\/\/)?(?:www.)?(?:player.)?vimeo\.co(?:.+\/([^\/]\d+)(?:#t=[\d]+)?s?$)/,
    embedUrl: "https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0",
    html: '<iframe style="width:100%;" height="320" frameborder="0"></iframe>',
    height: 320,
    width: 580
  },
  youtube: {
    name: "youtube",
    regex: /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    embedUrl: "https://www.youtube.com/embed/<%= remote_id %>",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
    id: ([i, t]) => {
      if (!t && i)
        return i;
      const e = {
        start: "start",
        end: "end",
        t: "start",
        // eslint-disable-next-line camelcase
        time_continue: "start",
        list: "list"
      }, r = t.slice(1).split("&").map((n) => {
        const [s, o] = n.split("=");
        return i ? !e[s] || o === "LL" || o.startsWith("RDMM") || o.startsWith("FL") ? null : `${e[s]}=${o}` : (i = o, null);
      }).filter((n) => !!n);
      return i + "?" + r.join("&");
    }
  },
  coub: {
    name: "coub",
    regex: /https?:\/\/coub\.com\/view\/([^\/\?\&]+)/,
    embedUrl: "https://coub.com/embed/<%= remote_id %>",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  vine: {
    name: "vine",
    regex: /https?:\/\/vine\.co\/v\/([^\/\?\&]+)/,
    embedUrl: "https://vine.co/v/<%= remote_id %>/embed/simple/",
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580
  },
  imgur: {
    name: "imgur",
    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
    embedUrl: "http://imgur.com/<%= remote_id %>/embed",
    html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>',
    height: 500,
    width: 540
  },
  gfycat: {
    name: "gfycat",
    regex: /https?:\/\/gfycat\.com(?:\/detail)?\/([a-zA-Z]+)/,
    embedUrl: "https://gfycat.com/ifr/<%= remote_id %>",
    html: `<iframe frameborder='0' scrolling='no' style="width:100%;" height='436' allowfullscreen ></iframe>`,
    height: 436,
    width: 580
  },
  "twitch-channel": {
    name: "twitch-channel",
    regex: /https?:\/\/www\.twitch\.tv\/([^\/\?\&]*)\/?$/,
    embedUrl: "https://player.twitch.tv/?channel=<%= remote_id %>",
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "twitch-video": {
    name: "twitch-video",
    regex: /https?:\/\/www\.twitch\.tv\/(?:[^\/\?\&]*\/v|videos)\/([0-9]*)/,
    embedUrl: "https://player.twitch.tv/?video=v<%= remote_id %>",
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600
  },
  "yandex-music-album": {
    name: "yandex-music-album",
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/?$/,
    embedUrl: "https://music.yandex.ru/iframe/#album/<%= remote_id %>/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" style="width:100%;" height="400"></iframe>',
    height: 400,
    width: 540
  },
  "yandex-music-track": {
    name: "yandex-music-track",
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/track\/([0-9]*)/,
    embedUrl: "https://music.yandex.ru/iframe/#track/<%= remote_id %>/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:100px;" style="width:100%;" height="100"></iframe>',
    height: 100,
    width: 540,
    id: (i) => i.join("/")
  },
  "yandex-music-playlist": {
    name: "yandex-music-playlist",
    regex: /https?:\/\/music\.yandex\.ru\/users\/([^\/\?\&]*)\/playlists\/([0-9]*)/,
    embedUrl: "https://music.yandex.ru/iframe/#playlist/<%= remote_id %>/show/cover/description/",
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" width="540" height="400"></iframe>',
    height: 400,
    width: 540,
    id: (i) => i.join("/")
  },
  codepen: {
    name: "codepen",
    regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
    embedUrl: "https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2",
    html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
    height: 300,
    width: 600,
    id: (i) => i.join("/embed/")
  },
  instagram: {
    name: "instagram",
    regex: /https?:\/\/www\.instagram\.com\/p\/([^\/\?\&]+)\/?.*/,
    embedUrl: "https://www.instagram.com/p/<%= remote_id %>/embed",
    html: '<iframe width="400" height="505" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 505,
    width: 400
  },
  twitter: {
    name: "twitter",
    regex: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+?.*)?$/,
    embedUrl: "https://twitframe.com/show?url=https://twitter.com/<%= remote_id %>",
    html: '<iframe width="600" height="600" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600,
    id: (i) => i.join("/status/")
  },
  pinterest: {
    name: "pinterest",
    regex: /https?:\/\/([^\/\?\&]*).pinterest.com\/pin\/([^\/\?\&]*)\/?$/,
    embedUrl: "https://assets.pinterest.com/ext/embed.html?id=<%= remote_id %>",
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 400px; max-height: 1000px;'></iframe>",
    id: (i) => i[1]
  },
  facebook: {
    name: "facebook",
    regex: /https?:\/\/www.facebook.com\/([^\/\?\&]*)\/(.*)/,
    embedUrl: "https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/<%= remote_id %>&width=500",
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 500px; max-height: 1000px;'></iframe>",
    id: (i) => i.join("/")
  },
  aparat: {
    name: "aparat",
    regex: /(?:http[s]?:\/\/)?(?:www.)?aparat\.com\/v\/([^\/\?\&]+)\/?/,
    embedUrl: "https://www.aparat.com/video/video/embed/videohash/<%= remote_id %>/vt/frame",
    html: '<iframe width="600" height="300" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600
  },
  miro: {
    name: "miro",
    regex: /https:\/\/miro.com\/\S+(\S{12})\/(\S+)?/,
    embedUrl: "https://miro.com/app/live-embed/<%= remote_id %>",
    html: '<iframe width="700" height="500" style="margin: 0 auto;" allowFullScreen frameBorder="0" scrolling="no"></iframe>'
  },
  github: {
    name: "github",
    regex: /https?:\/\/gist.github.com\/([^\/\?\&]*)\/([^\/\?\&]*)/,
    embedUrl: 'data:text/html;charset=utf-8,<head><base target="_blank" /></head><body><script src="https://gist.github.com/<%= remote_id %>" ><\/script></body>',
    html: '<iframe width="100%" height="350" frameborder="0" style="margin: 0 auto;"></iframe>',
    height: 300,
    width: 600,
    id: (i) => `${i.join("/")}.js`
  }
};
export {
  f as default
};
