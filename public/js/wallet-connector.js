var jd = Object.defineProperty;
var Hd = (t, e, r) => e in t ? jd(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var G = (t, e, r) => Hd(t, typeof e != "symbol" ? e + "" : e, r);
var Vr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Kd(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function Vd(t) {
  if (t.__esModule) return t;
  var e = t.default;
  if (typeof e == "function") {
    var r = function n() {
      return this instanceof n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    r.prototype = e.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(t).forEach(function(n) {
    var s = Object.getOwnPropertyDescriptor(t, n);
    Object.defineProperty(r, n, s.get ? s : {
      enumerable: !0,
      get: function() {
        return t[n];
      }
    });
  }), r;
}
var Xo = { exports: {} }, tn = typeof Reflect == "object" ? Reflect : null, Ya = tn && typeof tn.apply == "function" ? tn.apply : function(e, r, n) {
  return Function.prototype.apply.call(e, r, n);
}, $s;
tn && typeof tn.ownKeys == "function" ? $s = tn.ownKeys : Object.getOwnPropertySymbols ? $s = function(e) {
  return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
} : $s = function(e) {
  return Object.getOwnPropertyNames(e);
};
function Wd(t) {
  console && console.warn && console.warn(t);
}
var du = Number.isNaN || function(e) {
  return e !== e;
};
function re() {
  re.init.call(this);
}
Xo.exports = re;
Xo.exports.once = Xd;
re.EventEmitter = re;
re.prototype._events = void 0;
re.prototype._eventsCount = 0;
re.prototype._maxListeners = void 0;
var Za = 10;
function oi(t) {
  if (typeof t != "function")
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof t);
}
Object.defineProperty(re, "defaultMaxListeners", {
  enumerable: !0,
  get: function() {
    return Za;
  },
  set: function(t) {
    if (typeof t != "number" || t < 0 || du(t))
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + t + ".");
    Za = t;
  }
});
re.init = function() {
  (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
};
re.prototype.setMaxListeners = function(e) {
  if (typeof e != "number" || e < 0 || du(e))
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
  return this._maxListeners = e, this;
};
function pu(t) {
  return t._maxListeners === void 0 ? re.defaultMaxListeners : t._maxListeners;
}
re.prototype.getMaxListeners = function() {
  return pu(this);
};
re.prototype.emit = function(e) {
  for (var r = [], n = 1; n < arguments.length; n++) r.push(arguments[n]);
  var s = e === "error", i = this._events;
  if (i !== void 0)
    s = s && i.error === void 0;
  else if (!s)
    return !1;
  if (s) {
    var o;
    if (r.length > 0 && (o = r[0]), o instanceof Error)
      throw o;
    var a = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
    throw a.context = o, a;
  }
  var c = i[e];
  if (c === void 0)
    return !1;
  if (typeof c == "function")
    Ya(c, this, r);
  else
    for (var l = c.length, u = bu(c, l), n = 0; n < l; ++n)
      Ya(u[n], this, r);
  return !0;
};
function gu(t, e, r, n) {
  var s, i, o;
  if (oi(r), i = t._events, i === void 0 ? (i = t._events = /* @__PURE__ */ Object.create(null), t._eventsCount = 0) : (i.newListener !== void 0 && (t.emit(
    "newListener",
    e,
    r.listener ? r.listener : r
  ), i = t._events), o = i[e]), o === void 0)
    o = i[e] = r, ++t._eventsCount;
  else if (typeof o == "function" ? o = i[e] = n ? [r, o] : [o, r] : n ? o.unshift(r) : o.push(r), s = pu(t), s > 0 && o.length > s && !o.warned) {
    o.warned = !0;
    var a = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
    a.name = "MaxListenersExceededWarning", a.emitter = t, a.type = e, a.count = o.length, Wd(a);
  }
  return t;
}
re.prototype.addListener = function(e, r) {
  return gu(this, e, r, !1);
};
re.prototype.on = re.prototype.addListener;
re.prototype.prependListener = function(e, r) {
  return gu(this, e, r, !0);
};
function Gd() {
  if (!this.fired)
    return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
}
function yu(t, e, r) {
  var n = { fired: !1, wrapFn: void 0, target: t, type: e, listener: r }, s = Gd.bind(n);
  return s.listener = r, n.wrapFn = s, s;
}
re.prototype.once = function(e, r) {
  return oi(r), this.on(e, yu(this, e, r)), this;
};
re.prototype.prependOnceListener = function(e, r) {
  return oi(r), this.prependListener(e, yu(this, e, r)), this;
};
re.prototype.removeListener = function(e, r) {
  var n, s, i, o, a;
  if (oi(r), s = this._events, s === void 0)
    return this;
  if (n = s[e], n === void 0)
    return this;
  if (n === r || n.listener === r)
    --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete s[e], s.removeListener && this.emit("removeListener", e, n.listener || r));
  else if (typeof n != "function") {
    for (i = -1, o = n.length - 1; o >= 0; o--)
      if (n[o] === r || n[o].listener === r) {
        a = n[o].listener, i = o;
        break;
      }
    if (i < 0)
      return this;
    i === 0 ? n.shift() : Yd(n, i), n.length === 1 && (s[e] = n[0]), s.removeListener !== void 0 && this.emit("removeListener", e, a || r);
  }
  return this;
};
re.prototype.off = re.prototype.removeListener;
re.prototype.removeAllListeners = function(e) {
  var r, n, s;
  if (n = this._events, n === void 0)
    return this;
  if (n.removeListener === void 0)
    return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
  if (arguments.length === 0) {
    var i = Object.keys(n), o;
    for (s = 0; s < i.length; ++s)
      o = i[s], o !== "removeListener" && this.removeAllListeners(o);
    return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
  }
  if (r = n[e], typeof r == "function")
    this.removeListener(e, r);
  else if (r !== void 0)
    for (s = r.length - 1; s >= 0; s--)
      this.removeListener(e, r[s]);
  return this;
};
function wu(t, e, r) {
  var n = t._events;
  if (n === void 0)
    return [];
  var s = n[e];
  return s === void 0 ? [] : typeof s == "function" ? r ? [s.listener || s] : [s] : r ? Zd(s) : bu(s, s.length);
}
re.prototype.listeners = function(e) {
  return wu(this, e, !0);
};
re.prototype.rawListeners = function(e) {
  return wu(this, e, !1);
};
re.listenerCount = function(t, e) {
  return typeof t.listenerCount == "function" ? t.listenerCount(e) : mu.call(t, e);
};
re.prototype.listenerCount = mu;
function mu(t) {
  var e = this._events;
  if (e !== void 0) {
    var r = e[t];
    if (typeof r == "function")
      return 1;
    if (r !== void 0)
      return r.length;
  }
  return 0;
}
re.prototype.eventNames = function() {
  return this._eventsCount > 0 ? $s(this._events) : [];
};
function bu(t, e) {
  for (var r = new Array(e), n = 0; n < e; ++n)
    r[n] = t[n];
  return r;
}
function Yd(t, e) {
  for (; e + 1 < t.length; e++)
    t[e] = t[e + 1];
  t.pop();
}
function Zd(t) {
  for (var e = new Array(t.length), r = 0; r < e.length; ++r)
    e[r] = t[r].listener || t[r];
  return e;
}
function Xd(t, e) {
  return new Promise(function(r, n) {
    function s(o) {
      t.removeListener(e, i), n(o);
    }
    function i() {
      typeof t.removeListener == "function" && t.removeListener("error", s), r([].slice.call(arguments));
    }
    Eu(t, e, i, { once: !0 }), e !== "error" && Jd(t, s, { once: !0 });
  });
}
function Jd(t, e, r) {
  typeof t.on == "function" && Eu(t, "error", e, r);
}
function Eu(t, e, r, n) {
  if (typeof t.on == "function")
    n.once ? t.once(e, r) : t.on(e, r);
  else if (typeof t.addEventListener == "function")
    t.addEventListener(e, function s(i) {
      n.once && t.removeEventListener(e, s), r(i);
    });
  else
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof t);
}
var dt = Xo.exports;
const vu = /* @__PURE__ */ Kd(dt);
var M = {};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var mo = function(t, e) {
  return mo = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(r, n) {
    r.__proto__ = n;
  } || function(r, n) {
    for (var s in n) n.hasOwnProperty(s) && (r[s] = n[s]);
  }, mo(t, e);
};
function Qd(t, e) {
  mo(t, e);
  function r() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (r.prototype = e.prototype, new r());
}
var bo = function() {
  return bo = Object.assign || function(e) {
    for (var r, n = 1, s = arguments.length; n < s; n++) {
      r = arguments[n];
      for (var i in r) Object.prototype.hasOwnProperty.call(r, i) && (e[i] = r[i]);
    }
    return e;
  }, bo.apply(this, arguments);
};
function ep(t, e) {
  var r = {};
  for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e.indexOf(n) < 0 && (r[n] = t[n]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, n = Object.getOwnPropertySymbols(t); s < n.length; s++)
      e.indexOf(n[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, n[s]) && (r[n[s]] = t[n[s]]);
  return r;
}
function tp(t, e, r, n) {
  var s = arguments.length, i = s < 3 ? e : n === null ? n = Object.getOwnPropertyDescriptor(e, r) : n, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") i = Reflect.decorate(t, e, r, n);
  else for (var a = t.length - 1; a >= 0; a--) (o = t[a]) && (i = (s < 3 ? o(i) : s > 3 ? o(e, r, i) : o(e, r)) || i);
  return s > 3 && i && Object.defineProperty(e, r, i), i;
}
function rp(t, e) {
  return function(r, n) {
    e(r, n, t);
  };
}
function np(t, e) {
  if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(t, e);
}
function sp(t, e, r, n) {
  function s(i) {
    return i instanceof r ? i : new r(function(o) {
      o(i);
    });
  }
  return new (r || (r = Promise))(function(i, o) {
    function a(u) {
      try {
        l(n.next(u));
      } catch (h) {
        o(h);
      }
    }
    function c(u) {
      try {
        l(n.throw(u));
      } catch (h) {
        o(h);
      }
    }
    function l(u) {
      u.done ? i(u.value) : s(u.value).then(a, c);
    }
    l((n = n.apply(t, e || [])).next());
  });
}
function ip(t, e) {
  var r = { label: 0, sent: function() {
    if (i[0] & 1) throw i[1];
    return i[1];
  }, trys: [], ops: [] }, n, s, i, o;
  return o = { next: a(0), throw: a(1), return: a(2) }, typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function a(l) {
    return function(u) {
      return c([l, u]);
    };
  }
  function c(l) {
    if (n) throw new TypeError("Generator is already executing.");
    for (; r; ) try {
      if (n = 1, s && (i = l[0] & 2 ? s.return : l[0] ? s.throw || ((i = s.return) && i.call(s), 0) : s.next) && !(i = i.call(s, l[1])).done) return i;
      switch (s = 0, i && (l = [l[0] & 2, i.value]), l[0]) {
        case 0:
        case 1:
          i = l;
          break;
        case 4:
          return r.label++, { value: l[1], done: !1 };
        case 5:
          r.label++, s = l[1], l = [0];
          continue;
        case 7:
          l = r.ops.pop(), r.trys.pop();
          continue;
        default:
          if (i = r.trys, !(i = i.length > 0 && i[i.length - 1]) && (l[0] === 6 || l[0] === 2)) {
            r = 0;
            continue;
          }
          if (l[0] === 3 && (!i || l[1] > i[0] && l[1] < i[3])) {
            r.label = l[1];
            break;
          }
          if (l[0] === 6 && r.label < i[1]) {
            r.label = i[1], i = l;
            break;
          }
          if (i && r.label < i[2]) {
            r.label = i[2], r.ops.push(l);
            break;
          }
          i[2] && r.ops.pop(), r.trys.pop();
          continue;
      }
      l = e.call(t, r);
    } catch (u) {
      l = [6, u], s = 0;
    } finally {
      n = i = 0;
    }
    if (l[0] & 5) throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
function op(t, e, r, n) {
  n === void 0 && (n = r), t[n] = e[r];
}
function ap(t, e) {
  for (var r in t) r !== "default" && !e.hasOwnProperty(r) && (e[r] = t[r]);
}
function Eo(t) {
  var e = typeof Symbol == "function" && Symbol.iterator, r = e && t[e], n = 0;
  if (r) return r.call(t);
  if (t && typeof t.length == "number") return {
    next: function() {
      return t && n >= t.length && (t = void 0), { value: t && t[n++], done: !t };
    }
  };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function xu(t, e) {
  var r = typeof Symbol == "function" && t[Symbol.iterator];
  if (!r) return t;
  var n = r.call(t), s, i = [], o;
  try {
    for (; (e === void 0 || e-- > 0) && !(s = n.next()).done; ) i.push(s.value);
  } catch (a) {
    o = { error: a };
  } finally {
    try {
      s && !s.done && (r = n.return) && r.call(n);
    } finally {
      if (o) throw o.error;
    }
  }
  return i;
}
function cp() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t = t.concat(xu(arguments[e]));
  return t;
}
function lp() {
  for (var t = 0, e = 0, r = arguments.length; e < r; e++) t += arguments[e].length;
  for (var n = Array(t), s = 0, e = 0; e < r; e++)
    for (var i = arguments[e], o = 0, a = i.length; o < a; o++, s++)
      n[s] = i[o];
  return n;
}
function qn(t) {
  return this instanceof qn ? (this.v = t, this) : new qn(t);
}
function up(t, e, r) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = r.apply(t, e || []), s, i = [];
  return s = {}, o("next"), o("throw"), o("return"), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function o(f) {
    n[f] && (s[f] = function(d) {
      return new Promise(function(p, g) {
        i.push([f, d, p, g]) > 1 || a(f, d);
      });
    });
  }
  function a(f, d) {
    try {
      c(n[f](d));
    } catch (p) {
      h(i[0][3], p);
    }
  }
  function c(f) {
    f.value instanceof qn ? Promise.resolve(f.value.v).then(l, u) : h(i[0][2], f);
  }
  function l(f) {
    a("next", f);
  }
  function u(f) {
    a("throw", f);
  }
  function h(f, d) {
    f(d), i.shift(), i.length && a(i[0][0], i[0][1]);
  }
}
function hp(t) {
  var e, r;
  return e = {}, n("next"), n("throw", function(s) {
    throw s;
  }), n("return"), e[Symbol.iterator] = function() {
    return this;
  }, e;
  function n(s, i) {
    e[s] = t[s] ? function(o) {
      return (r = !r) ? { value: qn(t[s](o)), done: s === "return" } : i ? i(o) : o;
    } : i;
  }
}
function fp(t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = t[Symbol.asyncIterator], r;
  return e ? e.call(t) : (t = typeof Eo == "function" ? Eo(t) : t[Symbol.iterator](), r = {}, n("next"), n("throw"), n("return"), r[Symbol.asyncIterator] = function() {
    return this;
  }, r);
  function n(i) {
    r[i] = t[i] && function(o) {
      return new Promise(function(a, c) {
        o = t[i](o), s(a, c, o.done, o.value);
      });
    };
  }
  function s(i, o, a, c) {
    Promise.resolve(c).then(function(l) {
      i({ value: l, done: a });
    }, o);
  }
}
function dp(t, e) {
  return Object.defineProperty ? Object.defineProperty(t, "raw", { value: e }) : t.raw = e, t;
}
function pp(t) {
  if (t && t.__esModule) return t;
  var e = {};
  if (t != null) for (var r in t) Object.hasOwnProperty.call(t, r) && (e[r] = t[r]);
  return e.default = t, e;
}
function gp(t) {
  return t && t.__esModule ? t : { default: t };
}
function yp(t, e) {
  if (!e.has(t))
    throw new TypeError("attempted to get private field on non-instance");
  return e.get(t);
}
function wp(t, e, r) {
  if (!e.has(t))
    throw new TypeError("attempted to set private field on non-instance");
  return e.set(t, r), r;
}
const mp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get __assign() {
    return bo;
  },
  __asyncDelegator: hp,
  __asyncGenerator: up,
  __asyncValues: fp,
  __await: qn,
  __awaiter: sp,
  __classPrivateFieldGet: yp,
  __classPrivateFieldSet: wp,
  __createBinding: op,
  __decorate: tp,
  __exportStar: ap,
  __extends: Qd,
  __generator: ip,
  __importDefault: gp,
  __importStar: pp,
  __makeTemplateObject: dp,
  __metadata: np,
  __param: rp,
  __read: xu,
  __rest: ep,
  __spread: cp,
  __spreadArrays: lp,
  __values: Eo
}, Symbol.toStringTag, { value: "Module" })), Zn = /* @__PURE__ */ Vd(mp);
var Ai = {}, bn = {}, Xa;
function bp() {
  if (Xa) return bn;
  Xa = 1, Object.defineProperty(bn, "__esModule", { value: !0 }), bn.delay = void 0;
  function t(e) {
    return new Promise((r) => {
      setTimeout(() => {
        r(!0);
      }, e);
    });
  }
  return bn.delay = t, bn;
}
var mr = {}, Oi = {}, br = {}, Ja;
function Ep() {
  return Ja || (Ja = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.ONE_THOUSAND = br.ONE_HUNDRED = void 0, br.ONE_HUNDRED = 100, br.ONE_THOUSAND = 1e3), br;
}
var $i = {}, Qa;
function vp() {
  return Qa || (Qa = 1, function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.ONE_YEAR = t.FOUR_WEEKS = t.THREE_WEEKS = t.TWO_WEEKS = t.ONE_WEEK = t.THIRTY_DAYS = t.SEVEN_DAYS = t.FIVE_DAYS = t.THREE_DAYS = t.ONE_DAY = t.TWENTY_FOUR_HOURS = t.TWELVE_HOURS = t.SIX_HOURS = t.THREE_HOURS = t.ONE_HOUR = t.SIXTY_MINUTES = t.THIRTY_MINUTES = t.TEN_MINUTES = t.FIVE_MINUTES = t.ONE_MINUTE = t.SIXTY_SECONDS = t.THIRTY_SECONDS = t.TEN_SECONDS = t.FIVE_SECONDS = t.ONE_SECOND = void 0, t.ONE_SECOND = 1, t.FIVE_SECONDS = 5, t.TEN_SECONDS = 10, t.THIRTY_SECONDS = 30, t.SIXTY_SECONDS = 60, t.ONE_MINUTE = t.SIXTY_SECONDS, t.FIVE_MINUTES = t.ONE_MINUTE * 5, t.TEN_MINUTES = t.ONE_MINUTE * 10, t.THIRTY_MINUTES = t.ONE_MINUTE * 30, t.SIXTY_MINUTES = t.ONE_MINUTE * 60, t.ONE_HOUR = t.SIXTY_MINUTES, t.THREE_HOURS = t.ONE_HOUR * 3, t.SIX_HOURS = t.ONE_HOUR * 6, t.TWELVE_HOURS = t.ONE_HOUR * 12, t.TWENTY_FOUR_HOURS = t.ONE_HOUR * 24, t.ONE_DAY = t.TWENTY_FOUR_HOURS, t.THREE_DAYS = t.ONE_DAY * 3, t.FIVE_DAYS = t.ONE_DAY * 5, t.SEVEN_DAYS = t.ONE_DAY * 7, t.THIRTY_DAYS = t.ONE_DAY * 30, t.ONE_WEEK = t.SEVEN_DAYS, t.TWO_WEEKS = t.ONE_WEEK * 2, t.THREE_WEEKS = t.ONE_WEEK * 3, t.FOUR_WEEKS = t.ONE_WEEK * 4, t.ONE_YEAR = t.ONE_DAY * 365;
  }($i)), $i;
}
var ec;
function _u() {
  return ec || (ec = 1, function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const e = Zn;
    e.__exportStar(Ep(), t), e.__exportStar(vp(), t);
  }(Oi)), Oi;
}
var tc;
function xp() {
  if (tc) return mr;
  tc = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.fromMiliseconds = mr.toMiliseconds = void 0;
  const t = _u();
  function e(n) {
    return n * t.ONE_THOUSAND;
  }
  mr.toMiliseconds = e;
  function r(n) {
    return Math.floor(n / t.ONE_THOUSAND);
  }
  return mr.fromMiliseconds = r, mr;
}
var rc;
function _p() {
  return rc || (rc = 1, function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const e = Zn;
    e.__exportStar(bp(), t), e.__exportStar(xp(), t);
  }(Ai)), Ai;
}
var Wr = {}, nc;
function Sp() {
  if (nc) return Wr;
  nc = 1, Object.defineProperty(Wr, "__esModule", { value: !0 }), Wr.Watch = void 0;
  class t {
    constructor() {
      this.timestamps = /* @__PURE__ */ new Map();
    }
    start(r) {
      if (this.timestamps.has(r))
        throw new Error(`Watch already started for label: ${r}`);
      this.timestamps.set(r, { started: Date.now() });
    }
    stop(r) {
      const n = this.get(r);
      if (typeof n.elapsed < "u")
        throw new Error(`Watch already stopped for label: ${r}`);
      const s = Date.now() - n.started;
      this.timestamps.set(r, { started: n.started, elapsed: s });
    }
    get(r) {
      const n = this.timestamps.get(r);
      if (typeof n > "u")
        throw new Error(`No timestamp found for label: ${r}`);
      return n;
    }
    elapsed(r) {
      const n = this.get(r);
      return n.elapsed || Date.now() - n.started;
    }
  }
  return Wr.Watch = t, Wr.default = t, Wr;
}
var Ti = {}, En = {}, sc;
function Ip() {
  if (sc) return En;
  sc = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.IWatch = void 0;
  class t {
  }
  return En.IWatch = t, En;
}
var ic;
function Dp() {
  return ic || (ic = 1, function(t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), Zn.__exportStar(Ip(), t);
  }(Ti)), Ti;
}
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const e = Zn;
  e.__exportStar(_p(), t), e.__exportStar(Sp(), t), e.__exportStar(Dp(), t), e.__exportStar(_u(), t);
})(M);
class Fr {
}
let Ap = class extends Fr {
  constructor(e) {
    super();
  }
};
const oc = M.FIVE_SECONDS, qr = { pulse: "heartbeat_pulse" };
class Jo extends Ap {
  constructor(e) {
    super(e), this.events = new dt.EventEmitter(), this.interval = oc, this.interval = (e == null ? void 0 : e.interval) || oc;
  }
  static async init(e) {
    const r = new Jo(e);
    return await r.init(), r;
  }
  async init() {
    await this.initialize();
  }
  stop() {
    clearInterval(this.intervalRef);
  }
  on(e, r) {
    this.events.on(e, r);
  }
  once(e, r) {
    this.events.once(e, r);
  }
  off(e, r) {
    this.events.off(e, r);
  }
  removeListener(e, r) {
    this.events.removeListener(e, r);
  }
  async initialize() {
    this.intervalRef = setInterval(() => this.pulse(), M.toMiliseconds(this.interval));
  }
  pulse() {
    this.events.emit(qr.pulse);
  }
}
const Op = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/, $p = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/, Tp = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function Bp(t, e) {
  if (t === "__proto__" || t === "constructor" && e && typeof e == "object" && "prototype" in e) {
    Rp(t);
    return;
  }
  return e;
}
function Rp(t) {
  console.warn(`[destr] Dropping "${t}" key to prevent prototype pollution.`);
}
function ls(t, e = {}) {
  if (typeof t != "string")
    return t;
  if (t[0] === '"' && t[t.length - 1] === '"' && t.indexOf("\\") === -1)
    return t.slice(1, -1);
  const r = t.trim();
  if (r.length <= 9)
    switch (r.toLowerCase()) {
      case "true":
        return !0;
      case "false":
        return !1;
      case "undefined":
        return;
      case "null":
        return null;
      case "nan":
        return Number.NaN;
      case "infinity":
        return Number.POSITIVE_INFINITY;
      case "-infinity":
        return Number.NEGATIVE_INFINITY;
    }
  if (!Tp.test(t)) {
    if (e.strict)
      throw new SyntaxError("[destr] Invalid JSON");
    return t;
  }
  try {
    if (Op.test(t) || $p.test(t)) {
      if (e.strict)
        throw new Error("[destr] Possible prototype pollution");
      return JSON.parse(t, Bp);
    }
    return JSON.parse(t);
  } catch (n) {
    if (e.strict)
      throw n;
    return t;
  }
}
function Pp(t) {
  return !t || typeof t.then != "function" ? Promise.resolve(t) : t;
}
function we(t, ...e) {
  try {
    return Pp(t(...e));
  } catch (r) {
    return Promise.reject(r);
  }
}
function Cp(t) {
  const e = typeof t;
  return t === null || e !== "object" && e !== "function";
}
function Np(t) {
  const e = Object.getPrototypeOf(t);
  return !e || e.isPrototypeOf(Object);
}
function Ts(t) {
  if (Cp(t))
    return String(t);
  if (Np(t) || Array.isArray(t))
    return JSON.stringify(t);
  if (typeof t.toJSON == "function")
    return Ts(t.toJSON());
  throw new Error("[unstorage] Cannot stringify value!");
}
const vo = "base64:";
function Up(t) {
  return typeof t == "string" ? t : vo + Mp(t);
}
function Lp(t) {
  return typeof t != "string" || !t.startsWith(vo) ? t : kp(t.slice(vo.length));
}
function kp(t) {
  return globalThis.Buffer ? Buffer.from(t, "base64") : Uint8Array.from(
    globalThis.atob(t),
    (e) => e.codePointAt(0)
  );
}
function Mp(t) {
  return globalThis.Buffer ? Buffer.from(t).toString("base64") : globalThis.btoa(String.fromCodePoint(...t));
}
function Me(t) {
  var e;
  return t && ((e = t.split("?")[0]) == null ? void 0 : e.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "")) || "";
}
function Fp(...t) {
  return Me(t.join(":"));
}
function us(t) {
  return t = Me(t), t ? t + ":" : "";
}
function qp(t, e) {
  if (e === void 0)
    return !0;
  let r = 0, n = t.indexOf(":");
  for (; n > -1; )
    r++, n = t.indexOf(":", n + 1);
  return r <= e;
}
function zp(t, e) {
  return e ? t.startsWith(e) && t[t.length - 1] !== "$" : t[t.length - 1] !== "$";
}
const jp = "memory", Hp = () => {
  const t = /* @__PURE__ */ new Map();
  return {
    name: jp,
    getInstance: () => t,
    hasItem(e) {
      return t.has(e);
    },
    getItem(e) {
      return t.get(e) ?? null;
    },
    getItemRaw(e) {
      return t.get(e) ?? null;
    },
    setItem(e, r) {
      t.set(e, r);
    },
    setItemRaw(e, r) {
      t.set(e, r);
    },
    removeItem(e) {
      t.delete(e);
    },
    getKeys() {
      return [...t.keys()];
    },
    clear() {
      t.clear();
    },
    dispose() {
      t.clear();
    }
  };
};
function Kp(t = {}) {
  const e = {
    mounts: { "": t.driver || Hp() },
    mountpoints: [""],
    watching: !1,
    watchListeners: [],
    unwatch: {}
  }, r = (l) => {
    for (const u of e.mountpoints)
      if (l.startsWith(u))
        return {
          base: u,
          relativeKey: l.slice(u.length),
          driver: e.mounts[u]
        };
    return {
      base: "",
      relativeKey: l,
      driver: e.mounts[""]
    };
  }, n = (l, u) => e.mountpoints.filter(
    (h) => h.startsWith(l) || u && l.startsWith(h)
  ).map((h) => ({
    relativeBase: l.length > h.length ? l.slice(h.length) : void 0,
    mountpoint: h,
    driver: e.mounts[h]
  })), s = (l, u) => {
    if (e.watching) {
      u = Me(u);
      for (const h of e.watchListeners)
        h(l, u);
    }
  }, i = async () => {
    if (!e.watching) {
      e.watching = !0;
      for (const l in e.mounts)
        e.unwatch[l] = await ac(
          e.mounts[l],
          s,
          l
        );
    }
  }, o = async () => {
    if (e.watching) {
      for (const l in e.unwatch)
        await e.unwatch[l]();
      e.unwatch = {}, e.watching = !1;
    }
  }, a = (l, u, h) => {
    const f = /* @__PURE__ */ new Map(), d = (p) => {
      let g = f.get(p.base);
      return g || (g = {
        driver: p.driver,
        base: p.base,
        items: []
      }, f.set(p.base, g)), g;
    };
    for (const p of l) {
      const g = typeof p == "string", m = Me(g ? p : p.key), _ = g ? void 0 : p.value, R = g || !p.options ? u : { ...u, ...p.options }, b = r(m);
      d(b).items.push({
        key: m,
        value: _,
        relativeKey: b.relativeKey,
        options: R
      });
    }
    return Promise.all([...f.values()].map((p) => h(p))).then(
      (p) => p.flat()
    );
  }, c = {
    // Item
    hasItem(l, u = {}) {
      l = Me(l);
      const { relativeKey: h, driver: f } = r(l);
      return we(f.hasItem, h, u);
    },
    getItem(l, u = {}) {
      l = Me(l);
      const { relativeKey: h, driver: f } = r(l);
      return we(f.getItem, h, u).then(
        (d) => ls(d)
      );
    },
    getItems(l, u = {}) {
      return a(l, u, (h) => h.driver.getItems ? we(
        h.driver.getItems,
        h.items.map((f) => ({
          key: f.relativeKey,
          options: f.options
        })),
        u
      ).then(
        (f) => f.map((d) => ({
          key: Fp(h.base, d.key),
          value: ls(d.value)
        }))
      ) : Promise.all(
        h.items.map((f) => we(
          h.driver.getItem,
          f.relativeKey,
          f.options
        ).then((d) => ({
          key: f.key,
          value: ls(d)
        })))
      ));
    },
    getItemRaw(l, u = {}) {
      l = Me(l);
      const { relativeKey: h, driver: f } = r(l);
      return f.getItemRaw ? we(f.getItemRaw, h, u) : we(f.getItem, h, u).then(
        (d) => Lp(d)
      );
    },
    async setItem(l, u, h = {}) {
      if (u === void 0)
        return c.removeItem(l);
      l = Me(l);
      const { relativeKey: f, driver: d } = r(l);
      d.setItem && (await we(d.setItem, f, Ts(u), h), d.watch || s("update", l));
    },
    async setItems(l, u) {
      await a(l, u, async (h) => {
        if (h.driver.setItems)
          return we(
            h.driver.setItems,
            h.items.map((f) => ({
              key: f.relativeKey,
              value: Ts(f.value),
              options: f.options
            })),
            u
          );
        h.driver.setItem && await Promise.all(
          h.items.map((f) => we(
            h.driver.setItem,
            f.relativeKey,
            Ts(f.value),
            f.options
          ))
        );
      });
    },
    async setItemRaw(l, u, h = {}) {
      if (u === void 0)
        return c.removeItem(l, h);
      l = Me(l);
      const { relativeKey: f, driver: d } = r(l);
      if (d.setItemRaw)
        await we(d.setItemRaw, f, u, h);
      else if (d.setItem)
        await we(d.setItem, f, Up(u), h);
      else
        return;
      d.watch || s("update", l);
    },
    async removeItem(l, u = {}) {
      typeof u == "boolean" && (u = { removeMeta: u }), l = Me(l);
      const { relativeKey: h, driver: f } = r(l);
      f.removeItem && (await we(f.removeItem, h, u), (u.removeMeta || u.removeMata) && await we(f.removeItem, h + "$", u), f.watch || s("remove", l));
    },
    // Meta
    async getMeta(l, u = {}) {
      typeof u == "boolean" && (u = { nativeOnly: u }), l = Me(l);
      const { relativeKey: h, driver: f } = r(l), d = /* @__PURE__ */ Object.create(null);
      if (f.getMeta && Object.assign(d, await we(f.getMeta, h, u)), !u.nativeOnly) {
        const p = await we(
          f.getItem,
          h + "$",
          u
        ).then((g) => ls(g));
        p && typeof p == "object" && (typeof p.atime == "string" && (p.atime = new Date(p.atime)), typeof p.mtime == "string" && (p.mtime = new Date(p.mtime)), Object.assign(d, p));
      }
      return d;
    },
    setMeta(l, u, h = {}) {
      return this.setItem(l + "$", u, h);
    },
    removeMeta(l, u = {}) {
      return this.removeItem(l + "$", u);
    },
    // Keys
    async getKeys(l, u = {}) {
      var m;
      l = us(l);
      const h = n(l, !0);
      let f = [];
      const d = [];
      let p = !0;
      for (const _ of h) {
        (m = _.driver.flags) != null && m.maxDepth || (p = !1);
        const R = await we(
          _.driver.getKeys,
          _.relativeBase,
          u
        );
        for (const b of R) {
          const S = _.mountpoint + Me(b);
          f.some(($) => S.startsWith($)) || d.push(S);
        }
        f = [
          _.mountpoint,
          ...f.filter((b) => !b.startsWith(_.mountpoint))
        ];
      }
      const g = u.maxDepth !== void 0 && !p;
      return d.filter(
        (_) => (!g || qp(_, u.maxDepth)) && zp(_, l)
      );
    },
    // Utils
    async clear(l, u = {}) {
      l = us(l), await Promise.all(
        n(l, !1).map(async (h) => {
          if (h.driver.clear)
            return we(h.driver.clear, h.relativeBase, u);
          if (h.driver.removeItem) {
            const f = await h.driver.getKeys(h.relativeBase || "", u);
            return Promise.all(
              f.map((d) => h.driver.removeItem(d, u))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(e.mounts).map((l) => cc(l))
      );
    },
    async watch(l) {
      return await i(), e.watchListeners.push(l), async () => {
        e.watchListeners = e.watchListeners.filter(
          (u) => u !== l
        ), e.watchListeners.length === 0 && await o();
      };
    },
    async unwatch() {
      e.watchListeners = [], await o();
    },
    // Mount
    mount(l, u) {
      if (l = us(l), l && e.mounts[l])
        throw new Error(`already mounted at ${l}`);
      return l && (e.mountpoints.push(l), e.mountpoints.sort((h, f) => f.length - h.length)), e.mounts[l] = u, e.watching && Promise.resolve(ac(u, s, l)).then((h) => {
        e.unwatch[l] = h;
      }).catch(console.error), c;
    },
    async unmount(l, u = !0) {
      var h, f;
      l = us(l), !(!l || !e.mounts[l]) && (e.watching && l in e.unwatch && ((f = (h = e.unwatch)[l]) == null || f.call(h), delete e.unwatch[l]), u && await cc(e.mounts[l]), e.mountpoints = e.mountpoints.filter((d) => d !== l), delete e.mounts[l]);
    },
    getMount(l = "") {
      l = Me(l) + ":";
      const u = r(l);
      return {
        driver: u.driver,
        base: u.base
      };
    },
    getMounts(l = "", u = {}) {
      return l = Me(l), n(l, u.parents).map((f) => ({
        driver: f.driver,
        base: f.mountpoint
      }));
    },
    // Aliases
    keys: (l, u = {}) => c.getKeys(l, u),
    get: (l, u = {}) => c.getItem(l, u),
    set: (l, u, h = {}) => c.setItem(l, u, h),
    has: (l, u = {}) => c.hasItem(l, u),
    del: (l, u = {}) => c.removeItem(l, u),
    remove: (l, u = {}) => c.removeItem(l, u)
  };
  return c;
}
function ac(t, e, r) {
  return t.watch ? t.watch((n, s) => e(n, r + s)) : () => {
  };
}
async function cc(t) {
  typeof t.dispose == "function" && await we(t.dispose);
}
function zr(t) {
  return new Promise((e, r) => {
    t.oncomplete = t.onsuccess = () => e(t.result), t.onabort = t.onerror = () => r(t.error);
  });
}
function Su(t, e) {
  let r;
  const n = () => {
    if (r)
      return r;
    const s = indexedDB.open(t);
    return s.onupgradeneeded = () => s.result.createObjectStore(e), r = zr(s), r.then((i) => {
      i.onclose = () => r = void 0;
    }, () => {
    }), r;
  };
  return (s, i) => n().then((o) => i(o.transaction(e, s).objectStore(e)));
}
let Bi;
function Xn() {
  return Bi || (Bi = Su("keyval-store", "keyval")), Bi;
}
function lc(t, e = Xn()) {
  return e("readonly", (r) => zr(r.get(t)));
}
function Vp(t, e, r = Xn()) {
  return r("readwrite", (n) => (n.put(e, t), zr(n.transaction)));
}
function Wp(t, e = Xn()) {
  return e("readwrite", (r) => (r.delete(t), zr(r.transaction)));
}
function Gp(t = Xn()) {
  return t("readwrite", (e) => (e.clear(), zr(e.transaction)));
}
function Yp(t, e) {
  return t.openCursor().onsuccess = function() {
    this.result && (e(this.result), this.result.continue());
  }, zr(t.transaction);
}
function Zp(t = Xn()) {
  return t("readonly", (e) => {
    if (e.getAllKeys)
      return zr(e.getAllKeys());
    const r = [];
    return Yp(e, (n) => r.push(n.key)).then(() => r);
  });
}
const Xp = (t) => JSON.stringify(t, (e, r) => typeof r == "bigint" ? r.toString() + "n" : r), Jp = (t) => {
  const e = /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g, r = t.replace(e, '$1"$2n"$3');
  return JSON.parse(r, (n, s) => typeof s == "string" && s.match(/^\d+n$/) ? BigInt(s.substring(0, s.length - 1)) : s);
};
function ln(t) {
  if (typeof t != "string")
    throw new Error(`Cannot safe json parse value of type ${typeof t}`);
  try {
    return Jp(t);
  } catch {
    return t;
  }
}
function Jn(t) {
  return typeof t == "string" ? t : Xp(t) || "";
}
const Qp = "idb-keyval";
var eg = (t = {}) => {
  const e = t.base && t.base.length > 0 ? `${t.base}:` : "", r = (s) => e + s;
  let n;
  return t.dbName && t.storeName && (n = Su(t.dbName, t.storeName)), { name: Qp, options: t, async hasItem(s) {
    return !(typeof await lc(r(s), n) > "u");
  }, async getItem(s) {
    return await lc(r(s), n) ?? null;
  }, setItem(s, i) {
    return Vp(r(s), i, n);
  }, removeItem(s) {
    return Wp(r(s), n);
  }, getKeys() {
    return Zp(n);
  }, clear() {
    return Gp(n);
  } };
};
const tg = "WALLET_CONNECT_V2_INDEXED_DB", rg = "keyvaluestorage";
let ng = class {
  constructor() {
    this.indexedDb = Kp({ driver: eg({ dbName: tg, storeName: rg }) });
  }
  async getKeys() {
    return this.indexedDb.getKeys();
  }
  async getEntries() {
    return (await this.indexedDb.getItems(await this.indexedDb.getKeys())).map((e) => [e.key, e.value]);
  }
  async getItem(e) {
    const r = await this.indexedDb.getItem(e);
    if (r !== null) return r;
  }
  async setItem(e, r) {
    await this.indexedDb.setItem(e, Jn(r));
  }
  async removeItem(e) {
    await this.indexedDb.removeItem(e);
  }
};
var Ri = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Bs = { exports: {} };
(function() {
  let t;
  function e() {
  }
  t = e, t.prototype.getItem = function(r) {
    return this.hasOwnProperty(r) ? String(this[r]) : null;
  }, t.prototype.setItem = function(r, n) {
    this[r] = String(n);
  }, t.prototype.removeItem = function(r) {
    delete this[r];
  }, t.prototype.clear = function() {
    const r = this;
    Object.keys(r).forEach(function(n) {
      r[n] = void 0, delete r[n];
    });
  }, t.prototype.key = function(r) {
    return r = r || 0, Object.keys(this)[r];
  }, t.prototype.__defineGetter__("length", function() {
    return Object.keys(this).length;
  }), typeof Ri < "u" && Ri.localStorage ? Bs.exports = Ri.localStorage : typeof window < "u" && window.localStorage ? Bs.exports = window.localStorage : Bs.exports = new e();
})();
function sg(t) {
  var e;
  return [t[0], ln((e = t[1]) != null ? e : "")];
}
let ig = class {
  constructor() {
    this.localStorage = Bs.exports;
  }
  async getKeys() {
    return Object.keys(this.localStorage);
  }
  async getEntries() {
    return Object.entries(this.localStorage).map(sg);
  }
  async getItem(e) {
    const r = this.localStorage.getItem(e);
    if (r !== null) return ln(r);
  }
  async setItem(e, r) {
    this.localStorage.setItem(e, Jn(r));
  }
  async removeItem(e) {
    this.localStorage.removeItem(e);
  }
};
const og = "wc_storage_version", uc = 1, ag = async (t, e, r) => {
  const n = og, s = await e.getItem(n);
  if (s && s >= uc) {
    r(e);
    return;
  }
  const i = await t.getKeys();
  if (!i.length) {
    r(e);
    return;
  }
  const o = [];
  for (; i.length; ) {
    const a = i.shift();
    if (!a) continue;
    const c = a.toLowerCase();
    if (c.includes("wc@") || c.includes("walletconnect") || c.includes("wc_") || c.includes("wallet_connect")) {
      const l = await t.getItem(a);
      await e.setItem(a, l), o.push(a);
    }
  }
  await e.setItem(n, uc), r(e), cg(t, o);
}, cg = async (t, e) => {
  e.length && e.forEach(async (r) => {
    await t.removeItem(r);
  });
};
let lg = class {
  constructor() {
    this.initialized = !1, this.setInitialized = (r) => {
      this.storage = r, this.initialized = !0;
    };
    const e = new ig();
    this.storage = e;
    try {
      const r = new ng();
      ag(e, r, this.setInitialized);
    } catch {
      this.initialized = !0;
    }
  }
  async getKeys() {
    return await this.initialize(), this.storage.getKeys();
  }
  async getEntries() {
    return await this.initialize(), this.storage.getEntries();
  }
  async getItem(e) {
    return await this.initialize(), this.storage.getItem(e);
  }
  async setItem(e, r) {
    return await this.initialize(), this.storage.setItem(e, r);
  }
  async removeItem(e) {
    return await this.initialize(), this.storage.removeItem(e);
  }
  async initialize() {
    this.initialized || await new Promise((e) => {
      const r = setInterval(() => {
        this.initialized && (clearInterval(r), e());
      }, 20);
    });
  }
};
var xt = { exports: {} };
function ug(t) {
  try {
    return JSON.stringify(t);
  } catch {
    return '"[Circular]"';
  }
}
var hg = fg;
function fg(t, e, r) {
  var n = r && r.stringify || ug, s = 1;
  if (typeof t == "object" && t !== null) {
    var i = e.length + s;
    if (i === 1) return t;
    var o = new Array(i);
    o[0] = n(t);
    for (var a = 1; a < i; a++) o[a] = n(e[a]);
    return o.join(" ");
  }
  if (typeof t != "string") return t;
  var c = e.length;
  if (c === 0) return t;
  for (var l = "", u = 1 - s, h = -1, f = t && t.length || 0, d = 0; d < f; ) {
    if (t.charCodeAt(d) === 37 && d + 1 < f) {
      switch (h = h > -1 ? h : 0, t.charCodeAt(d + 1)) {
        case 100:
        case 102:
          if (u >= c || e[u] == null) break;
          h < d && (l += t.slice(h, d)), l += Number(e[u]), h = d + 2, d++;
          break;
        case 105:
          if (u >= c || e[u] == null) break;
          h < d && (l += t.slice(h, d)), l += Math.floor(Number(e[u])), h = d + 2, d++;
          break;
        case 79:
        case 111:
        case 106:
          if (u >= c || e[u] === void 0) break;
          h < d && (l += t.slice(h, d));
          var p = typeof e[u];
          if (p === "string") {
            l += "'" + e[u] + "'", h = d + 2, d++;
            break;
          }
          if (p === "function") {
            l += e[u].name || "<anonymous>", h = d + 2, d++;
            break;
          }
          l += n(e[u]), h = d + 2, d++;
          break;
        case 115:
          if (u >= c) break;
          h < d && (l += t.slice(h, d)), l += String(e[u]), h = d + 2, d++;
          break;
        case 37:
          h < d && (l += t.slice(h, d)), l += "%", h = d + 2, d++, u--;
          break;
      }
      ++u;
    }
    ++d;
  }
  return h === -1 ? t : (h < f && (l += t.slice(h)), l);
}
const hc = hg;
xt.exports = Mt;
const zn = Ag().console || {}, dg = { mapHttpRequest: hs, mapHttpResponse: hs, wrapRequestSerializer: Pi, wrapResponseSerializer: Pi, wrapErrorSerializer: Pi, req: hs, res: hs, err: dc, errWithCause: dc };
function lr(t, e) {
  return t === "silent" ? 1 / 0 : e.levels.values[t];
}
const Qo = Symbol("pino.logFuncs"), xo = Symbol("pino.hierarchy"), pg = { error: "log", fatal: "error", warn: "error", info: "log", debug: "log", trace: "log" };
function fc(t, e) {
  const r = { logger: e, parent: t[xo] };
  e[xo] = r;
}
function gg(t, e, r) {
  const n = {};
  e.forEach((s) => {
    n[s] = r[s] ? r[s] : zn[s] || zn[pg[s] || "log"] || rn;
  }), t[Qo] = n;
}
function yg(t, e) {
  return Array.isArray(t) ? t.filter(function(r) {
    return r !== "!stdSerializers.err";
  }) : t === !0 ? Object.keys(e) : !1;
}
function Mt(t) {
  t = t || {}, t.browser = t.browser || {};
  const e = t.browser.transmit;
  if (e && typeof e.send != "function") throw Error("pino: transmit option must have a send function");
  const r = t.browser.write || zn;
  t.browser.write && (t.browser.asObject = !0);
  const n = t.serializers || {}, s = yg(t.browser.serialize, n);
  let i = t.browser.serialize;
  Array.isArray(t.browser.serialize) && t.browser.serialize.indexOf("!stdSerializers.err") > -1 && (i = !1);
  const o = Object.keys(t.customLevels || {}), a = ["error", "fatal", "warn", "info", "debug", "trace"].concat(o);
  typeof r == "function" && a.forEach(function(g) {
    r[g] = r;
  }), (t.enabled === !1 || t.browser.disabled) && (t.level = "silent");
  const c = t.level || "info", l = Object.create(r);
  l.log || (l.log = rn), gg(l, a, r), fc({}, l), Object.defineProperty(l, "levelVal", { get: h }), Object.defineProperty(l, "level", { get: f, set: d });
  const u = { transmit: e, serialize: s, asObject: t.browser.asObject, asObjectBindingsOnly: t.browser.asObjectBindingsOnly, formatters: t.browser.formatters, levels: a, timestamp: Sg(t), messageKey: t.messageKey || "msg", onChild: t.onChild || rn };
  l.levels = wg(t), l.level = c, l.isLevelEnabled = function(g) {
    return this.levels.values[g] ? this.levels.values[g] >= this.levels.values[this.level] : !1;
  }, l.setMaxListeners = l.getMaxListeners = l.emit = l.addListener = l.on = l.prependListener = l.once = l.prependOnceListener = l.removeListener = l.removeAllListeners = l.listeners = l.listenerCount = l.eventNames = l.write = l.flush = rn, l.serializers = n, l._serialize = s, l._stdErrSerialize = i, l.child = function(...g) {
    return p.call(this, u, ...g);
  }, e && (l._logEvent = _o());
  function h() {
    return lr(this.level, this);
  }
  function f() {
    return this._level;
  }
  function d(g) {
    if (g !== "silent" && !this.levels.values[g]) throw Error("unknown level " + g);
    this._level = g, Er(this, u, l, "error"), Er(this, u, l, "fatal"), Er(this, u, l, "warn"), Er(this, u, l, "info"), Er(this, u, l, "debug"), Er(this, u, l, "trace"), o.forEach((m) => {
      Er(this, u, l, m);
    });
  }
  function p(g, m, _) {
    if (!m) throw new Error("missing bindings for child Pino");
    _ = _ || {}, s && m.serializers && (_.serializers = m.serializers);
    const R = _.serializers;
    if (s && R) {
      var b = Object.assign({}, n, R), S = t.browser.serialize === !0 ? Object.keys(b) : s;
      delete m.serializers, ea([m], S, b, this._stdErrSerialize);
    }
    function $(C) {
      this._childLevel = (C._childLevel | 0) + 1, this.bindings = m, b && (this.serializers = b, this._serialize = S), e && (this._logEvent = _o([].concat(C._logEvent.bindings, m)));
    }
    $.prototype = this;
    const B = new $(this);
    return fc(this, B), B.child = function(...C) {
      return p.call(this, g, ...C);
    }, B.level = _.level || this.level, g.onChild(B), B;
  }
  return l;
}
function wg(t) {
  const e = t.customLevels || {}, r = Object.assign({}, Mt.levels.values, e), n = Object.assign({}, Mt.levels.labels, mg(e));
  return { values: r, labels: n };
}
function mg(t) {
  const e = {};
  return Object.keys(t).forEach(function(r) {
    e[t[r]] = r;
  }), e;
}
Mt.levels = { values: { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 }, labels: { 10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal" } }, Mt.stdSerializers = dg, Mt.stdTimeFunctions = Object.assign({}, { nullTime: Iu, epochTime: Du, unixTime: Ig, isoTime: Dg });
function bg(t) {
  const e = [];
  t.bindings && e.push(t.bindings);
  let r = t[xo];
  for (; r.parent; ) r = r.parent, r.logger.bindings && e.push(r.logger.bindings);
  return e.reverse();
}
function Er(t, e, r, n) {
  if (Object.defineProperty(t, n, { value: lr(t.level, r) > lr(n, r) ? rn : r[Qo][n], writable: !0, enumerable: !0, configurable: !0 }), t[n] === rn) {
    if (!e.transmit) return;
    const i = e.transmit.level || t.level, o = lr(i, r);
    if (lr(n, r) < o) return;
  }
  t[n] = vg(t, e, r, n);
  const s = bg(t);
  s.length !== 0 && (t[n] = Eg(s, t[n]));
}
function Eg(t, e) {
  return function() {
    return e.apply(this, [...t, ...arguments]);
  };
}
function vg(t, e, r, n) {
  return /* @__PURE__ */ function(s) {
    return function() {
      const i = e.timestamp(), o = new Array(arguments.length), a = Object.getPrototypeOf && Object.getPrototypeOf(this) === zn ? zn : this;
      for (var c = 0; c < o.length; c++) o[c] = arguments[c];
      var l = !1;
      if (e.serialize && (ea(o, this._serialize, this.serializers, this._stdErrSerialize), l = !0), e.asObject || e.formatters ? s.call(a, ...xg(this, n, o, i, e)) : s.apply(a, o), e.transmit) {
        const u = e.transmit.level || t._level, h = lr(u, r), f = lr(n, r);
        if (f < h) return;
        _g(this, { ts: i, methodLevel: n, methodValue: f, transmitValue: r.levels.values[e.transmit.level || t._level], send: e.transmit.send, val: lr(t._level, r) }, o, l);
      }
    };
  }(t[Qo][n]);
}
function xg(t, e, r, n, s) {
  const { level: i, log: o = (h) => h } = s.formatters || {}, a = r.slice();
  let c = a[0];
  const l = {};
  let u = (t._childLevel | 0) + 1;
  if (u < 1 && (u = 1), n && (l.time = n), i) {
    const h = i(e, t.levels.values[e]);
    Object.assign(l, h);
  } else l.level = t.levels.values[e];
  if (s.asObjectBindingsOnly) {
    if (c !== null && typeof c == "object") for (; u-- && typeof a[0] == "object"; ) Object.assign(l, a.shift());
    return [o(l), ...a];
  } else {
    if (c !== null && typeof c == "object") {
      for (; u-- && typeof a[0] == "object"; ) Object.assign(l, a.shift());
      c = a.length ? hc(a.shift(), a) : void 0;
    } else typeof c == "string" && (c = hc(a.shift(), a));
    return c !== void 0 && (l[s.messageKey] = c), [o(l)];
  }
}
function ea(t, e, r, n) {
  for (const s in t) if (n && t[s] instanceof Error) t[s] = Mt.stdSerializers.err(t[s]);
  else if (typeof t[s] == "object" && !Array.isArray(t[s]) && e) for (const i in t[s]) e.indexOf(i) > -1 && i in r && (t[s][i] = r[i](t[s][i]));
}
function _g(t, e, r, n = !1) {
  const s = e.send, i = e.ts, o = e.methodLevel, a = e.methodValue, c = e.val, l = t._logEvent.bindings;
  n || ea(r, t._serialize || Object.keys(t.serializers), t.serializers, t._stdErrSerialize === void 0 ? !0 : t._stdErrSerialize), t._logEvent.ts = i, t._logEvent.messages = r.filter(function(u) {
    return l.indexOf(u) === -1;
  }), t._logEvent.level.label = o, t._logEvent.level.value = a, s(o, t._logEvent, c), t._logEvent = _o(l);
}
function _o(t) {
  return { ts: 0, messages: [], bindings: t || [], level: { label: "", value: 0 } };
}
function dc(t) {
  const e = { type: t.constructor.name, msg: t.message, stack: t.stack };
  for (const r in t) e[r] === void 0 && (e[r] = t[r]);
  return e;
}
function Sg(t) {
  return typeof t.timestamp == "function" ? t.timestamp : t.timestamp === !1 ? Iu : Du;
}
function hs() {
  return {};
}
function Pi(t) {
  return t;
}
function rn() {
}
function Iu() {
  return !1;
}
function Du() {
  return Date.now();
}
function Ig() {
  return Math.round(Date.now() / 1e3);
}
function Dg() {
  return new Date(Date.now()).toISOString();
}
function Ag() {
  function t(e) {
    return typeof e < "u" && e;
  }
  try {
    return typeof globalThis < "u" || Object.defineProperty(Object.prototype, "globalThis", { get: function() {
      return delete Object.prototype.globalThis, this.globalThis = this;
    }, configurable: !0 }), globalThis;
  } catch {
    return t(self) || t(window) || t(this) || {};
  }
}
xt.exports.default = Mt;
xt.exports.pino = Mt;
const Og = { level: "info" }, ai = "custom_context", ta = 1e3 * 1024;
var $g = Object.defineProperty, Tg = (t, e, r) => e in t ? $g(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, ar = (t, e, r) => Tg(t, typeof e != "symbol" ? e + "" : e, r);
let Bg = class {
  constructor(e) {
    ar(this, "nodeValue"), ar(this, "sizeInBytes"), ar(this, "next"), this.nodeValue = e, this.sizeInBytes = new TextEncoder().encode(this.nodeValue).length, this.next = null;
  }
  get value() {
    return this.nodeValue;
  }
  get size() {
    return this.sizeInBytes;
  }
}, pc = class {
  constructor(e) {
    ar(this, "lengthInNodes"), ar(this, "sizeInBytes"), ar(this, "head"), ar(this, "tail"), ar(this, "maxSizeInBytes"), this.head = null, this.tail = null, this.lengthInNodes = 0, this.maxSizeInBytes = e, this.sizeInBytes = 0;
  }
  append(e) {
    const r = new Bg(e);
    if (r.size > this.maxSizeInBytes) throw new Error(`[LinkedList] Value too big to insert into list: ${e} with size ${r.size}`);
    for (; this.size + r.size > this.maxSizeInBytes; ) this.shift();
    this.head ? (this.tail && (this.tail.next = r), this.tail = r) : (this.head = r, this.tail = r), this.lengthInNodes++, this.sizeInBytes += r.size;
  }
  shift() {
    if (!this.head) return;
    const e = this.head;
    this.head = this.head.next, this.head || (this.tail = null), this.lengthInNodes--, this.sizeInBytes -= e.size;
  }
  toArray() {
    const e = [];
    let r = this.head;
    for (; r !== null; ) e.push(r.value), r = r.next;
    return e;
  }
  get length() {
    return this.lengthInNodes;
  }
  get size() {
    return this.sizeInBytes;
  }
  toOrderedArray() {
    return Array.from(this);
  }
  [Symbol.iterator]() {
    let e = this.head;
    return { next: () => {
      if (!e) return { done: !0, value: null };
      const r = e.value;
      return e = e.next, { done: !1, value: r };
    } };
  }
};
const Rg = (t) => JSON.stringify(t, (e, r) => typeof r == "bigint" ? r.toString() + "n" : r);
function gc(t) {
  return typeof t == "string" ? t : Rg(t) || "";
}
var Pg = Object.defineProperty, Cg = (t, e, r) => e in t ? Pg(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, fs = (t, e, r) => Cg(t, typeof e != "symbol" ? e + "" : e, r);
let Au = class {
  constructor(e, r = ta) {
    fs(this, "logs"), fs(this, "level"), fs(this, "levelValue"), fs(this, "MAX_LOG_SIZE_IN_BYTES"), this.level = e ?? "error", this.levelValue = xt.exports.levels.values[this.level], this.MAX_LOG_SIZE_IN_BYTES = r, this.logs = new pc(this.MAX_LOG_SIZE_IN_BYTES);
  }
  forwardToConsole(e, r) {
    r === xt.exports.levels.values.error ? console.error(e) : r === xt.exports.levels.values.warn ? console.warn(e) : r === xt.exports.levels.values.debug ? console.debug(e) : r === xt.exports.levels.values.trace ? console.trace(e) : console.log(e);
  }
  appendToLogs(e) {
    this.logs.append(gc({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), log: e }));
    const r = typeof e == "string" ? JSON.parse(e).level : e.level;
    r >= this.levelValue && this.forwardToConsole(e, r);
  }
  getLogs() {
    return this.logs;
  }
  clearLogs() {
    this.logs = new pc(this.MAX_LOG_SIZE_IN_BYTES);
  }
  getLogArray() {
    return Array.from(this.logs);
  }
  logsToBlob(e) {
    const r = this.getLogArray();
    return r.push(gc({ extraMetadata: e })), new Blob(r, { type: "application/json" });
  }
};
var Ng = Object.defineProperty, Ug = (t, e, r) => e in t ? Ng(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Lg = (t, e, r) => Ug(t, e + "", r);
let kg = class {
  constructor(e, r = ta) {
    Lg(this, "baseChunkLogger"), this.baseChunkLogger = new Au(e, r);
  }
  write(e) {
    this.baseChunkLogger.appendToLogs(e);
  }
  getLogs() {
    return this.baseChunkLogger.getLogs();
  }
  clearLogs() {
    this.baseChunkLogger.clearLogs();
  }
  getLogArray() {
    return this.baseChunkLogger.getLogArray();
  }
  logsToBlob(e) {
    return this.baseChunkLogger.logsToBlob(e);
  }
  downloadLogsBlobInBrowser(e) {
    const r = URL.createObjectURL(this.logsToBlob(e)), n = document.createElement("a");
    n.href = r, n.download = `walletconnect-logs-${(/* @__PURE__ */ new Date()).toISOString()}.txt`, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(r);
  }
};
var Mg = Object.defineProperty, Fg = (t, e, r) => e in t ? Mg(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, qg = (t, e, r) => Fg(t, e + "", r);
let zg = class {
  constructor(e, r = ta) {
    qg(this, "baseChunkLogger"), this.baseChunkLogger = new Au(e, r);
  }
  write(e) {
    this.baseChunkLogger.appendToLogs(e);
  }
  getLogs() {
    return this.baseChunkLogger.getLogs();
  }
  clearLogs() {
    this.baseChunkLogger.clearLogs();
  }
  getLogArray() {
    return this.baseChunkLogger.getLogArray();
  }
  logsToBlob(e) {
    return this.baseChunkLogger.logsToBlob(e);
  }
};
var jg = Object.defineProperty, Hg = Object.defineProperties, Kg = Object.getOwnPropertyDescriptors, yc = Object.getOwnPropertySymbols, Vg = Object.prototype.hasOwnProperty, Wg = Object.prototype.propertyIsEnumerable, wc = (t, e, r) => e in t ? jg(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, hr = (t, e) => {
  for (var r in e || (e = {})) Vg.call(e, r) && wc(t, r, e[r]);
  if (yc) for (var r of yc(e)) Wg.call(e, r) && wc(t, r, e[r]);
  return t;
}, fr = (t, e) => Hg(t, Kg(e));
function Gg(t) {
  return fr(hr({}, t), { level: (t == null ? void 0 : t.level) || Og.level });
}
function Yg(t, e, r = ai) {
  return t[r] = e, t;
}
function Ke(t, e = ai) {
  return t[e] || "";
}
function Zg(t, e, r = ai) {
  const n = Ke(t, r);
  return n.trim() ? `${n}/${e}` : e;
}
function Ze(t, e, r = ai) {
  const n = Zg(t, e, r), s = t.child({ context: n });
  return Yg(s, n, r);
}
function Xg(t) {
  var e, r;
  const n = new kg((e = t.opts) == null ? void 0 : e.level, t.maxSizeInBytes);
  return { logger: xt.exports(fr(hr({}, t.opts), { level: "trace", browser: fr(hr({}, (r = t.opts) == null ? void 0 : r.browser), { write: (s) => n.write(s) }) })), chunkLoggerController: n };
}
function Jg(t) {
  var e, r;
  const n = new zg((e = t.opts) == null ? void 0 : e.level, t.maxSizeInBytes);
  return { logger: xt.exports(fr(hr({}, t.opts), { level: "trace", browser: fr(hr({}, (r = t.opts) == null ? void 0 : r.browser), { write: (s) => n.write(s) }) }), n), chunkLoggerController: n };
}
function Ou(t) {
  var e;
  if (typeof t.loggerOverride < "u" && typeof t.loggerOverride != "string") return { logger: t.loggerOverride, chunkLoggerController: null };
  const r = fr(hr({}, t.opts), { level: typeof t.loggerOverride == "string" ? t.loggerOverride : (e = t.opts) == null ? void 0 : e.level });
  return typeof window < "u" ? Xg(fr(hr({}, t), { opts: r })) : Jg(fr(hr({}, t), { opts: r }));
}
let Qg = class extends Fr {
  constructor(e) {
    super(), this.opts = e, this.protocol = "wc", this.version = 2;
  }
}, e0 = class extends Fr {
  constructor(e, r) {
    super(), this.core = e, this.logger = r, this.records = /* @__PURE__ */ new Map();
  }
};
class t0 {
  constructor(e, r) {
    this.logger = e, this.core = r;
  }
}
let r0 = class extends Fr {
  constructor(e, r) {
    super(), this.relayer = e, this.logger = r;
  }
};
class n0 extends Fr {
  constructor(e) {
    super();
  }
}
let s0 = class {
  constructor(e, r, n, s) {
    this.core = e, this.logger = r, this.name = n;
  }
}, i0 = class extends Fr {
  constructor(e, r) {
    super(), this.relayer = e, this.logger = r;
  }
}, o0 = class extends Fr {
  constructor(e, r) {
    super(), this.core = e, this.logger = r;
  }
}, a0 = class {
  constructor(e, r, n) {
    this.core = e, this.logger = r, this.store = n;
  }
}, c0 = class {
  constructor(e, r) {
    this.projectId = e, this.logger = r;
  }
}, l0 = class {
  constructor(e, r, n) {
    this.core = e, this.logger = r, this.telemetryEnabled = n;
  }
}, u0 = class {
  constructor(e) {
    this.opts = e, this.protocol = "wc", this.version = 2;
  }
}, h0 = class {
  constructor(e) {
    this.client = e;
  }
};
function f0(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function $u(t, ...e) {
  if (!f0(t)) throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(t.length)) throw new Error("Uint8Array expected of length " + e + ", got length=" + t.length);
}
function mc(t, e = !0) {
  if (t.destroyed) throw new Error("Hash instance has been destroyed");
  if (e && t.finished) throw new Error("Hash#digest() has already been called");
}
function d0(t, e) {
  $u(t);
  const r = e.outputLen;
  if (t.length < r) throw new Error("digestInto() expects output buffer of length at least " + r);
}
const Gr = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Ci = (t) => new DataView(t.buffer, t.byteOffset, t.byteLength);
function p0(t) {
  if (typeof t != "string") throw new Error("utf8ToBytes expected string, got " + typeof t);
  return new Uint8Array(new TextEncoder().encode(t));
}
function Tu(t) {
  return typeof t == "string" && (t = p0(t)), $u(t), t;
}
class g0 {
  clone() {
    return this._cloneInto();
  }
}
function y0(t) {
  const e = (n) => t().update(Tu(n)).digest(), r = t();
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = () => t(), e;
}
function Bu(t = 32) {
  if (Gr && typeof Gr.getRandomValues == "function") return Gr.getRandomValues(new Uint8Array(t));
  if (Gr && typeof Gr.randomBytes == "function") return Gr.randomBytes(t);
  throw new Error("crypto.getRandomValues must be defined");
}
function w0(t, e, r, n) {
  if (typeof t.setBigUint64 == "function") return t.setBigUint64(e, r, n);
  const s = BigInt(32), i = BigInt(4294967295), o = Number(r >> s & i), a = Number(r & i), c = n ? 4 : 0, l = n ? 0 : 4;
  t.setUint32(e + c, o, n), t.setUint32(e + l, a, n);
}
class m0 extends g0 {
  constructor(e, r, n, s) {
    super(), this.blockLen = e, this.outputLen = r, this.padOffset = n, this.isLE = s, this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.buffer = new Uint8Array(e), this.view = Ci(this.buffer);
  }
  update(e) {
    mc(this);
    const { view: r, buffer: n, blockLen: s } = this;
    e = Tu(e);
    const i = e.length;
    for (let o = 0; o < i; ) {
      const a = Math.min(s - this.pos, i - o);
      if (a === s) {
        const c = Ci(e);
        for (; s <= i - o; o += s) this.process(c, o);
        continue;
      }
      n.set(e.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += e.length, this.roundClean(), this;
  }
  digestInto(e) {
    mc(this), d0(e, this), this.finished = !0;
    const { buffer: r, view: n, blockLen: s, isLE: i } = this;
    let { pos: o } = this;
    r[o++] = 128, this.buffer.subarray(o).fill(0), this.padOffset > s - o && (this.process(n, 0), o = 0);
    for (let h = o; h < s; h++) r[h] = 0;
    w0(n, s - 8, BigInt(this.length * 8), i), this.process(n, 0);
    const a = Ci(e), c = this.outputLen;
    if (c % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
    const l = c / 4, u = this.get();
    if (l > u.length) throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < l; h++) a.setUint32(4 * h, u[h], i);
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    e || (e = new this.constructor()), e.set(...this.get());
    const { blockLen: r, buffer: n, length: s, finished: i, destroyed: o, pos: a } = this;
    return e.length = s, e.pos = a, e.finished = i, e.destroyed = o, s % r && e.buffer.set(n), e;
  }
}
const ds = BigInt(2 ** 32 - 1), So = BigInt(32);
function Ru(t, e = !1) {
  return e ? { h: Number(t & ds), l: Number(t >> So & ds) } : { h: Number(t >> So & ds) | 0, l: Number(t & ds) | 0 };
}
function b0(t, e = !1) {
  let r = new Uint32Array(t.length), n = new Uint32Array(t.length);
  for (let s = 0; s < t.length; s++) {
    const { h: i, l: o } = Ru(t[s], e);
    [r[s], n[s]] = [i, o];
  }
  return [r, n];
}
const E0 = (t, e) => BigInt(t >>> 0) << So | BigInt(e >>> 0), v0 = (t, e, r) => t >>> r, x0 = (t, e, r) => t << 32 - r | e >>> r, _0 = (t, e, r) => t >>> r | e << 32 - r, S0 = (t, e, r) => t << 32 - r | e >>> r, I0 = (t, e, r) => t << 64 - r | e >>> r - 32, D0 = (t, e, r) => t >>> r - 32 | e << 64 - r, A0 = (t, e) => e, O0 = (t, e) => t, $0 = (t, e, r) => t << r | e >>> 32 - r, T0 = (t, e, r) => e << r | t >>> 32 - r, B0 = (t, e, r) => e << r - 32 | t >>> 64 - r, R0 = (t, e, r) => t << r - 32 | e >>> 64 - r;
function P0(t, e, r, n) {
  const s = (e >>> 0) + (n >>> 0);
  return { h: t + r + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const C0 = (t, e, r) => (t >>> 0) + (e >>> 0) + (r >>> 0), N0 = (t, e, r, n) => e + r + n + (t / 2 ** 32 | 0) | 0, U0 = (t, e, r, n) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0), L0 = (t, e, r, n, s) => e + r + n + s + (t / 2 ** 32 | 0) | 0, k0 = (t, e, r, n, s) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0) + (s >>> 0), M0 = (t, e, r, n, s, i) => e + r + n + s + i + (t / 2 ** 32 | 0) | 0, X = { fromBig: Ru, split: b0, toBig: E0, shrSH: v0, shrSL: x0, rotrSH: _0, rotrSL: S0, rotrBH: I0, rotrBL: D0, rotr32H: A0, rotr32L: O0, rotlSH: $0, rotlSL: T0, rotlBH: B0, rotlBL: R0, add: P0, add3L: C0, add3H: N0, add4L: U0, add4H: L0, add5H: M0, add5L: k0 }, [F0, q0] = X.split(["0x428a2f98d728ae22", "0x7137449123ef65cd", "0xb5c0fbcfec4d3b2f", "0xe9b5dba58189dbbc", "0x3956c25bf348b538", "0x59f111f1b605d019", "0x923f82a4af194f9b", "0xab1c5ed5da6d8118", "0xd807aa98a3030242", "0x12835b0145706fbe", "0x243185be4ee4b28c", "0x550c7dc3d5ffb4e2", "0x72be5d74f27b896f", "0x80deb1fe3b1696b1", "0x9bdc06a725c71235", "0xc19bf174cf692694", "0xe49b69c19ef14ad2", "0xefbe4786384f25e3", "0x0fc19dc68b8cd5b5", "0x240ca1cc77ac9c65", "0x2de92c6f592b0275", "0x4a7484aa6ea6e483", "0x5cb0a9dcbd41fbd4", "0x76f988da831153b5", "0x983e5152ee66dfab", "0xa831c66d2db43210", "0xb00327c898fb213f", "0xbf597fc7beef0ee4", "0xc6e00bf33da88fc2", "0xd5a79147930aa725", "0x06ca6351e003826f", "0x142929670a0e6e70", "0x27b70a8546d22ffc", "0x2e1b21385c26c926", "0x4d2c6dfc5ac42aed", "0x53380d139d95b3df", "0x650a73548baf63de", "0x766a0abb3c77b2a8", "0x81c2c92e47edaee6", "0x92722c851482353b", "0xa2bfe8a14cf10364", "0xa81a664bbc423001", "0xc24b8b70d0f89791", "0xc76c51a30654be30", "0xd192e819d6ef5218", "0xd69906245565a910", "0xf40e35855771202a", "0x106aa07032bbd1b8", "0x19a4c116b8d2d0c8", "0x1e376c085141ab53", "0x2748774cdf8eeb99", "0x34b0bcb5e19b48a8", "0x391c0cb3c5c95a63", "0x4ed8aa4ae3418acb", "0x5b9cca4f7763e373", "0x682e6ff3d6b2b8a3", "0x748f82ee5defb2fc", "0x78a5636f43172f60", "0x84c87814a1f0ab72", "0x8cc702081a6439ec", "0x90befffa23631e28", "0xa4506cebde82bde9", "0xbef9a3f7b2c67915", "0xc67178f2e372532b", "0xca273eceea26619c", "0xd186b8c721c0c207", "0xeada7dd6cde0eb1e", "0xf57d4f7fee6ed178", "0x06f067aa72176fba", "0x0a637dc5a2c898a6", "0x113f9804bef90dae", "0x1b710b35131c471b", "0x28db77f523047d84", "0x32caab7b40c72493", "0x3c9ebe0a15c9bebc", "0x431d67c49c100d4c", "0x4cc5d4becb3e42b6", "0x597f299cfc657e2a", "0x5fcb6fab3ad6faec", "0x6c44198c4a475817"].map((t) => BigInt(t))), jt = new Uint32Array(80), Ht = new Uint32Array(80);
let z0 = class extends m0 {
  constructor() {
    super(128, 64, 16, !1), this.Ah = 1779033703, this.Al = -205731576, this.Bh = -1150833019, this.Bl = -2067093701, this.Ch = 1013904242, this.Cl = -23791573, this.Dh = -1521486534, this.Dl = 1595750129, this.Eh = 1359893119, this.El = -1377402159, this.Fh = -1694144372, this.Fl = 725511199, this.Gh = 528734635, this.Gl = -79577749, this.Hh = 1541459225, this.Hl = 327033209;
  }
  get() {
    const { Ah: e, Al: r, Bh: n, Bl: s, Ch: i, Cl: o, Dh: a, Dl: c, Eh: l, El: u, Fh: h, Fl: f, Gh: d, Gl: p, Hh: g, Hl: m } = this;
    return [e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m];
  }
  set(e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m) {
    this.Ah = e | 0, this.Al = r | 0, this.Bh = n | 0, this.Bl = s | 0, this.Ch = i | 0, this.Cl = o | 0, this.Dh = a | 0, this.Dl = c | 0, this.Eh = l | 0, this.El = u | 0, this.Fh = h | 0, this.Fl = f | 0, this.Gh = d | 0, this.Gl = p | 0, this.Hh = g | 0, this.Hl = m | 0;
  }
  process(e, r) {
    for (let b = 0; b < 16; b++, r += 4) jt[b] = e.getUint32(r), Ht[b] = e.getUint32(r += 4);
    for (let b = 16; b < 80; b++) {
      const S = jt[b - 15] | 0, $ = Ht[b - 15] | 0, B = X.rotrSH(S, $, 1) ^ X.rotrSH(S, $, 8) ^ X.shrSH(S, $, 7), C = X.rotrSL(S, $, 1) ^ X.rotrSL(S, $, 8) ^ X.shrSL(S, $, 7), P = jt[b - 2] | 0, O = Ht[b - 2] | 0, U = X.rotrSH(P, O, 19) ^ X.rotrBH(P, O, 61) ^ X.shrSH(P, O, 6), k = X.rotrSL(P, O, 19) ^ X.rotrBL(P, O, 61) ^ X.shrSL(P, O, 6), N = X.add4L(C, k, Ht[b - 7], Ht[b - 16]), v = X.add4H(N, B, U, jt[b - 7], jt[b - 16]);
      jt[b] = v | 0, Ht[b] = N | 0;
    }
    let { Ah: n, Al: s, Bh: i, Bl: o, Ch: a, Cl: c, Dh: l, Dl: u, Eh: h, El: f, Fh: d, Fl: p, Gh: g, Gl: m, Hh: _, Hl: R } = this;
    for (let b = 0; b < 80; b++) {
      const S = X.rotrSH(h, f, 14) ^ X.rotrSH(h, f, 18) ^ X.rotrBH(h, f, 41), $ = X.rotrSL(h, f, 14) ^ X.rotrSL(h, f, 18) ^ X.rotrBL(h, f, 41), B = h & d ^ ~h & g, C = f & p ^ ~f & m, P = X.add5L(R, $, C, q0[b], Ht[b]), O = X.add5H(P, _, S, B, F0[b], jt[b]), U = P | 0, k = X.rotrSH(n, s, 28) ^ X.rotrBH(n, s, 34) ^ X.rotrBH(n, s, 39), N = X.rotrSL(n, s, 28) ^ X.rotrBL(n, s, 34) ^ X.rotrBL(n, s, 39), v = n & i ^ n & a ^ i & a, A = s & o ^ s & c ^ o & c;
      _ = g | 0, R = m | 0, g = d | 0, m = p | 0, d = h | 0, p = f | 0, { h, l: f } = X.add(l | 0, u | 0, O | 0, U | 0), l = a | 0, u = c | 0, a = i | 0, c = o | 0, i = n | 0, o = s | 0;
      const y = X.add3L(U, N, A);
      n = X.add3H(y, O, k, v), s = y | 0;
    }
    ({ h: n, l: s } = X.add(this.Ah | 0, this.Al | 0, n | 0, s | 0)), { h: i, l: o } = X.add(this.Bh | 0, this.Bl | 0, i | 0, o | 0), { h: a, l: c } = X.add(this.Ch | 0, this.Cl | 0, a | 0, c | 0), { h: l, l: u } = X.add(this.Dh | 0, this.Dl | 0, l | 0, u | 0), { h, l: f } = X.add(this.Eh | 0, this.El | 0, h | 0, f | 0), { h: d, l: p } = X.add(this.Fh | 0, this.Fl | 0, d | 0, p | 0), { h: g, l: m } = X.add(this.Gh | 0, this.Gl | 0, g | 0, m | 0), { h: _, l: R } = X.add(this.Hh | 0, this.Hl | 0, _ | 0, R | 0), this.set(n, s, i, o, a, c, l, u, h, f, d, p, g, m, _, R);
  }
  roundClean() {
    jt.fill(0), Ht.fill(0);
  }
  destroy() {
    this.buffer.fill(0), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
const j0 = y0(() => new z0());
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const ra = BigInt(0), Pu = BigInt(1), H0 = BigInt(2);
function na(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function sa(t) {
  if (!na(t)) throw new Error("Uint8Array expected");
}
function Ni(t, e) {
  if (typeof e != "boolean") throw new Error(t + " boolean expected, got " + e);
}
const K0 = Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
function ia(t) {
  sa(t);
  let e = "";
  for (let r = 0; r < t.length; r++) e += K0[t[r]];
  return e;
}
function Cu(t) {
  if (typeof t != "string") throw new Error("hex string expected, got " + typeof t);
  return t === "" ? ra : BigInt("0x" + t);
}
const St = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function bc(t) {
  if (t >= St._0 && t <= St._9) return t - St._0;
  if (t >= St.A && t <= St.F) return t - (St.A - 10);
  if (t >= St.a && t <= St.f) return t - (St.a - 10);
}
function Nu(t) {
  if (typeof t != "string") throw new Error("hex string expected, got " + typeof t);
  const e = t.length, r = e / 2;
  if (e % 2) throw new Error("hex string expected, got unpadded hex of length " + e);
  const n = new Uint8Array(r);
  for (let s = 0, i = 0; s < r; s++, i += 2) {
    const o = bc(t.charCodeAt(i)), a = bc(t.charCodeAt(i + 1));
    if (o === void 0 || a === void 0) {
      const c = t[i] + t[i + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + i);
    }
    n[s] = o * 16 + a;
  }
  return n;
}
function V0(t) {
  return Cu(ia(t));
}
function Rs(t) {
  return sa(t), Cu(ia(Uint8Array.from(t).reverse()));
}
function Uu(t, e) {
  return Nu(t.toString(16).padStart(e * 2, "0"));
}
function Io(t, e) {
  return Uu(t, e).reverse();
}
function It(t, e, r) {
  let n;
  if (typeof e == "string") try {
    n = Nu(e);
  } catch (i) {
    throw new Error(t + " must be hex string or Uint8Array, cause: " + i);
  }
  else if (na(e)) n = Uint8Array.from(e);
  else throw new Error(t + " must be hex string or Uint8Array");
  const s = n.length;
  if (typeof r == "number" && s !== r) throw new Error(t + " of length " + r + " expected, got " + s);
  return n;
}
function Ec(...t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    sa(s), e += s.length;
  }
  const r = new Uint8Array(e);
  for (let n = 0, s = 0; n < t.length; n++) {
    const i = t[n];
    r.set(i, s), s += i.length;
  }
  return r;
}
const Ui = (t) => typeof t == "bigint" && ra <= t;
function W0(t, e, r) {
  return Ui(t) && Ui(e) && Ui(r) && e <= t && t < r;
}
function vn(t, e, r, n) {
  if (!W0(e, r, n)) throw new Error("expected valid " + t + ": " + r + " <= n < " + n + ", got " + e);
}
function G0(t) {
  let e;
  for (e = 0; t > ra; t >>= Pu, e += 1) ;
  return e;
}
const Y0 = (t) => (H0 << BigInt(t - 1)) - Pu, Z0 = { bigint: (t) => typeof t == "bigint", function: (t) => typeof t == "function", boolean: (t) => typeof t == "boolean", string: (t) => typeof t == "string", stringOrUint8Array: (t) => typeof t == "string" || na(t), isSafeInteger: (t) => Number.isSafeInteger(t), array: (t) => Array.isArray(t), field: (t, e) => e.Fp.isValid(t), hash: (t) => typeof t == "function" && Number.isSafeInteger(t.outputLen) };
function oa(t, e, r = {}) {
  const n = (s, i, o) => {
    const a = Z0[i];
    if (typeof a != "function") throw new Error("invalid validator function");
    const c = t[s];
    if (!(o && c === void 0) && !a(c, t)) throw new Error("param " + String(s) + " is invalid. Expected " + i + ", got " + c);
  };
  for (const [s, i] of Object.entries(e)) n(s, i, !1);
  for (const [s, i] of Object.entries(r)) n(s, i, !0);
  return t;
}
function vc(t) {
  const e = /* @__PURE__ */ new WeakMap();
  return (r, ...n) => {
    const s = e.get(r);
    if (s !== void 0) return s;
    const i = t(r, ...n);
    return e.set(r, i), i;
  };
}
const be = BigInt(0), le = BigInt(1), Sr = BigInt(2), X0 = BigInt(3), Do = BigInt(4), xc = BigInt(5), _c = BigInt(8);
function pe(t, e) {
  const r = t % e;
  return r >= be ? r : e + r;
}
function J0(t, e, r) {
  if (e < be) throw new Error("invalid exponent, negatives unsupported");
  if (r <= be) throw new Error("invalid modulus");
  if (r === le) return be;
  let n = le;
  for (; e > be; ) e & le && (n = n * t % r), t = t * t % r, e >>= le;
  return n;
}
function pt(t, e, r) {
  let n = t;
  for (; e-- > be; ) n *= n, n %= r;
  return n;
}
function Sc(t, e) {
  if (t === be) throw new Error("invert: expected non-zero number");
  if (e <= be) throw new Error("invert: expected positive modulus, got " + e);
  let r = pe(t, e), n = e, s = be, i = le;
  for (; r !== be; ) {
    const o = n / r, a = n % r, c = s - i * o;
    n = r, r = a, s = i, i = c;
  }
  if (n !== le) throw new Error("invert: does not exist");
  return pe(s, e);
}
function Q0(t) {
  const e = (t - le) / Sr;
  let r, n, s;
  for (r = t - le, n = 0; r % Sr === be; r /= Sr, n++) ;
  for (s = Sr; s < t && J0(s, e, t) !== t - le; s++) if (s > 1e3) throw new Error("Cannot find square root: likely non-prime P");
  if (n === 1) {
    const o = (t + le) / Do;
    return function(a, c) {
      const l = a.pow(c, o);
      if (!a.eql(a.sqr(l), c)) throw new Error("Cannot find square root");
      return l;
    };
  }
  const i = (r + le) / Sr;
  return function(o, a) {
    if (o.pow(a, e) === o.neg(o.ONE)) throw new Error("Cannot find square root");
    let c = n, l = o.pow(o.mul(o.ONE, s), r), u = o.pow(a, i), h = o.pow(a, r);
    for (; !o.eql(h, o.ONE); ) {
      if (o.eql(h, o.ZERO)) return o.ZERO;
      let f = 1;
      for (let p = o.sqr(h); f < c && !o.eql(p, o.ONE); f++) p = o.sqr(p);
      const d = o.pow(l, le << BigInt(c - f - 1));
      l = o.sqr(d), u = o.mul(u, d), h = o.mul(h, l), c = f;
    }
    return u;
  };
}
function ey(t) {
  if (t % Do === X0) {
    const e = (t + le) / Do;
    return function(r, n) {
      const s = r.pow(n, e);
      if (!r.eql(r.sqr(s), n)) throw new Error("Cannot find square root");
      return s;
    };
  }
  if (t % _c === xc) {
    const e = (t - xc) / _c;
    return function(r, n) {
      const s = r.mul(n, Sr), i = r.pow(s, e), o = r.mul(n, i), a = r.mul(r.mul(o, Sr), i), c = r.mul(o, r.sub(a, r.ONE));
      if (!r.eql(r.sqr(c), n)) throw new Error("Cannot find square root");
      return c;
    };
  }
  return Q0(t);
}
const ty = (t, e) => (pe(t, e) & le) === le, ry = ["create", "isValid", "is0", "neg", "inv", "sqrt", "sqr", "eql", "add", "sub", "mul", "pow", "div", "addN", "subN", "mulN", "sqrN"];
function ny(t) {
  const e = { ORDER: "bigint", MASK: "bigint", BYTES: "isSafeInteger", BITS: "isSafeInteger" }, r = ry.reduce((n, s) => (n[s] = "function", n), e);
  return oa(t, r);
}
function sy(t, e, r) {
  if (r < be) throw new Error("invalid exponent, negatives unsupported");
  if (r === be) return t.ONE;
  if (r === le) return e;
  let n = t.ONE, s = e;
  for (; r > be; ) r & le && (n = t.mul(n, s)), s = t.sqr(s), r >>= le;
  return n;
}
function iy(t, e) {
  const r = new Array(e.length), n = e.reduce((i, o, a) => t.is0(o) ? i : (r[a] = i, t.mul(i, o)), t.ONE), s = t.inv(n);
  return e.reduceRight((i, o, a) => t.is0(o) ? i : (r[a] = t.mul(i, r[a]), t.mul(i, o)), s), r;
}
function Lu(t, e) {
  const r = e !== void 0 ? e : t.toString(2).length, n = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: n };
}
function ku(t, e, r = !1, n = {}) {
  if (t <= be) throw new Error("invalid field: expected ORDER > 0, got " + t);
  const { nBitLength: s, nByteLength: i } = Lu(t, e);
  if (i > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let o;
  const a = Object.freeze({ ORDER: t, isLE: r, BITS: s, BYTES: i, MASK: Y0(s), ZERO: be, ONE: le, create: (c) => pe(c, t), isValid: (c) => {
    if (typeof c != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof c);
    return be <= c && c < t;
  }, is0: (c) => c === be, isOdd: (c) => (c & le) === le, neg: (c) => pe(-c, t), eql: (c, l) => c === l, sqr: (c) => pe(c * c, t), add: (c, l) => pe(c + l, t), sub: (c, l) => pe(c - l, t), mul: (c, l) => pe(c * l, t), pow: (c, l) => sy(a, c, l), div: (c, l) => pe(c * Sc(l, t), t), sqrN: (c) => c * c, addN: (c, l) => c + l, subN: (c, l) => c - l, mulN: (c, l) => c * l, inv: (c) => Sc(c, t), sqrt: n.sqrt || ((c) => (o || (o = ey(t)), o(a, c))), invertBatch: (c) => iy(a, c), cmov: (c, l, u) => u ? l : c, toBytes: (c) => r ? Io(c, i) : Uu(c, i), fromBytes: (c) => {
    if (c.length !== i) throw new Error("Field.fromBytes: expected " + i + " bytes, got " + c.length);
    return r ? Rs(c) : V0(c);
  } });
  return Object.freeze(a);
}
const Ic = BigInt(0), ps = BigInt(1);
function Li(t, e) {
  const r = e.negate();
  return t ? r : e;
}
function Mu(t, e) {
  if (!Number.isSafeInteger(t) || t <= 0 || t > e) throw new Error("invalid window size, expected [1.." + e + "], got W=" + t);
}
function ki(t, e) {
  Mu(t, e);
  const r = Math.ceil(e / t) + 1, n = 2 ** (t - 1);
  return { windows: r, windowSize: n };
}
function oy(t, e) {
  if (!Array.isArray(t)) throw new Error("array expected");
  t.forEach((r, n) => {
    if (!(r instanceof e)) throw new Error("invalid point at index " + n);
  });
}
function ay(t, e) {
  if (!Array.isArray(t)) throw new Error("array of scalars expected");
  t.forEach((r, n) => {
    if (!e.isValid(r)) throw new Error("invalid scalar at index " + n);
  });
}
const Mi = /* @__PURE__ */ new WeakMap(), Fu = /* @__PURE__ */ new WeakMap();
function Fi(t) {
  return Fu.get(t) || 1;
}
function cy(t, e) {
  return { constTimeNegate: Li, hasPrecomputes(r) {
    return Fi(r) !== 1;
  }, unsafeLadder(r, n, s = t.ZERO) {
    let i = r;
    for (; n > Ic; ) n & ps && (s = s.add(i)), i = i.double(), n >>= ps;
    return s;
  }, precomputeWindow(r, n) {
    const { windows: s, windowSize: i } = ki(n, e), o = [];
    let a = r, c = a;
    for (let l = 0; l < s; l++) {
      c = a, o.push(c);
      for (let u = 1; u < i; u++) c = c.add(a), o.push(c);
      a = c.double();
    }
    return o;
  }, wNAF(r, n, s) {
    const { windows: i, windowSize: o } = ki(r, e);
    let a = t.ZERO, c = t.BASE;
    const l = BigInt(2 ** r - 1), u = 2 ** r, h = BigInt(r);
    for (let f = 0; f < i; f++) {
      const d = f * o;
      let p = Number(s & l);
      s >>= h, p > o && (p -= u, s += ps);
      const g = d, m = d + Math.abs(p) - 1, _ = f % 2 !== 0, R = p < 0;
      p === 0 ? c = c.add(Li(_, n[g])) : a = a.add(Li(R, n[m]));
    }
    return { p: a, f: c };
  }, wNAFUnsafe(r, n, s, i = t.ZERO) {
    const { windows: o, windowSize: a } = ki(r, e), c = BigInt(2 ** r - 1), l = 2 ** r, u = BigInt(r);
    for (let h = 0; h < o; h++) {
      const f = h * a;
      if (s === Ic) break;
      let d = Number(s & c);
      if (s >>= u, d > a && (d -= l, s += ps), d === 0) continue;
      let p = n[f + Math.abs(d) - 1];
      d < 0 && (p = p.negate()), i = i.add(p);
    }
    return i;
  }, getPrecomputes(r, n, s) {
    let i = Mi.get(n);
    return i || (i = this.precomputeWindow(n, r), r !== 1 && Mi.set(n, s(i))), i;
  }, wNAFCached(r, n, s) {
    const i = Fi(r);
    return this.wNAF(i, this.getPrecomputes(i, r, s), n);
  }, wNAFCachedUnsafe(r, n, s, i) {
    const o = Fi(r);
    return o === 1 ? this.unsafeLadder(r, n, i) : this.wNAFUnsafe(o, this.getPrecomputes(o, r, s), n, i);
  }, setWindowSize(r, n) {
    Mu(n, e), Fu.set(r, n), Mi.delete(r);
  } };
}
function ly(t, e, r, n) {
  if (oy(r, t), ay(n, e), r.length !== n.length) throw new Error("arrays of points and scalars must have equal length");
  const s = t.ZERO, i = G0(BigInt(r.length)), o = i > 12 ? i - 3 : i > 4 ? i - 2 : i ? 2 : 1, a = (1 << o) - 1, c = new Array(a + 1).fill(s), l = Math.floor((e.BITS - 1) / o) * o;
  let u = s;
  for (let h = l; h >= 0; h -= o) {
    c.fill(s);
    for (let d = 0; d < n.length; d++) {
      const p = n[d], g = Number(p >> BigInt(h) & BigInt(a));
      c[g] = c[g].add(r[d]);
    }
    let f = s;
    for (let d = c.length - 1, p = s; d > 0; d--) p = p.add(c[d]), f = f.add(p);
    if (u = u.add(f), h !== 0) for (let d = 0; d < o; d++) u = u.double();
  }
  return u;
}
function uy(t) {
  return ny(t.Fp), oa(t, { n: "bigint", h: "bigint", Gx: "field", Gy: "field" }, { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" }), Object.freeze({ ...Lu(t.n, t.nBitLength), ...t, p: t.Fp.ORDER });
}
const it = BigInt(0), ke = BigInt(1), gs = BigInt(2), hy = BigInt(8), fy = { zip215: !0 };
function dy(t) {
  const e = uy(t);
  return oa(t, { hash: "function", a: "bigint", d: "bigint", randomBytes: "function" }, { adjustScalarBytes: "function", domain: "function", uvRatio: "function", mapToCurve: "function" }), Object.freeze({ ...e });
}
function py(t) {
  const e = dy(t), { Fp: r, n, prehash: s, hash: i, randomBytes: o, nByteLength: a, h: c } = e, l = gs << BigInt(a * 8) - ke, u = r.create, h = ku(e.n, e.nBitLength), f = e.uvRatio || ((y, w) => {
    try {
      return { isValid: !0, value: r.sqrt(y * r.inv(w)) };
    } catch {
      return { isValid: !1, value: it };
    }
  }), d = e.adjustScalarBytes || ((y) => y), p = e.domain || ((y, w, x) => {
    if (Ni("phflag", x), w.length || x) throw new Error("Contexts/pre-hash are not supported");
    return y;
  });
  function g(y, w) {
    vn("coordinate " + y, w, it, l);
  }
  function m(y) {
    if (!(y instanceof b)) throw new Error("ExtendedPoint expected");
  }
  const _ = vc((y, w) => {
    const { ex: x, ey: D, ez: E } = y, I = y.is0();
    w == null && (w = I ? hy : r.inv(E));
    const T = u(x * w), L = u(D * w), j = u(E * w);
    if (I) return { x: it, y: ke };
    if (j !== ke) throw new Error("invZ was invalid");
    return { x: T, y: L };
  }), R = vc((y) => {
    const { a: w, d: x } = e;
    if (y.is0()) throw new Error("bad point: ZERO");
    const { ex: D, ey: E, ez: I, et: T } = y, L = u(D * D), j = u(E * E), z = u(I * I), q = u(z * z), V = u(L * w), W = u(z * u(V + j)), Z = u(q + u(x * u(L * j)));
    if (W !== Z) throw new Error("bad point: equation left != right (1)");
    const K = u(D * E), J = u(I * T);
    if (K !== J) throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class b {
    constructor(w, x, D, E) {
      this.ex = w, this.ey = x, this.ez = D, this.et = E, g("x", w), g("y", x), g("z", D), g("t", E), Object.freeze(this);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static fromAffine(w) {
      if (w instanceof b) throw new Error("extended point not allowed");
      const { x, y: D } = w || {};
      return g("x", x), g("y", D), new b(x, D, ke, u(x * D));
    }
    static normalizeZ(w) {
      const x = r.invertBatch(w.map((D) => D.ez));
      return w.map((D, E) => D.toAffine(x[E])).map(b.fromAffine);
    }
    static msm(w, x) {
      return ly(b, h, w, x);
    }
    _setWindowSize(w) {
      B.setWindowSize(this, w);
    }
    assertValidity() {
      R(this);
    }
    equals(w) {
      m(w);
      const { ex: x, ey: D, ez: E } = this, { ex: I, ey: T, ez: L } = w, j = u(x * L), z = u(I * E), q = u(D * L), V = u(T * E);
      return j === z && q === V;
    }
    is0() {
      return this.equals(b.ZERO);
    }
    negate() {
      return new b(u(-this.ex), this.ey, this.ez, u(-this.et));
    }
    double() {
      const { a: w } = e, { ex: x, ey: D, ez: E } = this, I = u(x * x), T = u(D * D), L = u(gs * u(E * E)), j = u(w * I), z = x + D, q = u(u(z * z) - I - T), V = j + T, W = V - L, Z = j - T, K = u(q * W), J = u(V * Z), ae = u(q * Z), he = u(W * V);
      return new b(K, J, he, ae);
    }
    add(w) {
      m(w);
      const { a: x, d: D } = e, { ex: E, ey: I, ez: T, et: L } = this, { ex: j, ey: z, ez: q, et: V } = w;
      if (x === BigInt(-1)) {
        const za = u((I - E) * (z + j)), ja = u((I + E) * (z - j)), Di = u(ja - za);
        if (Di === it) return this.double();
        const Ha = u(T * gs * V), Ka = u(L * gs * q), Va = Ka + Ha, Wa = ja + za, Ga = Ka - Ha, Md = u(Va * Di), Fd = u(Wa * Ga), qd = u(Va * Ga), zd = u(Di * Wa);
        return new b(Md, Fd, zd, qd);
      }
      const W = u(E * j), Z = u(I * z), K = u(L * D * V), J = u(T * q), ae = u((E + I) * (j + z) - W - Z), he = J - K, ye = J + K, Ce = u(Z - x * W), Xe = u(ae * he), zt = u(ye * Ce), Ld = u(ae * Ce), kd = u(he * ye);
      return new b(Xe, zt, kd, Ld);
    }
    subtract(w) {
      return this.add(w.negate());
    }
    wNAF(w) {
      return B.wNAFCached(this, w, b.normalizeZ);
    }
    multiply(w) {
      const x = w;
      vn("scalar", x, ke, n);
      const { p: D, f: E } = this.wNAF(x);
      return b.normalizeZ([D, E])[0];
    }
    multiplyUnsafe(w, x = b.ZERO) {
      const D = w;
      return vn("scalar", D, it, n), D === it ? $ : this.is0() || D === ke ? this : B.wNAFCachedUnsafe(this, D, b.normalizeZ, x);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(c).is0();
    }
    isTorsionFree() {
      return B.unsafeLadder(this, n).is0();
    }
    toAffine(w) {
      return _(this, w);
    }
    clearCofactor() {
      const { h: w } = e;
      return w === ke ? this : this.multiplyUnsafe(w);
    }
    static fromHex(w, x = !1) {
      const { d: D, a: E } = e, I = r.BYTES;
      w = It("pointHex", w, I), Ni("zip215", x);
      const T = w.slice(), L = w[I - 1];
      T[I - 1] = L & -129;
      const j = Rs(T), z = x ? l : r.ORDER;
      vn("pointHex.y", j, it, z);
      const q = u(j * j), V = u(q - ke), W = u(D * q - E);
      let { isValid: Z, value: K } = f(V, W);
      if (!Z) throw new Error("Point.fromHex: invalid y coordinate");
      const J = (K & ke) === ke, ae = (L & 128) !== 0;
      if (!x && K === it && ae) throw new Error("Point.fromHex: x=0 and x_0=1");
      return ae !== J && (K = u(-K)), b.fromAffine({ x: K, y: j });
    }
    static fromPrivateKey(w) {
      return O(w).point;
    }
    toRawBytes() {
      const { x: w, y: x } = this.toAffine(), D = Io(x, r.BYTES);
      return D[D.length - 1] |= w & ke ? 128 : 0, D;
    }
    toHex() {
      return ia(this.toRawBytes());
    }
  }
  b.BASE = new b(e.Gx, e.Gy, ke, u(e.Gx * e.Gy)), b.ZERO = new b(it, ke, ke, it);
  const { BASE: S, ZERO: $ } = b, B = cy(b, a * 8);
  function C(y) {
    return pe(y, n);
  }
  function P(y) {
    return C(Rs(y));
  }
  function O(y) {
    const w = r.BYTES;
    y = It("private key", y, w);
    const x = It("hashed private key", i(y), 2 * w), D = d(x.slice(0, w)), E = x.slice(w, 2 * w), I = P(D), T = S.multiply(I), L = T.toRawBytes();
    return { head: D, prefix: E, scalar: I, point: T, pointBytes: L };
  }
  function U(y) {
    return O(y).pointBytes;
  }
  function k(y = new Uint8Array(), ...w) {
    const x = Ec(...w);
    return P(i(p(x, It("context", y), !!s)));
  }
  function N(y, w, x = {}) {
    y = It("message", y), s && (y = s(y));
    const { prefix: D, scalar: E, pointBytes: I } = O(w), T = k(x.context, D, y), L = S.multiply(T).toRawBytes(), j = k(x.context, L, I, y), z = C(T + j * E);
    vn("signature.s", z, it, n);
    const q = Ec(L, Io(z, r.BYTES));
    return It("result", q, r.BYTES * 2);
  }
  const v = fy;
  function A(y, w, x, D = v) {
    const { context: E, zip215: I } = D, T = r.BYTES;
    y = It("signature", y, 2 * T), w = It("message", w), x = It("publicKey", x, T), I !== void 0 && Ni("zip215", I), s && (w = s(w));
    const L = Rs(y.slice(T, 2 * T));
    let j, z, q;
    try {
      j = b.fromHex(x, I), z = b.fromHex(y.slice(0, T), I), q = S.multiplyUnsafe(L);
    } catch {
      return !1;
    }
    if (!I && j.isSmallOrder()) return !1;
    const V = k(E, z.toRawBytes(), j.toRawBytes(), w);
    return z.add(j.multiplyUnsafe(V)).subtract(q).clearCofactor().equals(b.ZERO);
  }
  return S._setWindowSize(8), { CURVE: e, getPublicKey: U, sign: N, verify: A, ExtendedPoint: b, utils: { getExtendedPublicKey: O, randomPrivateKey: () => o(r.BYTES), precompute(y = 8, w = b.BASE) {
    return w._setWindowSize(y), w.multiply(BigInt(3)), w;
  } } };
}
BigInt(0), BigInt(1);
const aa = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949"), Dc = BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
BigInt(0);
const gy = BigInt(1), Ac = BigInt(2);
BigInt(3);
const yy = BigInt(5), wy = BigInt(8);
function my(t) {
  const e = BigInt(10), r = BigInt(20), n = BigInt(40), s = BigInt(80), i = aa, o = t * t % i * t % i, a = pt(o, Ac, i) * o % i, c = pt(a, gy, i) * t % i, l = pt(c, yy, i) * c % i, u = pt(l, e, i) * l % i, h = pt(u, r, i) * u % i, f = pt(h, n, i) * h % i, d = pt(f, s, i) * f % i, p = pt(d, s, i) * f % i, g = pt(p, e, i) * l % i;
  return { pow_p_5_8: pt(g, Ac, i) * t % i, b2: o };
}
function by(t) {
  return t[0] &= 248, t[31] &= 127, t[31] |= 64, t;
}
function Ey(t, e) {
  const r = aa, n = pe(e * e * e, r), s = pe(n * n * e, r), i = my(t * s).pow_p_5_8;
  let o = pe(t * n * i, r);
  const a = pe(e * o * o, r), c = o, l = pe(o * Dc, r), u = a === t, h = a === pe(-t, r), f = a === pe(-t * Dc, r);
  return u && (o = c), (h || f) && (o = l), ty(o, r) && (o = pe(-o, r)), { isValid: u || h, value: o };
}
const vy = ku(aa, void 0, !0), xy = { a: BigInt(-1), d: BigInt("37095705934669439343138083508754565189542113879843219016388785533085940283555"), Fp: vy, n: BigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"), h: wy, Gx: BigInt("15112221349535400772501151409588531511454012693041857206046113283949847762202"), Gy: BigInt("46316835694926478169428394003475163141307993866256225615783033603165251855960"), hash: j0, randomBytes: Bu, adjustScalarBytes: by, uvRatio: Ey }, qu = py(xy), _y = "EdDSA", Sy = "JWT", ks = ".", ci = "base64url", zu = "utf8", ju = "utf8", Iy = ":", Dy = "did", Ay = "key", Oc = "base58btc", Oy = "z", $y = "K36", Ty = 32;
function ca(t) {
  return globalThis.Buffer != null ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : t;
}
function Hu(t = 0) {
  return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null ? ca(globalThis.Buffer.allocUnsafe(t)) : new Uint8Array(t);
}
function Ku(t, e) {
  e || (e = t.reduce((s, i) => s + i.length, 0));
  const r = Hu(e);
  let n = 0;
  for (const s of t) r.set(s, n), n += s.length;
  return ca(r);
}
function By(t, e) {
  if (t.length >= 255) throw new TypeError("Alphabet too long");
  for (var r = new Uint8Array(256), n = 0; n < r.length; n++) r[n] = 255;
  for (var s = 0; s < t.length; s++) {
    var i = t.charAt(s), o = i.charCodeAt(0);
    if (r[o] !== 255) throw new TypeError(i + " is ambiguous");
    r[o] = s;
  }
  var a = t.length, c = t.charAt(0), l = Math.log(a) / Math.log(256), u = Math.log(256) / Math.log(a);
  function h(p) {
    if (p instanceof Uint8Array || (ArrayBuffer.isView(p) ? p = new Uint8Array(p.buffer, p.byteOffset, p.byteLength) : Array.isArray(p) && (p = Uint8Array.from(p))), !(p instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
    if (p.length === 0) return "";
    for (var g = 0, m = 0, _ = 0, R = p.length; _ !== R && p[_] === 0; ) _++, g++;
    for (var b = (R - _) * u + 1 >>> 0, S = new Uint8Array(b); _ !== R; ) {
      for (var $ = p[_], B = 0, C = b - 1; ($ !== 0 || B < m) && C !== -1; C--, B++) $ += 256 * S[C] >>> 0, S[C] = $ % a >>> 0, $ = $ / a >>> 0;
      if ($ !== 0) throw new Error("Non-zero carry");
      m = B, _++;
    }
    for (var P = b - m; P !== b && S[P] === 0; ) P++;
    for (var O = c.repeat(g); P < b; ++P) O += t.charAt(S[P]);
    return O;
  }
  function f(p) {
    if (typeof p != "string") throw new TypeError("Expected String");
    if (p.length === 0) return new Uint8Array();
    var g = 0;
    if (p[g] !== " ") {
      for (var m = 0, _ = 0; p[g] === c; ) m++, g++;
      for (var R = (p.length - g) * l + 1 >>> 0, b = new Uint8Array(R); p[g]; ) {
        var S = r[p.charCodeAt(g)];
        if (S === 255) return;
        for (var $ = 0, B = R - 1; (S !== 0 || $ < _) && B !== -1; B--, $++) S += a * b[B] >>> 0, b[B] = S % 256 >>> 0, S = S / 256 >>> 0;
        if (S !== 0) throw new Error("Non-zero carry");
        _ = $, g++;
      }
      if (p[g] !== " ") {
        for (var C = R - _; C !== R && b[C] === 0; ) C++;
        for (var P = new Uint8Array(m + (R - C)), O = m; C !== R; ) P[O++] = b[C++];
        return P;
      }
    }
  }
  function d(p) {
    var g = f(p);
    if (g) return g;
    throw new Error(`Non-${e} character`);
  }
  return { encode: h, decodeUnsafe: f, decode: d };
}
var Ry = By, Py = Ry;
const Vu = (t) => {
  if (t instanceof Uint8Array && t.constructor.name === "Uint8Array") return t;
  if (t instanceof ArrayBuffer) return new Uint8Array(t);
  if (ArrayBuffer.isView(t)) return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
  throw new Error("Unknown type, must be binary type");
}, Cy = (t) => new TextEncoder().encode(t), Ny = (t) => new TextDecoder().decode(t);
let Uy = class {
  constructor(e, r, n) {
    this.name = e, this.prefix = r, this.baseEncode = n;
  }
  encode(e) {
    if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
    throw Error("Unknown type, must be binary type");
  }
}, Ly = class {
  constructor(e, r, n) {
    if (this.name = e, this.prefix = r, r.codePointAt(0) === void 0) throw new Error("Invalid prefix character");
    this.prefixCodePoint = r.codePointAt(0), this.baseDecode = n;
  }
  decode(e) {
    if (typeof e == "string") {
      if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      return this.baseDecode(e.slice(this.prefix.length));
    } else throw Error("Can only multibase decode strings");
  }
  or(e) {
    return Wu(this, e);
  }
}, ky = class {
  constructor(e) {
    this.decoders = e;
  }
  or(e) {
    return Wu(this, e);
  }
  decode(e) {
    const r = e[0], n = this.decoders[r];
    if (n) return n.decode(e);
    throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
  }
};
const Wu = (t, e) => new ky({ ...t.decoders || { [t.prefix]: t }, ...e.decoders || { [e.prefix]: e } });
let My = class {
  constructor(e, r, n, s) {
    this.name = e, this.prefix = r, this.baseEncode = n, this.baseDecode = s, this.encoder = new Uy(e, r, n), this.decoder = new Ly(e, r, s);
  }
  encode(e) {
    return this.encoder.encode(e);
  }
  decode(e) {
    return this.decoder.decode(e);
  }
};
const li = ({ name: t, prefix: e, encode: r, decode: n }) => new My(t, e, r, n), Qn = ({ prefix: t, name: e, alphabet: r }) => {
  const { encode: n, decode: s } = Py(r, e);
  return li({ prefix: t, name: e, encode: n, decode: (i) => Vu(s(i)) });
}, Fy = (t, e, r, n) => {
  const s = {};
  for (let u = 0; u < e.length; ++u) s[e[u]] = u;
  let i = t.length;
  for (; t[i - 1] === "="; ) --i;
  const o = new Uint8Array(i * r / 8 | 0);
  let a = 0, c = 0, l = 0;
  for (let u = 0; u < i; ++u) {
    const h = s[t[u]];
    if (h === void 0) throw new SyntaxError(`Non-${n} character`);
    c = c << r | h, a += r, a >= 8 && (a -= 8, o[l++] = 255 & c >> a);
  }
  if (a >= r || 255 & c << 8 - a) throw new SyntaxError("Unexpected end of data");
  return o;
}, qy = (t, e, r) => {
  const n = e[e.length - 1] === "=", s = (1 << r) - 1;
  let i = "", o = 0, a = 0;
  for (let c = 0; c < t.length; ++c) for (a = a << 8 | t[c], o += 8; o > r; ) o -= r, i += e[s & a >> o];
  if (o && (i += e[s & a << r - o]), n) for (; i.length * r & 7; ) i += "=";
  return i;
}, Ie = ({ name: t, prefix: e, bitsPerChar: r, alphabet: n }) => li({ prefix: e, name: t, encode(s) {
  return qy(s, n, r);
}, decode(s) {
  return Fy(s, n, r, t);
} }), zy = li({ prefix: "\0", name: "identity", encode: (t) => Ny(t), decode: (t) => Cy(t) });
var jy = Object.freeze({ __proto__: null, identity: zy });
const Hy = Ie({ prefix: "0", name: "base2", alphabet: "01", bitsPerChar: 1 });
var Ky = Object.freeze({ __proto__: null, base2: Hy });
const Vy = Ie({ prefix: "7", name: "base8", alphabet: "01234567", bitsPerChar: 3 });
var Wy = Object.freeze({ __proto__: null, base8: Vy });
const Gy = Qn({ prefix: "9", name: "base10", alphabet: "0123456789" });
var Yy = Object.freeze({ __proto__: null, base10: Gy });
const Zy = Ie({ prefix: "f", name: "base16", alphabet: "0123456789abcdef", bitsPerChar: 4 }), Xy = Ie({ prefix: "F", name: "base16upper", alphabet: "0123456789ABCDEF", bitsPerChar: 4 });
var Jy = Object.freeze({ __proto__: null, base16: Zy, base16upper: Xy });
const Qy = Ie({ prefix: "b", name: "base32", alphabet: "abcdefghijklmnopqrstuvwxyz234567", bitsPerChar: 5 }), ew = Ie({ prefix: "B", name: "base32upper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bitsPerChar: 5 }), tw = Ie({ prefix: "c", name: "base32pad", alphabet: "abcdefghijklmnopqrstuvwxyz234567=", bitsPerChar: 5 }), rw = Ie({ prefix: "C", name: "base32padupper", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=", bitsPerChar: 5 }), nw = Ie({ prefix: "v", name: "base32hex", alphabet: "0123456789abcdefghijklmnopqrstuv", bitsPerChar: 5 }), sw = Ie({ prefix: "V", name: "base32hexupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV", bitsPerChar: 5 }), iw = Ie({ prefix: "t", name: "base32hexpad", alphabet: "0123456789abcdefghijklmnopqrstuv=", bitsPerChar: 5 }), ow = Ie({ prefix: "T", name: "base32hexpadupper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=", bitsPerChar: 5 }), aw = Ie({ prefix: "h", name: "base32z", alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769", bitsPerChar: 5 });
var cw = Object.freeze({ __proto__: null, base32: Qy, base32upper: ew, base32pad: tw, base32padupper: rw, base32hex: nw, base32hexupper: sw, base32hexpad: iw, base32hexpadupper: ow, base32z: aw });
const lw = Qn({ prefix: "k", name: "base36", alphabet: "0123456789abcdefghijklmnopqrstuvwxyz" }), uw = Qn({ prefix: "K", name: "base36upper", alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
var hw = Object.freeze({ __proto__: null, base36: lw, base36upper: uw });
const fw = Qn({ name: "base58btc", prefix: "z", alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" }), dw = Qn({ name: "base58flickr", prefix: "Z", alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ" });
var pw = Object.freeze({ __proto__: null, base58btc: fw, base58flickr: dw });
const gw = Ie({ prefix: "m", name: "base64", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", bitsPerChar: 6 }), yw = Ie({ prefix: "M", name: "base64pad", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", bitsPerChar: 6 }), ww = Ie({ prefix: "u", name: "base64url", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", bitsPerChar: 6 }), mw = Ie({ prefix: "U", name: "base64urlpad", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=", bitsPerChar: 6 });
var bw = Object.freeze({ __proto__: null, base64: gw, base64pad: yw, base64url: ww, base64urlpad: mw });
const Gu = Array.from("🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂"), Ew = Gu.reduce((t, e, r) => (t[r] = e, t), []), vw = Gu.reduce((t, e, r) => (t[e.codePointAt(0)] = r, t), []);
function xw(t) {
  return t.reduce((e, r) => (e += Ew[r], e), "");
}
function _w(t) {
  const e = [];
  for (const r of t) {
    const n = vw[r.codePointAt(0)];
    if (n === void 0) throw new Error(`Non-base256emoji character: ${r}`);
    e.push(n);
  }
  return new Uint8Array(e);
}
const Sw = li({ prefix: "🚀", name: "base256emoji", encode: xw, decode: _w });
var Iw = Object.freeze({ __proto__: null, base256emoji: Sw }), Dw = Yu, $c = 128, Aw = -128, Ow = Math.pow(2, 31);
function Yu(t, e, r) {
  e = e || [], r = r || 0;
  for (var n = r; t >= Ow; ) e[r++] = t & 255 | $c, t /= 128;
  for (; t & Aw; ) e[r++] = t & 255 | $c, t >>>= 7;
  return e[r] = t | 0, Yu.bytes = r - n + 1, e;
}
var $w = Ao, Tw = 128, Tc = 127;
function Ao(t, n) {
  var r = 0, n = n || 0, s = 0, i = n, o, a = t.length;
  do {
    if (i >= a) throw Ao.bytes = 0, new RangeError("Could not decode varint");
    o = t[i++], r += s < 28 ? (o & Tc) << s : (o & Tc) * Math.pow(2, s), s += 7;
  } while (o >= Tw);
  return Ao.bytes = i - n, r;
}
var Bw = Math.pow(2, 7), Rw = Math.pow(2, 14), Pw = Math.pow(2, 21), Cw = Math.pow(2, 28), Nw = Math.pow(2, 35), Uw = Math.pow(2, 42), Lw = Math.pow(2, 49), kw = Math.pow(2, 56), Mw = Math.pow(2, 63), Fw = function(t) {
  return t < Bw ? 1 : t < Rw ? 2 : t < Pw ? 3 : t < Cw ? 4 : t < Nw ? 5 : t < Uw ? 6 : t < Lw ? 7 : t < kw ? 8 : t < Mw ? 9 : 10;
}, qw = { encode: Dw, decode: $w, encodingLength: Fw }, Zu = qw;
const Bc = (t, e, r = 0) => (Zu.encode(t, e, r), e), Rc = (t) => Zu.encodingLength(t), Oo = (t, e) => {
  const r = e.byteLength, n = Rc(t), s = n + Rc(r), i = new Uint8Array(s + r);
  return Bc(t, i, 0), Bc(r, i, n), i.set(e, s), new zw(t, r, e, i);
};
class zw {
  constructor(e, r, n, s) {
    this.code = e, this.size = r, this.digest = n, this.bytes = s;
  }
}
const Xu = ({ name: t, code: e, encode: r }) => new jw(t, e, r);
class jw {
  constructor(e, r, n) {
    this.name = e, this.code = r, this.encode = n;
  }
  digest(e) {
    if (e instanceof Uint8Array) {
      const r = this.encode(e);
      return r instanceof Uint8Array ? Oo(this.code, r) : r.then((n) => Oo(this.code, n));
    } else throw Error("Unknown type, must be binary type");
  }
}
const Ju = (t) => async (e) => new Uint8Array(await crypto.subtle.digest(t, e)), Hw = Xu({ name: "sha2-256", code: 18, encode: Ju("SHA-256") }), Kw = Xu({ name: "sha2-512", code: 19, encode: Ju("SHA-512") });
var Vw = Object.freeze({ __proto__: null, sha256: Hw, sha512: Kw });
const Qu = 0, Ww = "identity", eh = Vu, Gw = (t) => Oo(Qu, eh(t)), Yw = { code: Qu, name: Ww, encode: eh, digest: Gw };
var Zw = Object.freeze({ __proto__: null, identity: Yw });
new TextEncoder(), new TextDecoder();
const Pc = { ...jy, ...Ky, ...Wy, ...Yy, ...Jy, ...cw, ...hw, ...pw, ...bw, ...Iw };
({ ...Vw, ...Zw });
function th(t, e, r, n) {
  return { name: t, prefix: e, encoder: { name: t, prefix: e, encode: r }, decoder: { decode: n } };
}
const Cc = th("utf8", "u", (t) => "u" + new TextDecoder("utf8").decode(t), (t) => new TextEncoder().encode(t.substring(1))), qi = th("ascii", "a", (t) => {
  let e = "a";
  for (let r = 0; r < t.length; r++) e += String.fromCharCode(t[r]);
  return e;
}, (t) => {
  t = t.substring(1);
  const e = Hu(t.length);
  for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
  return e;
}), rh = { utf8: Cc, "utf-8": Cc, hex: Pc.base16, latin1: qi, ascii: qi, binary: qi, ...Pc };
function ui(t, e = "utf8") {
  const r = rh[e];
  if (!r) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null ? globalThis.Buffer.from(t.buffer, t.byteOffset, t.byteLength).toString("utf8") : r.encoder.encode(t).substring(1);
}
function gn(t, e = "utf8") {
  const r = rh[e];
  if (!r) throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null ? ca(globalThis.Buffer.from(t, "utf-8")) : r.decoder.decode(`${r.prefix}${t}`);
}
function Nc(t) {
  return ln(ui(gn(t, ci), zu));
}
function Ms(t) {
  return ui(gn(Jn(t), zu), ci);
}
function nh(t) {
  const e = gn($y, Oc), r = Oy + ui(Ku([e, t]), Oc);
  return [Dy, Ay, r].join(Iy);
}
function Xw(t) {
  return ui(t, ci);
}
function Jw(t) {
  return gn(t, ci);
}
function Qw(t) {
  return gn([Ms(t.header), Ms(t.payload)].join(ks), ju);
}
function em(t) {
  return [Ms(t.header), Ms(t.payload), Xw(t.signature)].join(ks);
}
function $o(t) {
  const e = t.split(ks), r = Nc(e[0]), n = Nc(e[1]), s = Jw(e[2]), i = gn(e.slice(0, 2).join(ks), ju);
  return { header: r, payload: n, signature: s, data: i };
}
function Uc(t = Bu(Ty)) {
  const e = qu.getPublicKey(t);
  return { secretKey: Ku([t, e]), publicKey: e };
}
async function tm(t, e, r, n, s = M.fromMiliseconds(Date.now())) {
  const i = { alg: _y, typ: Sy }, o = nh(n.publicKey), a = s + r, c = { iss: o, sub: t, aud: e, iat: s, exp: a }, l = Qw({ header: i, payload: c }), u = qu.sign(l, n.secretKey.slice(0, 32));
  return em({ header: i, payload: c, signature: u });
}
function rm(t, e) {
  if (t.length >= 255)
    throw new TypeError("Alphabet too long");
  for (var r = new Uint8Array(256), n = 0; n < r.length; n++)
    r[n] = 255;
  for (var s = 0; s < t.length; s++) {
    var i = t.charAt(s), o = i.charCodeAt(0);
    if (r[o] !== 255)
      throw new TypeError(i + " is ambiguous");
    r[o] = s;
  }
  var a = t.length, c = t.charAt(0), l = Math.log(a) / Math.log(256), u = Math.log(256) / Math.log(a);
  function h(p) {
    if (p instanceof Uint8Array || (ArrayBuffer.isView(p) ? p = new Uint8Array(p.buffer, p.byteOffset, p.byteLength) : Array.isArray(p) && (p = Uint8Array.from(p))), !(p instanceof Uint8Array))
      throw new TypeError("Expected Uint8Array");
    if (p.length === 0)
      return "";
    for (var g = 0, m = 0, _ = 0, R = p.length; _ !== R && p[_] === 0; )
      _++, g++;
    for (var b = (R - _) * u + 1 >>> 0, S = new Uint8Array(b); _ !== R; ) {
      for (var $ = p[_], B = 0, C = b - 1; ($ !== 0 || B < m) && C !== -1; C--, B++)
        $ += 256 * S[C] >>> 0, S[C] = $ % a >>> 0, $ = $ / a >>> 0;
      if ($ !== 0)
        throw new Error("Non-zero carry");
      m = B, _++;
    }
    for (var P = b - m; P !== b && S[P] === 0; )
      P++;
    for (var O = c.repeat(g); P < b; ++P)
      O += t.charAt(S[P]);
    return O;
  }
  function f(p) {
    if (typeof p != "string")
      throw new TypeError("Expected String");
    if (p.length === 0)
      return new Uint8Array();
    var g = 0;
    if (p[g] !== " ") {
      for (var m = 0, _ = 0; p[g] === c; )
        m++, g++;
      for (var R = (p.length - g) * l + 1 >>> 0, b = new Uint8Array(R); p[g]; ) {
        var S = r[p.charCodeAt(g)];
        if (S === 255)
          return;
        for (var $ = 0, B = R - 1; (S !== 0 || $ < _) && B !== -1; B--, $++)
          S += a * b[B] >>> 0, b[B] = S % 256 >>> 0, S = S / 256 >>> 0;
        if (S !== 0)
          throw new Error("Non-zero carry");
        _ = $, g++;
      }
      if (p[g] !== " ") {
        for (var C = R - _; C !== R && b[C] === 0; )
          C++;
        for (var P = new Uint8Array(m + (R - C)), O = m; C !== R; )
          P[O++] = b[C++];
        return P;
      }
    }
  }
  function d(p) {
    var g = f(p);
    if (g)
      return g;
    throw new Error(`Non-${e} character`);
  }
  return {
    encode: h,
    decodeUnsafe: f,
    decode: d
  };
}
var nm = rm, sm = nm;
const im = (t) => {
  if (t instanceof Uint8Array && t.constructor.name === "Uint8Array")
    return t;
  if (t instanceof ArrayBuffer)
    return new Uint8Array(t);
  if (ArrayBuffer.isView(t))
    return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
  throw new Error("Unknown type, must be binary type");
}, om = (t) => new TextEncoder().encode(t), am = (t) => new TextDecoder().decode(t);
let cm = class {
  constructor(e, r, n) {
    this.name = e, this.prefix = r, this.baseEncode = n;
  }
  encode(e) {
    if (e instanceof Uint8Array)
      return `${this.prefix}${this.baseEncode(e)}`;
    throw Error("Unknown type, must be binary type");
  }
}, lm = class {
  constructor(e, r, n) {
    if (this.name = e, this.prefix = r, r.codePointAt(0) === void 0)
      throw new Error("Invalid prefix character");
    this.prefixCodePoint = r.codePointAt(0), this.baseDecode = n;
  }
  decode(e) {
    if (typeof e == "string") {
      if (e.codePointAt(0) !== this.prefixCodePoint)
        throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      return this.baseDecode(e.slice(this.prefix.length));
    } else
      throw Error("Can only multibase decode strings");
  }
  or(e) {
    return sh(this, e);
  }
};
class um {
  constructor(e) {
    this.decoders = e;
  }
  or(e) {
    return sh(this, e);
  }
  decode(e) {
    const r = e[0], n = this.decoders[r];
    if (n)
      return n.decode(e);
    throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
  }
}
const sh = (t, e) => new um({
  ...t.decoders || { [t.prefix]: t },
  ...e.decoders || { [e.prefix]: e }
});
class hm {
  constructor(e, r, n, s) {
    this.name = e, this.prefix = r, this.baseEncode = n, this.baseDecode = s, this.encoder = new cm(e, r, n), this.decoder = new lm(e, r, s);
  }
  encode(e) {
    return this.encoder.encode(e);
  }
  decode(e) {
    return this.decoder.decode(e);
  }
}
const hi = ({ name: t, prefix: e, encode: r, decode: n }) => new hm(t, e, r, n), es = ({ prefix: t, name: e, alphabet: r }) => {
  const { encode: n, decode: s } = sm(r, e);
  return hi({
    prefix: t,
    name: e,
    encode: n,
    decode: (i) => im(s(i))
  });
}, fm = (t, e, r, n) => {
  const s = {};
  for (let u = 0; u < e.length; ++u)
    s[e[u]] = u;
  let i = t.length;
  for (; t[i - 1] === "="; )
    --i;
  const o = new Uint8Array(i * r / 8 | 0);
  let a = 0, c = 0, l = 0;
  for (let u = 0; u < i; ++u) {
    const h = s[t[u]];
    if (h === void 0)
      throw new SyntaxError(`Non-${n} character`);
    c = c << r | h, a += r, a >= 8 && (a -= 8, o[l++] = 255 & c >> a);
  }
  if (a >= r || 255 & c << 8 - a)
    throw new SyntaxError("Unexpected end of data");
  return o;
}, dm = (t, e, r) => {
  const n = e[e.length - 1] === "=", s = (1 << r) - 1;
  let i = "", o = 0, a = 0;
  for (let c = 0; c < t.length; ++c)
    for (a = a << 8 | t[c], o += 8; o > r; )
      o -= r, i += e[s & a >> o];
  if (o && (i += e[s & a << r - o]), n)
    for (; i.length * r & 7; )
      i += "=";
  return i;
}, De = ({ name: t, prefix: e, bitsPerChar: r, alphabet: n }) => hi({
  prefix: e,
  name: t,
  encode(s) {
    return dm(s, n, r);
  },
  decode(s) {
    return fm(s, n, r, t);
  }
}), pm = hi({
  prefix: "\0",
  name: "identity",
  encode: (t) => am(t),
  decode: (t) => om(t)
}), gm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  identity: pm
}, Symbol.toStringTag, { value: "Module" })), ym = De({
  prefix: "0",
  name: "base2",
  alphabet: "01",
  bitsPerChar: 1
}), wm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base2: ym
}, Symbol.toStringTag, { value: "Module" })), mm = De({
  prefix: "7",
  name: "base8",
  alphabet: "01234567",
  bitsPerChar: 3
}), bm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base8: mm
}, Symbol.toStringTag, { value: "Module" })), Em = es({
  prefix: "9",
  name: "base10",
  alphabet: "0123456789"
}), vm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base10: Em
}, Symbol.toStringTag, { value: "Module" })), xm = De({
  prefix: "f",
  name: "base16",
  alphabet: "0123456789abcdef",
  bitsPerChar: 4
}), _m = De({
  prefix: "F",
  name: "base16upper",
  alphabet: "0123456789ABCDEF",
  bitsPerChar: 4
}), Sm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base16: xm,
  base16upper: _m
}, Symbol.toStringTag, { value: "Module" })), Im = De({
  prefix: "b",
  name: "base32",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567",
  bitsPerChar: 5
}), Dm = De({
  prefix: "B",
  name: "base32upper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  bitsPerChar: 5
}), Am = De({
  prefix: "c",
  name: "base32pad",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
  bitsPerChar: 5
}), Om = De({
  prefix: "C",
  name: "base32padupper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
  bitsPerChar: 5
}), $m = De({
  prefix: "v",
  name: "base32hex",
  alphabet: "0123456789abcdefghijklmnopqrstuv",
  bitsPerChar: 5
}), Tm = De({
  prefix: "V",
  name: "base32hexupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  bitsPerChar: 5
}), Bm = De({
  prefix: "t",
  name: "base32hexpad",
  alphabet: "0123456789abcdefghijklmnopqrstuv=",
  bitsPerChar: 5
}), Rm = De({
  prefix: "T",
  name: "base32hexpadupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
  bitsPerChar: 5
}), Pm = De({
  prefix: "h",
  name: "base32z",
  alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
  bitsPerChar: 5
}), Cm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base32: Im,
  base32hex: $m,
  base32hexpad: Bm,
  base32hexpadupper: Rm,
  base32hexupper: Tm,
  base32pad: Am,
  base32padupper: Om,
  base32upper: Dm,
  base32z: Pm
}, Symbol.toStringTag, { value: "Module" })), Nm = es({
  prefix: "k",
  name: "base36",
  alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
}), Um = es({
  prefix: "K",
  name: "base36upper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
}), Lm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base36: Nm,
  base36upper: Um
}, Symbol.toStringTag, { value: "Module" })), km = es({
  name: "base58btc",
  prefix: "z",
  alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
}), Mm = es({
  name: "base58flickr",
  prefix: "Z",
  alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
}), Fm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base58btc: km,
  base58flickr: Mm
}, Symbol.toStringTag, { value: "Module" })), qm = De({
  prefix: "m",
  name: "base64",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  bitsPerChar: 6
}), zm = De({
  prefix: "M",
  name: "base64pad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  bitsPerChar: 6
}), jm = De({
  prefix: "u",
  name: "base64url",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bitsPerChar: 6
}), Hm = De({
  prefix: "U",
  name: "base64urlpad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
  bitsPerChar: 6
}), Km = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base64: qm,
  base64pad: zm,
  base64url: jm,
  base64urlpad: Hm
}, Symbol.toStringTag, { value: "Module" })), ih = Array.from("🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂"), Vm = ih.reduce((t, e, r) => (t[r] = e, t), []), Wm = ih.reduce((t, e, r) => (t[e.codePointAt(0)] = r, t), []);
function Gm(t) {
  return t.reduce((e, r) => (e += Vm[r], e), "");
}
function Ym(t) {
  const e = [];
  for (const r of t) {
    const n = Wm[r.codePointAt(0)];
    if (n === void 0)
      throw new Error(`Non-base256emoji character: ${r}`);
    e.push(n);
  }
  return new Uint8Array(e);
}
const Zm = hi({
  prefix: "🚀",
  name: "base256emoji",
  encode: Gm,
  decode: Ym
}), Xm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  base256emoji: Zm
}, Symbol.toStringTag, { value: "Module" }));
new TextEncoder();
new TextDecoder();
const Lc = {
  ...gm,
  ...wm,
  ...bm,
  ...vm,
  ...Sm,
  ...Cm,
  ...Lm,
  ...Fm,
  ...Km,
  ...Xm
};
function la(t) {
  return globalThis.Buffer != null ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : t;
}
function oh(t = 0) {
  return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null ? la(globalThis.Buffer.allocUnsafe(t)) : new Uint8Array(t);
}
function ah(t, e, r, n) {
  return {
    name: t,
    prefix: e,
    encoder: {
      name: t,
      prefix: e,
      encode: r
    },
    decoder: { decode: n }
  };
}
const kc = ah("utf8", "u", (t) => "u" + new TextDecoder("utf8").decode(t), (t) => new TextEncoder().encode(t.substring(1))), zi = ah("ascii", "a", (t) => {
  let e = "a";
  for (let r = 0; r < t.length; r++)
    e += String.fromCharCode(t[r]);
  return e;
}, (t) => {
  t = t.substring(1);
  const e = oh(t.length);
  for (let r = 0; r < t.length; r++)
    e[r] = t.charCodeAt(r);
  return e;
}), ch = {
  utf8: kc,
  "utf-8": kc,
  hex: Lc.base16,
  latin1: zi,
  ascii: zi,
  binary: zi,
  ...Lc
};
function Pe(t, e = "utf8") {
  const r = ch[e];
  if (!r)
    throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null ? la(globalThis.Buffer.from(t, "utf-8")) : r.decoder.decode(`${r.prefix}${t}`);
}
var Mc = function(t, e, r) {
  if (r || arguments.length === 2) for (var n = 0, s = e.length, i; n < s; n++)
    (i || !(n in e)) && (i || (i = Array.prototype.slice.call(e, 0, n)), i[n] = e[n]);
  return t.concat(i || Array.prototype.slice.call(e));
}, Jm = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e, r, n) {
      this.name = e, this.version = r, this.os = n, this.type = "browser";
    }
    return t;
  }()
), Qm = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e) {
      this.version = e, this.type = "node", this.name = "node", this.os = process.platform;
    }
    return t;
  }()
), eb = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e, r, n, s) {
      this.name = e, this.version = r, this.os = n, this.bot = s, this.type = "bot-device";
    }
    return t;
  }()
), tb = (
  /** @class */
  /* @__PURE__ */ function() {
    function t() {
      this.type = "bot", this.bot = !0, this.name = "bot", this.version = null, this.os = null;
    }
    return t;
  }()
), rb = (
  /** @class */
  /* @__PURE__ */ function() {
    function t() {
      this.type = "react-native", this.name = "react-native", this.version = null, this.os = null;
    }
    return t;
  }()
), nb = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/, sb = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/, Fc = 3, ib = [
  ["aol", /AOLShield\/([0-9\._]+)/],
  ["edge", /Edge\/([0-9\._]+)/],
  ["edge-ios", /EdgiOS\/([0-9\._]+)/],
  ["yandexbrowser", /YaBrowser\/([0-9\._]+)/],
  ["kakaotalk", /KAKAOTALK\s([0-9\.]+)/],
  ["samsung", /SamsungBrowser\/([0-9\.]+)/],
  ["silk", /\bSilk\/([0-9._-]+)\b/],
  ["miui", /MiuiBrowser\/([0-9\.]+)$/],
  ["beaker", /BeakerBrowser\/([0-9\.]+)/],
  ["edge-chromium", /EdgA?\/([0-9\.]+)/],
  [
    "chromium-webview",
    /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/
  ],
  ["chrome", /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
  ["phantomjs", /PhantomJS\/([0-9\.]+)(:?\s|$)/],
  ["crios", /CriOS\/([0-9\.]+)(:?\s|$)/],
  ["firefox", /Firefox\/([0-9\.]+)(?:\s|$)/],
  ["fxios", /FxiOS\/([0-9\.]+)/],
  ["opera-mini", /Opera Mini.*Version\/([0-9\.]+)/],
  ["opera", /Opera\/([0-9\.]+)(?:\s|$)/],
  ["opera", /OPR\/([0-9\.]+)(:?\s|$)/],
  ["pie", /^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],
  ["pie", /^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],
  ["netfront", /^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],
  ["ie", /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],
  ["ie", /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
  ["ie", /MSIE\s(7\.0)/],
  ["bb10", /BB10;\sTouch.*Version\/([0-9\.]+)/],
  ["android", /Android\s([0-9\.]+)/],
  ["ios", /Version\/([0-9\._]+).*Mobile.*Safari.*/],
  ["safari", /Version\/([0-9\._]+).*Safari/],
  ["facebook", /FB[AS]V\/([0-9\.]+)/],
  ["instagram", /Instagram\s([0-9\.]+)/],
  ["ios-webview", /AppleWebKit\/([0-9\.]+).*Mobile/],
  ["ios-webview", /AppleWebKit\/([0-9\.]+).*Gecko\)$/],
  ["curl", /^curl\/([0-9\.]+)$/],
  ["searchbot", nb]
], qc = [
  ["iOS", /iP(hone|od|ad)/],
  ["Android OS", /Android/],
  ["BlackBerry OS", /BlackBerry|BB10/],
  ["Windows Mobile", /IEMobile/],
  ["Amazon OS", /Kindle/],
  ["Windows 3.11", /Win16/],
  ["Windows 95", /(Windows 95)|(Win95)|(Windows_95)/],
  ["Windows 98", /(Windows 98)|(Win98)/],
  ["Windows 2000", /(Windows NT 5.0)|(Windows 2000)/],
  ["Windows XP", /(Windows NT 5.1)|(Windows XP)/],
  ["Windows Server 2003", /(Windows NT 5.2)/],
  ["Windows Vista", /(Windows NT 6.0)/],
  ["Windows 7", /(Windows NT 6.1)/],
  ["Windows 8", /(Windows NT 6.2)/],
  ["Windows 8.1", /(Windows NT 6.3)/],
  ["Windows 10", /(Windows NT 10.0)/],
  ["Windows ME", /Windows ME/],
  ["Windows CE", /Windows CE|WinCE|Microsoft Pocket Internet Explorer/],
  ["Open BSD", /OpenBSD/],
  ["Sun OS", /SunOS/],
  ["Chrome OS", /CrOS/],
  ["Linux", /(Linux)|(X11)/],
  ["Mac OS", /(Mac_PowerPC)|(Macintosh)/],
  ["QNX", /QNX/],
  ["BeOS", /BeOS/],
  ["OS/2", /OS\/2/]
];
function ob(t) {
  return typeof document > "u" && typeof navigator < "u" && navigator.product === "ReactNative" ? new rb() : typeof navigator < "u" ? cb(navigator.userAgent) : ub();
}
function ab(t) {
  return t !== "" && ib.reduce(function(e, r) {
    var n = r[0], s = r[1];
    if (e)
      return e;
    var i = s.exec(t);
    return !!i && [n, i];
  }, !1);
}
function cb(t) {
  var e = ab(t);
  if (!e)
    return null;
  var r = e[0], n = e[1];
  if (r === "searchbot")
    return new tb();
  var s = n[1] && n[1].split(".").join("_").split("_").slice(0, 3);
  s ? s.length < Fc && (s = Mc(Mc([], s, !0), hb(Fc - s.length), !0)) : s = [];
  var i = s.join("."), o = lb(t), a = sb.exec(t);
  return a && a[1] ? new eb(r, i, o, a[1]) : new Jm(r, i, o);
}
function lb(t) {
  for (var e = 0, r = qc.length; e < r; e++) {
    var n = qc[e], s = n[0], i = n[1], o = i.exec(t);
    if (o)
      return s;
  }
  return null;
}
function ub() {
  var t = typeof process < "u" && process.version;
  return t ? new Qm(process.version.slice(1)) : null;
}
function hb(t) {
  for (var e = [], r = 0; r < t; r++)
    e.push("0");
  return e;
}
var se = {};
Object.defineProperty(se, "__esModule", { value: !0 });
se.getLocalStorage = se.getLocalStorageOrThrow = se.getCrypto = se.getCryptoOrThrow = lh = se.getLocation = se.getLocationOrThrow = ua = se.getNavigator = se.getNavigatorOrThrow = Nr = se.getDocument = se.getDocumentOrThrow = se.getFromWindowOrThrow = se.getFromWindow = void 0;
function jr(t) {
  let e;
  return typeof window < "u" && typeof window[t] < "u" && (e = window[t]), e;
}
se.getFromWindow = jr;
function yn(t) {
  const e = jr(t);
  if (!e)
    throw new Error(`${t} is not defined in Window`);
  return e;
}
se.getFromWindowOrThrow = yn;
function fb() {
  return yn("document");
}
se.getDocumentOrThrow = fb;
function db() {
  return jr("document");
}
var Nr = se.getDocument = db;
function pb() {
  return yn("navigator");
}
se.getNavigatorOrThrow = pb;
function gb() {
  return jr("navigator");
}
var ua = se.getNavigator = gb;
function yb() {
  return yn("location");
}
se.getLocationOrThrow = yb;
function wb() {
  return jr("location");
}
var lh = se.getLocation = wb;
function mb() {
  return yn("crypto");
}
se.getCryptoOrThrow = mb;
function bb() {
  return jr("crypto");
}
se.getCrypto = bb;
function Eb() {
  return yn("localStorage");
}
se.getLocalStorageOrThrow = Eb;
function vb() {
  return jr("localStorage");
}
se.getLocalStorage = vb;
var ha = {};
Object.defineProperty(ha, "__esModule", { value: !0 });
var uh = ha.getWindowMetadata = void 0;
const zc = se;
function xb() {
  let t, e;
  try {
    t = zc.getDocumentOrThrow(), e = zc.getLocationOrThrow();
  } catch {
    return null;
  }
  function r() {
    const h = t.getElementsByTagName("link"), f = [];
    for (let d = 0; d < h.length; d++) {
      const p = h[d], g = p.getAttribute("rel");
      if (g && g.toLowerCase().indexOf("icon") > -1) {
        const m = p.getAttribute("href");
        if (m)
          if (m.toLowerCase().indexOf("https:") === -1 && m.toLowerCase().indexOf("http:") === -1 && m.indexOf("//") !== 0) {
            let _ = e.protocol + "//" + e.host;
            if (m.indexOf("/") === 0)
              _ += m;
            else {
              const R = e.pathname.split("/");
              R.pop();
              const b = R.join("/");
              _ += b + "/" + m;
            }
            f.push(_);
          } else if (m.indexOf("//") === 0) {
            const _ = e.protocol + m;
            f.push(_);
          } else
            f.push(m);
      }
    }
    return f;
  }
  function n(...h) {
    const f = t.getElementsByTagName("meta");
    for (let d = 0; d < f.length; d++) {
      const p = f[d], g = ["itemprop", "property", "name"].map((m) => p.getAttribute(m)).filter((m) => m ? h.includes(m) : !1);
      if (g.length && g) {
        const m = p.getAttribute("content");
        if (m)
          return m;
      }
    }
    return "";
  }
  function s() {
    let h = n("name", "og:site_name", "og:title", "twitter:title");
    return h || (h = t.title), h;
  }
  function i() {
    return n("description", "og:description", "twitter:description", "keywords");
  }
  const o = s(), a = i(), c = e.origin, l = r();
  return {
    description: a,
    url: c,
    icons: l,
    name: o
  };
}
uh = ha.getWindowMetadata = xb;
const ys = /* @__PURE__ */ BigInt(2 ** 32 - 1), jc = /* @__PURE__ */ BigInt(32);
function hh(t, e = !1) {
  return e ? { h: Number(t & ys), l: Number(t >> jc & ys) } : { h: Number(t >> jc & ys) | 0, l: Number(t & ys) | 0 };
}
function fh(t, e = !1) {
  const r = t.length;
  let n = new Uint32Array(r), s = new Uint32Array(r);
  for (let i = 0; i < r; i++) {
    const { h: o, l: a } = hh(t[i], e);
    [n[i], s[i]] = [o, a];
  }
  return [n, s];
}
const Hc = (t, e, r) => t >>> r, Kc = (t, e, r) => t << 32 - r | e >>> r, nr = (t, e, r) => t >>> r | e << 32 - r, sr = (t, e, r) => t << 32 - r | e >>> r, Rn = (t, e, r) => t << 64 - r | e >>> r - 32, Pn = (t, e, r) => t >>> r - 32 | e << 64 - r, _b = (t, e) => e, Sb = (t, e) => t, Ib = (t, e, r) => t << r | e >>> 32 - r, Db = (t, e, r) => e << r | t >>> 32 - r, Ab = (t, e, r) => e << r - 32 | t >>> 64 - r, Ob = (t, e, r) => t << r - 32 | e >>> 64 - r;
function lt(t, e, r, n) {
  const s = (e >>> 0) + (n >>> 0);
  return { h: t + r + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const fa = (t, e, r) => (t >>> 0) + (e >>> 0) + (r >>> 0), da = (t, e, r, n) => e + r + n + (t / 2 ** 32 | 0) | 0, $b = (t, e, r, n) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0), Tb = (t, e, r, n, s) => e + r + n + s + (t / 2 ** 32 | 0) | 0, Bb = (t, e, r, n, s) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0) + (s >>> 0), Rb = (t, e, r, n, s, i) => e + r + n + s + i + (t / 2 ** 32 | 0) | 0, Yr = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function fi(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function qt(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("positive integer expected, got " + t);
}
function ft(t, ...e) {
  if (!fi(t))
    throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(t.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + t.length);
}
function di(t) {
  if (typeof t != "function" || typeof t.create != "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  qt(t.outputLen), qt(t.blockLen);
}
function pr(t, e = !0) {
  if (t.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (e && t.finished)
    throw new Error("Hash#digest() has already been called");
}
function pa(t, e) {
  ft(t);
  const r = e.outputLen;
  if (t.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function jn(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function st(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
function ji(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
function gt(t, e) {
  return t << 32 - e | t >>> e;
}
const dh = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function ph(t) {
  return t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255;
}
const Bt = dh ? (t) => t : (t) => ph(t);
function Pb(t) {
  for (let e = 0; e < t.length; e++)
    t[e] = ph(t[e]);
  return t;
}
const ir = dh ? (t) => t : Pb, gh = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Cb = /* @__PURE__ */ Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
function nn(t) {
  if (ft(t), gh)
    return t.toHex();
  let e = "";
  for (let r = 0; r < t.length; r++)
    e += Cb[t[r]];
  return e;
}
const Dt = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function Vc(t) {
  if (t >= Dt._0 && t <= Dt._9)
    return t - Dt._0;
  if (t >= Dt.A && t <= Dt.F)
    return t - (Dt.A - 10);
  if (t >= Dt.a && t <= Dt.f)
    return t - (Dt.a - 10);
}
function Fs(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  if (gh)
    return Uint8Array.fromHex(t);
  const e = t.length, r = e / 2;
  if (e % 2)
    throw new Error("hex string expected, got unpadded hex of length " + e);
  const n = new Uint8Array(r);
  for (let s = 0, i = 0; s < r; s++, i += 2) {
    const o = Vc(t.charCodeAt(i)), a = Vc(t.charCodeAt(i + 1));
    if (o === void 0 || a === void 0) {
      const c = t[i] + t[i + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + i);
    }
    n[s] = o * 16 + a;
  }
  return n;
}
function Nb(t) {
  if (typeof t != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(t));
}
function ht(t) {
  return typeof t == "string" && (t = Nb(t)), ft(t), t;
}
function cr(...t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    ft(s), e += s.length;
  }
  const r = new Uint8Array(e);
  for (let n = 0, s = 0; n < t.length; n++) {
    const i = t[n];
    r.set(i, s), s += i.length;
  }
  return r;
}
let pi = class {
};
function ts(t) {
  const e = (n) => t().update(ht(n)).digest(), r = t();
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = () => t(), e;
}
function Ub(t) {
  const e = (n, s) => t(s).update(ht(n)).digest(), r = t({});
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = (n) => t(n), e;
}
function Hr(t = 32) {
  if (Yr && typeof Yr.getRandomValues == "function")
    return Yr.getRandomValues(new Uint8Array(t));
  if (Yr && typeof Yr.randomBytes == "function")
    return Uint8Array.from(Yr.randomBytes(t));
  throw new Error("crypto.getRandomValues must be defined");
}
const Lb = BigInt(0), xn = BigInt(1), kb = BigInt(2), Mb = BigInt(7), Fb = BigInt(256), qb = BigInt(113), yh = [], wh = [], mh = [];
for (let t = 0, e = xn, r = 1, n = 0; t < 24; t++) {
  [r, n] = [n, (2 * r + 3 * n) % 5], yh.push(2 * (5 * n + r)), wh.push((t + 1) * (t + 2) / 2 % 64);
  let s = Lb;
  for (let i = 0; i < 7; i++)
    e = (e << xn ^ (e >> Mb) * qb) % Fb, e & kb && (s ^= xn << (xn << /* @__PURE__ */ BigInt(i)) - xn);
  mh.push(s);
}
const bh = fh(mh, !0), zb = bh[0], jb = bh[1], Wc = (t, e, r) => r > 32 ? Ab(t, e, r) : Ib(t, e, r), Gc = (t, e, r) => r > 32 ? Ob(t, e, r) : Db(t, e, r);
function Hb(t, e = 24) {
  const r = new Uint32Array(10);
  for (let n = 24 - e; n < 24; n++) {
    for (let o = 0; o < 10; o++)
      r[o] = t[o] ^ t[o + 10] ^ t[o + 20] ^ t[o + 30] ^ t[o + 40];
    for (let o = 0; o < 10; o += 2) {
      const a = (o + 8) % 10, c = (o + 2) % 10, l = r[c], u = r[c + 1], h = Wc(l, u, 1) ^ r[a], f = Gc(l, u, 1) ^ r[a + 1];
      for (let d = 0; d < 50; d += 10)
        t[o + d] ^= h, t[o + d + 1] ^= f;
    }
    let s = t[2], i = t[3];
    for (let o = 0; o < 24; o++) {
      const a = wh[o], c = Wc(s, i, a), l = Gc(s, i, a), u = yh[o];
      s = t[u], i = t[u + 1], t[u] = c, t[u + 1] = l;
    }
    for (let o = 0; o < 50; o += 10) {
      for (let a = 0; a < 10; a++)
        r[a] = t[o + a];
      for (let a = 0; a < 10; a++)
        t[o + a] ^= ~r[(a + 2) % 10] & r[(a + 4) % 10];
    }
    t[0] ^= zb[n], t[1] ^= jb[n];
  }
  st(r);
}
let Kb = class Eh extends pi {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(e, r, n, s = !1, i = 24) {
    if (super(), this.pos = 0, this.posOut = 0, this.finished = !1, this.destroyed = !1, this.enableXOF = !1, this.blockLen = e, this.suffix = r, this.outputLen = n, this.enableXOF = s, this.rounds = i, qt(n), !(0 < e && e < 200))
      throw new Error("only keccak-f1600 function is supported");
    this.state = new Uint8Array(200), this.state32 = jn(this.state);
  }
  clone() {
    return this._cloneInto();
  }
  keccak() {
    ir(this.state32), Hb(this.state32, this.rounds), ir(this.state32), this.posOut = 0, this.pos = 0;
  }
  update(e) {
    pr(this), e = ht(e), ft(e);
    const { blockLen: r, state: n } = this, s = e.length;
    for (let i = 0; i < s; ) {
      const o = Math.min(r - this.pos, s - i);
      for (let a = 0; a < o; a++)
        n[this.pos++] ^= e[i++];
      this.pos === r && this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = !0;
    const { state: e, suffix: r, pos: n, blockLen: s } = this;
    e[n] ^= r, r & 128 && n === s - 1 && this.keccak(), e[s - 1] ^= 128, this.keccak();
  }
  writeInto(e) {
    pr(this, !1), ft(e), this.finish();
    const r = this.state, { blockLen: n } = this;
    for (let s = 0, i = e.length; s < i; ) {
      this.posOut >= n && this.keccak();
      const o = Math.min(n - this.posOut, i - s);
      e.set(r.subarray(this.posOut, this.posOut + o), s), this.posOut += o, s += o;
    }
    return e;
  }
  xofInto(e) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(e);
  }
  xof(e) {
    return qt(e), this.xofInto(new Uint8Array(e));
  }
  digestInto(e) {
    if (pa(e, this), this.finished)
      throw new Error("digest() was already called");
    return this.writeInto(e), this.destroy(), e;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = !0, st(this.state);
  }
  _cloneInto(e) {
    const { blockLen: r, suffix: n, outputLen: s, rounds: i, enableXOF: o } = this;
    return e || (e = new Eh(r, n, s, o, i)), e.state32.set(this.state32), e.pos = this.pos, e.posOut = this.posOut, e.finished = this.finished, e.rounds = i, e.suffix = n, e.outputLen = s, e.enableXOF = o, e.destroyed = this.destroyed, e;
  }
};
const Vb = (t, e, r) => ts(() => new Kb(e, t, r)), Wb = Vb(1, 136, 256 / 8), Gb = "0.1.1";
function Yb() {
  return Gb;
}
class ie extends Error {
  constructor(e, r = {}) {
    const n = (() => {
      var c;
      if (r.cause instanceof ie) {
        if (r.cause.details)
          return r.cause.details;
        if (r.cause.shortMessage)
          return r.cause.shortMessage;
      }
      return r.cause && "details" in r.cause && typeof r.cause.details == "string" ? r.cause.details : (c = r.cause) != null && c.message ? r.cause.message : r.details;
    })(), s = r.cause instanceof ie && r.cause.docsPath || r.docsPath, o = `https://oxlib.sh${s ?? ""}`, a = [
      e || "An error occurred.",
      ...r.metaMessages ? ["", ...r.metaMessages] : [],
      ...n || s ? [
        "",
        n ? `Details: ${n}` : void 0,
        s ? `See: ${o}` : void 0
      ] : []
    ].filter((c) => typeof c == "string").join(`
`);
    super(a, r.cause ? { cause: r.cause } : void 0), Object.defineProperty(this, "details", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), Object.defineProperty(this, "docs", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), Object.defineProperty(this, "docsPath", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), Object.defineProperty(this, "shortMessage", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), Object.defineProperty(this, "cause", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "BaseError"
    }), Object.defineProperty(this, "version", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: `ox@${Yb()}`
    }), this.cause = r.cause, this.details = n, this.docs = o, this.docsPath = s, this.shortMessage = e;
  }
  walk(e) {
    return vh(this, e);
  }
}
function vh(t, e) {
  return e != null && e(t) ? t : t && typeof t == "object" && "cause" in t && t.cause ? vh(t.cause, e) : e ? null : t;
}
const Zr = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Zb(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function Hn(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("positive integer expected, got " + t);
}
function Ur(t, ...e) {
  if (!Zb(t))
    throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(t.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + t.length);
}
function Xb(t) {
  if (typeof t != "function" || typeof t.create != "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  Hn(t.outputLen), Hn(t.blockLen);
}
function un(t, e = !0) {
  if (t.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (e && t.finished)
    throw new Error("Hash#digest() has already been called");
}
function xh(t, e) {
  Ur(t);
  const r = e.outputLen;
  if (t.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function Jb(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function hn(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
function Hi(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
function yt(t, e) {
  return t << 32 - e | t >>> e;
}
const Qb = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function e1(t) {
  return t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255;
}
function t1(t) {
  for (let e = 0; e < t.length; e++)
    t[e] = e1(t[e]);
  return t;
}
const Yc = Qb ? (t) => t : t1;
function r1(t) {
  if (typeof t != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(t));
}
function gi(t) {
  return typeof t == "string" && (t = r1(t)), Ur(t), t;
}
function n1(...t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    Ur(s), e += s.length;
  }
  const r = new Uint8Array(e);
  for (let n = 0, s = 0; n < t.length; n++) {
    const i = t[n];
    r.set(i, s), s += i.length;
  }
  return r;
}
class ga {
}
function _h(t) {
  const e = (n) => t().update(gi(n)).digest(), r = t();
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = () => t(), e;
}
function s1(t = 32) {
  if (Zr && typeof Zr.getRandomValues == "function")
    return Zr.getRandomValues(new Uint8Array(t));
  if (Zr && typeof Zr.randomBytes == "function")
    return Uint8Array.from(Zr.randomBytes(t));
  throw new Error("crypto.getRandomValues must be defined");
}
function i1(t, e, r, n) {
  if (typeof t.setBigUint64 == "function")
    return t.setBigUint64(e, r, n);
  const s = BigInt(32), i = BigInt(4294967295), o = Number(r >> s & i), a = Number(r & i), c = n ? 4 : 0, l = n ? 0 : 4;
  t.setUint32(e + c, o, n), t.setUint32(e + l, a, n);
}
function o1(t, e, r) {
  return t & e ^ ~t & r;
}
function a1(t, e, r) {
  return t & e ^ t & r ^ e & r;
}
let c1 = class extends ga {
  constructor(e, r, n, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = e, this.outputLen = r, this.padOffset = n, this.isLE = s, this.buffer = new Uint8Array(e), this.view = Hi(this.buffer);
  }
  update(e) {
    un(this), e = gi(e), Ur(e);
    const { view: r, buffer: n, blockLen: s } = this, i = e.length;
    for (let o = 0; o < i; ) {
      const a = Math.min(s - this.pos, i - o);
      if (a === s) {
        const c = Hi(e);
        for (; s <= i - o; o += s)
          this.process(c, o);
        continue;
      }
      n.set(e.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += e.length, this.roundClean(), this;
  }
  digestInto(e) {
    un(this), xh(e, this), this.finished = !0;
    const { buffer: r, view: n, blockLen: s, isLE: i } = this;
    let { pos: o } = this;
    r[o++] = 128, hn(this.buffer.subarray(o)), this.padOffset > s - o && (this.process(n, 0), o = 0);
    for (let h = o; h < s; h++)
      r[h] = 0;
    i1(n, s - 8, BigInt(this.length * 8), i), this.process(n, 0);
    const a = Hi(e), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const l = c / 4, u = this.get();
    if (l > u.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < l; h++)
      a.setUint32(4 * h, u[h], i);
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    e || (e = new this.constructor()), e.set(...this.get());
    const { blockLen: r, buffer: n, length: s, finished: i, destroyed: o, pos: a } = this;
    return e.destroyed = o, e.finished = i, e.length = s, e.pos = a, s % r && e.buffer.set(n), e;
  }
  clone() {
    return this._cloneInto();
  }
};
const Kt = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), ws = /* @__PURE__ */ BigInt(2 ** 32 - 1), Zc = /* @__PURE__ */ BigInt(32);
function l1(t, e = !1) {
  return e ? { h: Number(t & ws), l: Number(t >> Zc & ws) } : { h: Number(t >> Zc & ws) | 0, l: Number(t & ws) | 0 };
}
function u1(t, e = !1) {
  const r = t.length;
  let n = new Uint32Array(r), s = new Uint32Array(r);
  for (let i = 0; i < r; i++) {
    const { h: o, l: a } = l1(t[i], e);
    [n[i], s[i]] = [o, a];
  }
  return [n, s];
}
const h1 = (t, e, r) => t << r | e >>> 32 - r, f1 = (t, e, r) => e << r | t >>> 32 - r, d1 = (t, e, r) => e << r - 32 | t >>> 64 - r, p1 = (t, e, r) => t << r - 32 | e >>> 64 - r, g1 = BigInt(0), _n = BigInt(1), y1 = BigInt(2), w1 = BigInt(7), m1 = BigInt(256), b1 = BigInt(113), Sh = [], Ih = [], Dh = [];
for (let t = 0, e = _n, r = 1, n = 0; t < 24; t++) {
  [r, n] = [n, (2 * r + 3 * n) % 5], Sh.push(2 * (5 * n + r)), Ih.push((t + 1) * (t + 2) / 2 % 64);
  let s = g1;
  for (let i = 0; i < 7; i++)
    e = (e << _n ^ (e >> w1) * b1) % m1, e & y1 && (s ^= _n << (_n << /* @__PURE__ */ BigInt(i)) - _n);
  Dh.push(s);
}
const Ah = u1(Dh, !0), E1 = Ah[0], v1 = Ah[1], Xc = (t, e, r) => r > 32 ? d1(t, e, r) : h1(t, e, r), Jc = (t, e, r) => r > 32 ? p1(t, e, r) : f1(t, e, r);
function x1(t, e = 24) {
  const r = new Uint32Array(10);
  for (let n = 24 - e; n < 24; n++) {
    for (let o = 0; o < 10; o++)
      r[o] = t[o] ^ t[o + 10] ^ t[o + 20] ^ t[o + 30] ^ t[o + 40];
    for (let o = 0; o < 10; o += 2) {
      const a = (o + 8) % 10, c = (o + 2) % 10, l = r[c], u = r[c + 1], h = Xc(l, u, 1) ^ r[a], f = Jc(l, u, 1) ^ r[a + 1];
      for (let d = 0; d < 50; d += 10)
        t[o + d] ^= h, t[o + d + 1] ^= f;
    }
    let s = t[2], i = t[3];
    for (let o = 0; o < 24; o++) {
      const a = Ih[o], c = Xc(s, i, a), l = Jc(s, i, a), u = Sh[o];
      s = t[u], i = t[u + 1], t[u] = c, t[u + 1] = l;
    }
    for (let o = 0; o < 50; o += 10) {
      for (let a = 0; a < 10; a++)
        r[a] = t[o + a];
      for (let a = 0; a < 10; a++)
        t[o + a] ^= ~r[(a + 2) % 10] & r[(a + 4) % 10];
    }
    t[0] ^= E1[n], t[1] ^= v1[n];
  }
  hn(r);
}
class ya extends ga {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(e, r, n, s = !1, i = 24) {
    if (super(), this.pos = 0, this.posOut = 0, this.finished = !1, this.destroyed = !1, this.enableXOF = !1, this.blockLen = e, this.suffix = r, this.outputLen = n, this.enableXOF = s, this.rounds = i, Hn(n), !(0 < e && e < 200))
      throw new Error("only keccak-f1600 function is supported");
    this.state = new Uint8Array(200), this.state32 = Jb(this.state);
  }
  clone() {
    return this._cloneInto();
  }
  keccak() {
    Yc(this.state32), x1(this.state32, this.rounds), Yc(this.state32), this.posOut = 0, this.pos = 0;
  }
  update(e) {
    un(this), e = gi(e), Ur(e);
    const { blockLen: r, state: n } = this, s = e.length;
    for (let i = 0; i < s; ) {
      const o = Math.min(r - this.pos, s - i);
      for (let a = 0; a < o; a++)
        n[this.pos++] ^= e[i++];
      this.pos === r && this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = !0;
    const { state: e, suffix: r, pos: n, blockLen: s } = this;
    e[n] ^= r, r & 128 && n === s - 1 && this.keccak(), e[s - 1] ^= 128, this.keccak();
  }
  writeInto(e) {
    un(this, !1), Ur(e), this.finish();
    const r = this.state, { blockLen: n } = this;
    for (let s = 0, i = e.length; s < i; ) {
      this.posOut >= n && this.keccak();
      const o = Math.min(n - this.posOut, i - s);
      e.set(r.subarray(this.posOut, this.posOut + o), s), this.posOut += o, s += o;
    }
    return e;
  }
  xofInto(e) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(e);
  }
  xof(e) {
    return Hn(e), this.xofInto(new Uint8Array(e));
  }
  digestInto(e) {
    if (xh(e, this), this.finished)
      throw new Error("digest() was already called");
    return this.writeInto(e), this.destroy(), e;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = !0, hn(this.state);
  }
  _cloneInto(e) {
    const { blockLen: r, suffix: n, outputLen: s, rounds: i, enableXOF: o } = this;
    return e || (e = new ya(r, n, s, o, i)), e.state32.set(this.state32), e.pos = this.pos, e.posOut = this.posOut, e.finished = this.finished, e.rounds = i, e.suffix = n, e.outputLen = s, e.enableXOF = o, e.destroyed = this.destroyed, e;
  }
}
const _1 = (t, e, r) => _h(() => new ya(e, t, r)), S1 = _1(1, 136, 256 / 8), I1 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), Vt = /* @__PURE__ */ new Uint32Array(64);
let D1 = class extends c1 {
  constructor(e = 32) {
    super(64, e, 8, !1), this.A = Kt[0] | 0, this.B = Kt[1] | 0, this.C = Kt[2] | 0, this.D = Kt[3] | 0, this.E = Kt[4] | 0, this.F = Kt[5] | 0, this.G = Kt[6] | 0, this.H = Kt[7] | 0;
  }
  get() {
    const { A: e, B: r, C: n, D: s, E: i, F: o, G: a, H: c } = this;
    return [e, r, n, s, i, o, a, c];
  }
  // prettier-ignore
  set(e, r, n, s, i, o, a, c) {
    this.A = e | 0, this.B = r | 0, this.C = n | 0, this.D = s | 0, this.E = i | 0, this.F = o | 0, this.G = a | 0, this.H = c | 0;
  }
  process(e, r) {
    for (let h = 0; h < 16; h++, r += 4)
      Vt[h] = e.getUint32(r, !1);
    for (let h = 16; h < 64; h++) {
      const f = Vt[h - 15], d = Vt[h - 2], p = yt(f, 7) ^ yt(f, 18) ^ f >>> 3, g = yt(d, 17) ^ yt(d, 19) ^ d >>> 10;
      Vt[h] = g + Vt[h - 7] + p + Vt[h - 16] | 0;
    }
    let { A: n, B: s, C: i, D: o, E: a, F: c, G: l, H: u } = this;
    for (let h = 0; h < 64; h++) {
      const f = yt(a, 6) ^ yt(a, 11) ^ yt(a, 25), d = u + f + o1(a, c, l) + I1[h] + Vt[h] | 0, g = (yt(n, 2) ^ yt(n, 13) ^ yt(n, 22)) + a1(n, s, i) | 0;
      u = l, l = c, c = a, a = o + d | 0, o = i, i = s, s = n, n = d + g | 0;
    }
    n = n + this.A | 0, s = s + this.B | 0, i = i + this.C | 0, o = o + this.D | 0, a = a + this.E | 0, c = c + this.F | 0, l = l + this.G | 0, u = u + this.H | 0, this.set(n, s, i, o, a, c, l, u);
  }
  roundClean() {
    hn(Vt);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), hn(this.buffer);
  }
};
const A1 = /* @__PURE__ */ _h(() => new D1());
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const wa = /* @__PURE__ */ BigInt(0), To = /* @__PURE__ */ BigInt(1);
function rs(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function ma(t) {
  if (!rs(t))
    throw new Error("Uint8Array expected");
}
function Kn(t, e) {
  if (typeof e != "boolean")
    throw new Error(t + " boolean expected, got " + e);
}
function ms(t) {
  const e = t.toString(16);
  return e.length & 1 ? "0" + e : e;
}
function Oh(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  return t === "" ? wa : BigInt("0x" + t);
}
const $h = (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function"
), O1 = /* @__PURE__ */ Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
function Vn(t) {
  if (ma(t), $h)
    return t.toHex();
  let e = "";
  for (let r = 0; r < t.length; r++)
    e += O1[t[r]];
  return e;
}
const At = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function Qc(t) {
  if (t >= At._0 && t <= At._9)
    return t - At._0;
  if (t >= At.A && t <= At.F)
    return t - (At.A - 10);
  if (t >= At.a && t <= At.f)
    return t - (At.a - 10);
}
function qs(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  if ($h)
    return Uint8Array.fromHex(t);
  const e = t.length, r = e / 2;
  if (e % 2)
    throw new Error("hex string expected, got unpadded hex of length " + e);
  const n = new Uint8Array(r);
  for (let s = 0, i = 0; s < r; s++, i += 2) {
    const o = Qc(t.charCodeAt(i)), a = Qc(t.charCodeAt(i + 1));
    if (o === void 0 || a === void 0) {
      const c = t[i] + t[i + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + i);
    }
    n[s] = o * 16 + a;
  }
  return n;
}
function Rr(t) {
  return Oh(Vn(t));
}
function Th(t) {
  return ma(t), Oh(Vn(Uint8Array.from(t).reverse()));
}
function ns(t, e) {
  return qs(t.toString(16).padStart(e * 2, "0"));
}
function Bh(t, e) {
  return ns(t, e).reverse();
}
function tt(t, e, r) {
  let n;
  if (typeof e == "string")
    try {
      n = qs(e);
    } catch (i) {
      throw new Error(t + " must be hex string or Uint8Array, cause: " + i);
    }
  else if (rs(e))
    n = Uint8Array.from(e);
  else
    throw new Error(t + " must be hex string or Uint8Array");
  const s = n.length;
  if (typeof r == "number" && s !== r)
    throw new Error(t + " of length " + r + " expected, got " + s);
  return n;
}
function zs(...t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    ma(s), e += s.length;
  }
  const r = new Uint8Array(e);
  for (let n = 0, s = 0; n < t.length; n++) {
    const i = t[n];
    r.set(i, s), s += i.length;
  }
  return r;
}
const Ki = (t) => typeof t == "bigint" && wa <= t;
function ba(t, e, r) {
  return Ki(t) && Ki(e) && Ki(r) && e <= t && t < r;
}
function sn(t, e, r, n) {
  if (!ba(e, r, n))
    throw new Error("expected valid " + t + ": " + r + " <= n < " + n + ", got " + e);
}
function $1(t) {
  let e;
  for (e = 0; t > wa; t >>= To, e += 1)
    ;
  return e;
}
const yi = (t) => (To << BigInt(t)) - To, Vi = (t) => new Uint8Array(t), el = (t) => Uint8Array.from(t);
function T1(t, e, r) {
  if (typeof t != "number" || t < 2)
    throw new Error("hashLen must be a number");
  if (typeof e != "number" || e < 2)
    throw new Error("qByteLen must be a number");
  if (typeof r != "function")
    throw new Error("hmacFn must be a function");
  let n = Vi(t), s = Vi(t), i = 0;
  const o = () => {
    n.fill(1), s.fill(0), i = 0;
  }, a = (...h) => r(s, n, ...h), c = (h = Vi(0)) => {
    s = a(el([0]), h), n = a(), h.length !== 0 && (s = a(el([1]), h), n = a());
  }, l = () => {
    if (i++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let h = 0;
    const f = [];
    for (; h < e; ) {
      n = a();
      const d = n.slice();
      f.push(d), h += n.length;
    }
    return zs(...f);
  };
  return (h, f) => {
    o(), c(h);
    let d;
    for (; !(d = f(l())); )
      c();
    return o(), d;
  };
}
const B1 = {
  bigint: (t) => typeof t == "bigint",
  function: (t) => typeof t == "function",
  boolean: (t) => typeof t == "boolean",
  string: (t) => typeof t == "string",
  stringOrUint8Array: (t) => typeof t == "string" || rs(t),
  isSafeInteger: (t) => Number.isSafeInteger(t),
  array: (t) => Array.isArray(t),
  field: (t, e) => e.Fp.isValid(t),
  hash: (t) => typeof t == "function" && Number.isSafeInteger(t.outputLen)
};
function wi(t, e, r = {}) {
  const n = (s, i, o) => {
    const a = B1[i];
    if (typeof a != "function")
      throw new Error("invalid validator function");
    const c = t[s];
    if (!(o && c === void 0) && !a(c, t))
      throw new Error("param " + String(s) + " is invalid. Expected " + i + ", got " + c);
  };
  for (const [s, i] of Object.entries(e))
    n(s, i, !1);
  for (const [s, i] of Object.entries(r))
    n(s, i, !0);
  return t;
}
function tl(t) {
  const e = /* @__PURE__ */ new WeakMap();
  return (r, ...n) => {
    const s = e.get(r);
    if (s !== void 0)
      return s;
    const i = t(r, ...n);
    return e.set(r, i), i;
  };
}
function R1(t, e) {
  if (il(t) > e)
    throw new Q1({
      givenSize: il(t),
      maxSize: e
    });
}
const Ot = {
  zero: 48,
  nine: 57,
  A: 65,
  F: 70,
  a: 97,
  f: 102
};
function rl(t) {
  if (t >= Ot.zero && t <= Ot.nine)
    return t - Ot.zero;
  if (t >= Ot.A && t <= Ot.F)
    return t - (Ot.A - 10);
  if (t >= Ot.a && t <= Ot.f)
    return t - (Ot.a - 10);
}
function P1(t, e = {}) {
  const { dir: r, size: n = 32 } = e;
  if (n === 0)
    return t;
  if (t.length > n)
    throw new eE({
      size: t.length,
      targetSize: n,
      type: "Bytes"
    });
  const s = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = r === "right";
    s[o ? i : n - i - 1] = t[o ? i : t.length - i - 1];
  }
  return s;
}
function Rh(t, e) {
  if (gr(t) > e)
    throw new j1({
      givenSize: gr(t),
      maxSize: e
    });
}
function C1(t, e) {
  if (typeof e == "number" && e > 0 && e > gr(t) - 1)
    throw new Nh({
      offset: e,
      position: "start",
      size: gr(t)
    });
}
function N1(t, e, r) {
  if (typeof e == "number" && typeof r == "number" && gr(t) !== r - e)
    throw new Nh({
      offset: r,
      position: "end",
      size: gr(t)
    });
}
function Ph(t, e = {}) {
  const { dir: r, size: n = 32 } = e;
  if (n === 0)
    return t;
  const s = t.replace("0x", "");
  if (s.length > n * 2)
    throw new H1({
      size: Math.ceil(s.length / 2),
      targetSize: n,
      type: "Hex"
    });
  return `0x${s[r === "right" ? "padEnd" : "padStart"](n * 2, "0")}`;
}
const U1 = "#__bigint";
function Ea(t, e, r) {
  return JSON.stringify(t, (n, s) => typeof s == "bigint" ? s.toString() + U1 : s, r);
}
const L1 = /* @__PURE__ */ Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
function k1(t, e = {}) {
  const { strict: r = !1 } = e;
  if (!t)
    throw new nl(t);
  if (typeof t != "string")
    throw new nl(t);
  if (r && !/^0x[0-9a-fA-F]*$/.test(t))
    throw new sl(t);
  if (!t.startsWith("0x"))
    throw new sl(t);
}
function M1(...t) {
  return `0x${t.reduce((e, r) => e + r.replace("0x", ""), "")}`;
}
function va(t) {
  return t instanceof Uint8Array ? js(t) : Array.isArray(t) ? js(new Uint8Array(t)) : t;
}
function js(t, e = {}) {
  let r = "";
  for (let s = 0; s < t.length; s++)
    r += L1[t[s]];
  const n = `0x${r}`;
  return typeof e.size == "number" ? (Rh(n, e.size), Ch(n, e.size)) : n;
}
function Wi(t, e = {}) {
  const { signed: r, size: n } = e, s = BigInt(t);
  let i;
  n ? r ? i = (1n << BigInt(n) * 8n - 1n) - 1n : i = 2n ** (BigInt(n) * 8n) - 1n : typeof t == "number" && (i = BigInt(Number.MAX_SAFE_INTEGER));
  const o = typeof i == "bigint" && r ? -i - 1n : 0;
  if (i && s > i || s < o) {
    const l = typeof t == "bigint" ? "n" : "";
    throw new z1({
      max: i ? `${i}${l}` : void 0,
      min: `${o}${l}`,
      signed: r,
      size: n,
      value: `${t}${l}`
    });
  }
  const c = `0x${(r && s < 0 ? (1n << BigInt(n * 8)) + BigInt(s) : s).toString(16)}`;
  return n ? F1(c, n) : c;
}
function F1(t, e) {
  return Ph(t, { dir: "left", size: e });
}
function Ch(t, e) {
  return Ph(t, { dir: "right", size: e });
}
function Pt(t, e, r, n = {}) {
  const { strict: s } = n;
  C1(t, e);
  const i = `0x${t.replace("0x", "").slice((e ?? 0) * 2, (r ?? t.length) * 2)}`;
  return s && N1(i, e, r), i;
}
function gr(t) {
  return Math.ceil((t.length - 2) / 2);
}
function q1(t, e = {}) {
  const { strict: r = !1 } = e;
  try {
    return k1(t, { strict: r }), !0;
  } catch {
    return !1;
  }
}
class z1 extends ie {
  constructor({ max: e, min: r, signed: n, size: s, value: i }) {
    super(`Number \`${i}\` is not in safe${s ? ` ${s * 8}-bit` : ""}${n ? " signed" : " unsigned"} integer range ${e ? `(\`${r}\` to \`${e}\`)` : `(above \`${r}\`)`}`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.IntegerOutOfRangeError"
    });
  }
}
class nl extends ie {
  constructor(e) {
    super(`Value \`${typeof e == "object" ? Ea(e) : e}\` of type \`${typeof e}\` is an invalid hex type.`, {
      metaMessages: ['Hex types must be represented as `"0x${string}"`.']
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.InvalidHexTypeError"
    });
  }
}
class sl extends ie {
  constructor(e) {
    super(`Value \`${e}\` is an invalid hex value.`, {
      metaMessages: [
        'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
      ]
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.InvalidHexValueError"
    });
  }
}
let j1 = class extends ie {
  constructor({ givenSize: e, maxSize: r }) {
    super(`Size cannot exceed \`${r}\` bytes. Given size: \`${e}\` bytes.`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.SizeOverflowError"
    });
  }
};
class Nh extends ie {
  constructor({ offset: e, position: r, size: n }) {
    super(`Slice ${r === "start" ? "starting" : "ending"} at offset \`${e}\` is out-of-bounds (size: \`${n}\`).`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.SliceOffsetOutOfBoundsError"
    });
  }
}
let H1 = class extends ie {
  constructor({ size: e, targetSize: r, type: n }) {
    super(`${n.charAt(0).toUpperCase()}${n.slice(1).toLowerCase()} size (\`${e}\`) exceeds padding size (\`${r}\`).`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Hex.SizeExceedsPaddingSizeError"
    });
  }
};
const K1 = /* @__PURE__ */ new TextEncoder();
function V1(t) {
  if (!(t instanceof Uint8Array)) {
    if (!t)
      throw new bs(t);
    if (typeof t != "object")
      throw new bs(t);
    if (!("BYTES_PER_ELEMENT" in t))
      throw new bs(t);
    if (t.BYTES_PER_ELEMENT !== 1 || t.constructor.name !== "Uint8Array")
      throw new bs(t);
  }
}
function W1(t) {
  return t instanceof Uint8Array ? t : typeof t == "string" ? Y1(t) : G1(t);
}
function G1(t) {
  return t instanceof Uint8Array ? t : new Uint8Array(t);
}
function Y1(t, e = {}) {
  const { size: r } = e;
  let n = t;
  r && (Rh(t, r), n = Ch(t, r));
  let s = n.slice(2);
  s.length % 2 && (s = `0${s}`);
  const i = s.length / 2, o = new Uint8Array(i);
  for (let a = 0, c = 0; a < i; a++) {
    const l = rl(s.charCodeAt(c++)), u = rl(s.charCodeAt(c++));
    if (l === void 0 || u === void 0)
      throw new ie(`Invalid byte sequence ("${s[c - 2]}${s[c - 1]}" in "${s}").`);
    o[a] = l * 16 + u;
  }
  return o;
}
function Z1(t, e = {}) {
  const { size: r } = e, n = K1.encode(t);
  return typeof r == "number" ? (R1(n, r), X1(n, r)) : n;
}
function X1(t, e) {
  return P1(t, { dir: "right", size: e });
}
function il(t) {
  return t.length;
}
function J1(t) {
  try {
    return V1(t), !0;
  } catch {
    return !1;
  }
}
class bs extends ie {
  constructor(e) {
    super(`Value \`${typeof e == "object" ? Ea(e) : e}\` of type \`${typeof e}\` is an invalid Bytes value.`, {
      metaMessages: ["Bytes values must be of type `Bytes`."]
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Bytes.InvalidBytesTypeError"
    });
  }
}
class Q1 extends ie {
  constructor({ givenSize: e, maxSize: r }) {
    super(`Size cannot exceed \`${r}\` bytes. Given size: \`${e}\` bytes.`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Bytes.SizeOverflowError"
    });
  }
}
class eE extends ie {
  constructor({ size: e, targetSize: r, type: n }) {
    super(`${n.charAt(0).toUpperCase()}${n.slice(1).toLowerCase()} size (\`${e}\`) exceeds padding size (\`${r}\`).`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Bytes.SizeExceedsPaddingSizeError"
    });
  }
}
function Uh(t, e = {}) {
  const { as: r = typeof t == "string" ? "Hex" : "Bytes" } = e, n = S1(W1(t));
  return r === "Bytes" ? n : js(n);
}
class tE extends Map {
  constructor(e) {
    super(), Object.defineProperty(this, "maxSize", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.maxSize = e;
  }
  get(e) {
    const r = super.get(e);
    return super.has(e) && r !== void 0 && (this.delete(e), super.set(e, r)), r;
  }
  set(e, r) {
    if (super.set(e, r), this.maxSize && this.size > this.maxSize) {
      const n = this.keys().next().value;
      n && this.delete(n);
    }
    return this;
  }
}
const rE = {
  checksum: /* @__PURE__ */ new tE(8192)
}, Gi = rE.checksum;
function Lh(t, e = {}) {
  const { compressed: r } = e, { prefix: n, x: s, y: i } = t;
  if (r === !1 || typeof s == "bigint" && typeof i == "bigint") {
    if (n !== 4)
      throw new ol({
        prefix: n,
        cause: new cE()
      });
    return;
  }
  if (r === !0 || typeof s == "bigint" && typeof i > "u") {
    if (n !== 3 && n !== 2)
      throw new ol({
        prefix: n,
        cause: new aE()
      });
    return;
  }
  throw new oE({ publicKey: t });
}
function nE(t) {
  const e = (() => {
    if (q1(t))
      return kh(t);
    if (J1(t))
      return sE(t);
    const { prefix: r, x: n, y: s } = t;
    return typeof n == "bigint" && typeof s == "bigint" ? { prefix: r ?? 4, x: n, y: s } : { prefix: r, x: n };
  })();
  return Lh(e), e;
}
function sE(t) {
  return kh(js(t));
}
function kh(t) {
  if (t.length !== 132 && t.length !== 130 && t.length !== 68)
    throw new lE({ publicKey: t });
  if (t.length === 130) {
    const n = BigInt(Pt(t, 0, 32)), s = BigInt(Pt(t, 32, 64));
    return {
      prefix: 4,
      x: n,
      y: s
    };
  }
  if (t.length === 132) {
    const n = Number(Pt(t, 0, 1)), s = BigInt(Pt(t, 1, 33)), i = BigInt(Pt(t, 33, 65));
    return {
      prefix: n,
      x: s,
      y: i
    };
  }
  const e = Number(Pt(t, 0, 1)), r = BigInt(Pt(t, 1, 33));
  return {
    prefix: e,
    x: r
  };
}
function iE(t, e = {}) {
  Lh(t);
  const { prefix: r, x: n, y: s } = t, { includePrefix: i = !0 } = e;
  return M1(
    i ? Wi(r, { size: 1 }) : "0x",
    Wi(n, { size: 32 }),
    // If the public key is not compressed, add the y coordinate.
    typeof s == "bigint" ? Wi(s, { size: 32 }) : "0x"
  );
}
class oE extends ie {
  constructor({ publicKey: e }) {
    super(`Value \`${Ea(e)}\` is not a valid public key.`, {
      metaMessages: [
        "Public key must contain:",
        "- an `x` and `prefix` value (compressed)",
        "- an `x`, `y`, and `prefix` value (uncompressed)"
      ]
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "PublicKey.InvalidError"
    });
  }
}
class ol extends ie {
  constructor({ prefix: e, cause: r }) {
    super(`Prefix "${e}" is invalid.`, {
      cause: r
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "PublicKey.InvalidPrefixError"
    });
  }
}
class aE extends ie {
  constructor() {
    super("Prefix must be 2 or 3 for compressed public keys."), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "PublicKey.InvalidCompressedPrefixError"
    });
  }
}
class cE extends ie {
  constructor() {
    super("Prefix must be 4 for uncompressed public keys."), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "PublicKey.InvalidUncompressedPrefixError"
    });
  }
}
let lE = class extends ie {
  constructor({ publicKey: e }) {
    super(`Value \`${e}\` is an invalid public key size.`, {
      metaMessages: [
        "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
        `Received ${gr(va(e))} bytes.`
      ]
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "PublicKey.InvalidSerializedSizeError"
    });
  }
};
const uE = /^0x[a-fA-F0-9]{40}$/;
function Mh(t, e = {}) {
  const { strict: r = !0 } = e;
  if (!uE.test(t))
    throw new al({
      address: t,
      cause: new dE()
    });
  if (r) {
    if (t.toLowerCase() === t)
      return;
    if (Fh(t) !== t)
      throw new al({
        address: t,
        cause: new pE()
      });
  }
}
function Fh(t) {
  if (Gi.has(t))
    return Gi.get(t);
  Mh(t, { strict: !1 });
  const e = t.substring(2).toLowerCase(), r = Uh(Z1(e), { as: "Bytes" }), n = e.split("");
  for (let i = 0; i < 40; i += 2)
    r[i >> 1] >> 4 >= 8 && n[i] && (n[i] = n[i].toUpperCase()), (r[i >> 1] & 15) >= 8 && n[i + 1] && (n[i + 1] = n[i + 1].toUpperCase());
  const s = `0x${n.join("")}`;
  return Gi.set(t, s), s;
}
function hE(t, e = {}) {
  const { checksum: r = !1 } = e;
  return Mh(t), r ? Fh(t) : t;
}
function fE(t, e = {}) {
  const r = Uh(`0x${iE(t).slice(4)}`).substring(26);
  return hE(`0x${r}`, e);
}
class al extends ie {
  constructor({ address: e, cause: r }) {
    super(`Address "${e}" is invalid.`, {
      cause: r
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Address.InvalidAddressError"
    });
  }
}
class dE extends ie {
  constructor() {
    super("Address is not a 20 byte (40 hexadecimal character) value."), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Address.InvalidInputError"
    });
  }
}
class pE extends ie {
  constructor() {
    super("Address does not match its checksum counterpart."), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Address.InvalidChecksumError"
    });
  }
}
let qh = class extends ga {
  constructor(e, r) {
    super(), this.finished = !1, this.destroyed = !1, Xb(e);
    const n = gi(r);
    if (this.iHash = e.create(), typeof this.iHash.update != "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const s = this.blockLen, i = new Uint8Array(s);
    i.set(n.length > s ? e.create().update(n).digest() : n);
    for (let o = 0; o < i.length; o++)
      i[o] ^= 54;
    this.iHash.update(i), this.oHash = e.create();
    for (let o = 0; o < i.length; o++)
      i[o] ^= 106;
    this.oHash.update(i), hn(i);
  }
  update(e) {
    return un(this), this.iHash.update(e), this;
  }
  digestInto(e) {
    un(this), Ur(e, this.outputLen), this.finished = !0, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
  }
  digest() {
    const e = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(e), e;
  }
  _cloneInto(e) {
    e || (e = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash: r, iHash: n, finished: s, destroyed: i, blockLen: o, outputLen: a } = this;
    return e = e, e.finished = s, e.destroyed = i, e.blockLen = o, e.outputLen = a, e.oHash = r._cloneInto(e.oHash), e.iHash = n._cloneInto(e.iHash), e;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
};
const zh = (t, e, r) => new qh(t, e).update(r).digest();
zh.create = (t, e) => new qh(t, e);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const je = BigInt(0), Ne = BigInt(1), Dr = /* @__PURE__ */ BigInt(2), gE = /* @__PURE__ */ BigInt(3), jh = /* @__PURE__ */ BigInt(4), Hh = /* @__PURE__ */ BigInt(5), Kh = /* @__PURE__ */ BigInt(8);
function qe(t, e) {
  const r = t % e;
  return r >= je ? r : e + r;
}
function Je(t, e, r) {
  let n = t;
  for (; e-- > je; )
    n *= n, n %= r;
  return n;
}
function Bo(t, e) {
  if (t === je)
    throw new Error("invert: expected non-zero number");
  if (e <= je)
    throw new Error("invert: expected positive modulus, got " + e);
  let r = qe(t, e), n = e, s = je, i = Ne;
  for (; r !== je; ) {
    const a = n / r, c = n % r, l = s - i * a;
    n = r, r = c, s = i, i = l;
  }
  if (n !== Ne)
    throw new Error("invert: does not exist");
  return qe(s, e);
}
function Vh(t, e) {
  const r = (t.ORDER + Ne) / jh, n = t.pow(e, r);
  if (!t.eql(t.sqr(n), e))
    throw new Error("Cannot find square root");
  return n;
}
function yE(t, e) {
  const r = (t.ORDER - Hh) / Kh, n = t.mul(e, Dr), s = t.pow(n, r), i = t.mul(e, s), o = t.mul(t.mul(i, Dr), s), a = t.mul(i, t.sub(o, t.ONE));
  if (!t.eql(t.sqr(a), e))
    throw new Error("Cannot find square root");
  return a;
}
function wE(t) {
  if (t < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let e = t - Ne, r = 0;
  for (; e % Dr === je; )
    e /= Dr, r++;
  let n = Dr;
  const s = xa(t);
  for (; cl(s, n) === 1; )
    if (n++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (r === 1)
    return Vh;
  let i = s.pow(n, e);
  const o = (e + Ne) / Dr;
  return function(c, l) {
    if (c.is0(l))
      return l;
    if (cl(c, l) !== 1)
      throw new Error("Cannot find square root");
    let u = r, h = c.mul(c.ONE, i), f = c.pow(l, e), d = c.pow(l, o);
    for (; !c.eql(f, c.ONE); ) {
      if (c.is0(f))
        return c.ZERO;
      let p = 1, g = c.sqr(f);
      for (; !c.eql(g, c.ONE); )
        if (p++, g = c.sqr(g), p === u)
          throw new Error("Cannot find square root");
      const m = Ne << BigInt(u - p - 1), _ = c.pow(h, m);
      u = p, h = c.sqr(_), f = c.mul(f, h), d = c.mul(d, _);
    }
    return d;
  };
}
function mE(t) {
  return t % jh === gE ? Vh : t % Kh === Hh ? yE : wE(t);
}
const bE = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function EE(t) {
  const e = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  }, r = bE.reduce((n, s) => (n[s] = "function", n), e);
  return wi(t, r);
}
function vE(t, e, r) {
  if (r < je)
    throw new Error("invalid exponent, negatives unsupported");
  if (r === je)
    return t.ONE;
  if (r === Ne)
    return e;
  let n = t.ONE, s = e;
  for (; r > je; )
    r & Ne && (n = t.mul(n, s)), s = t.sqr(s), r >>= Ne;
  return n;
}
function Wh(t, e, r = !1) {
  const n = new Array(e.length).fill(r ? t.ZERO : void 0), s = e.reduce((o, a, c) => t.is0(a) ? o : (n[c] = o, t.mul(o, a)), t.ONE), i = t.inv(s);
  return e.reduceRight((o, a, c) => t.is0(a) ? o : (n[c] = t.mul(o, n[c]), t.mul(o, a)), i), n;
}
function cl(t, e) {
  const r = (t.ORDER - Ne) / Dr, n = t.pow(e, r), s = t.eql(n, t.ONE), i = t.eql(n, t.ZERO), o = t.eql(n, t.neg(t.ONE));
  if (!s && !i && !o)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : i ? 0 : -1;
}
function Gh(t, e) {
  e !== void 0 && Hn(e);
  const r = e !== void 0 ? e : t.toString(2).length, n = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: n };
}
function xa(t, e, r = !1, n = {}) {
  if (t <= je)
    throw new Error("invalid field: expected ORDER > 0, got " + t);
  const { nBitLength: s, nByteLength: i } = Gh(t, e);
  if (i > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let o;
  const a = Object.freeze({
    ORDER: t,
    isLE: r,
    BITS: s,
    BYTES: i,
    MASK: yi(s),
    ZERO: je,
    ONE: Ne,
    create: (c) => qe(c, t),
    isValid: (c) => {
      if (typeof c != "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof c);
      return je <= c && c < t;
    },
    is0: (c) => c === je,
    isOdd: (c) => (c & Ne) === Ne,
    neg: (c) => qe(-c, t),
    eql: (c, l) => c === l,
    sqr: (c) => qe(c * c, t),
    add: (c, l) => qe(c + l, t),
    sub: (c, l) => qe(c - l, t),
    mul: (c, l) => qe(c * l, t),
    pow: (c, l) => vE(a, c, l),
    div: (c, l) => qe(c * Bo(l, t), t),
    // Same as above, but doesn't normalize
    sqrN: (c) => c * c,
    addN: (c, l) => c + l,
    subN: (c, l) => c - l,
    mulN: (c, l) => c * l,
    inv: (c) => Bo(c, t),
    sqrt: n.sqrt || ((c) => (o || (o = mE(t)), o(a, c))),
    toBytes: (c) => r ? Bh(c, i) : ns(c, i),
    fromBytes: (c) => {
      if (c.length !== i)
        throw new Error("Field.fromBytes: expected " + i + " bytes, got " + c.length);
      return r ? Th(c) : Rr(c);
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (c) => Wh(a, c),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (c, l, u) => u ? l : c
  });
  return Object.freeze(a);
}
function Yh(t) {
  if (typeof t != "bigint")
    throw new Error("field order must be bigint");
  const e = t.toString(2).length;
  return Math.ceil(e / 8);
}
function Zh(t) {
  const e = Yh(t);
  return e + Math.ceil(e / 2);
}
function xE(t, e, r = !1) {
  const n = t.length, s = Yh(e), i = Zh(e);
  if (n < 16 || n < i || n > 1024)
    throw new Error("expected " + i + "-1024 bytes of input, got " + n);
  const o = r ? Th(t) : Rr(t), a = qe(o, e - Ne) + Ne;
  return r ? Bh(a, s) : ns(a, s);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const ll = BigInt(0), Ro = BigInt(1);
function Yi(t, e) {
  const r = e.negate();
  return t ? r : e;
}
function Xh(t, e) {
  if (!Number.isSafeInteger(t) || t <= 0 || t > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + t);
}
function Zi(t, e) {
  Xh(t, e);
  const r = Math.ceil(e / t) + 1, n = 2 ** (t - 1), s = 2 ** t, i = yi(t), o = BigInt(t);
  return { windows: r, windowSize: n, mask: i, maxNumber: s, shiftBy: o };
}
function ul(t, e, r) {
  const { windowSize: n, mask: s, maxNumber: i, shiftBy: o } = r;
  let a = Number(t & s), c = t >> o;
  a > n && (a -= i, c += Ro);
  const l = e * n, u = l + Math.abs(a) - 1, h = a === 0, f = a < 0, d = e % 2 !== 0;
  return { nextN: c, offset: u, isZero: h, isNeg: f, isNegF: d, offsetF: l };
}
function _E(t, e) {
  if (!Array.isArray(t))
    throw new Error("array expected");
  t.forEach((r, n) => {
    if (!(r instanceof e))
      throw new Error("invalid point at index " + n);
  });
}
function SE(t, e) {
  if (!Array.isArray(t))
    throw new Error("array of scalars expected");
  t.forEach((r, n) => {
    if (!e.isValid(r))
      throw new Error("invalid scalar at index " + n);
  });
}
const Xi = /* @__PURE__ */ new WeakMap(), Jh = /* @__PURE__ */ new WeakMap();
function Ji(t) {
  return Jh.get(t) || 1;
}
function IE(t, e) {
  return {
    constTimeNegate: Yi,
    hasPrecomputes(r) {
      return Ji(r) !== 1;
    },
    // non-const time multiplication ladder
    unsafeLadder(r, n, s = t.ZERO) {
      let i = r;
      for (; n > ll; )
        n & Ro && (s = s.add(i)), i = i.double(), n >>= Ro;
      return s;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param elm Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(r, n) {
      const { windows: s, windowSize: i } = Zi(n, e), o = [];
      let a = r, c = a;
      for (let l = 0; l < s; l++) {
        c = a, o.push(c);
        for (let u = 1; u < i; u++)
          c = c.add(a), o.push(c);
        a = c.double();
      }
      return o;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(r, n, s) {
      let i = t.ZERO, o = t.BASE;
      const a = Zi(r, e);
      for (let c = 0; c < a.windows; c++) {
        const { nextN: l, offset: u, isZero: h, isNeg: f, isNegF: d, offsetF: p } = ul(s, c, a);
        s = l, h ? o = o.add(Yi(d, n[p])) : i = i.add(Yi(f, n[u]));
      }
      return { p: i, f: o };
    },
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(r, n, s, i = t.ZERO) {
      const o = Zi(r, e);
      for (let a = 0; a < o.windows && s !== ll; a++) {
        const { nextN: c, offset: l, isZero: u, isNeg: h } = ul(s, a, o);
        if (s = c, !u) {
          const f = n[l];
          i = i.add(h ? f.negate() : f);
        }
      }
      return i;
    },
    getPrecomputes(r, n, s) {
      let i = Xi.get(n);
      return i || (i = this.precomputeWindow(n, r), r !== 1 && Xi.set(n, s(i))), i;
    },
    wNAFCached(r, n, s) {
      const i = Ji(r);
      return this.wNAF(i, this.getPrecomputes(i, r, s), n);
    },
    wNAFCachedUnsafe(r, n, s, i) {
      const o = Ji(r);
      return o === 1 ? this.unsafeLadder(r, n, i) : this.wNAFUnsafe(o, this.getPrecomputes(o, r, s), n, i);
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize(r, n) {
      Xh(n, e), Jh.set(r, n), Xi.delete(r);
    }
  };
}
function DE(t, e, r, n) {
  _E(r, t), SE(n, e);
  const s = r.length, i = n.length;
  if (s !== i)
    throw new Error("arrays of points and scalars must have equal length");
  const o = t.ZERO, a = $1(BigInt(s));
  let c = 1;
  a > 12 ? c = a - 3 : a > 4 ? c = a - 2 : a > 0 && (c = 2);
  const l = yi(c), u = new Array(Number(l) + 1).fill(o), h = Math.floor((e.BITS - 1) / c) * c;
  let f = o;
  for (let d = h; d >= 0; d -= c) {
    u.fill(o);
    for (let g = 0; g < i; g++) {
      const m = n[g], _ = Number(m >> BigInt(d) & l);
      u[_] = u[_].add(r[g]);
    }
    let p = o;
    for (let g = u.length - 1, m = o; g > 0; g--)
      m = m.add(u[g]), p = p.add(m);
    if (f = f.add(p), d !== 0)
      for (let g = 0; g < c; g++)
        f = f.double();
  }
  return f;
}
function Qh(t) {
  return EE(t.Fp), wi(t, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  }), Object.freeze({
    ...Gh(t.n, t.nBitLength),
    ...t,
    p: t.Fp.ORDER
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function hl(t) {
  t.lowS !== void 0 && Kn("lowS", t.lowS), t.prehash !== void 0 && Kn("prehash", t.prehash);
}
function AE(t) {
  const e = Qh(t);
  wi(e, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo: r, Fp: n, a: s } = e;
  if (r) {
    if (!n.eql(s, n.ZERO))
      throw new Error("invalid endo: CURVE.a must be 0");
    if (typeof r != "object" || typeof r.beta != "bigint" || typeof r.splitScalar != "function")
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
  }
  return Object.freeze({ ...e });
}
let OE = class extends Error {
  constructor(e = "") {
    super(e);
  }
};
const Ct = {
  // asn.1 DER encoding utils
  Err: OE,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (t, e) => {
      const { Err: r } = Ct;
      if (t < 0 || t > 256)
        throw new r("tlv.encode: wrong tag");
      if (e.length & 1)
        throw new r("tlv.encode: unpadded data");
      const n = e.length / 2, s = ms(n);
      if (s.length / 2 & 128)
        throw new r("tlv.encode: long form length too big");
      const i = n > 127 ? ms(s.length / 2 | 128) : "";
      return ms(t) + i + s + e;
    },
    // v - value, l - left bytes (unparsed)
    decode(t, e) {
      const { Err: r } = Ct;
      let n = 0;
      if (t < 0 || t > 256)
        throw new r("tlv.encode: wrong tag");
      if (e.length < 2 || e[n++] !== t)
        throw new r("tlv.decode: wrong tlv");
      const s = e[n++], i = !!(s & 128);
      let o = 0;
      if (!i)
        o = s;
      else {
        const c = s & 127;
        if (!c)
          throw new r("tlv.decode(long): indefinite length not supported");
        if (c > 4)
          throw new r("tlv.decode(long): byte length is too big");
        const l = e.subarray(n, n + c);
        if (l.length !== c)
          throw new r("tlv.decode: length bytes not complete");
        if (l[0] === 0)
          throw new r("tlv.decode(long): zero leftmost byte");
        for (const u of l)
          o = o << 8 | u;
        if (n += c, o < 128)
          throw new r("tlv.decode(long): not minimal encoding");
      }
      const a = e.subarray(n, n + o);
      if (a.length !== o)
        throw new r("tlv.decode: wrong value length");
      return { v: a, l: e.subarray(n + o) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(t) {
      const { Err: e } = Ct;
      if (t < Lt)
        throw new e("integer: negative integers are not allowed");
      let r = ms(t);
      if (Number.parseInt(r[0], 16) & 8 && (r = "00" + r), r.length & 1)
        throw new e("unexpected DER parsing assertion: unpadded hex");
      return r;
    },
    decode(t) {
      const { Err: e } = Ct;
      if (t[0] & 128)
        throw new e("invalid signature integer: negative");
      if (t[0] === 0 && !(t[1] & 128))
        throw new e("invalid signature integer: unnecessary leading zero");
      return Rr(t);
    }
  },
  toSig(t) {
    const { Err: e, _int: r, _tlv: n } = Ct, s = tt("signature", t), { v: i, l: o } = n.decode(48, s);
    if (o.length)
      throw new e("invalid signature: left bytes after parsing");
    const { v: a, l: c } = n.decode(2, i), { v: l, l: u } = n.decode(2, c);
    if (u.length)
      throw new e("invalid signature: left bytes after parsing");
    return { r: r.decode(a), s: r.decode(l) };
  },
  hexFromSig(t) {
    const { _tlv: e, _int: r } = Ct, n = e.encode(2, r.encode(t.r)), s = e.encode(2, r.encode(t.s)), i = n + s;
    return e.encode(48, i);
  }
};
function Qi(t, e) {
  return Vn(ns(t, e));
}
const Lt = BigInt(0), me = BigInt(1);
BigInt(2);
const eo = BigInt(3), $E = BigInt(4);
function TE(t) {
  const e = AE(t), { Fp: r } = e, n = xa(e.n, e.nBitLength), s = e.toBytes || ((b, S, $) => {
    const B = S.toAffine();
    return zs(Uint8Array.from([4]), r.toBytes(B.x), r.toBytes(B.y));
  }), i = e.fromBytes || ((b) => {
    const S = b.subarray(1), $ = r.fromBytes(S.subarray(0, r.BYTES)), B = r.fromBytes(S.subarray(r.BYTES, 2 * r.BYTES));
    return { x: $, y: B };
  });
  function o(b) {
    const { a: S, b: $ } = e, B = r.sqr(b), C = r.mul(B, b);
    return r.add(r.add(C, r.mul(b, S)), $);
  }
  function a(b, S) {
    const $ = r.sqr(S), B = o(b);
    return r.eql($, B);
  }
  if (!a(e.Gx, e.Gy))
    throw new Error("bad curve params: generator point");
  const c = r.mul(r.pow(e.a, eo), $E), l = r.mul(r.sqr(e.b), BigInt(27));
  if (r.is0(r.add(c, l)))
    throw new Error("bad curve params: a or b");
  function u(b) {
    return ba(b, me, e.n);
  }
  function h(b) {
    const { allowedPrivateKeyLengths: S, nByteLength: $, wrapPrivateKey: B, n: C } = e;
    if (S && typeof b != "bigint") {
      if (rs(b) && (b = Vn(b)), typeof b != "string" || !S.includes(b.length))
        throw new Error("invalid private key");
      b = b.padStart($ * 2, "0");
    }
    let P;
    try {
      P = typeof b == "bigint" ? b : Rr(tt("private key", b, $));
    } catch {
      throw new Error("invalid private key, expected hex or " + $ + " bytes, got " + typeof b);
    }
    return B && (P = qe(P, C)), sn("private key", P, me, C), P;
  }
  function f(b) {
    if (!(b instanceof g))
      throw new Error("ProjectivePoint expected");
  }
  const d = tl((b, S) => {
    const { px: $, py: B, pz: C } = b;
    if (r.eql(C, r.ONE))
      return { x: $, y: B };
    const P = b.is0();
    S == null && (S = P ? r.ONE : r.inv(C));
    const O = r.mul($, S), U = r.mul(B, S), k = r.mul(C, S);
    if (P)
      return { x: r.ZERO, y: r.ZERO };
    if (!r.eql(k, r.ONE))
      throw new Error("invZ was invalid");
    return { x: O, y: U };
  }), p = tl((b) => {
    if (b.is0()) {
      if (e.allowInfinityPoint && !r.is0(b.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: S, y: $ } = b.toAffine();
    if (!r.isValid(S) || !r.isValid($))
      throw new Error("bad point: x or y not FE");
    if (!a(S, $))
      throw new Error("bad point: equation left != right");
    if (!b.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return !0;
  });
  class g {
    constructor(S, $, B) {
      if (S == null || !r.isValid(S))
        throw new Error("x required");
      if ($ == null || !r.isValid($) || r.is0($))
        throw new Error("y required");
      if (B == null || !r.isValid(B))
        throw new Error("z required");
      this.px = S, this.py = $, this.pz = B, Object.freeze(this);
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(S) {
      const { x: $, y: B } = S || {};
      if (!S || !r.isValid($) || !r.isValid(B))
        throw new Error("invalid affine point");
      if (S instanceof g)
        throw new Error("projective point not allowed");
      const C = (P) => r.eql(P, r.ZERO);
      return C($) && C(B) ? g.ZERO : new g($, B, r.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(S) {
      const $ = Wh(r, S.map((B) => B.pz));
      return S.map((B, C) => B.toAffine($[C])).map(g.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(S) {
      const $ = g.fromAffine(i(tt("pointHex", S)));
      return $.assertValidity(), $;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(S) {
      return g.BASE.multiply(h(S));
    }
    // Multiscalar Multiplication
    static msm(S, $) {
      return DE(g, n, S, $);
    }
    // "Private method", don't use it directly
    _setWindowSize(S) {
      R.setWindowSize(this, S);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      p(this);
    }
    hasEvenY() {
      const { y: S } = this.toAffine();
      if (r.isOdd)
        return !r.isOdd(S);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(S) {
      f(S);
      const { px: $, py: B, pz: C } = this, { px: P, py: O, pz: U } = S, k = r.eql(r.mul($, U), r.mul(P, C)), N = r.eql(r.mul(B, U), r.mul(O, C));
      return k && N;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new g(this.px, r.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: S, b: $ } = e, B = r.mul($, eo), { px: C, py: P, pz: O } = this;
      let U = r.ZERO, k = r.ZERO, N = r.ZERO, v = r.mul(C, C), A = r.mul(P, P), y = r.mul(O, O), w = r.mul(C, P);
      return w = r.add(w, w), N = r.mul(C, O), N = r.add(N, N), U = r.mul(S, N), k = r.mul(B, y), k = r.add(U, k), U = r.sub(A, k), k = r.add(A, k), k = r.mul(U, k), U = r.mul(w, U), N = r.mul(B, N), y = r.mul(S, y), w = r.sub(v, y), w = r.mul(S, w), w = r.add(w, N), N = r.add(v, v), v = r.add(N, v), v = r.add(v, y), v = r.mul(v, w), k = r.add(k, v), y = r.mul(P, O), y = r.add(y, y), v = r.mul(y, w), U = r.sub(U, v), N = r.mul(y, A), N = r.add(N, N), N = r.add(N, N), new g(U, k, N);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(S) {
      f(S);
      const { px: $, py: B, pz: C } = this, { px: P, py: O, pz: U } = S;
      let k = r.ZERO, N = r.ZERO, v = r.ZERO;
      const A = e.a, y = r.mul(e.b, eo);
      let w = r.mul($, P), x = r.mul(B, O), D = r.mul(C, U), E = r.add($, B), I = r.add(P, O);
      E = r.mul(E, I), I = r.add(w, x), E = r.sub(E, I), I = r.add($, C);
      let T = r.add(P, U);
      return I = r.mul(I, T), T = r.add(w, D), I = r.sub(I, T), T = r.add(B, C), k = r.add(O, U), T = r.mul(T, k), k = r.add(x, D), T = r.sub(T, k), v = r.mul(A, I), k = r.mul(y, D), v = r.add(k, v), k = r.sub(x, v), v = r.add(x, v), N = r.mul(k, v), x = r.add(w, w), x = r.add(x, w), D = r.mul(A, D), I = r.mul(y, I), x = r.add(x, D), D = r.sub(w, D), D = r.mul(A, D), I = r.add(I, D), w = r.mul(x, I), N = r.add(N, w), w = r.mul(T, I), k = r.mul(E, k), k = r.sub(k, w), w = r.mul(E, x), v = r.mul(T, v), v = r.add(v, w), new g(k, N, v);
    }
    subtract(S) {
      return this.add(S.negate());
    }
    is0() {
      return this.equals(g.ZERO);
    }
    wNAF(S) {
      return R.wNAFCached(this, S, g.normalizeZ);
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(S) {
      const { endo: $, n: B } = e;
      sn("scalar", S, Lt, B);
      const C = g.ZERO;
      if (S === Lt)
        return C;
      if (this.is0() || S === me)
        return this;
      if (!$ || R.hasPrecomputes(this))
        return R.wNAFCachedUnsafe(this, S, g.normalizeZ);
      let { k1neg: P, k1: O, k2neg: U, k2: k } = $.splitScalar(S), N = C, v = C, A = this;
      for (; O > Lt || k > Lt; )
        O & me && (N = N.add(A)), k & me && (v = v.add(A)), A = A.double(), O >>= me, k >>= me;
      return P && (N = N.negate()), U && (v = v.negate()), v = new g(r.mul(v.px, $.beta), v.py, v.pz), N.add(v);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(S) {
      const { endo: $, n: B } = e;
      sn("scalar", S, me, B);
      let C, P;
      if ($) {
        const { k1neg: O, k1: U, k2neg: k, k2: N } = $.splitScalar(S);
        let { p: v, f: A } = this.wNAF(U), { p: y, f: w } = this.wNAF(N);
        v = R.constTimeNegate(O, v), y = R.constTimeNegate(k, y), y = new g(r.mul(y.px, $.beta), y.py, y.pz), C = v.add(y), P = A.add(w);
      } else {
        const { p: O, f: U } = this.wNAF(S);
        C = O, P = U;
      }
      return g.normalizeZ([C, P])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(S, $, B) {
      const C = g.BASE, P = (U, k) => k === Lt || k === me || !U.equals(C) ? U.multiplyUnsafe(k) : U.multiply(k), O = P(this, $).add(P(S, B));
      return O.is0() ? void 0 : O;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(S) {
      return d(this, S);
    }
    isTorsionFree() {
      const { h: S, isTorsionFree: $ } = e;
      if (S === me)
        return !0;
      if ($)
        return $(g, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: S, clearCofactor: $ } = e;
      return S === me ? this : $ ? $(g, this) : this.multiplyUnsafe(e.h);
    }
    toRawBytes(S = !0) {
      return Kn("isCompressed", S), this.assertValidity(), s(g, this, S);
    }
    toHex(S = !0) {
      return Kn("isCompressed", S), Vn(this.toRawBytes(S));
    }
  }
  g.BASE = new g(e.Gx, e.Gy, r.ONE), g.ZERO = new g(r.ZERO, r.ONE, r.ZERO);
  const { endo: m, nBitLength: _ } = e, R = IE(g, m ? Math.ceil(_ / 2) : _);
  return {
    CURVE: e,
    ProjectivePoint: g,
    normPrivateKeyToScalar: h,
    weierstrassEquation: o,
    isWithinCurveOrder: u
  };
}
function BE(t) {
  const e = Qh(t);
  return wi(e, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  }), Object.freeze({ lowS: !0, ...e });
}
function RE(t) {
  const e = BE(t), { Fp: r, n, nByteLength: s, nBitLength: i } = e, o = r.BYTES + 1, a = 2 * r.BYTES + 1;
  function c(y) {
    return qe(y, n);
  }
  function l(y) {
    return Bo(y, n);
  }
  const { ProjectivePoint: u, normPrivateKeyToScalar: h, weierstrassEquation: f, isWithinCurveOrder: d } = TE({
    ...e,
    toBytes(y, w, x) {
      const D = w.toAffine(), E = r.toBytes(D.x), I = zs;
      return Kn("isCompressed", x), x ? I(Uint8Array.from([w.hasEvenY() ? 2 : 3]), E) : I(Uint8Array.from([4]), E, r.toBytes(D.y));
    },
    fromBytes(y) {
      const w = y.length, x = y[0], D = y.subarray(1);
      if (w === o && (x === 2 || x === 3)) {
        const E = Rr(D);
        if (!ba(E, me, r.ORDER))
          throw new Error("Point is not on curve");
        const I = f(E);
        let T;
        try {
          T = r.sqrt(I);
        } catch (z) {
          const q = z instanceof Error ? ": " + z.message : "";
          throw new Error("Point is not on curve" + q);
        }
        const L = (T & me) === me;
        return (x & 1) === 1 !== L && (T = r.neg(T)), { x: E, y: T };
      } else if (w === a && x === 4) {
        const E = r.fromBytes(D.subarray(0, r.BYTES)), I = r.fromBytes(D.subarray(r.BYTES, 2 * r.BYTES));
        return { x: E, y: I };
      } else {
        const E = o, I = a;
        throw new Error("invalid Point, expected length of " + E + ", or uncompressed " + I + ", got " + w);
      }
    }
  });
  function p(y) {
    const w = n >> me;
    return y > w;
  }
  function g(y) {
    return p(y) ? c(-y) : y;
  }
  const m = (y, w, x) => Rr(y.slice(w, x));
  class _ {
    constructor(w, x, D) {
      sn("r", w, me, n), sn("s", x, me, n), this.r = w, this.s = x, D != null && (this.recovery = D), Object.freeze(this);
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(w) {
      const x = s;
      return w = tt("compactSignature", w, x * 2), new _(m(w, 0, x), m(w, x, 2 * x));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(w) {
      const { r: x, s: D } = Ct.toSig(tt("DER", w));
      return new _(x, D);
    }
    /**
     * @todo remove
     * @deprecated
     */
    assertValidity() {
    }
    addRecoveryBit(w) {
      return new _(this.r, this.s, w);
    }
    recoverPublicKey(w) {
      const { r: x, s: D, recovery: E } = this, I = C(tt("msgHash", w));
      if (E == null || ![0, 1, 2, 3].includes(E))
        throw new Error("recovery id invalid");
      const T = E === 2 || E === 3 ? x + e.n : x;
      if (T >= r.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const L = E & 1 ? "03" : "02", j = u.fromHex(L + Qi(T, r.BYTES)), z = l(T), q = c(-I * z), V = c(D * z), W = u.BASE.multiplyAndAddUnsafe(j, q, V);
      if (!W)
        throw new Error("point at infinify");
      return W.assertValidity(), W;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return p(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new _(this.r, c(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return qs(this.toDERHex());
    }
    toDERHex() {
      return Ct.hexFromSig(this);
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return qs(this.toCompactHex());
    }
    toCompactHex() {
      const w = s;
      return Qi(this.r, w) + Qi(this.s, w);
    }
  }
  const R = {
    isValidPrivateKey(y) {
      try {
        return h(y), !0;
      } catch {
        return !1;
      }
    },
    normPrivateKeyToScalar: h,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: () => {
      const y = Zh(e.n);
      return xE(e.randomBytes(y), e.n);
    },
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(y = 8, w = u.BASE) {
      return w._setWindowSize(y), w.multiply(BigInt(3)), w;
    }
  };
  function b(y, w = !0) {
    return u.fromPrivateKey(y).toRawBytes(w);
  }
  function S(y) {
    if (typeof y == "bigint")
      return !1;
    if (y instanceof u)
      return !0;
    const x = tt("key", y).length, D = r.BYTES, E = D + 1, I = 2 * D + 1;
    if (!(e.allowedPrivateKeyLengths || s === E))
      return x === E || x === I;
  }
  function $(y, w, x = !0) {
    if (S(y) === !0)
      throw new Error("first arg must be private key");
    if (S(w) === !1)
      throw new Error("second arg must be public key");
    return u.fromHex(w).multiply(h(y)).toRawBytes(x);
  }
  const B = e.bits2int || function(y) {
    if (y.length > 8192)
      throw new Error("input is too large");
    const w = Rr(y), x = y.length * 8 - i;
    return x > 0 ? w >> BigInt(x) : w;
  }, C = e.bits2int_modN || function(y) {
    return c(B(y));
  }, P = yi(i);
  function O(y) {
    return sn("num < 2^" + i, y, Lt, P), ns(y, s);
  }
  function U(y, w, x = k) {
    if (["recovered", "canonical"].some((K) => K in x))
      throw new Error("sign() legacy options not supported");
    const { hash: D, randomBytes: E } = e;
    let { lowS: I, prehash: T, extraEntropy: L } = x;
    I == null && (I = !0), y = tt("msgHash", y), hl(x), T && (y = tt("prehashed msgHash", D(y)));
    const j = C(y), z = h(w), q = [O(z), O(j)];
    if (L != null && L !== !1) {
      const K = L === !0 ? E(r.BYTES) : L;
      q.push(tt("extraEntropy", K));
    }
    const V = zs(...q), W = j;
    function Z(K) {
      const J = B(K);
      if (!d(J))
        return;
      const ae = l(J), he = u.BASE.multiply(J).toAffine(), ye = c(he.x);
      if (ye === Lt)
        return;
      const Ce = c(ae * c(W + ye * z));
      if (Ce === Lt)
        return;
      let Xe = (he.x === ye ? 0 : 2) | Number(he.y & me), zt = Ce;
      return I && p(Ce) && (zt = g(Ce), Xe ^= 1), new _(ye, zt, Xe);
    }
    return { seed: V, k2sig: Z };
  }
  const k = { lowS: e.lowS, prehash: !1 }, N = { lowS: e.lowS, prehash: !1 };
  function v(y, w, x = k) {
    const { seed: D, k2sig: E } = U(y, w, x), I = e;
    return T1(I.hash.outputLen, I.nByteLength, I.hmac)(D, E);
  }
  u.BASE._setWindowSize(8);
  function A(y, w, x, D = N) {
    var Xe;
    const E = y;
    w = tt("msgHash", w), x = tt("publicKey", x);
    const { lowS: I, prehash: T, format: L } = D;
    if (hl(D), "strict" in D)
      throw new Error("options.strict was renamed to lowS");
    if (L !== void 0 && L !== "compact" && L !== "der")
      throw new Error("format must be compact or der");
    const j = typeof E == "string" || rs(E), z = !j && !L && typeof E == "object" && E !== null && typeof E.r == "bigint" && typeof E.s == "bigint";
    if (!j && !z)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let q, V;
    try {
      if (z && (q = new _(E.r, E.s)), j) {
        try {
          L !== "compact" && (q = _.fromDER(E));
        } catch (zt) {
          if (!(zt instanceof Ct.Err))
            throw zt;
        }
        !q && L !== "der" && (q = _.fromCompact(E));
      }
      V = u.fromHex(x);
    } catch {
      return !1;
    }
    if (!q || I && q.hasHighS())
      return !1;
    T && (w = e.hash(w));
    const { r: W, s: Z } = q, K = C(w), J = l(Z), ae = c(K * J), he = c(W * J), ye = (Xe = u.BASE.multiplyAndAddUnsafe(V, ae, he)) == null ? void 0 : Xe.toAffine();
    return ye ? c(ye.x) === W : !1;
  }
  return {
    CURVE: e,
    getPublicKey: b,
    getSharedSecret: $,
    sign: v,
    verify: A,
    ProjectivePoint: u,
    Signature: _,
    utils: R
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function PE(t) {
  return {
    hash: t,
    hmac: (e, ...r) => zh(t, e, n1(...r)),
    randomBytes: s1
  };
}
function CE(t, e) {
  const r = (n) => RE({ ...t, ...PE(n) });
  return { ...r(e), create: r };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const ef = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"), fl = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"), NE = BigInt(0), UE = BigInt(1), Po = BigInt(2), dl = (t, e) => (t + e / Po) / e;
function LE(t) {
  const e = ef, r = BigInt(3), n = BigInt(6), s = BigInt(11), i = BigInt(22), o = BigInt(23), a = BigInt(44), c = BigInt(88), l = t * t * t % e, u = l * l * t % e, h = Je(u, r, e) * u % e, f = Je(h, r, e) * u % e, d = Je(f, Po, e) * l % e, p = Je(d, s, e) * d % e, g = Je(p, i, e) * p % e, m = Je(g, a, e) * g % e, _ = Je(m, c, e) * m % e, R = Je(_, a, e) * g % e, b = Je(R, r, e) * u % e, S = Je(b, o, e) * p % e, $ = Je(S, n, e) * l % e, B = Je($, Po, e);
  if (!Co.eql(Co.sqr(B), t))
    throw new Error("Cannot find square root");
  return B;
}
const Co = xa(ef, void 0, void 0, { sqrt: LE }), kE = CE({
  a: NE,
  b: BigInt(7),
  Fp: Co,
  n: fl,
  Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
  Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
  h: BigInt(1),
  lowS: !0,
  // Allow only low-S signatures by default in sign() and verify()
  endo: {
    // Endomorphism, see above
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    splitScalar: (t) => {
      const e = fl, r = BigInt("0x3086d221a7d46bcde86c90e49284eb15"), n = -UE * BigInt("0xe4437ed6010e88286f547fa90abfe4c3"), s = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), i = r, o = BigInt("0x100000000000000000000000000000000"), a = dl(i * t, e), c = dl(-n * t, e);
      let l = qe(t - a * r - c * s, e), u = qe(-a * n - c * i, e);
      const h = l > o, f = u > o;
      if (h && (l = e - l), f && (u = e - u), l > o || u > o)
        throw new Error("splitScalar: Endomorphism failed, k=" + t);
      return { k1neg: h, k1: l, k2neg: f, k2: u };
    }
  }
}, A1);
function ME(t) {
  if (t.length !== 130 && t.length !== 132)
    throw new qE({ signature: t });
  const e = BigInt(Pt(t, 0, 32)), r = BigInt(Pt(t, 32, 64)), n = (() => {
    const s = +`0x${t.slice(130)}`;
    if (!Number.isNaN(s))
      try {
        return FE(s);
      } catch {
        throw new zE({ value: s });
      }
  })();
  return typeof n > "u" ? {
    r: e,
    s: r
  } : {
    r: e,
    s: r,
    yParity: n
  };
}
function FE(t) {
  if (t === 0 || t === 27)
    return 0;
  if (t === 1 || t === 28)
    return 1;
  if (t >= 35)
    return t % 2 === 0 ? 1 : 0;
  throw new jE({ value: t });
}
class qE extends ie {
  constructor({ signature: e }) {
    super(`Value \`${e}\` is an invalid signature size.`, {
      metaMessages: [
        "Expected: 64 bytes or 65 bytes.",
        `Received ${gr(va(e))} bytes.`
      ]
    }), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Signature.InvalidSerializedSizeError"
    });
  }
}
class zE extends ie {
  constructor({ value: e }) {
    super(`Value \`${e}\` is an invalid y-parity value. Y-parity must be 0 or 1.`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Signature.InvalidYParityError"
    });
  }
}
class jE extends ie {
  constructor({ value: e }) {
    super(`Value \`${e}\` is an invalid v value. v must be 27, 28 or >=35.`), Object.defineProperty(this, "name", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: "Signature.InvalidVError"
    });
  }
}
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function tf(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function rf(t, e) {
  return Array.isArray(e) ? e.length === 0 ? !0 : t ? e.every((r) => typeof r == "string") : e.every((r) => Number.isSafeInteger(r)) : !1;
}
function Hs(t, e) {
  if (typeof e != "string")
    throw new Error(`${t}: string expected`);
  return !0;
}
function ss(t) {
  if (!Number.isSafeInteger(t))
    throw new Error(`invalid integer: ${t}`);
}
function Ks(t) {
  if (!Array.isArray(t))
    throw new Error("array expected");
}
function Vs(t, e) {
  if (!rf(!0, e))
    throw new Error(`${t}: array of strings expected`);
}
function nf(t, e) {
  if (!rf(!1, e))
    throw new Error(`${t}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function sf(...t) {
  const e = (i) => i, r = (i, o) => (a) => i(o(a)), n = t.map((i) => i.encode).reduceRight(r, e), s = t.map((i) => i.decode).reduce(r, e);
  return { encode: n, decode: s };
}
// @__NO_SIDE_EFFECTS__
function of(t) {
  const e = typeof t == "string" ? t.split("") : t, r = e.length;
  Vs("alphabet", e);
  const n = new Map(e.map((s, i) => [s, i]));
  return {
    encode: (s) => (Ks(s), s.map((i) => {
      if (!Number.isSafeInteger(i) || i < 0 || i >= r)
        throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${t}`);
      return e[i];
    })),
    decode: (s) => (Ks(s), s.map((i) => {
      Hs("alphabet.decode", i);
      const o = n.get(i);
      if (o === void 0)
        throw new Error(`Unknown letter: "${i}". Allowed: ${t}`);
      return o;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function af(t = "") {
  return Hs("join", t), {
    encode: (e) => (Vs("join.decode", e), e.join(t)),
    decode: (e) => (Hs("join.decode", e), e.split(t))
  };
}
// @__NO_SIDE_EFFECTS__
function HE(t, e = "=") {
  return ss(t), Hs("padding", e), {
    encode(r) {
      for (Vs("padding.encode", r); r.length * t % 8; )
        r.push(e);
      return r;
    },
    decode(r) {
      Vs("padding.decode", r);
      let n = r.length;
      if (n * t % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; n > 0 && r[n - 1] === e; n--)
        if ((n - 1) * t % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return r.slice(0, n);
    }
  };
}
function pl(t, e, r) {
  if (e < 2)
    throw new Error(`convertRadix: invalid from=${e}, base cannot be less than 2`);
  if (r < 2)
    throw new Error(`convertRadix: invalid to=${r}, base cannot be less than 2`);
  if (Ks(t), !t.length)
    return [];
  let n = 0;
  const s = [], i = Array.from(t, (a) => {
    if (ss(a), a < 0 || a >= e)
      throw new Error(`invalid integer: ${a}`);
    return a;
  }), o = i.length;
  for (; ; ) {
    let a = 0, c = !0;
    for (let l = n; l < o; l++) {
      const u = i[l], h = e * a, f = h + u;
      if (!Number.isSafeInteger(f) || h / e !== a || f - u !== h)
        throw new Error("convertRadix: carry overflow");
      const d = f / r;
      a = f % r;
      const p = Math.floor(d);
      if (i[l] = p, !Number.isSafeInteger(p) || p * r + a !== f)
        throw new Error("convertRadix: carry overflow");
      if (c)
        p ? c = !1 : n = l;
      else continue;
    }
    if (s.push(a), c)
      break;
  }
  for (let a = 0; a < t.length - 1 && t[a] === 0; a++)
    s.push(0);
  return s.reverse();
}
const cf = (t, e) => e === 0 ? t : cf(e, t % e), Ws = /* @__NO_SIDE_EFFECTS__ */ (t, e) => t + (e - cf(t, e)), to = /* @__PURE__ */ (() => {
  let t = [];
  for (let e = 0; e < 40; e++)
    t.push(2 ** e);
  return t;
})();
function gl(t, e, r, n) {
  if (Ks(t), e <= 0 || e > 32)
    throw new Error(`convertRadix2: wrong from=${e}`);
  if (r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong to=${r}`);
  if (/* @__PURE__ */ Ws(e, r) > 32)
    throw new Error(`convertRadix2: carry overflow from=${e} to=${r} carryBits=${/* @__PURE__ */ Ws(e, r)}`);
  let s = 0, i = 0;
  const o = to[e], a = to[r] - 1, c = [];
  for (const l of t) {
    if (ss(l), l >= o)
      throw new Error(`convertRadix2: invalid data word=${l} from=${e}`);
    if (s = s << e | l, i + e > 32)
      throw new Error(`convertRadix2: carry overflow pos=${i} from=${e}`);
    for (i += e; i >= r; i -= r)
      c.push((s >> i - r & a) >>> 0);
    const u = to[i];
    if (u === void 0)
      throw new Error("invalid carry");
    s &= u - 1;
  }
  if (s = s << r - i & a, !n && i >= e)
    throw new Error("Excess padding");
  if (!n && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return n && i > 0 && c.push(s >>> 0), c;
}
// @__NO_SIDE_EFFECTS__
function KE(t) {
  ss(t);
  const e = 2 ** 8;
  return {
    encode: (r) => {
      if (!tf(r))
        throw new Error("radix.encode input should be Uint8Array");
      return pl(Array.from(r), e, t);
    },
    decode: (r) => (nf("radix.decode", r), Uint8Array.from(pl(r, t, e)))
  };
}
// @__NO_SIDE_EFFECTS__
function VE(t, e = !1) {
  if (ss(t), t <= 0 || t > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Ws(8, t) > 32 || /* @__PURE__ */ Ws(t, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (r) => {
      if (!tf(r))
        throw new Error("radix2.encode input should be Uint8Array");
      return gl(Array.from(r), 8, t, !e);
    },
    decode: (r) => (nf("radix2.decode", r), Uint8Array.from(gl(r, t, 8, e)))
  };
}
const WE = /* @__PURE__ */ sf(/* @__PURE__ */ VE(5), /* @__PURE__ */ of("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), /* @__PURE__ */ HE(5), /* @__PURE__ */ af("")), GE = /* @__NO_SIDE_EFFECTS__ */ (t) => /* @__PURE__ */ sf(/* @__PURE__ */ KE(58), /* @__PURE__ */ of(t), /* @__PURE__ */ af("")), is = /* @__PURE__ */ GE("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
function YE(t) {
  return fE(ZE(t));
}
function ZE(t) {
  const { payload: e, signature: r } = t, { r: n, s, yParity: i } = r, a = new kE.Signature(BigInt(n), BigInt(s)).addRecoveryBit(i).recoverPublicKey(va(e).substring(2));
  return nE(a);
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function lf(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function No(t) {
  if (typeof t != "boolean")
    throw new Error(`boolean expected, not ${t}`);
}
function ro(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("positive integer expected, got " + t);
}
function ze(t, ...e) {
  if (!lf(t))
    throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(t.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + t.length);
}
function yl(t, e = !0) {
  if (t.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (e && t.finished)
    throw new Error("Hash#digest() has already been called");
}
function XE(t, e) {
  ze(t);
  const r = e.outputLen;
  if (t.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function dr(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function fn(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
function JE(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
const QE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function e2(t) {
  if (typeof t != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(t));
}
function Uo(t) {
  if (typeof t == "string")
    t = e2(t);
  else if (lf(t))
    t = Lo(t);
  else
    throw new Error("Uint8Array expected, got " + typeof t);
  return t;
}
function t2(t, e) {
  if (e == null || typeof e != "object")
    throw new Error("options must be defined");
  return Object.assign(t, e);
}
function r2(t, e) {
  if (t.length !== e.length)
    return !1;
  let r = 0;
  for (let n = 0; n < t.length; n++)
    r |= t[n] ^ e[n];
  return r === 0;
}
const n2 = /* @__NO_SIDE_EFFECTS__ */ (t, e) => {
  function r(n, ...s) {
    if (ze(n), !QE)
      throw new Error("Non little-endian hardware is not yet supported");
    if (t.nonceLength !== void 0) {
      const u = s[0];
      if (!u)
        throw new Error("nonce / iv required");
      t.varSizeNonce ? ze(u) : ze(u, t.nonceLength);
    }
    const i = t.tagLength;
    i && s[1] !== void 0 && ze(s[1]);
    const o = e(n, ...s), a = (u, h) => {
      if (h !== void 0) {
        if (u !== 2)
          throw new Error("cipher output not supported");
        ze(h);
      }
    };
    let c = !1;
    return {
      encrypt(u, h) {
        if (c)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return c = !0, ze(u), a(o.encrypt.length, h), o.encrypt(u, h);
      },
      decrypt(u, h) {
        if (ze(u), i && u.length < i)
          throw new Error("invalid ciphertext length: smaller than tagLength=" + i);
        return a(o.decrypt.length, h), o.decrypt(u, h);
      }
    };
  }
  return Object.assign(r, t), r;
};
function wl(t, e, r = !0) {
  if (e === void 0)
    return new Uint8Array(t);
  if (e.length !== t)
    throw new Error("invalid output length, expected " + t + ", got: " + e.length);
  if (r && !i2(e))
    throw new Error("invalid output, must be aligned");
  return e;
}
function ml(t, e, r, n) {
  if (typeof t.setBigUint64 == "function")
    return t.setBigUint64(e, r, n);
  const s = BigInt(32), i = BigInt(4294967295), o = Number(r >> s & i), a = Number(r & i), c = 4, l = 0;
  t.setUint32(e + c, o, n), t.setUint32(e + l, a, n);
}
function s2(t, e, r) {
  No(r);
  const n = new Uint8Array(16), s = JE(n);
  return ml(s, 0, BigInt(e), r), ml(s, 8, BigInt(t), r), n;
}
function i2(t) {
  return t.byteOffset % 4 === 0;
}
function Lo(t) {
  return Uint8Array.from(t);
}
function o2(t, e, r, n) {
  if (typeof t.setBigUint64 == "function")
    return t.setBigUint64(e, r, n);
  const s = BigInt(32), i = BigInt(4294967295), o = Number(r >> s & i), a = Number(r & i), c = n ? 4 : 0, l = n ? 0 : 4;
  t.setUint32(e + c, o, n), t.setUint32(e + l, a, n);
}
function a2(t, e, r) {
  return t & e ^ ~t & r;
}
function c2(t, e, r) {
  return t & e ^ t & r ^ e & r;
}
class uf extends pi {
  constructor(e, r, n, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = e, this.outputLen = r, this.padOffset = n, this.isLE = s, this.buffer = new Uint8Array(e), this.view = ji(this.buffer);
  }
  update(e) {
    pr(this), e = ht(e), ft(e);
    const { view: r, buffer: n, blockLen: s } = this, i = e.length;
    for (let o = 0; o < i; ) {
      const a = Math.min(s - this.pos, i - o);
      if (a === s) {
        const c = ji(e);
        for (; s <= i - o; o += s)
          this.process(c, o);
        continue;
      }
      n.set(e.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += e.length, this.roundClean(), this;
  }
  digestInto(e) {
    pr(this), pa(e, this), this.finished = !0;
    const { buffer: r, view: n, blockLen: s, isLE: i } = this;
    let { pos: o } = this;
    r[o++] = 128, st(this.buffer.subarray(o)), this.padOffset > s - o && (this.process(n, 0), o = 0);
    for (let h = o; h < s; h++)
      r[h] = 0;
    o2(n, s - 8, BigInt(this.length * 8), i), this.process(n, 0);
    const a = ji(e), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const l = c / 4, u = this.get();
    if (l > u.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < l; h++)
      a.setUint32(4 * h, u[h], i);
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    e || (e = new this.constructor()), e.set(...this.get());
    const { blockLen: r, buffer: n, length: s, finished: i, destroyed: o, pos: a } = this;
    return e.destroyed = o, e.finished = i, e.length = s, e.pos = a, s % r && e.buffer.set(n), e;
  }
  clone() {
    return this._cloneInto();
  }
}
const Wt = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Ae = /* @__PURE__ */ Uint32Array.from([
  3418070365,
  3238371032,
  1654270250,
  914150663,
  2438529370,
  812702999,
  355462360,
  4144912697,
  1731405415,
  4290775857,
  2394180231,
  1750603025,
  3675008525,
  1694076839,
  1203062813,
  3204075428
]), Oe = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]), l2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), Gt = /* @__PURE__ */ new Uint32Array(64);
class u2 extends uf {
  constructor(e = 32) {
    super(64, e, 8, !1), this.A = Wt[0] | 0, this.B = Wt[1] | 0, this.C = Wt[2] | 0, this.D = Wt[3] | 0, this.E = Wt[4] | 0, this.F = Wt[5] | 0, this.G = Wt[6] | 0, this.H = Wt[7] | 0;
  }
  get() {
    const { A: e, B: r, C: n, D: s, E: i, F: o, G: a, H: c } = this;
    return [e, r, n, s, i, o, a, c];
  }
  // prettier-ignore
  set(e, r, n, s, i, o, a, c) {
    this.A = e | 0, this.B = r | 0, this.C = n | 0, this.D = s | 0, this.E = i | 0, this.F = o | 0, this.G = a | 0, this.H = c | 0;
  }
  process(e, r) {
    for (let h = 0; h < 16; h++, r += 4)
      Gt[h] = e.getUint32(r, !1);
    for (let h = 16; h < 64; h++) {
      const f = Gt[h - 15], d = Gt[h - 2], p = gt(f, 7) ^ gt(f, 18) ^ f >>> 3, g = gt(d, 17) ^ gt(d, 19) ^ d >>> 10;
      Gt[h] = g + Gt[h - 7] + p + Gt[h - 16] | 0;
    }
    let { A: n, B: s, C: i, D: o, E: a, F: c, G: l, H: u } = this;
    for (let h = 0; h < 64; h++) {
      const f = gt(a, 6) ^ gt(a, 11) ^ gt(a, 25), d = u + f + a2(a, c, l) + l2[h] + Gt[h] | 0, g = (gt(n, 2) ^ gt(n, 13) ^ gt(n, 22)) + c2(n, s, i) | 0;
      u = l, l = c, c = a, a = o + d | 0, o = i, i = s, s = n, n = d + g | 0;
    }
    n = n + this.A | 0, s = s + this.B | 0, i = i + this.C | 0, o = o + this.D | 0, a = a + this.E | 0, c = c + this.F | 0, l = l + this.G | 0, u = u + this.H | 0, this.set(n, s, i, o, a, c, l, u);
  }
  roundClean() {
    st(Gt);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), st(this.buffer);
  }
}
const hf = fh([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((t) => BigInt(t))), h2 = hf[0], f2 = hf[1], Yt = /* @__PURE__ */ new Uint32Array(80), Zt = /* @__PURE__ */ new Uint32Array(80);
class _a extends uf {
  constructor(e = 64) {
    super(128, e, 16, !1), this.Ah = Oe[0] | 0, this.Al = Oe[1] | 0, this.Bh = Oe[2] | 0, this.Bl = Oe[3] | 0, this.Ch = Oe[4] | 0, this.Cl = Oe[5] | 0, this.Dh = Oe[6] | 0, this.Dl = Oe[7] | 0, this.Eh = Oe[8] | 0, this.El = Oe[9] | 0, this.Fh = Oe[10] | 0, this.Fl = Oe[11] | 0, this.Gh = Oe[12] | 0, this.Gl = Oe[13] | 0, this.Hh = Oe[14] | 0, this.Hl = Oe[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah: e, Al: r, Bh: n, Bl: s, Ch: i, Cl: o, Dh: a, Dl: c, Eh: l, El: u, Fh: h, Fl: f, Gh: d, Gl: p, Hh: g, Hl: m } = this;
    return [e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m];
  }
  // prettier-ignore
  set(e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m) {
    this.Ah = e | 0, this.Al = r | 0, this.Bh = n | 0, this.Bl = s | 0, this.Ch = i | 0, this.Cl = o | 0, this.Dh = a | 0, this.Dl = c | 0, this.Eh = l | 0, this.El = u | 0, this.Fh = h | 0, this.Fl = f | 0, this.Gh = d | 0, this.Gl = p | 0, this.Hh = g | 0, this.Hl = m | 0;
  }
  process(e, r) {
    for (let b = 0; b < 16; b++, r += 4)
      Yt[b] = e.getUint32(r), Zt[b] = e.getUint32(r += 4);
    for (let b = 16; b < 80; b++) {
      const S = Yt[b - 15] | 0, $ = Zt[b - 15] | 0, B = nr(S, $, 1) ^ nr(S, $, 8) ^ Hc(S, $, 7), C = sr(S, $, 1) ^ sr(S, $, 8) ^ Kc(S, $, 7), P = Yt[b - 2] | 0, O = Zt[b - 2] | 0, U = nr(P, O, 19) ^ Rn(P, O, 61) ^ Hc(P, O, 6), k = sr(P, O, 19) ^ Pn(P, O, 61) ^ Kc(P, O, 6), N = $b(C, k, Zt[b - 7], Zt[b - 16]), v = Tb(N, B, U, Yt[b - 7], Yt[b - 16]);
      Yt[b] = v | 0, Zt[b] = N | 0;
    }
    let { Ah: n, Al: s, Bh: i, Bl: o, Ch: a, Cl: c, Dh: l, Dl: u, Eh: h, El: f, Fh: d, Fl: p, Gh: g, Gl: m, Hh: _, Hl: R } = this;
    for (let b = 0; b < 80; b++) {
      const S = nr(h, f, 14) ^ nr(h, f, 18) ^ Rn(h, f, 41), $ = sr(h, f, 14) ^ sr(h, f, 18) ^ Pn(h, f, 41), B = h & d ^ ~h & g, C = f & p ^ ~f & m, P = Bb(R, $, C, f2[b], Zt[b]), O = Rb(P, _, S, B, h2[b], Yt[b]), U = P | 0, k = nr(n, s, 28) ^ Rn(n, s, 34) ^ Rn(n, s, 39), N = sr(n, s, 28) ^ Pn(n, s, 34) ^ Pn(n, s, 39), v = n & i ^ n & a ^ i & a, A = s & o ^ s & c ^ o & c;
      _ = g | 0, R = m | 0, g = d | 0, m = p | 0, d = h | 0, p = f | 0, { h, l: f } = lt(l | 0, u | 0, O | 0, U | 0), l = a | 0, u = c | 0, a = i | 0, c = o | 0, i = n | 0, o = s | 0;
      const y = fa(U, N, A);
      n = da(y, O, k, v), s = y | 0;
    }
    ({ h: n, l: s } = lt(this.Ah | 0, this.Al | 0, n | 0, s | 0)), { h: i, l: o } = lt(this.Bh | 0, this.Bl | 0, i | 0, o | 0), { h: a, l: c } = lt(this.Ch | 0, this.Cl | 0, a | 0, c | 0), { h: l, l: u } = lt(this.Dh | 0, this.Dl | 0, l | 0, u | 0), { h, l: f } = lt(this.Eh | 0, this.El | 0, h | 0, f | 0), { h: d, l: p } = lt(this.Fh | 0, this.Fl | 0, d | 0, p | 0), { h: g, l: m } = lt(this.Gh | 0, this.Gl | 0, g | 0, m | 0), { h: _, l: R } = lt(this.Hh | 0, this.Hl | 0, _ | 0, R | 0), this.set(n, s, i, o, a, c, l, u, h, f, d, p, g, m, _, R);
  }
  roundClean() {
    st(Yt, Zt);
  }
  destroy() {
    st(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class d2 extends _a {
  constructor() {
    super(48), this.Ah = Ae[0] | 0, this.Al = Ae[1] | 0, this.Bh = Ae[2] | 0, this.Bl = Ae[3] | 0, this.Ch = Ae[4] | 0, this.Cl = Ae[5] | 0, this.Dh = Ae[6] | 0, this.Dl = Ae[7] | 0, this.Eh = Ae[8] | 0, this.El = Ae[9] | 0, this.Fh = Ae[10] | 0, this.Fl = Ae[11] | 0, this.Gh = Ae[12] | 0, this.Gl = Ae[13] | 0, this.Hh = Ae[14] | 0, this.Hl = Ae[15] | 0;
  }
}
const $e = /* @__PURE__ */ Uint32Array.from([
  573645204,
  4230739756,
  2673172387,
  3360449730,
  596883563,
  1867755857,
  2520282905,
  1497426621,
  2519219938,
  2827943907,
  3193839141,
  1401305490,
  721525244,
  746961066,
  246885852,
  2177182882
]);
class p2 extends _a {
  constructor() {
    super(32), this.Ah = $e[0] | 0, this.Al = $e[1] | 0, this.Bh = $e[2] | 0, this.Bl = $e[3] | 0, this.Ch = $e[4] | 0, this.Cl = $e[5] | 0, this.Dh = $e[6] | 0, this.Dl = $e[7] | 0, this.Eh = $e[8] | 0, this.El = $e[9] | 0, this.Fh = $e[10] | 0, this.Fl = $e[11] | 0, this.Gh = $e[12] | 0, this.Gl = $e[13] | 0, this.Hh = $e[14] | 0, this.Hl = $e[15] | 0;
  }
}
const mi = /* @__PURE__ */ ts(() => new u2()), g2 = /* @__PURE__ */ ts(() => new _a()), y2 = /* @__PURE__ */ ts(() => new d2()), w2 = /* @__PURE__ */ ts(() => new p2()), m2 = /* @__PURE__ */ Uint8Array.from([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9,
  12,
  5,
  1,
  15,
  14,
  13,
  4,
  10,
  0,
  7,
  6,
  3,
  9,
  2,
  8,
  11,
  13,
  11,
  7,
  14,
  12,
  1,
  3,
  9,
  5,
  0,
  15,
  4,
  8,
  6,
  2,
  10,
  6,
  15,
  14,
  9,
  11,
  3,
  0,
  8,
  12,
  2,
  13,
  7,
  1,
  4,
  10,
  5,
  10,
  2,
  8,
  4,
  7,
  6,
  1,
  5,
  15,
  11,
  9,
  14,
  3,
  12,
  13,
  0,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  // Blake1, unused in others
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9
]), fe = /* @__PURE__ */ Uint32Array.from([
  4089235720,
  1779033703,
  2227873595,
  3144134277,
  4271175723,
  1013904242,
  1595750129,
  2773480762,
  2917565137,
  1359893119,
  725511199,
  2600822924,
  4215389547,
  528734635,
  327033209,
  1541459225
]), H = /* @__PURE__ */ new Uint32Array(32);
function Xt(t, e, r, n, s, i) {
  const o = s[i], a = s[i + 1];
  let c = H[2 * t], l = H[2 * t + 1], u = H[2 * e], h = H[2 * e + 1], f = H[2 * r], d = H[2 * r + 1], p = H[2 * n], g = H[2 * n + 1], m = fa(c, u, o);
  l = da(m, l, h, a), c = m | 0, { Dh: g, Dl: p } = { Dh: g ^ l, Dl: p ^ c }, { Dh: g, Dl: p } = { Dh: _b(g, p), Dl: Sb(g) }, { h: d, l: f } = lt(d, f, g, p), { Bh: h, Bl: u } = { Bh: h ^ d, Bl: u ^ f }, { Bh: h, Bl: u } = { Bh: nr(h, u, 24), Bl: sr(h, u, 24) }, H[2 * t] = c, H[2 * t + 1] = l, H[2 * e] = u, H[2 * e + 1] = h, H[2 * r] = f, H[2 * r + 1] = d, H[2 * n] = p, H[2 * n + 1] = g;
}
function Jt(t, e, r, n, s, i) {
  const o = s[i], a = s[i + 1];
  let c = H[2 * t], l = H[2 * t + 1], u = H[2 * e], h = H[2 * e + 1], f = H[2 * r], d = H[2 * r + 1], p = H[2 * n], g = H[2 * n + 1], m = fa(c, u, o);
  l = da(m, l, h, a), c = m | 0, { Dh: g, Dl: p } = { Dh: g ^ l, Dl: p ^ c }, { Dh: g, Dl: p } = { Dh: nr(g, p, 16), Dl: sr(g, p, 16) }, { h: d, l: f } = lt(d, f, g, p), { Bh: h, Bl: u } = { Bh: h ^ d, Bl: u ^ f }, { Bh: h, Bl: u } = { Bh: Rn(h, u, 63), Bl: Pn(h, u, 63) }, H[2 * t] = c, H[2 * t + 1] = l, H[2 * e] = u, H[2 * e + 1] = h, H[2 * r] = f, H[2 * r + 1] = d, H[2 * n] = p, H[2 * n + 1] = g;
}
function b2(t, e = {}, r, n, s) {
  if (qt(r), t < 0 || t > r)
    throw new Error("outputLen bigger than keyLen");
  const { key: i, salt: o, personalization: a } = e;
  if (i !== void 0 && (i.length < 1 || i.length > r))
    throw new Error("key length must be undefined or 1.." + r);
  if (o !== void 0 && o.length !== n)
    throw new Error("salt must be undefined or " + n);
  if (a !== void 0 && a.length !== s)
    throw new Error("personalization must be undefined or " + s);
}
class E2 extends pi {
  constructor(e, r) {
    super(), this.finished = !1, this.destroyed = !1, this.length = 0, this.pos = 0, qt(e), qt(r), this.blockLen = e, this.outputLen = r, this.buffer = new Uint8Array(e), this.buffer32 = jn(this.buffer);
  }
  update(e) {
    pr(this), e = ht(e), ft(e);
    const { blockLen: r, buffer: n, buffer32: s } = this, i = e.length, o = e.byteOffset, a = e.buffer;
    for (let c = 0; c < i; ) {
      this.pos === r && (ir(s), this.compress(s, 0, !1), ir(s), this.pos = 0);
      const l = Math.min(r - this.pos, i - c), u = o + c;
      if (l === r && !(u % 4) && c + l < i) {
        const h = new Uint32Array(a, u, Math.floor((i - c) / 4));
        ir(h);
        for (let f = 0; c + r < i; f += s.length, c += r)
          this.length += r, this.compress(h, f, !1);
        ir(h);
        continue;
      }
      n.set(e.subarray(c, c + l), this.pos), this.pos += l, this.length += l, c += l;
    }
    return this;
  }
  digestInto(e) {
    pr(this), pa(e, this);
    const { pos: r, buffer32: n } = this;
    this.finished = !0, st(this.buffer.subarray(r)), ir(n), this.compress(n, 0, !0), ir(n);
    const s = jn(e);
    this.get().forEach((i, o) => s[o] = Bt(i));
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    const { buffer: r, length: n, finished: s, destroyed: i, outputLen: o, pos: a } = this;
    return e || (e = new this.constructor({ dkLen: o })), e.set(...this.get()), e.buffer.set(r), e.destroyed = i, e.finished = s, e.length = n, e.pos = a, e.outputLen = o, e;
  }
  clone() {
    return this._cloneInto();
  }
}
class v2 extends E2 {
  constructor(e = {}) {
    const r = e.dkLen === void 0 ? 64 : e.dkLen;
    super(128, r), this.v0l = fe[0] | 0, this.v0h = fe[1] | 0, this.v1l = fe[2] | 0, this.v1h = fe[3] | 0, this.v2l = fe[4] | 0, this.v2h = fe[5] | 0, this.v3l = fe[6] | 0, this.v3h = fe[7] | 0, this.v4l = fe[8] | 0, this.v4h = fe[9] | 0, this.v5l = fe[10] | 0, this.v5h = fe[11] | 0, this.v6l = fe[12] | 0, this.v6h = fe[13] | 0, this.v7l = fe[14] | 0, this.v7h = fe[15] | 0, b2(r, e, 64, 16, 16);
    let { key: n, personalization: s, salt: i } = e, o = 0;
    if (n !== void 0 && (n = ht(n), o = n.length), this.v0l ^= this.outputLen | o << 8 | 65536 | 1 << 24, i !== void 0) {
      i = ht(i);
      const a = jn(i);
      this.v4l ^= Bt(a[0]), this.v4h ^= Bt(a[1]), this.v5l ^= Bt(a[2]), this.v5h ^= Bt(a[3]);
    }
    if (s !== void 0) {
      s = ht(s);
      const a = jn(s);
      this.v6l ^= Bt(a[0]), this.v6h ^= Bt(a[1]), this.v7l ^= Bt(a[2]), this.v7h ^= Bt(a[3]);
    }
    if (n !== void 0) {
      const a = new Uint8Array(this.blockLen);
      a.set(n), this.update(a);
    }
  }
  // prettier-ignore
  get() {
    let { v0l: e, v0h: r, v1l: n, v1h: s, v2l: i, v2h: o, v3l: a, v3h: c, v4l: l, v4h: u, v5l: h, v5h: f, v6l: d, v6h: p, v7l: g, v7h: m } = this;
    return [e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m];
  }
  // prettier-ignore
  set(e, r, n, s, i, o, a, c, l, u, h, f, d, p, g, m) {
    this.v0l = e | 0, this.v0h = r | 0, this.v1l = n | 0, this.v1h = s | 0, this.v2l = i | 0, this.v2h = o | 0, this.v3l = a | 0, this.v3h = c | 0, this.v4l = l | 0, this.v4h = u | 0, this.v5l = h | 0, this.v5h = f | 0, this.v6l = d | 0, this.v6h = p | 0, this.v7l = g | 0, this.v7h = m | 0;
  }
  compress(e, r, n) {
    this.get().forEach((c, l) => H[l] = c), H.set(fe, 16);
    let { h: s, l: i } = hh(BigInt(this.length));
    H[24] = fe[8] ^ i, H[25] = fe[9] ^ s, n && (H[28] = ~H[28], H[29] = ~H[29]);
    let o = 0;
    const a = m2;
    for (let c = 0; c < 12; c++)
      Xt(0, 4, 8, 12, e, r + 2 * a[o++]), Jt(0, 4, 8, 12, e, r + 2 * a[o++]), Xt(1, 5, 9, 13, e, r + 2 * a[o++]), Jt(1, 5, 9, 13, e, r + 2 * a[o++]), Xt(2, 6, 10, 14, e, r + 2 * a[o++]), Jt(2, 6, 10, 14, e, r + 2 * a[o++]), Xt(3, 7, 11, 15, e, r + 2 * a[o++]), Jt(3, 7, 11, 15, e, r + 2 * a[o++]), Xt(0, 5, 10, 15, e, r + 2 * a[o++]), Jt(0, 5, 10, 15, e, r + 2 * a[o++]), Xt(1, 6, 11, 12, e, r + 2 * a[o++]), Jt(1, 6, 11, 12, e, r + 2 * a[o++]), Xt(2, 7, 8, 13, e, r + 2 * a[o++]), Jt(2, 7, 8, 13, e, r + 2 * a[o++]), Xt(3, 4, 9, 14, e, r + 2 * a[o++]), Jt(3, 4, 9, 14, e, r + 2 * a[o++]);
    this.v0l ^= H[0] ^ H[16], this.v0h ^= H[1] ^ H[17], this.v1l ^= H[2] ^ H[18], this.v1h ^= H[3] ^ H[19], this.v2l ^= H[4] ^ H[20], this.v2h ^= H[5] ^ H[21], this.v3l ^= H[6] ^ H[22], this.v3h ^= H[7] ^ H[23], this.v4l ^= H[8] ^ H[24], this.v4h ^= H[9] ^ H[25], this.v5l ^= H[10] ^ H[26], this.v5h ^= H[11] ^ H[27], this.v6l ^= H[12] ^ H[28], this.v6h ^= H[13] ^ H[29], this.v7l ^= H[14] ^ H[30], this.v7h ^= H[15] ^ H[31], st(H);
  }
  destroy() {
    this.destroyed = !0, st(this.buffer32), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
const x2 = /* @__PURE__ */ Ub((t) => new v2(t));
function _2(t) {
  const e = t.length;
  let r = 0, n = 0;
  for (; n < e; ) {
    let s = t.charCodeAt(n++);
    if (s & 4294967168)
      if (!(s & 4294965248))
        r += 2;
      else {
        if (s >= 55296 && s <= 56319 && n < e) {
          const i = t.charCodeAt(n);
          (i & 64512) === 56320 && (++n, s = ((s & 1023) << 10) + (i & 1023) + 65536);
        }
        s & 4294901760 ? r += 4 : r += 3;
      }
    else {
      r++;
      continue;
    }
  }
  return r;
}
function S2(t, e, r) {
  const n = t.length;
  let s = r, i = 0;
  for (; i < n; ) {
    let o = t.charCodeAt(i++);
    if (o & 4294967168)
      if (!(o & 4294965248))
        e[s++] = o >> 6 & 31 | 192;
      else {
        if (o >= 55296 && o <= 56319 && i < n) {
          const a = t.charCodeAt(i);
          (a & 64512) === 56320 && (++i, o = ((o & 1023) << 10) + (a & 1023) + 65536);
        }
        o & 4294901760 ? (e[s++] = o >> 18 & 7 | 240, e[s++] = o >> 12 & 63 | 128, e[s++] = o >> 6 & 63 | 128) : (e[s++] = o >> 12 & 15 | 224, e[s++] = o >> 6 & 63 | 128);
      }
    else {
      e[s++] = o;
      continue;
    }
    e[s++] = o & 63 | 128;
  }
}
const I2 = new TextEncoder(), D2 = 50;
function A2(t, e, r) {
  I2.encodeInto(t, e.subarray(r));
}
function O2(t, e, r) {
  t.length > D2 ? A2(t, e, r) : S2(t, e, r);
}
const $2 = 4096;
function ff(t, e, r) {
  let n = e;
  const s = n + r, i = [];
  let o = "";
  for (; n < s; ) {
    const a = t[n++];
    if (!(a & 128))
      i.push(a);
    else if ((a & 224) === 192) {
      const c = t[n++] & 63;
      i.push((a & 31) << 6 | c);
    } else if ((a & 240) === 224) {
      const c = t[n++] & 63, l = t[n++] & 63;
      i.push((a & 31) << 12 | c << 6 | l);
    } else if ((a & 248) === 240) {
      const c = t[n++] & 63, l = t[n++] & 63, u = t[n++] & 63;
      let h = (a & 7) << 18 | c << 12 | l << 6 | u;
      h > 65535 && (h -= 65536, i.push(h >>> 10 & 1023 | 55296), h = 56320 | h & 1023), i.push(h);
    } else
      i.push(a);
    i.length >= $2 && (o += String.fromCharCode(...i), i.length = 0);
  }
  return i.length > 0 && (o += String.fromCharCode(...i)), o;
}
const T2 = new TextDecoder(), B2 = 200;
function R2(t, e, r) {
  const n = t.subarray(e, e + r);
  return T2.decode(n);
}
function P2(t, e, r) {
  return r > B2 ? R2(t, e, r) : ff(t, e, r);
}
class Es {
  constructor(e, r) {
    G(this, "type");
    G(this, "data");
    this.type = e, this.data = r;
  }
}
class We extends Error {
  constructor(e) {
    super(e);
    const r = Object.create(We.prototype);
    Object.setPrototypeOf(this, r), Object.defineProperty(this, "name", {
      configurable: !0,
      enumerable: !1,
      value: We.name
    });
  }
}
const Sn = 4294967295;
function C2(t, e, r) {
  const n = r / 4294967296, s = r;
  t.setUint32(e, n), t.setUint32(e + 4, s);
}
function df(t, e, r) {
  const n = Math.floor(r / 4294967296), s = r;
  t.setUint32(e, n), t.setUint32(e + 4, s);
}
function pf(t, e) {
  const r = t.getInt32(e), n = t.getUint32(e + 4);
  return r * 4294967296 + n;
}
function N2(t, e) {
  const r = t.getUint32(e), n = t.getUint32(e + 4);
  return r * 4294967296 + n;
}
const U2 = -1, L2 = 4294967296 - 1, k2 = 17179869184 - 1;
function M2({ sec: t, nsec: e }) {
  if (t >= 0 && e >= 0 && t <= k2)
    if (e === 0 && t <= L2) {
      const r = new Uint8Array(4);
      return new DataView(r.buffer).setUint32(0, t), r;
    } else {
      const r = t / 4294967296, n = t & 4294967295, s = new Uint8Array(8), i = new DataView(s.buffer);
      return i.setUint32(0, e << 2 | r & 3), i.setUint32(4, n), s;
    }
  else {
    const r = new Uint8Array(12), n = new DataView(r.buffer);
    return n.setUint32(0, e), df(n, 4, t), r;
  }
}
function F2(t) {
  const e = t.getTime(), r = Math.floor(e / 1e3), n = (e - r * 1e3) * 1e6, s = Math.floor(n / 1e9);
  return {
    sec: r + s,
    nsec: n - s * 1e9
  };
}
function q2(t) {
  if (t instanceof Date) {
    const e = F2(t);
    return M2(e);
  } else
    return null;
}
function z2(t) {
  const e = new DataView(t.buffer, t.byteOffset, t.byteLength);
  switch (t.byteLength) {
    case 4:
      return { sec: e.getUint32(0), nsec: 0 };
    case 8: {
      const r = e.getUint32(0), n = e.getUint32(4), s = (r & 3) * 4294967296 + n, i = r >>> 2;
      return { sec: s, nsec: i };
    }
    case 12: {
      const r = pf(e, 4), n = e.getUint32(0);
      return { sec: r, nsec: n };
    }
    default:
      throw new We(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${t.length}`);
  }
}
function j2(t) {
  const e = z2(t);
  return new Date(e.sec * 1e3 + e.nsec / 1e6);
}
const H2 = {
  type: U2,
  encode: q2,
  decode: j2
}, ii = class ii {
  constructor() {
    // ensures ExtensionCodecType<X> matches ExtensionCodec<X>
    // this will make type errors a lot more clear
    // eslint-disable-next-line @typescript-eslint/naming-convention
    G(this, "__brand");
    // built-in extensions
    G(this, "builtInEncoders", []);
    G(this, "builtInDecoders", []);
    // custom extensions
    G(this, "encoders", []);
    G(this, "decoders", []);
    this.register(H2);
  }
  register({ type: e, encode: r, decode: n }) {
    if (e >= 0)
      this.encoders[e] = r, this.decoders[e] = n;
    else {
      const s = -1 - e;
      this.builtInEncoders[s] = r, this.builtInDecoders[s] = n;
    }
  }
  tryToEncode(e, r) {
    for (let n = 0; n < this.builtInEncoders.length; n++) {
      const s = this.builtInEncoders[n];
      if (s != null) {
        const i = s(e, r);
        if (i != null) {
          const o = -1 - n;
          return new Es(o, i);
        }
      }
    }
    for (let n = 0; n < this.encoders.length; n++) {
      const s = this.encoders[n];
      if (s != null) {
        const i = s(e, r);
        if (i != null) {
          const o = n;
          return new Es(o, i);
        }
      }
    }
    return e instanceof Es ? e : null;
  }
  decode(e, r, n) {
    const s = r < 0 ? this.builtInDecoders[-1 - r] : this.decoders[r];
    return s ? s(e, r, n) : new Es(r, e);
  }
};
G(ii, "defaultCodec", new ii());
let Gs = ii;
function K2(t) {
  return t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer;
}
function ko(t) {
  return t instanceof Uint8Array ? t : ArrayBuffer.isView(t) ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : K2(t) ? new Uint8Array(t) : Uint8Array.from(t);
}
const V2 = 100, W2 = 2048;
class Sa {
  constructor(e) {
    G(this, "extensionCodec");
    G(this, "context");
    G(this, "useBigInt64");
    G(this, "maxDepth");
    G(this, "initialBufferSize");
    G(this, "sortKeys");
    G(this, "forceFloat32");
    G(this, "ignoreUndefined");
    G(this, "forceIntegerToFloat");
    G(this, "pos");
    G(this, "view");
    G(this, "bytes");
    G(this, "entered", !1);
    this.extensionCodec = (e == null ? void 0 : e.extensionCodec) ?? Gs.defaultCodec, this.context = e == null ? void 0 : e.context, this.useBigInt64 = (e == null ? void 0 : e.useBigInt64) ?? !1, this.maxDepth = (e == null ? void 0 : e.maxDepth) ?? V2, this.initialBufferSize = (e == null ? void 0 : e.initialBufferSize) ?? W2, this.sortKeys = (e == null ? void 0 : e.sortKeys) ?? !1, this.forceFloat32 = (e == null ? void 0 : e.forceFloat32) ?? !1, this.ignoreUndefined = (e == null ? void 0 : e.ignoreUndefined) ?? !1, this.forceIntegerToFloat = (e == null ? void 0 : e.forceIntegerToFloat) ?? !1, this.pos = 0, this.view = new DataView(new ArrayBuffer(this.initialBufferSize)), this.bytes = new Uint8Array(this.view.buffer);
  }
  clone() {
    return new Sa({
      extensionCodec: this.extensionCodec,
      context: this.context,
      useBigInt64: this.useBigInt64,
      maxDepth: this.maxDepth,
      initialBufferSize: this.initialBufferSize,
      sortKeys: this.sortKeys,
      forceFloat32: this.forceFloat32,
      ignoreUndefined: this.ignoreUndefined,
      forceIntegerToFloat: this.forceIntegerToFloat
    });
  }
  reinitializeState() {
    this.pos = 0;
  }
  /**
   * This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
   *
   * @returns Encodes the object and returns a shared reference the encoder's internal buffer.
   */
  encodeSharedRef(e) {
    if (this.entered)
      return this.clone().encodeSharedRef(e);
    try {
      return this.entered = !0, this.reinitializeState(), this.doEncode(e, 1), this.bytes.subarray(0, this.pos);
    } finally {
      this.entered = !1;
    }
  }
  /**
   * @returns Encodes the object and returns a copy of the encoder's internal buffer.
   */
  encode(e) {
    if (this.entered)
      return this.clone().encode(e);
    try {
      return this.entered = !0, this.reinitializeState(), this.doEncode(e, 1), this.bytes.slice(0, this.pos);
    } finally {
      this.entered = !1;
    }
  }
  doEncode(e, r) {
    if (r > this.maxDepth)
      throw new Error(`Too deep objects in depth ${r}`);
    e == null ? this.encodeNil() : typeof e == "boolean" ? this.encodeBoolean(e) : typeof e == "number" ? this.forceIntegerToFloat ? this.encodeNumberAsFloat(e) : this.encodeNumber(e) : typeof e == "string" ? this.encodeString(e) : this.useBigInt64 && typeof e == "bigint" ? this.encodeBigInt64(e) : this.encodeObject(e, r);
  }
  ensureBufferSizeToWrite(e) {
    const r = this.pos + e;
    this.view.byteLength < r && this.resizeBuffer(r * 2);
  }
  resizeBuffer(e) {
    const r = new ArrayBuffer(e), n = new Uint8Array(r), s = new DataView(r);
    n.set(this.bytes), this.view = s, this.bytes = n;
  }
  encodeNil() {
    this.writeU8(192);
  }
  encodeBoolean(e) {
    e === !1 ? this.writeU8(194) : this.writeU8(195);
  }
  encodeNumber(e) {
    !this.forceIntegerToFloat && Number.isSafeInteger(e) ? e >= 0 ? e < 128 ? this.writeU8(e) : e < 256 ? (this.writeU8(204), this.writeU8(e)) : e < 65536 ? (this.writeU8(205), this.writeU16(e)) : e < 4294967296 ? (this.writeU8(206), this.writeU32(e)) : this.useBigInt64 ? this.encodeNumberAsFloat(e) : (this.writeU8(207), this.writeU64(e)) : e >= -32 ? this.writeU8(224 | e + 32) : e >= -128 ? (this.writeU8(208), this.writeI8(e)) : e >= -32768 ? (this.writeU8(209), this.writeI16(e)) : e >= -2147483648 ? (this.writeU8(210), this.writeI32(e)) : this.useBigInt64 ? this.encodeNumberAsFloat(e) : (this.writeU8(211), this.writeI64(e)) : this.encodeNumberAsFloat(e);
  }
  encodeNumberAsFloat(e) {
    this.forceFloat32 ? (this.writeU8(202), this.writeF32(e)) : (this.writeU8(203), this.writeF64(e));
  }
  encodeBigInt64(e) {
    e >= BigInt(0) ? (this.writeU8(207), this.writeBigUint64(e)) : (this.writeU8(211), this.writeBigInt64(e));
  }
  writeStringHeader(e) {
    if (e < 32)
      this.writeU8(160 + e);
    else if (e < 256)
      this.writeU8(217), this.writeU8(e);
    else if (e < 65536)
      this.writeU8(218), this.writeU16(e);
    else if (e < 4294967296)
      this.writeU8(219), this.writeU32(e);
    else
      throw new Error(`Too long string: ${e} bytes in UTF-8`);
  }
  encodeString(e) {
    const n = _2(e);
    this.ensureBufferSizeToWrite(5 + n), this.writeStringHeader(n), O2(e, this.bytes, this.pos), this.pos += n;
  }
  encodeObject(e, r) {
    const n = this.extensionCodec.tryToEncode(e, this.context);
    if (n != null)
      this.encodeExtension(n);
    else if (Array.isArray(e))
      this.encodeArray(e, r);
    else if (ArrayBuffer.isView(e))
      this.encodeBinary(e);
    else if (typeof e == "object")
      this.encodeMap(e, r);
    else
      throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(e)}`);
  }
  encodeBinary(e) {
    const r = e.byteLength;
    if (r < 256)
      this.writeU8(196), this.writeU8(r);
    else if (r < 65536)
      this.writeU8(197), this.writeU16(r);
    else if (r < 4294967296)
      this.writeU8(198), this.writeU32(r);
    else
      throw new Error(`Too large binary: ${r}`);
    const n = ko(e);
    this.writeU8a(n);
  }
  encodeArray(e, r) {
    const n = e.length;
    if (n < 16)
      this.writeU8(144 + n);
    else if (n < 65536)
      this.writeU8(220), this.writeU16(n);
    else if (n < 4294967296)
      this.writeU8(221), this.writeU32(n);
    else
      throw new Error(`Too large array: ${n}`);
    for (const s of e)
      this.doEncode(s, r + 1);
  }
  countWithoutUndefined(e, r) {
    let n = 0;
    for (const s of r)
      e[s] !== void 0 && n++;
    return n;
  }
  encodeMap(e, r) {
    const n = Object.keys(e);
    this.sortKeys && n.sort();
    const s = this.ignoreUndefined ? this.countWithoutUndefined(e, n) : n.length;
    if (s < 16)
      this.writeU8(128 + s);
    else if (s < 65536)
      this.writeU8(222), this.writeU16(s);
    else if (s < 4294967296)
      this.writeU8(223), this.writeU32(s);
    else
      throw new Error(`Too large map object: ${s}`);
    for (const i of n) {
      const o = e[i];
      this.ignoreUndefined && o === void 0 || (this.encodeString(i), this.doEncode(o, r + 1));
    }
  }
  encodeExtension(e) {
    if (typeof e.data == "function") {
      const n = e.data(this.pos + 6), s = n.length;
      if (s >= 4294967296)
        throw new Error(`Too large extension object: ${s}`);
      this.writeU8(201), this.writeU32(s), this.writeI8(e.type), this.writeU8a(n);
      return;
    }
    const r = e.data.length;
    if (r === 1)
      this.writeU8(212);
    else if (r === 2)
      this.writeU8(213);
    else if (r === 4)
      this.writeU8(214);
    else if (r === 8)
      this.writeU8(215);
    else if (r === 16)
      this.writeU8(216);
    else if (r < 256)
      this.writeU8(199), this.writeU8(r);
    else if (r < 65536)
      this.writeU8(200), this.writeU16(r);
    else if (r < 4294967296)
      this.writeU8(201), this.writeU32(r);
    else
      throw new Error(`Too large extension object: ${r}`);
    this.writeI8(e.type), this.writeU8a(e.data);
  }
  writeU8(e) {
    this.ensureBufferSizeToWrite(1), this.view.setUint8(this.pos, e), this.pos++;
  }
  writeU8a(e) {
    const r = e.length;
    this.ensureBufferSizeToWrite(r), this.bytes.set(e, this.pos), this.pos += r;
  }
  writeI8(e) {
    this.ensureBufferSizeToWrite(1), this.view.setInt8(this.pos, e), this.pos++;
  }
  writeU16(e) {
    this.ensureBufferSizeToWrite(2), this.view.setUint16(this.pos, e), this.pos += 2;
  }
  writeI16(e) {
    this.ensureBufferSizeToWrite(2), this.view.setInt16(this.pos, e), this.pos += 2;
  }
  writeU32(e) {
    this.ensureBufferSizeToWrite(4), this.view.setUint32(this.pos, e), this.pos += 4;
  }
  writeI32(e) {
    this.ensureBufferSizeToWrite(4), this.view.setInt32(this.pos, e), this.pos += 4;
  }
  writeF32(e) {
    this.ensureBufferSizeToWrite(4), this.view.setFloat32(this.pos, e), this.pos += 4;
  }
  writeF64(e) {
    this.ensureBufferSizeToWrite(8), this.view.setFloat64(this.pos, e), this.pos += 8;
  }
  writeU64(e) {
    this.ensureBufferSizeToWrite(8), C2(this.view, this.pos, e), this.pos += 8;
  }
  writeI64(e) {
    this.ensureBufferSizeToWrite(8), df(this.view, this.pos, e), this.pos += 8;
  }
  writeBigUint64(e) {
    this.ensureBufferSizeToWrite(8), this.view.setBigUint64(this.pos, e), this.pos += 8;
  }
  writeBigInt64(e) {
    this.ensureBufferSizeToWrite(8), this.view.setBigInt64(this.pos, e), this.pos += 8;
  }
}
function G2(t, e) {
  return new Sa(e).encodeSharedRef(t);
}
function no(t) {
  return `${t < 0 ? "-" : ""}0x${Math.abs(t).toString(16).padStart(2, "0")}`;
}
const Y2 = 16, Z2 = 16;
class X2 {
  constructor(e = Y2, r = Z2) {
    G(this, "hit", 0);
    G(this, "miss", 0);
    G(this, "caches");
    G(this, "maxKeyLength");
    G(this, "maxLengthPerKey");
    this.maxKeyLength = e, this.maxLengthPerKey = r, this.caches = [];
    for (let n = 0; n < this.maxKeyLength; n++)
      this.caches.push([]);
  }
  canBeCached(e) {
    return e > 0 && e <= this.maxKeyLength;
  }
  find(e, r, n) {
    const s = this.caches[n - 1];
    e: for (const i of s) {
      const o = i.bytes;
      for (let a = 0; a < n; a++)
        if (o[a] !== e[r + a])
          continue e;
      return i.str;
    }
    return null;
  }
  store(e, r) {
    const n = this.caches[e.length - 1], s = { bytes: e, str: r };
    n.length >= this.maxLengthPerKey ? n[Math.random() * n.length | 0] = s : n.push(s);
  }
  decode(e, r, n) {
    const s = this.find(e, r, n);
    if (s != null)
      return this.hit++, s;
    this.miss++;
    const i = ff(e, r, n), o = Uint8Array.prototype.slice.call(e, r, r + n);
    return this.store(o, i), i;
  }
}
const Mo = "array", Un = "map_key", gf = "map_value", J2 = (t) => {
  if (typeof t == "string" || typeof t == "number")
    return t;
  throw new We("The type of key must be string or number but " + typeof t);
};
class Q2 {
  constructor() {
    G(this, "stack", []);
    G(this, "stackHeadPosition", -1);
  }
  get length() {
    return this.stackHeadPosition + 1;
  }
  top() {
    return this.stack[this.stackHeadPosition];
  }
  pushArrayState(e) {
    const r = this.getUninitializedStateFromPool();
    r.type = Mo, r.position = 0, r.size = e, r.array = new Array(e);
  }
  pushMapState(e) {
    const r = this.getUninitializedStateFromPool();
    r.type = Un, r.readCount = 0, r.size = e, r.map = {};
  }
  getUninitializedStateFromPool() {
    if (this.stackHeadPosition++, this.stackHeadPosition === this.stack.length) {
      const e = {
        type: void 0,
        size: 0,
        array: void 0,
        position: 0,
        readCount: 0,
        map: void 0,
        key: null
      };
      this.stack.push(e);
    }
    return this.stack[this.stackHeadPosition];
  }
  release(e) {
    if (this.stack[this.stackHeadPosition] !== e)
      throw new Error("Invalid stack state. Released state is not on top of the stack.");
    if (e.type === Mo) {
      const n = e;
      n.size = 0, n.array = void 0, n.position = 0, n.type = void 0;
    }
    if (e.type === Un || e.type === gf) {
      const n = e;
      n.size = 0, n.map = void 0, n.readCount = 0, n.type = void 0;
    }
    this.stackHeadPosition--;
  }
  reset() {
    this.stack.length = 0, this.stackHeadPosition = -1;
  }
}
const In = -1, Ia = new DataView(new ArrayBuffer(0)), ev = new Uint8Array(Ia.buffer);
try {
  Ia.getInt8(0);
} catch (t) {
  if (!(t instanceof RangeError))
    throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access");
}
const bl = new RangeError("Insufficient data"), tv = new X2();
class Da {
  constructor(e) {
    G(this, "extensionCodec");
    G(this, "context");
    G(this, "useBigInt64");
    G(this, "rawStrings");
    G(this, "maxStrLength");
    G(this, "maxBinLength");
    G(this, "maxArrayLength");
    G(this, "maxMapLength");
    G(this, "maxExtLength");
    G(this, "keyDecoder");
    G(this, "mapKeyConverter");
    G(this, "totalPos", 0);
    G(this, "pos", 0);
    G(this, "view", Ia);
    G(this, "bytes", ev);
    G(this, "headByte", In);
    G(this, "stack", new Q2());
    G(this, "entered", !1);
    this.extensionCodec = (e == null ? void 0 : e.extensionCodec) ?? Gs.defaultCodec, this.context = e == null ? void 0 : e.context, this.useBigInt64 = (e == null ? void 0 : e.useBigInt64) ?? !1, this.rawStrings = (e == null ? void 0 : e.rawStrings) ?? !1, this.maxStrLength = (e == null ? void 0 : e.maxStrLength) ?? Sn, this.maxBinLength = (e == null ? void 0 : e.maxBinLength) ?? Sn, this.maxArrayLength = (e == null ? void 0 : e.maxArrayLength) ?? Sn, this.maxMapLength = (e == null ? void 0 : e.maxMapLength) ?? Sn, this.maxExtLength = (e == null ? void 0 : e.maxExtLength) ?? Sn, this.keyDecoder = (e == null ? void 0 : e.keyDecoder) !== void 0 ? e.keyDecoder : tv, this.mapKeyConverter = (e == null ? void 0 : e.mapKeyConverter) ?? J2;
  }
  clone() {
    return new Da({
      extensionCodec: this.extensionCodec,
      context: this.context,
      useBigInt64: this.useBigInt64,
      rawStrings: this.rawStrings,
      maxStrLength: this.maxStrLength,
      maxBinLength: this.maxBinLength,
      maxArrayLength: this.maxArrayLength,
      maxMapLength: this.maxMapLength,
      maxExtLength: this.maxExtLength,
      keyDecoder: this.keyDecoder
    });
  }
  reinitializeState() {
    this.totalPos = 0, this.headByte = In, this.stack.reset();
  }
  setBuffer(e) {
    const r = ko(e);
    this.bytes = r, this.view = new DataView(r.buffer, r.byteOffset, r.byteLength), this.pos = 0;
  }
  appendBuffer(e) {
    if (this.headByte === In && !this.hasRemaining(1))
      this.setBuffer(e);
    else {
      const r = this.bytes.subarray(this.pos), n = ko(e), s = new Uint8Array(r.length + n.length);
      s.set(r), s.set(n, r.length), this.setBuffer(s);
    }
  }
  hasRemaining(e) {
    return this.view.byteLength - this.pos >= e;
  }
  createExtraByteError(e) {
    const { view: r, pos: n } = this;
    return new RangeError(`Extra ${r.byteLength - n} of ${r.byteLength} byte(s) found at buffer[${e}]`);
  }
  /**
   * @throws {@link DecodeError}
   * @throws {@link RangeError}
   */
  decode(e) {
    if (this.entered)
      return this.clone().decode(e);
    try {
      this.entered = !0, this.reinitializeState(), this.setBuffer(e);
      const r = this.doDecodeSync();
      if (this.hasRemaining(1))
        throw this.createExtraByteError(this.pos);
      return r;
    } finally {
      this.entered = !1;
    }
  }
  *decodeMulti(e) {
    if (this.entered) {
      yield* this.clone().decodeMulti(e);
      return;
    }
    try {
      for (this.entered = !0, this.reinitializeState(), this.setBuffer(e); this.hasRemaining(1); )
        yield this.doDecodeSync();
    } finally {
      this.entered = !1;
    }
  }
  async decodeAsync(e) {
    if (this.entered)
      return this.clone().decodeAsync(e);
    try {
      this.entered = !0;
      let r = !1, n;
      for await (const a of e) {
        if (r)
          throw this.entered = !1, this.createExtraByteError(this.totalPos);
        this.appendBuffer(a);
        try {
          n = this.doDecodeSync(), r = !0;
        } catch (c) {
          if (!(c instanceof RangeError))
            throw c;
        }
        this.totalPos += this.pos;
      }
      if (r) {
        if (this.hasRemaining(1))
          throw this.createExtraByteError(this.totalPos);
        return n;
      }
      const { headByte: s, pos: i, totalPos: o } = this;
      throw new RangeError(`Insufficient data in parsing ${no(s)} at ${o} (${i} in the current buffer)`);
    } finally {
      this.entered = !1;
    }
  }
  decodeArrayStream(e) {
    return this.decodeMultiAsync(e, !0);
  }
  decodeStream(e) {
    return this.decodeMultiAsync(e, !1);
  }
  async *decodeMultiAsync(e, r) {
    if (this.entered) {
      yield* this.clone().decodeMultiAsync(e, r);
      return;
    }
    try {
      this.entered = !0;
      let n = r, s = -1;
      for await (const i of e) {
        if (r && s === 0)
          throw this.createExtraByteError(this.totalPos);
        this.appendBuffer(i), n && (s = this.readArraySize(), n = !1, this.complete());
        try {
          for (; yield this.doDecodeSync(), --s !== 0; )
            ;
        } catch (o) {
          if (!(o instanceof RangeError))
            throw o;
        }
        this.totalPos += this.pos;
      }
    } finally {
      this.entered = !1;
    }
  }
  doDecodeSync() {
    e: for (; ; ) {
      const e = this.readHeadByte();
      let r;
      if (e >= 224)
        r = e - 256;
      else if (e < 192)
        if (e < 128)
          r = e;
        else if (e < 144) {
          const s = e - 128;
          if (s !== 0) {
            this.pushMapState(s), this.complete();
            continue e;
          } else
            r = {};
        } else if (e < 160) {
          const s = e - 144;
          if (s !== 0) {
            this.pushArrayState(s), this.complete();
            continue e;
          } else
            r = [];
        } else {
          const s = e - 160;
          r = this.decodeString(s, 0);
        }
      else if (e === 192)
        r = null;
      else if (e === 194)
        r = !1;
      else if (e === 195)
        r = !0;
      else if (e === 202)
        r = this.readF32();
      else if (e === 203)
        r = this.readF64();
      else if (e === 204)
        r = this.readU8();
      else if (e === 205)
        r = this.readU16();
      else if (e === 206)
        r = this.readU32();
      else if (e === 207)
        this.useBigInt64 ? r = this.readU64AsBigInt() : r = this.readU64();
      else if (e === 208)
        r = this.readI8();
      else if (e === 209)
        r = this.readI16();
      else if (e === 210)
        r = this.readI32();
      else if (e === 211)
        this.useBigInt64 ? r = this.readI64AsBigInt() : r = this.readI64();
      else if (e === 217) {
        const s = this.lookU8();
        r = this.decodeString(s, 1);
      } else if (e === 218) {
        const s = this.lookU16();
        r = this.decodeString(s, 2);
      } else if (e === 219) {
        const s = this.lookU32();
        r = this.decodeString(s, 4);
      } else if (e === 220) {
        const s = this.readU16();
        if (s !== 0) {
          this.pushArrayState(s), this.complete();
          continue e;
        } else
          r = [];
      } else if (e === 221) {
        const s = this.readU32();
        if (s !== 0) {
          this.pushArrayState(s), this.complete();
          continue e;
        } else
          r = [];
      } else if (e === 222) {
        const s = this.readU16();
        if (s !== 0) {
          this.pushMapState(s), this.complete();
          continue e;
        } else
          r = {};
      } else if (e === 223) {
        const s = this.readU32();
        if (s !== 0) {
          this.pushMapState(s), this.complete();
          continue e;
        } else
          r = {};
      } else if (e === 196) {
        const s = this.lookU8();
        r = this.decodeBinary(s, 1);
      } else if (e === 197) {
        const s = this.lookU16();
        r = this.decodeBinary(s, 2);
      } else if (e === 198) {
        const s = this.lookU32();
        r = this.decodeBinary(s, 4);
      } else if (e === 212)
        r = this.decodeExtension(1, 0);
      else if (e === 213)
        r = this.decodeExtension(2, 0);
      else if (e === 214)
        r = this.decodeExtension(4, 0);
      else if (e === 215)
        r = this.decodeExtension(8, 0);
      else if (e === 216)
        r = this.decodeExtension(16, 0);
      else if (e === 199) {
        const s = this.lookU8();
        r = this.decodeExtension(s, 1);
      } else if (e === 200) {
        const s = this.lookU16();
        r = this.decodeExtension(s, 2);
      } else if (e === 201) {
        const s = this.lookU32();
        r = this.decodeExtension(s, 4);
      } else
        throw new We(`Unrecognized type byte: ${no(e)}`);
      this.complete();
      const n = this.stack;
      for (; n.length > 0; ) {
        const s = n.top();
        if (s.type === Mo)
          if (s.array[s.position] = r, s.position++, s.position === s.size)
            r = s.array, n.release(s);
          else
            continue e;
        else if (s.type === Un) {
          if (r === "__proto__")
            throw new We("The key __proto__ is not allowed");
          s.key = this.mapKeyConverter(r), s.type = gf;
          continue e;
        } else if (s.map[s.key] = r, s.readCount++, s.readCount === s.size)
          r = s.map, n.release(s);
        else {
          s.key = null, s.type = Un;
          continue e;
        }
      }
      return r;
    }
  }
  readHeadByte() {
    return this.headByte === In && (this.headByte = this.readU8()), this.headByte;
  }
  complete() {
    this.headByte = In;
  }
  readArraySize() {
    const e = this.readHeadByte();
    switch (e) {
      case 220:
        return this.readU16();
      case 221:
        return this.readU32();
      default: {
        if (e < 160)
          return e - 144;
        throw new We(`Unrecognized array type byte: ${no(e)}`);
      }
    }
  }
  pushMapState(e) {
    if (e > this.maxMapLength)
      throw new We(`Max length exceeded: map length (${e}) > maxMapLengthLength (${this.maxMapLength})`);
    this.stack.pushMapState(e);
  }
  pushArrayState(e) {
    if (e > this.maxArrayLength)
      throw new We(`Max length exceeded: array length (${e}) > maxArrayLength (${this.maxArrayLength})`);
    this.stack.pushArrayState(e);
  }
  decodeString(e, r) {
    return !this.rawStrings || this.stateIsMapKey() ? this.decodeUtf8String(e, r) : this.decodeBinary(e, r);
  }
  /**
   * @throws {@link RangeError}
   */
  decodeUtf8String(e, r) {
    var i;
    if (e > this.maxStrLength)
      throw new We(`Max length exceeded: UTF-8 byte length (${e}) > maxStrLength (${this.maxStrLength})`);
    if (this.bytes.byteLength < this.pos + r + e)
      throw bl;
    const n = this.pos + r;
    let s;
    return this.stateIsMapKey() && ((i = this.keyDecoder) != null && i.canBeCached(e)) ? s = this.keyDecoder.decode(this.bytes, n, e) : s = P2(this.bytes, n, e), this.pos += r + e, s;
  }
  stateIsMapKey() {
    return this.stack.length > 0 ? this.stack.top().type === Un : !1;
  }
  /**
   * @throws {@link RangeError}
   */
  decodeBinary(e, r) {
    if (e > this.maxBinLength)
      throw new We(`Max length exceeded: bin length (${e}) > maxBinLength (${this.maxBinLength})`);
    if (!this.hasRemaining(e + r))
      throw bl;
    const n = this.pos + r, s = this.bytes.subarray(n, n + e);
    return this.pos += r + e, s;
  }
  decodeExtension(e, r) {
    if (e > this.maxExtLength)
      throw new We(`Max length exceeded: ext length (${e}) > maxExtLength (${this.maxExtLength})`);
    const n = this.view.getInt8(this.pos + r), s = this.decodeBinary(
      e,
      r + 1
      /* extType */
    );
    return this.extensionCodec.decode(s, n, this.context);
  }
  lookU8() {
    return this.view.getUint8(this.pos);
  }
  lookU16() {
    return this.view.getUint16(this.pos);
  }
  lookU32() {
    return this.view.getUint32(this.pos);
  }
  readU8() {
    const e = this.view.getUint8(this.pos);
    return this.pos++, e;
  }
  readI8() {
    const e = this.view.getInt8(this.pos);
    return this.pos++, e;
  }
  readU16() {
    const e = this.view.getUint16(this.pos);
    return this.pos += 2, e;
  }
  readI16() {
    const e = this.view.getInt16(this.pos);
    return this.pos += 2, e;
  }
  readU32() {
    const e = this.view.getUint32(this.pos);
    return this.pos += 4, e;
  }
  readI32() {
    const e = this.view.getInt32(this.pos);
    return this.pos += 4, e;
  }
  readU64() {
    const e = N2(this.view, this.pos);
    return this.pos += 8, e;
  }
  readI64() {
    const e = pf(this.view, this.pos);
    return this.pos += 8, e;
  }
  readU64AsBigInt() {
    const e = this.view.getBigUint64(this.pos);
    return this.pos += 8, e;
  }
  readI64AsBigInt() {
    const e = this.view.getBigInt64(this.pos);
    return this.pos += 8, e;
  }
  readF32() {
    const e = this.view.getFloat32(this.pos);
    return this.pos += 4, e;
  }
  readF64() {
    const e = this.view.getFloat64(this.pos);
    return this.pos += 8, e;
  }
}
function rv(t, e) {
  return new Da(e).decode(t);
}
function Pr(t, e) {
  e || (e = t.reduce((s, i) => s + i.length, 0));
  const r = oh(e);
  let n = 0;
  for (const s of t)
    r.set(s, n), n += s.length;
  return la(r);
}
function Ee(t, e = "utf8") {
  const r = ch[e];
  if (!r)
    throw new Error(`Unsupported encoding "${e}"`);
  return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null ? globalThis.Buffer.from(t.buffer, t.byteOffset, t.byteLength).toString("utf8") : r.encoder.encode(t).substring(1);
}
const yf = (t) => Uint8Array.from(t.split("").map((e) => e.charCodeAt(0))), nv = yf("expand 16-byte k"), sv = yf("expand 32-byte k"), iv = dr(nv), ov = dr(sv);
function Q(t, e) {
  return t << e | t >>> 32 - e;
}
function Fo(t) {
  return t.byteOffset % 4 === 0;
}
const vs = 64, av = 16, wf = 2 ** 32 - 1, El = new Uint32Array();
function cv(t, e, r, n, s, i, o, a) {
  const c = s.length, l = new Uint8Array(vs), u = dr(l), h = Fo(s) && Fo(i), f = h ? dr(s) : El, d = h ? dr(i) : El;
  for (let p = 0; p < c; o++) {
    if (t(e, r, n, u, o, a), o >= wf)
      throw new Error("arx: counter overflow");
    const g = Math.min(vs, c - p);
    if (h && g === vs) {
      const m = p / 4;
      if (p % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let _ = 0, R; _ < av; _++)
        R = m + _, d[R] = f[R] ^ u[_];
      p += vs;
      continue;
    }
    for (let m = 0, _; m < g; m++)
      _ = p + m, i[_] = s[_] ^ l[m];
    p += g;
  }
}
function lv(t, e) {
  const { allowShortKeys: r, extendNonceFn: n, counterLength: s, counterRight: i, rounds: o } = t2({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, e);
  if (typeof t != "function")
    throw new Error("core must be a function");
  return ro(s), ro(o), No(i), No(r), (a, c, l, u, h = 0) => {
    ze(a), ze(c), ze(l);
    const f = l.length;
    if (u === void 0 && (u = new Uint8Array(f)), ze(u), ro(h), h < 0 || h >= wf)
      throw new Error("arx: counter overflow");
    if (u.length < f)
      throw new Error(`arx: output (${u.length}) is shorter than data (${f})`);
    const d = [];
    let p = a.length, g, m;
    if (p === 32)
      d.push(g = Lo(a)), m = ov;
    else if (p === 16 && r)
      g = new Uint8Array(32), g.set(a), g.set(a, 16), m = iv, d.push(g);
    else
      throw new Error(`arx: invalid 32-byte key, got length=${p}`);
    Fo(c) || d.push(c = Lo(c));
    const _ = dr(g);
    if (n) {
      if (c.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      n(m, _, dr(c.subarray(0, 16)), _), c = c.subarray(16);
    }
    const R = 16 - s;
    if (R !== c.length)
      throw new Error(`arx: nonce must be ${R} or 16 bytes`);
    if (R !== 12) {
      const S = new Uint8Array(12);
      S.set(c, i ? 0 : 12 - c.length), c = S, d.push(c);
    }
    const b = dr(c);
    return cv(t, m, _, b, l, u, h, o), fn(...d), u;
  };
}
const ve = (t, e) => t[e++] & 255 | (t[e++] & 255) << 8;
class uv {
  constructor(e) {
    this.blockLen = 16, this.outputLen = 16, this.buffer = new Uint8Array(16), this.r = new Uint16Array(10), this.h = new Uint16Array(10), this.pad = new Uint16Array(8), this.pos = 0, this.finished = !1, e = Uo(e), ze(e, 32);
    const r = ve(e, 0), n = ve(e, 2), s = ve(e, 4), i = ve(e, 6), o = ve(e, 8), a = ve(e, 10), c = ve(e, 12), l = ve(e, 14);
    this.r[0] = r & 8191, this.r[1] = (r >>> 13 | n << 3) & 8191, this.r[2] = (n >>> 10 | s << 6) & 7939, this.r[3] = (s >>> 7 | i << 9) & 8191, this.r[4] = (i >>> 4 | o << 12) & 255, this.r[5] = o >>> 1 & 8190, this.r[6] = (o >>> 14 | a << 2) & 8191, this.r[7] = (a >>> 11 | c << 5) & 8065, this.r[8] = (c >>> 8 | l << 8) & 8191, this.r[9] = l >>> 5 & 127;
    for (let u = 0; u < 8; u++)
      this.pad[u] = ve(e, 16 + 2 * u);
  }
  process(e, r, n = !1) {
    const s = n ? 0 : 2048, { h: i, r: o } = this, a = o[0], c = o[1], l = o[2], u = o[3], h = o[4], f = o[5], d = o[6], p = o[7], g = o[8], m = o[9], _ = ve(e, r + 0), R = ve(e, r + 2), b = ve(e, r + 4), S = ve(e, r + 6), $ = ve(e, r + 8), B = ve(e, r + 10), C = ve(e, r + 12), P = ve(e, r + 14);
    let O = i[0] + (_ & 8191), U = i[1] + ((_ >>> 13 | R << 3) & 8191), k = i[2] + ((R >>> 10 | b << 6) & 8191), N = i[3] + ((b >>> 7 | S << 9) & 8191), v = i[4] + ((S >>> 4 | $ << 12) & 8191), A = i[5] + ($ >>> 1 & 8191), y = i[6] + (($ >>> 14 | B << 2) & 8191), w = i[7] + ((B >>> 11 | C << 5) & 8191), x = i[8] + ((C >>> 8 | P << 8) & 8191), D = i[9] + (P >>> 5 | s), E = 0, I = E + O * a + U * (5 * m) + k * (5 * g) + N * (5 * p) + v * (5 * d);
    E = I >>> 13, I &= 8191, I += A * (5 * f) + y * (5 * h) + w * (5 * u) + x * (5 * l) + D * (5 * c), E += I >>> 13, I &= 8191;
    let T = E + O * c + U * a + k * (5 * m) + N * (5 * g) + v * (5 * p);
    E = T >>> 13, T &= 8191, T += A * (5 * d) + y * (5 * f) + w * (5 * h) + x * (5 * u) + D * (5 * l), E += T >>> 13, T &= 8191;
    let L = E + O * l + U * c + k * a + N * (5 * m) + v * (5 * g);
    E = L >>> 13, L &= 8191, L += A * (5 * p) + y * (5 * d) + w * (5 * f) + x * (5 * h) + D * (5 * u), E += L >>> 13, L &= 8191;
    let j = E + O * u + U * l + k * c + N * a + v * (5 * m);
    E = j >>> 13, j &= 8191, j += A * (5 * g) + y * (5 * p) + w * (5 * d) + x * (5 * f) + D * (5 * h), E += j >>> 13, j &= 8191;
    let z = E + O * h + U * u + k * l + N * c + v * a;
    E = z >>> 13, z &= 8191, z += A * (5 * m) + y * (5 * g) + w * (5 * p) + x * (5 * d) + D * (5 * f), E += z >>> 13, z &= 8191;
    let q = E + O * f + U * h + k * u + N * l + v * c;
    E = q >>> 13, q &= 8191, q += A * a + y * (5 * m) + w * (5 * g) + x * (5 * p) + D * (5 * d), E += q >>> 13, q &= 8191;
    let V = E + O * d + U * f + k * h + N * u + v * l;
    E = V >>> 13, V &= 8191, V += A * c + y * a + w * (5 * m) + x * (5 * g) + D * (5 * p), E += V >>> 13, V &= 8191;
    let W = E + O * p + U * d + k * f + N * h + v * u;
    E = W >>> 13, W &= 8191, W += A * l + y * c + w * a + x * (5 * m) + D * (5 * g), E += W >>> 13, W &= 8191;
    let Z = E + O * g + U * p + k * d + N * f + v * h;
    E = Z >>> 13, Z &= 8191, Z += A * u + y * l + w * c + x * a + D * (5 * m), E += Z >>> 13, Z &= 8191;
    let K = E + O * m + U * g + k * p + N * d + v * f;
    E = K >>> 13, K &= 8191, K += A * h + y * u + w * l + x * c + D * a, E += K >>> 13, K &= 8191, E = (E << 2) + E | 0, E = E + I | 0, I = E & 8191, E = E >>> 13, T += E, i[0] = I, i[1] = T, i[2] = L, i[3] = j, i[4] = z, i[5] = q, i[6] = V, i[7] = W, i[8] = Z, i[9] = K;
  }
  finalize() {
    const { h: e, pad: r } = this, n = new Uint16Array(10);
    let s = e[1] >>> 13;
    e[1] &= 8191;
    for (let a = 2; a < 10; a++)
      e[a] += s, s = e[a] >>> 13, e[a] &= 8191;
    e[0] += s * 5, s = e[0] >>> 13, e[0] &= 8191, e[1] += s, s = e[1] >>> 13, e[1] &= 8191, e[2] += s, n[0] = e[0] + 5, s = n[0] >>> 13, n[0] &= 8191;
    for (let a = 1; a < 10; a++)
      n[a] = e[a] + s, s = n[a] >>> 13, n[a] &= 8191;
    n[9] -= 8192;
    let i = (s ^ 1) - 1;
    for (let a = 0; a < 10; a++)
      n[a] &= i;
    i = ~i;
    for (let a = 0; a < 10; a++)
      e[a] = e[a] & i | n[a];
    e[0] = (e[0] | e[1] << 13) & 65535, e[1] = (e[1] >>> 3 | e[2] << 10) & 65535, e[2] = (e[2] >>> 6 | e[3] << 7) & 65535, e[3] = (e[3] >>> 9 | e[4] << 4) & 65535, e[4] = (e[4] >>> 12 | e[5] << 1 | e[6] << 14) & 65535, e[5] = (e[6] >>> 2 | e[7] << 11) & 65535, e[6] = (e[7] >>> 5 | e[8] << 8) & 65535, e[7] = (e[8] >>> 8 | e[9] << 5) & 65535;
    let o = e[0] + r[0];
    e[0] = o & 65535;
    for (let a = 1; a < 8; a++)
      o = (e[a] + r[a] | 0) + (o >>> 16) | 0, e[a] = o & 65535;
    fn(n);
  }
  update(e) {
    yl(this), e = Uo(e), ze(e);
    const { buffer: r, blockLen: n } = this, s = e.length;
    for (let i = 0; i < s; ) {
      const o = Math.min(n - this.pos, s - i);
      if (o === n) {
        for (; n <= s - i; i += n)
          this.process(e, i);
        continue;
      }
      r.set(e.subarray(i, i + o), this.pos), this.pos += o, i += o, this.pos === n && (this.process(r, 0, !1), this.pos = 0);
    }
    return this;
  }
  destroy() {
    fn(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(e) {
    yl(this), XE(e, this), this.finished = !0;
    const { buffer: r, h: n } = this;
    let { pos: s } = this;
    if (s) {
      for (r[s++] = 1; s < 16; s++)
        r[s] = 0;
      this.process(r, 0, !0);
    }
    this.finalize();
    let i = 0;
    for (let o = 0; o < 8; o++)
      e[i++] = n[o] >>> 0, e[i++] = n[o] >>> 8;
    return e;
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
}
function hv(t) {
  const e = (n, s) => t(s).update(Uo(n)).digest(), r = t(new Uint8Array(32));
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = (n) => t(n), e;
}
const fv = hv((t) => new uv(t));
function dv(t, e, r, n, s, i = 20) {
  let o = t[0], a = t[1], c = t[2], l = t[3], u = e[0], h = e[1], f = e[2], d = e[3], p = e[4], g = e[5], m = e[6], _ = e[7], R = s, b = r[0], S = r[1], $ = r[2], B = o, C = a, P = c, O = l, U = u, k = h, N = f, v = d, A = p, y = g, w = m, x = _, D = R, E = b, I = S, T = $;
  for (let j = 0; j < i; j += 2)
    B = B + U | 0, D = Q(D ^ B, 16), A = A + D | 0, U = Q(U ^ A, 12), B = B + U | 0, D = Q(D ^ B, 8), A = A + D | 0, U = Q(U ^ A, 7), C = C + k | 0, E = Q(E ^ C, 16), y = y + E | 0, k = Q(k ^ y, 12), C = C + k | 0, E = Q(E ^ C, 8), y = y + E | 0, k = Q(k ^ y, 7), P = P + N | 0, I = Q(I ^ P, 16), w = w + I | 0, N = Q(N ^ w, 12), P = P + N | 0, I = Q(I ^ P, 8), w = w + I | 0, N = Q(N ^ w, 7), O = O + v | 0, T = Q(T ^ O, 16), x = x + T | 0, v = Q(v ^ x, 12), O = O + v | 0, T = Q(T ^ O, 8), x = x + T | 0, v = Q(v ^ x, 7), B = B + k | 0, T = Q(T ^ B, 16), w = w + T | 0, k = Q(k ^ w, 12), B = B + k | 0, T = Q(T ^ B, 8), w = w + T | 0, k = Q(k ^ w, 7), C = C + N | 0, D = Q(D ^ C, 16), x = x + D | 0, N = Q(N ^ x, 12), C = C + N | 0, D = Q(D ^ C, 8), x = x + D | 0, N = Q(N ^ x, 7), P = P + v | 0, E = Q(E ^ P, 16), A = A + E | 0, v = Q(v ^ A, 12), P = P + v | 0, E = Q(E ^ P, 8), A = A + E | 0, v = Q(v ^ A, 7), O = O + U | 0, I = Q(I ^ O, 16), y = y + I | 0, U = Q(U ^ y, 12), O = O + U | 0, I = Q(I ^ O, 8), y = y + I | 0, U = Q(U ^ y, 7);
  let L = 0;
  n[L++] = o + B | 0, n[L++] = a + C | 0, n[L++] = c + P | 0, n[L++] = l + O | 0, n[L++] = u + U | 0, n[L++] = h + k | 0, n[L++] = f + N | 0, n[L++] = d + v | 0, n[L++] = p + A | 0, n[L++] = g + y | 0, n[L++] = m + w | 0, n[L++] = _ + x | 0, n[L++] = R + D | 0, n[L++] = b + E | 0, n[L++] = S + I | 0, n[L++] = $ + T | 0;
}
const pv = /* @__PURE__ */ lv(dv, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), gv = /* @__PURE__ */ new Uint8Array(16), vl = (t, e) => {
  t.update(e);
  const r = e.length % 16;
  r && t.update(gv.subarray(r));
}, yv = /* @__PURE__ */ new Uint8Array(32);
function xl(t, e, r, n, s) {
  const i = t(e, r, yv), o = fv.create(i);
  s && vl(o, s), vl(o, n);
  const a = s2(n.length, s ? s.length : 0, !0);
  o.update(a);
  const c = o.digest();
  return fn(i, a), c;
}
const wv = (t) => (e, r, n) => ({
  encrypt(i, o) {
    const a = i.length;
    o = wl(a + 16, o, !1), o.set(i);
    const c = o.subarray(0, -16);
    t(e, r, c, c, 1);
    const l = xl(t, e, r, c, n);
    return o.set(l, a), fn(l), o;
  },
  decrypt(i, o) {
    o = wl(i.length - 16, o, !1);
    const a = i.subarray(0, -16), c = i.subarray(-16), l = xl(t, e, r, a, n);
    if (!r2(c, l))
      throw new Error("invalid tag");
    return o.set(i.subarray(0, -16)), t(e, r, o, o, 1), fn(l), o;
  }
}), mf = /* @__PURE__ */ n2({ blockSize: 64, nonceLength: 12, tagLength: 16 }, wv(pv));
class bf extends pi {
  constructor(e, r) {
    super(), this.finished = !1, this.destroyed = !1, di(e);
    const n = ht(r);
    if (this.iHash = e.create(), typeof this.iHash.update != "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const s = this.blockLen, i = new Uint8Array(s);
    i.set(n.length > s ? e.create().update(n).digest() : n);
    for (let o = 0; o < i.length; o++)
      i[o] ^= 54;
    this.iHash.update(i), this.oHash = e.create();
    for (let o = 0; o < i.length; o++)
      i[o] ^= 106;
    this.oHash.update(i), st(i);
  }
  update(e) {
    return pr(this), this.iHash.update(e), this;
  }
  digestInto(e) {
    pr(this), ft(e, this.outputLen), this.finished = !0, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
  }
  digest() {
    const e = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(e), e;
  }
  _cloneInto(e) {
    e || (e = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash: r, iHash: n, finished: s, destroyed: i, blockLen: o, outputLen: a } = this;
    return e = e, e.finished = s, e.destroyed = i, e.blockLen = o, e.outputLen = a, e.oHash = r._cloneInto(e.oHash), e.iHash = n._cloneInto(e.iHash), e;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
}
const bi = (t, e, r) => new bf(t, e).update(r).digest();
bi.create = (t, e) => new bf(t, e);
function mv(t, e, r) {
  return di(t), r === void 0 && (r = new Uint8Array(t.outputLen)), bi(t, ht(r), ht(e));
}
const so = /* @__PURE__ */ Uint8Array.from([0]), _l = /* @__PURE__ */ Uint8Array.of();
function bv(t, e, r, n = 32) {
  di(t), qt(n);
  const s = t.outputLen;
  if (n > 255 * s)
    throw new Error("Length should be <= 255*HashLen");
  const i = Math.ceil(n / s);
  r === void 0 && (r = _l);
  const o = new Uint8Array(i * s), a = bi.create(t, e), c = a._cloneInto(), l = new Uint8Array(a.outputLen);
  for (let u = 0; u < i; u++)
    so[0] = u + 1, c.update(u === 0 ? _l : l).update(r).update(so).digestInto(l), o.set(l, s * u), a._cloneInto(c);
  return a.destroy(), c.destroy(), st(l, so), o.slice(0, n);
}
const Ev = (t, e, r, n, s) => bv(t, mv(t, e, r), n, s), Ei = mi;
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Aa = /* @__PURE__ */ BigInt(0), qo = /* @__PURE__ */ BigInt(1);
function Ys(t, e = "") {
  if (typeof t != "boolean") {
    const r = e && `"${e}"`;
    throw new Error(r + "expected boolean, got type=" + typeof t);
  }
  return t;
}
function Ar(t, e, r = "") {
  const n = fi(t), s = t == null ? void 0 : t.length, i = e !== void 0;
  if (!n || i && s !== e) {
    const o = r && `"${r}" `, a = i ? ` of length ${e}` : "", c = n ? `length=${s}` : `type=${typeof t}`;
    throw new Error(o + "expected Uint8Array" + a + ", got " + c);
  }
  return t;
}
function xs(t) {
  const e = t.toString(16);
  return e.length & 1 ? "0" + e : e;
}
function Ef(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  return t === "" ? Aa : BigInt("0x" + t);
}
function vi(t) {
  return Ef(nn(t));
}
function Zs(t) {
  return ft(t), Ef(nn(Uint8Array.from(t).reverse()));
}
function Oa(t, e) {
  return Fs(t.toString(16).padStart(e * 2, "0"));
}
function $a(t, e) {
  return Oa(t, e).reverse();
}
function Re(t, e, r) {
  let n;
  if (typeof e == "string")
    try {
      n = Fs(e);
    } catch (i) {
      throw new Error(t + " must be hex string or Uint8Array, cause: " + i);
    }
  else if (fi(e))
    n = Uint8Array.from(e);
  else
    throw new Error(t + " must be hex string or Uint8Array");
  const s = n.length;
  if (typeof r == "number" && s !== r)
    throw new Error(t + " of length " + r + " expected, got " + s);
  return n;
}
const io = (t) => typeof t == "bigint" && Aa <= t;
function vv(t, e, r) {
  return io(t) && io(e) && io(r) && e <= t && t < r;
}
function zo(t, e, r, n) {
  if (!vv(e, r, n))
    throw new Error("expected valid " + t + ": " + r + " <= n < " + n + ", got " + e);
}
function vf(t) {
  let e;
  for (e = 0; t > Aa; t >>= qo, e += 1)
    ;
  return e;
}
const os = (t) => (qo << BigInt(t)) - qo;
function xv(t, e, r) {
  if (typeof t != "number" || t < 2)
    throw new Error("hashLen must be a number");
  if (typeof e != "number" || e < 2)
    throw new Error("qByteLen must be a number");
  if (typeof r != "function")
    throw new Error("hmacFn must be a function");
  const n = (d) => new Uint8Array(d), s = (d) => Uint8Array.of(d);
  let i = n(t), o = n(t), a = 0;
  const c = () => {
    i.fill(1), o.fill(0), a = 0;
  }, l = (...d) => r(o, i, ...d), u = (d = n(0)) => {
    o = l(s(0), d), i = l(), d.length !== 0 && (o = l(s(1), d), i = l());
  }, h = () => {
    if (a++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let d = 0;
    const p = [];
    for (; d < e; ) {
      i = l();
      const g = i.slice();
      p.push(g), d += i.length;
    }
    return cr(...p);
  };
  return (d, p) => {
    c(), u(d);
    let g;
    for (; !(g = p(h())); )
      u();
    return c(), g;
  };
}
function xi(t, e, r = {}) {
  if (!t || typeof t != "object")
    throw new Error("expected valid options object");
  function n(s, i, o) {
    const a = t[s];
    if (o && a === void 0)
      return;
    const c = typeof a;
    if (c !== i || a === null)
      throw new Error(`param "${s}" is invalid: expected ${i}, got ${c}`);
  }
  Object.entries(e).forEach(([s, i]) => n(s, i, !1)), Object.entries(r).forEach(([s, i]) => n(s, i, !0));
}
function Sl(t) {
  const e = /* @__PURE__ */ new WeakMap();
  return (r, ...n) => {
    const s = e.get(r);
    if (s !== void 0)
      return s;
    const i = t(r, ...n);
    return e.set(r, i), i;
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const He = BigInt(0), Ue = BigInt(1), Or = /* @__PURE__ */ BigInt(2), xf = /* @__PURE__ */ BigInt(3), _f = /* @__PURE__ */ BigInt(4), Sf = /* @__PURE__ */ BigInt(5), _v = /* @__PURE__ */ BigInt(7), If = /* @__PURE__ */ BigInt(8), Sv = /* @__PURE__ */ BigInt(9), Df = /* @__PURE__ */ BigInt(16);
function Ge(t, e) {
  const r = t % e;
  return r >= He ? r : e + r;
}
function ct(t, e, r) {
  let n = t;
  for (; e-- > He; )
    n *= n, n %= r;
  return n;
}
function Il(t, e) {
  if (t === He)
    throw new Error("invert: expected non-zero number");
  if (e <= He)
    throw new Error("invert: expected positive modulus, got " + e);
  let r = Ge(t, e), n = e, s = He, i = Ue;
  for (; r !== He; ) {
    const a = n / r, c = n % r, l = s - i * a;
    n = r, r = c, s = i, i = l;
  }
  if (n !== Ue)
    throw new Error("invert: does not exist");
  return Ge(s, e);
}
function Ta(t, e, r) {
  if (!t.eql(t.sqr(e), r))
    throw new Error("Cannot find square root");
}
function Af(t, e) {
  const r = (t.ORDER + Ue) / _f, n = t.pow(e, r);
  return Ta(t, n, e), n;
}
function Iv(t, e) {
  const r = (t.ORDER - Sf) / If, n = t.mul(e, Or), s = t.pow(n, r), i = t.mul(e, s), o = t.mul(t.mul(i, Or), s), a = t.mul(i, t.sub(o, t.ONE));
  return Ta(t, a, e), a;
}
function Dv(t) {
  const e = yr(t), r = Of(t), n = r(e, e.neg(e.ONE)), s = r(e, n), i = r(e, e.neg(n)), o = (t + _v) / Df;
  return (a, c) => {
    let l = a.pow(c, o), u = a.mul(l, n);
    const h = a.mul(l, s), f = a.mul(l, i), d = a.eql(a.sqr(u), c), p = a.eql(a.sqr(h), c);
    l = a.cmov(l, u, d), u = a.cmov(f, h, p);
    const g = a.eql(a.sqr(u), c), m = a.cmov(l, u, g);
    return Ta(a, m, c), m;
  };
}
function Of(t) {
  if (t < xf)
    throw new Error("sqrt is not defined for small field");
  let e = t - Ue, r = 0;
  for (; e % Or === He; )
    e /= Or, r++;
  let n = Or;
  const s = yr(t);
  for (; Dl(s, n) === 1; )
    if (n++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (r === 1)
    return Af;
  let i = s.pow(n, e);
  const o = (e + Ue) / Or;
  return function(c, l) {
    if (c.is0(l))
      return l;
    if (Dl(c, l) !== 1)
      throw new Error("Cannot find square root");
    let u = r, h = c.mul(c.ONE, i), f = c.pow(l, e), d = c.pow(l, o);
    for (; !c.eql(f, c.ONE); ) {
      if (c.is0(f))
        return c.ZERO;
      let p = 1, g = c.sqr(f);
      for (; !c.eql(g, c.ONE); )
        if (p++, g = c.sqr(g), p === u)
          throw new Error("Cannot find square root");
      const m = Ue << BigInt(u - p - 1), _ = c.pow(h, m);
      u = p, h = c.sqr(_), f = c.mul(f, h), d = c.mul(d, _);
    }
    return d;
  };
}
function Av(t) {
  return t % _f === xf ? Af : t % If === Sf ? Iv : t % Df === Sv ? Dv(t) : Of(t);
}
const Ov = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function $v(t) {
  const e = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  }, r = Ov.reduce((n, s) => (n[s] = "function", n), e);
  return xi(t, r), t;
}
function Tv(t, e, r) {
  if (r < He)
    throw new Error("invalid exponent, negatives unsupported");
  if (r === He)
    return t.ONE;
  if (r === Ue)
    return e;
  let n = t.ONE, s = e;
  for (; r > He; )
    r & Ue && (n = t.mul(n, s)), s = t.sqr(s), r >>= Ue;
  return n;
}
function $f(t, e, r = !1) {
  const n = new Array(e.length).fill(r ? t.ZERO : void 0), s = e.reduce((o, a, c) => t.is0(a) ? o : (n[c] = o, t.mul(o, a)), t.ONE), i = t.inv(s);
  return e.reduceRight((o, a, c) => t.is0(a) ? o : (n[c] = t.mul(o, n[c]), t.mul(o, a)), i), n;
}
function Dl(t, e) {
  const r = (t.ORDER - Ue) / Or, n = t.pow(e, r), s = t.eql(n, t.ONE), i = t.eql(n, t.ZERO), o = t.eql(n, t.neg(t.ONE));
  if (!s && !i && !o)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : i ? 0 : -1;
}
function Tf(t, e) {
  e !== void 0 && qt(e);
  const r = e !== void 0 ? e : t.toString(2).length, n = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: n };
}
function yr(t, e, r = !1, n = {}) {
  if (t <= He)
    throw new Error("invalid field: expected ORDER > 0, got " + t);
  let s, i, o = !1, a;
  if (typeof e == "object" && e != null) {
    if (n.sqrt || r)
      throw new Error("cannot specify opts in two arguments");
    const f = e;
    f.BITS && (s = f.BITS), f.sqrt && (i = f.sqrt), typeof f.isLE == "boolean" && (r = f.isLE), typeof f.modFromBytes == "boolean" && (o = f.modFromBytes), a = f.allowedLengths;
  } else
    typeof e == "number" && (s = e), n.sqrt && (i = n.sqrt);
  const { nBitLength: c, nByteLength: l } = Tf(t, s);
  if (l > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let u;
  const h = Object.freeze({
    ORDER: t,
    isLE: r,
    BITS: c,
    BYTES: l,
    MASK: os(c),
    ZERO: He,
    ONE: Ue,
    allowedLengths: a,
    create: (f) => Ge(f, t),
    isValid: (f) => {
      if (typeof f != "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof f);
      return He <= f && f < t;
    },
    is0: (f) => f === He,
    // is valid and invertible
    isValidNot0: (f) => !h.is0(f) && h.isValid(f),
    isOdd: (f) => (f & Ue) === Ue,
    neg: (f) => Ge(-f, t),
    eql: (f, d) => f === d,
    sqr: (f) => Ge(f * f, t),
    add: (f, d) => Ge(f + d, t),
    sub: (f, d) => Ge(f - d, t),
    mul: (f, d) => Ge(f * d, t),
    pow: (f, d) => Tv(h, f, d),
    div: (f, d) => Ge(f * Il(d, t), t),
    // Same as above, but doesn't normalize
    sqrN: (f) => f * f,
    addN: (f, d) => f + d,
    subN: (f, d) => f - d,
    mulN: (f, d) => f * d,
    inv: (f) => Il(f, t),
    sqrt: i || ((f) => (u || (u = Av(t)), u(h, f))),
    toBytes: (f) => r ? $a(f, l) : Oa(f, l),
    fromBytes: (f, d = !0) => {
      if (a) {
        if (!a.includes(f.length) || f.length > l)
          throw new Error("Field.fromBytes: expected " + a + " bytes, got " + f.length);
        const g = new Uint8Array(l);
        g.set(f, r ? 0 : g.length - f.length), f = g;
      }
      if (f.length !== l)
        throw new Error("Field.fromBytes: expected " + l + " bytes, got " + f.length);
      let p = r ? Zs(f) : vi(f);
      if (o && (p = Ge(p, t)), !d && !h.isValid(p))
        throw new Error("invalid field element: outside of range 0..ORDER");
      return p;
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (f) => $f(h, f),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (f, d, p) => p ? d : f
  });
  return Object.freeze(h);
}
function Bf(t) {
  if (typeof t != "bigint")
    throw new Error("field order must be bigint");
  const e = t.toString(2).length;
  return Math.ceil(e / 8);
}
function Rf(t) {
  const e = Bf(t);
  return e + Math.ceil(e / 2);
}
function Bv(t, e, r = !1) {
  const n = t.length, s = Bf(e), i = Rf(e);
  if (n < 16 || n < i || n > 1024)
    throw new Error("expected " + i + "-1024 bytes of input, got " + n);
  const o = r ? Zs(t) : vi(t), a = Ge(o, e - Ue) + Ue;
  return r ? $a(a, s) : Oa(a, s);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const dn = BigInt(0), $r = BigInt(1);
function Xs(t, e) {
  const r = e.negate();
  return t ? r : e;
}
function oo(t, e) {
  const r = $f(t.Fp, e.map((n) => n.Z));
  return e.map((n, s) => t.fromAffine(n.toAffine(r[s])));
}
function Pf(t, e) {
  if (!Number.isSafeInteger(t) || t <= 0 || t > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + t);
}
function ao(t, e) {
  Pf(t, e);
  const r = Math.ceil(e / t) + 1, n = 2 ** (t - 1), s = 2 ** t, i = os(t), o = BigInt(t);
  return { windows: r, windowSize: n, mask: i, maxNumber: s, shiftBy: o };
}
function Al(t, e, r) {
  const { windowSize: n, mask: s, maxNumber: i, shiftBy: o } = r;
  let a = Number(t & s), c = t >> o;
  a > n && (a -= i, c += $r);
  const l = e * n, u = l + Math.abs(a) - 1, h = a === 0, f = a < 0, d = e % 2 !== 0;
  return { nextN: c, offset: u, isZero: h, isNeg: f, isNegF: d, offsetF: l };
}
function Rv(t, e) {
  if (!Array.isArray(t))
    throw new Error("array expected");
  t.forEach((r, n) => {
    if (!(r instanceof e))
      throw new Error("invalid point at index " + n);
  });
}
function Pv(t, e) {
  if (!Array.isArray(t))
    throw new Error("array of scalars expected");
  t.forEach((r, n) => {
    if (!e.isValid(r))
      throw new Error("invalid scalar at index " + n);
  });
}
const co = /* @__PURE__ */ new WeakMap(), Cf = /* @__PURE__ */ new WeakMap();
function lo(t) {
  return Cf.get(t) || 1;
}
function Ol(t) {
  if (t !== dn)
    throw new Error("invalid wNAF");
}
class Cv {
  // Parametrized with a given Point class (not individual point)
  constructor(e, r) {
    this.BASE = e.BASE, this.ZERO = e.ZERO, this.Fn = e.Fn, this.bits = r;
  }
  // non-const time multiplication ladder
  _unsafeLadder(e, r, n = this.ZERO) {
    let s = e;
    for (; r > dn; )
      r & $r && (n = n.add(s)), s = s.double(), r >>= $r;
    return n;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(e, r) {
    const { windows: n, windowSize: s } = ao(r, this.bits), i = [];
    let o = e, a = o;
    for (let c = 0; c < n; c++) {
      a = o, i.push(a);
      for (let l = 1; l < s; l++)
        a = a.add(o), i.push(a);
      o = a.double();
    }
    return i;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(e, r, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let s = this.ZERO, i = this.BASE;
    const o = ao(e, this.bits);
    for (let a = 0; a < o.windows; a++) {
      const { nextN: c, offset: l, isZero: u, isNeg: h, isNegF: f, offsetF: d } = Al(n, a, o);
      n = c, u ? i = i.add(Xs(f, r[d])) : s = s.add(Xs(h, r[l]));
    }
    return Ol(n), { p: s, f: i };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(e, r, n, s = this.ZERO) {
    const i = ao(e, this.bits);
    for (let o = 0; o < i.windows && n !== dn; o++) {
      const { nextN: a, offset: c, isZero: l, isNeg: u } = Al(n, o, i);
      if (n = a, !l) {
        const h = r[c];
        s = s.add(u ? h.negate() : h);
      }
    }
    return Ol(n), s;
  }
  getPrecomputes(e, r, n) {
    let s = co.get(r);
    return s || (s = this.precomputeWindow(r, e), e !== 1 && (typeof n == "function" && (s = n(s)), co.set(r, s))), s;
  }
  cached(e, r, n) {
    const s = lo(e);
    return this.wNAF(s, this.getPrecomputes(s, e, n), r);
  }
  unsafe(e, r, n, s) {
    const i = lo(e);
    return i === 1 ? this._unsafeLadder(e, r, s) : this.wNAFUnsafe(i, this.getPrecomputes(i, e, n), r, s);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(e, r) {
    Pf(r, this.bits), Cf.set(e, r), co.delete(e);
  }
  hasCache(e) {
    return lo(e) !== 1;
  }
}
function Nv(t, e, r, n) {
  let s = e, i = t.ZERO, o = t.ZERO;
  for (; r > dn || n > dn; )
    r & $r && (i = i.add(s)), n & $r && (o = o.add(s)), s = s.double(), r >>= $r, n >>= $r;
  return { p1: i, p2: o };
}
function Uv(t, e, r, n) {
  Rv(r, t), Pv(n, e);
  const s = r.length, i = n.length;
  if (s !== i)
    throw new Error("arrays of points and scalars must have equal length");
  const o = t.ZERO, a = vf(BigInt(s));
  let c = 1;
  a > 12 ? c = a - 3 : a > 4 ? c = a - 2 : a > 0 && (c = 2);
  const l = os(c), u = new Array(Number(l) + 1).fill(o), h = Math.floor((e.BITS - 1) / c) * c;
  let f = o;
  for (let d = h; d >= 0; d -= c) {
    u.fill(o);
    for (let g = 0; g < i; g++) {
      const m = n[g], _ = Number(m >> BigInt(d) & l);
      u[_] = u[_].add(r[g]);
    }
    let p = o;
    for (let g = u.length - 1, m = o; g > 0; g--)
      m = m.add(u[g]), p = p.add(m);
    if (f = f.add(p), d !== 0)
      for (let g = 0; g < c; g++)
        f = f.double();
  }
  return f;
}
function $l(t, e, r) {
  if (e) {
    if (e.ORDER !== t)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return $v(e), e;
  } else
    return yr(t, { isLE: r });
}
function Lv(t, e, r = {}, n) {
  if (n === void 0 && (n = t === "edwards"), !e || typeof e != "object")
    throw new Error(`expected valid ${t} CURVE object`);
  for (const c of ["p", "n", "h"]) {
    const l = e[c];
    if (!(typeof l == "bigint" && l > dn))
      throw new Error(`CURVE.${c} must be positive bigint`);
  }
  const s = $l(e.p, r.Fp, n), i = $l(e.n, r.Fn, n), a = ["Gx", "Gy", "a", "b"];
  for (const c of a)
    if (!s.isValid(e[c]))
      throw new Error(`CURVE.${c} must be valid field element of CURVE.Fp`);
  return e = Object.freeze(Object.assign({}, e)), { CURVE: e, Fp: s, Fn: i };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
BigInt(0);
BigInt(1);
BigInt(2);
BigInt(8);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Dn = BigInt(0), Xr = BigInt(1), _s = BigInt(2);
function kv(t) {
  return xi(t, {
    adjustScalarBytes: "function",
    powPminus2: "function"
  }), Object.freeze({ ...t });
}
function Mv(t) {
  const e = kv(t), { P: r, type: n, adjustScalarBytes: s, powPminus2: i, randomBytes: o } = e, a = n === "x25519";
  if (!a && n !== "x448")
    throw new Error("invalid type");
  const c = o || Hr, l = a ? 255 : 448, u = a ? 32 : 56, h = BigInt(a ? 9 : 5), f = BigInt(a ? 121665 : 39081), d = a ? _s ** BigInt(254) : _s ** BigInt(447), p = a ? BigInt(8) * _s ** BigInt(251) - Xr : BigInt(4) * _s ** BigInt(445) - Xr, g = d + p + Xr, m = (v) => Ge(v, r), _ = R(h);
  function R(v) {
    return $a(m(v), u);
  }
  function b(v) {
    const A = Re("u coordinate", v, u);
    return a && (A[31] &= 127), m(Zs(A));
  }
  function S(v) {
    return Zs(s(Re("scalar", v, u)));
  }
  function $(v, A) {
    const y = P(b(A), S(v));
    if (y === Dn)
      throw new Error("invalid private or public key received");
    return R(y);
  }
  function B(v) {
    return $(v, _);
  }
  function C(v, A, y) {
    const w = m(v * (A - y));
    return A = m(A - w), y = m(y + w), { x_2: A, x_3: y };
  }
  function P(v, A) {
    zo("u", v, Dn, r), zo("scalar", A, d, g);
    const y = A, w = v;
    let x = Xr, D = Dn, E = v, I = Xr, T = Dn;
    for (let j = BigInt(l - 1); j >= Dn; j--) {
      const z = y >> j & Xr;
      T ^= z, { x_2: x, x_3: E } = C(T, x, E), { x_2: D, x_3: I } = C(T, D, I), T = z;
      const q = x + D, V = m(q * q), W = x - D, Z = m(W * W), K = V - Z, J = E + I, ae = E - I, he = m(ae * q), ye = m(J * W), Ce = he + ye, Xe = he - ye;
      E = m(Ce * Ce), I = m(w * m(Xe * Xe)), x = m(V * Z), D = m(K * (V + m(f * K)));
    }
    ({ x_2: x, x_3: E } = C(T, x, E)), { x_2: D, x_3: I } = C(T, D, I);
    const L = i(D);
    return m(x * L);
  }
  const O = {
    secretKey: u,
    publicKey: u,
    seed: u
  }, U = (v = c(u)) => (ft(v, O.seed), v);
  function k(v) {
    const A = U(v);
    return { secretKey: A, publicKey: B(A) };
  }
  return {
    keygen: k,
    getSharedSecret: (v, A) => $(v, A),
    getPublicKey: (v) => B(v),
    scalarMult: $,
    scalarMultBase: B,
    utils: {
      randomSecretKey: U,
      randomPrivateKey: U
    },
    GuBytes: _.slice(),
    lengths: O
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Fv = BigInt(1), Tl = BigInt(2), qv = BigInt(3), zv = BigInt(5), jv = BigInt(8), Nf = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Hv = {
  p: Nf,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: jv,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Kv(t) {
  const e = BigInt(10), r = BigInt(20), n = BigInt(40), s = BigInt(80), i = Nf, a = t * t % i * t % i, c = ct(a, Tl, i) * a % i, l = ct(c, Fv, i) * t % i, u = ct(l, zv, i) * l % i, h = ct(u, e, i) * u % i, f = ct(h, r, i) * h % i, d = ct(f, n, i) * f % i, p = ct(d, s, i) * d % i, g = ct(p, s, i) * d % i, m = ct(g, e, i) * u % i;
  return { pow_p_5_8: ct(m, Tl, i) * t % i, b2: a };
}
function Vv(t) {
  return t[0] &= 248, t[31] &= 127, t[31] |= 64, t;
}
const Wv = yr(Hv.p, { isLE: !0 }), jo = /* @__PURE__ */ (() => {
  const t = Wv.ORDER;
  return Mv({
    P: t,
    type: "x25519",
    powPminus2: (e) => {
      const { pow_p_5_8: r, b2: n } = Kv(e);
      return Ge(ct(r, qv, t) * n, t);
    },
    adjustScalarBytes: Vv
  });
})();
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Bl = (t, e) => (t + (t >= 0 ? e : -e) / Uf) / e;
function Gv(t, e, r) {
  const [[n, s], [i, o]] = e, a = Bl(o * t, r), c = Bl(-s * t, r);
  let l = t - a * n - c * i, u = -a * s - c * o;
  const h = l < kt, f = u < kt;
  h && (l = -l), f && (u = -u);
  const d = os(Math.ceil(vf(r) / 2)) + on;
  if (l < kt || l >= d || u < kt || u >= d)
    throw new Error("splitScalar (endomorphism): failed, k=" + t);
  return { k1neg: h, k1: l, k2neg: f, k2: u };
}
function Ho(t) {
  if (!["compact", "recovered", "der"].includes(t))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return t;
}
function uo(t, e) {
  const r = {};
  for (let n of Object.keys(e))
    r[n] = t[n] === void 0 ? e[n] : t[n];
  return Ys(r.lowS, "lowS"), Ys(r.prehash, "prehash"), r.format !== void 0 && Ho(r.format), r;
}
class Yv extends Error {
  constructor(e = "") {
    super(e);
  }
}
const Nt = {
  // asn.1 DER encoding utils
  Err: Yv,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (t, e) => {
      const { Err: r } = Nt;
      if (t < 0 || t > 256)
        throw new r("tlv.encode: wrong tag");
      if (e.length & 1)
        throw new r("tlv.encode: unpadded data");
      const n = e.length / 2, s = xs(n);
      if (s.length / 2 & 128)
        throw new r("tlv.encode: long form length too big");
      const i = n > 127 ? xs(s.length / 2 | 128) : "";
      return xs(t) + i + s + e;
    },
    // v - value, l - left bytes (unparsed)
    decode(t, e) {
      const { Err: r } = Nt;
      let n = 0;
      if (t < 0 || t > 256)
        throw new r("tlv.encode: wrong tag");
      if (e.length < 2 || e[n++] !== t)
        throw new r("tlv.decode: wrong tlv");
      const s = e[n++], i = !!(s & 128);
      let o = 0;
      if (!i)
        o = s;
      else {
        const c = s & 127;
        if (!c)
          throw new r("tlv.decode(long): indefinite length not supported");
        if (c > 4)
          throw new r("tlv.decode(long): byte length is too big");
        const l = e.subarray(n, n + c);
        if (l.length !== c)
          throw new r("tlv.decode: length bytes not complete");
        if (l[0] === 0)
          throw new r("tlv.decode(long): zero leftmost byte");
        for (const u of l)
          o = o << 8 | u;
        if (n += c, o < 128)
          throw new r("tlv.decode(long): not minimal encoding");
      }
      const a = e.subarray(n, n + o);
      if (a.length !== o)
        throw new r("tlv.decode: wrong value length");
      return { v: a, l: e.subarray(n + o) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(t) {
      const { Err: e } = Nt;
      if (t < kt)
        throw new e("integer: negative integers are not allowed");
      let r = xs(t);
      if (Number.parseInt(r[0], 16) & 8 && (r = "00" + r), r.length & 1)
        throw new e("unexpected DER parsing assertion: unpadded hex");
      return r;
    },
    decode(t) {
      const { Err: e } = Nt;
      if (t[0] & 128)
        throw new e("invalid signature integer: negative");
      if (t[0] === 0 && !(t[1] & 128))
        throw new e("invalid signature integer: unnecessary leading zero");
      return vi(t);
    }
  },
  toSig(t) {
    const { Err: e, _int: r, _tlv: n } = Nt, s = Re("signature", t), { v: i, l: o } = n.decode(48, s);
    if (o.length)
      throw new e("invalid signature: left bytes after parsing");
    const { v: a, l: c } = n.decode(2, i), { v: l, l: u } = n.decode(2, c);
    if (u.length)
      throw new e("invalid signature: left bytes after parsing");
    return { r: r.decode(a), s: r.decode(l) };
  },
  hexFromSig(t) {
    const { _tlv: e, _int: r } = Nt, n = e.encode(2, r.encode(t.r)), s = e.encode(2, r.encode(t.s)), i = n + s;
    return e.encode(48, i);
  }
}, kt = BigInt(0), on = BigInt(1), Uf = BigInt(2), Ss = BigInt(3), Zv = BigInt(4);
function Qr(t, e) {
  const { BYTES: r } = t;
  let n;
  if (typeof e == "bigint")
    n = e;
  else {
    let s = Re("private key", e);
    try {
      n = t.fromBytes(s);
    } catch {
      throw new Error(`invalid private key: expected ui8a of size ${r}, got ${typeof e}`);
    }
  }
  if (!t.isValidNot0(n))
    throw new Error("invalid private key: out of range [1..N-1]");
  return n;
}
function Xv(t, e = {}) {
  const r = Lv("weierstrass", t, e), { Fp: n, Fn: s } = r;
  let i = r.CURVE;
  const { h: o, n: a } = i;
  xi(e, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    wrapPrivateKey: "boolean"
  });
  const { endo: c } = e;
  if (c && (!n.is0(i.a) || typeof c.beta != "bigint" || !Array.isArray(c.basises)))
    throw new Error('invalid endo: expected "beta": bigint and "basises": array');
  const l = kf(n, s);
  function u() {
    if (!n.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function h(N, v, A) {
    const { x: y, y: w } = v.toAffine(), x = n.toBytes(y);
    if (Ys(A, "isCompressed"), A) {
      u();
      const D = !n.isOdd(w);
      return cr(Lf(D), x);
    } else
      return cr(Uint8Array.of(4), x, n.toBytes(w));
  }
  function f(N) {
    Ar(N, void 0, "Point");
    const { publicKey: v, publicKeyUncompressed: A } = l, y = N.length, w = N[0], x = N.subarray(1);
    if (y === v && (w === 2 || w === 3)) {
      const D = n.fromBytes(x);
      if (!n.isValid(D))
        throw new Error("bad point: is not on curve, wrong x");
      const E = g(D);
      let I;
      try {
        I = n.sqrt(E);
      } catch (j) {
        const z = j instanceof Error ? ": " + j.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + z);
      }
      u();
      const T = n.isOdd(I);
      return (w & 1) === 1 !== T && (I = n.neg(I)), { x: D, y: I };
    } else if (y === A && w === 4) {
      const D = n.BYTES, E = n.fromBytes(x.subarray(0, D)), I = n.fromBytes(x.subarray(D, D * 2));
      if (!m(E, I))
        throw new Error("bad point: is not on curve");
      return { x: E, y: I };
    } else
      throw new Error(`bad point: got length ${y}, expected compressed=${v} or uncompressed=${A}`);
  }
  const d = e.toBytes || h, p = e.fromBytes || f;
  function g(N) {
    const v = n.sqr(N), A = n.mul(v, N);
    return n.add(n.add(A, n.mul(N, i.a)), i.b);
  }
  function m(N, v) {
    const A = n.sqr(v), y = g(N);
    return n.eql(A, y);
  }
  if (!m(i.Gx, i.Gy))
    throw new Error("bad curve params: generator point");
  const _ = n.mul(n.pow(i.a, Ss), Zv), R = n.mul(n.sqr(i.b), BigInt(27));
  if (n.is0(n.add(_, R)))
    throw new Error("bad curve params: a or b");
  function b(N, v, A = !1) {
    if (!n.isValid(v) || A && n.is0(v))
      throw new Error(`bad point coordinate ${N}`);
    return v;
  }
  function S(N) {
    if (!(N instanceof O))
      throw new Error("ProjectivePoint expected");
  }
  function $(N) {
    if (!c || !c.basises)
      throw new Error("no endo");
    return Gv(N, c.basises, s.ORDER);
  }
  const B = Sl((N, v) => {
    const { X: A, Y: y, Z: w } = N;
    if (n.eql(w, n.ONE))
      return { x: A, y };
    const x = N.is0();
    v == null && (v = x ? n.ONE : n.inv(w));
    const D = n.mul(A, v), E = n.mul(y, v), I = n.mul(w, v);
    if (x)
      return { x: n.ZERO, y: n.ZERO };
    if (!n.eql(I, n.ONE))
      throw new Error("invZ was invalid");
    return { x: D, y: E };
  }), C = Sl((N) => {
    if (N.is0()) {
      if (e.allowInfinityPoint && !n.is0(N.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: v, y: A } = N.toAffine();
    if (!n.isValid(v) || !n.isValid(A))
      throw new Error("bad point: x or y not field elements");
    if (!m(v, A))
      throw new Error("bad point: equation left != right");
    if (!N.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return !0;
  });
  function P(N, v, A, y, w) {
    return A = new O(n.mul(A.X, N), A.Y, A.Z), v = Xs(y, v), A = Xs(w, A), v.add(A);
  }
  class O {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(v, A, y) {
      this.X = b("x", v), this.Y = b("y", A, !0), this.Z = b("z", y), Object.freeze(this);
    }
    static CURVE() {
      return i;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(v) {
      const { x: A, y } = v || {};
      if (!v || !n.isValid(A) || !n.isValid(y))
        throw new Error("invalid affine point");
      if (v instanceof O)
        throw new Error("projective point not allowed");
      return n.is0(A) && n.is0(y) ? O.ZERO : new O(A, y, n.ONE);
    }
    static fromBytes(v) {
      const A = O.fromAffine(p(Ar(v, void 0, "point")));
      return A.assertValidity(), A;
    }
    static fromHex(v) {
      return O.fromBytes(Re("pointHex", v));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(v = 8, A = !0) {
      return k.createCache(this, v), A || this.multiply(Ss), this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      C(this);
    }
    hasEvenY() {
      const { y: v } = this.toAffine();
      if (!n.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !n.isOdd(v);
    }
    /** Compare one point to another. */
    equals(v) {
      S(v);
      const { X: A, Y: y, Z: w } = this, { X: x, Y: D, Z: E } = v, I = n.eql(n.mul(A, E), n.mul(x, w)), T = n.eql(n.mul(y, E), n.mul(D, w));
      return I && T;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new O(this.X, n.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: v, b: A } = i, y = n.mul(A, Ss), { X: w, Y: x, Z: D } = this;
      let E = n.ZERO, I = n.ZERO, T = n.ZERO, L = n.mul(w, w), j = n.mul(x, x), z = n.mul(D, D), q = n.mul(w, x);
      return q = n.add(q, q), T = n.mul(w, D), T = n.add(T, T), E = n.mul(v, T), I = n.mul(y, z), I = n.add(E, I), E = n.sub(j, I), I = n.add(j, I), I = n.mul(E, I), E = n.mul(q, E), T = n.mul(y, T), z = n.mul(v, z), q = n.sub(L, z), q = n.mul(v, q), q = n.add(q, T), T = n.add(L, L), L = n.add(T, L), L = n.add(L, z), L = n.mul(L, q), I = n.add(I, L), z = n.mul(x, D), z = n.add(z, z), L = n.mul(z, q), E = n.sub(E, L), T = n.mul(z, j), T = n.add(T, T), T = n.add(T, T), new O(E, I, T);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(v) {
      S(v);
      const { X: A, Y: y, Z: w } = this, { X: x, Y: D, Z: E } = v;
      let I = n.ZERO, T = n.ZERO, L = n.ZERO;
      const j = i.a, z = n.mul(i.b, Ss);
      let q = n.mul(A, x), V = n.mul(y, D), W = n.mul(w, E), Z = n.add(A, y), K = n.add(x, D);
      Z = n.mul(Z, K), K = n.add(q, V), Z = n.sub(Z, K), K = n.add(A, w);
      let J = n.add(x, E);
      return K = n.mul(K, J), J = n.add(q, W), K = n.sub(K, J), J = n.add(y, w), I = n.add(D, E), J = n.mul(J, I), I = n.add(V, W), J = n.sub(J, I), L = n.mul(j, K), I = n.mul(z, W), L = n.add(I, L), I = n.sub(V, L), L = n.add(V, L), T = n.mul(I, L), V = n.add(q, q), V = n.add(V, q), W = n.mul(j, W), K = n.mul(z, K), V = n.add(V, W), W = n.sub(q, W), W = n.mul(j, W), K = n.add(K, W), q = n.mul(V, K), T = n.add(T, q), q = n.mul(J, K), I = n.mul(Z, I), I = n.sub(I, q), q = n.mul(Z, V), L = n.mul(J, L), L = n.add(L, q), new O(I, T, L);
    }
    subtract(v) {
      return this.add(v.negate());
    }
    is0() {
      return this.equals(O.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(v) {
      const { endo: A } = e;
      if (!s.isValidNot0(v))
        throw new Error("invalid scalar: out of range");
      let y, w;
      const x = (D) => k.cached(this, D, (E) => oo(O, E));
      if (A) {
        const { k1neg: D, k1: E, k2neg: I, k2: T } = $(v), { p: L, f: j } = x(E), { p: z, f: q } = x(T);
        w = j.add(q), y = P(A.beta, L, z, D, I);
      } else {
        const { p: D, f: E } = x(v);
        y = D, w = E;
      }
      return oo(O, [y, w])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(v) {
      const { endo: A } = e, y = this;
      if (!s.isValid(v))
        throw new Error("invalid scalar: out of range");
      if (v === kt || y.is0())
        return O.ZERO;
      if (v === on)
        return y;
      if (k.hasCache(this))
        return this.multiply(v);
      if (A) {
        const { k1neg: w, k1: x, k2neg: D, k2: E } = $(v), { p1: I, p2: T } = Nv(O, y, x, E);
        return P(A.beta, I, T, w, D);
      } else
        return k.unsafe(y, v);
    }
    multiplyAndAddUnsafe(v, A, y) {
      const w = this.multiplyUnsafe(A).add(v.multiplyUnsafe(y));
      return w.is0() ? void 0 : w;
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(v) {
      return B(this, v);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree: v } = e;
      return o === on ? !0 : v ? v(O, this) : k.unsafe(this, a).is0();
    }
    clearCofactor() {
      const { clearCofactor: v } = e;
      return o === on ? this : v ? v(O, this) : this.multiplyUnsafe(o);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(o).is0();
    }
    toBytes(v = !0) {
      return Ys(v, "isCompressed"), this.assertValidity(), d(O, this, v);
    }
    toHex(v = !0) {
      return nn(this.toBytes(v));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(v = !0) {
      return this.toBytes(v);
    }
    _setWindowSize(v) {
      this.precompute(v);
    }
    static normalizeZ(v) {
      return oo(O, v);
    }
    static msm(v, A) {
      return Uv(O, s, v, A);
    }
    static fromPrivateKey(v) {
      return O.BASE.multiply(Qr(s, v));
    }
  }
  O.BASE = new O(i.Gx, i.Gy, n.ONE), O.ZERO = new O(n.ZERO, n.ONE, n.ZERO), O.Fp = n, O.Fn = s;
  const U = s.BITS, k = new Cv(O, e.endo ? Math.ceil(U / 2) : U);
  return O.BASE.precompute(8), O;
}
function Lf(t) {
  return Uint8Array.of(t ? 2 : 3);
}
function kf(t, e) {
  return {
    secretKey: e.BYTES,
    publicKey: 1 + t.BYTES,
    publicKeyUncompressed: 1 + 2 * t.BYTES,
    publicKeyHasPrefix: !0,
    signature: 2 * e.BYTES
  };
}
function Jv(t, e = {}) {
  const { Fn: r } = t, n = e.randomBytes || Hr, s = Object.assign(kf(t.Fp, r), { seed: Rf(r.ORDER) });
  function i(d) {
    try {
      return !!Qr(r, d);
    } catch {
      return !1;
    }
  }
  function o(d, p) {
    const { publicKey: g, publicKeyUncompressed: m } = s;
    try {
      const _ = d.length;
      return p === !0 && _ !== g || p === !1 && _ !== m ? !1 : !!t.fromBytes(d);
    } catch {
      return !1;
    }
  }
  function a(d = n(s.seed)) {
    return Bv(Ar(d, s.seed, "seed"), r.ORDER);
  }
  function c(d, p = !0) {
    return t.BASE.multiply(Qr(r, d)).toBytes(p);
  }
  function l(d) {
    const p = a(d);
    return { secretKey: p, publicKey: c(p) };
  }
  function u(d) {
    if (typeof d == "bigint")
      return !1;
    if (d instanceof t)
      return !0;
    const { secretKey: p, publicKey: g, publicKeyUncompressed: m } = s;
    if (r.allowedLengths || p === g)
      return;
    const _ = Re("key", d).length;
    return _ === g || _ === m;
  }
  function h(d, p, g = !0) {
    if (u(d) === !0)
      throw new Error("first arg must be private key");
    if (u(p) === !1)
      throw new Error("second arg must be public key");
    const m = Qr(r, d);
    return t.fromHex(p).multiply(m).toBytes(g);
  }
  return Object.freeze({ getPublicKey: c, getSharedSecret: h, keygen: l, Point: t, utils: {
    isValidSecretKey: i,
    isValidPublicKey: o,
    randomSecretKey: a,
    // TODO: remove
    isValidPrivateKey: i,
    randomPrivateKey: a,
    normPrivateKeyToScalar: (d) => Qr(r, d),
    precompute(d = 8, p = t.BASE) {
      return p.precompute(d, !1);
    }
  }, lengths: s });
}
function Qv(t, e, r = {}) {
  di(e), xi(r, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const n = r.randomBytes || Hr, s = r.hmac || ((A, ...y) => bi(e, A, cr(...y))), { Fp: i, Fn: o } = t, { ORDER: a, BITS: c } = o, { keygen: l, getPublicKey: u, getSharedSecret: h, utils: f, lengths: d } = Jv(t, r), p = {
    prehash: !1,
    lowS: typeof r.lowS == "boolean" ? r.lowS : !1,
    format: void 0,
    //'compact' as ECDSASigFormat,
    extraEntropy: !1
  }, g = "compact";
  function m(A) {
    const y = a >> on;
    return A > y;
  }
  function _(A, y) {
    if (!o.isValidNot0(y))
      throw new Error(`invalid signature ${A}: out of range 1..Point.Fn.ORDER`);
    return y;
  }
  function R(A, y) {
    Ho(y);
    const w = d.signature, x = y === "compact" ? w : y === "recovered" ? w + 1 : void 0;
    return Ar(A, x, `${y} signature`);
  }
  class b {
    constructor(y, w, x) {
      this.r = _("r", y), this.s = _("s", w), x != null && (this.recovery = x), Object.freeze(this);
    }
    static fromBytes(y, w = g) {
      R(y, w);
      let x;
      if (w === "der") {
        const { r: T, s: L } = Nt.toSig(Ar(y));
        return new b(T, L);
      }
      w === "recovered" && (x = y[0], w = "compact", y = y.subarray(1));
      const D = o.BYTES, E = y.subarray(0, D), I = y.subarray(D, D * 2);
      return new b(o.fromBytes(E), o.fromBytes(I), x);
    }
    static fromHex(y, w) {
      return this.fromBytes(Fs(y), w);
    }
    addRecoveryBit(y) {
      return new b(this.r, this.s, y);
    }
    recoverPublicKey(y) {
      const w = i.ORDER, { r: x, s: D, recovery: E } = this;
      if (E == null || ![0, 1, 2, 3].includes(E))
        throw new Error("recovery id invalid");
      if (a * Uf < w && E > 1)
        throw new Error("recovery id is ambiguous for h>1 curve");
      const T = E === 2 || E === 3 ? x + a : x;
      if (!i.isValid(T))
        throw new Error("recovery id 2 or 3 invalid");
      const L = i.toBytes(T), j = t.fromBytes(cr(Lf((E & 1) === 0), L)), z = o.inv(T), q = $(Re("msgHash", y)), V = o.create(-q * z), W = o.create(D * z), Z = t.BASE.multiplyUnsafe(V).add(j.multiplyUnsafe(W));
      if (Z.is0())
        throw new Error("point at infinify");
      return Z.assertValidity(), Z;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return m(this.s);
    }
    toBytes(y = g) {
      if (Ho(y), y === "der")
        return Fs(Nt.hexFromSig(this));
      const w = o.toBytes(this.r), x = o.toBytes(this.s);
      if (y === "recovered") {
        if (this.recovery == null)
          throw new Error("recovery bit must be present");
        return cr(Uint8Array.of(this.recovery), w, x);
      }
      return cr(w, x);
    }
    toHex(y) {
      return nn(this.toBytes(y));
    }
    // TODO: remove
    assertValidity() {
    }
    static fromCompact(y) {
      return b.fromBytes(Re("sig", y), "compact");
    }
    static fromDER(y) {
      return b.fromBytes(Re("sig", y), "der");
    }
    normalizeS() {
      return this.hasHighS() ? new b(this.r, o.neg(this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return this.toBytes("der");
    }
    toDERHex() {
      return nn(this.toBytes("der"));
    }
    toCompactRawBytes() {
      return this.toBytes("compact");
    }
    toCompactHex() {
      return nn(this.toBytes("compact"));
    }
  }
  const S = r.bits2int || function(y) {
    if (y.length > 8192)
      throw new Error("input is too large");
    const w = vi(y), x = y.length * 8 - c;
    return x > 0 ? w >> BigInt(x) : w;
  }, $ = r.bits2int_modN || function(y) {
    return o.create(S(y));
  }, B = os(c);
  function C(A) {
    return zo("num < 2^" + c, A, kt, B), o.toBytes(A);
  }
  function P(A, y) {
    return Ar(A, void 0, "message"), y ? Ar(e(A), void 0, "prehashed message") : A;
  }
  function O(A, y, w) {
    if (["recovered", "canonical"].some((V) => V in w))
      throw new Error("sign() legacy options not supported");
    const { lowS: x, prehash: D, extraEntropy: E } = uo(w, p);
    A = P(A, D);
    const I = $(A), T = Qr(o, y), L = [C(T), C(I)];
    if (E != null && E !== !1) {
      const V = E === !0 ? n(d.secretKey) : E;
      L.push(Re("extraEntropy", V));
    }
    const j = cr(...L), z = I;
    function q(V) {
      const W = S(V);
      if (!o.isValidNot0(W))
        return;
      const Z = o.inv(W), K = t.BASE.multiply(W).toAffine(), J = o.create(K.x);
      if (J === kt)
        return;
      const ae = o.create(Z * o.create(z + J * T));
      if (ae === kt)
        return;
      let he = (K.x === J ? 0 : 2) | Number(K.y & on), ye = ae;
      return x && m(ae) && (ye = o.neg(ae), he ^= 1), new b(J, ye, he);
    }
    return { seed: j, k2sig: q };
  }
  function U(A, y, w = {}) {
    A = Re("message", A);
    const { seed: x, k2sig: D } = O(A, y, w);
    return xv(e.outputLen, o.BYTES, s)(x, D);
  }
  function k(A) {
    let y;
    const w = typeof A == "string" || fi(A), x = !w && A !== null && typeof A == "object" && typeof A.r == "bigint" && typeof A.s == "bigint";
    if (!w && !x)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    if (x)
      y = new b(A.r, A.s);
    else if (w) {
      try {
        y = b.fromBytes(Re("sig", A), "der");
      } catch (D) {
        if (!(D instanceof Nt.Err))
          throw D;
      }
      if (!y)
        try {
          y = b.fromBytes(Re("sig", A), "compact");
        } catch {
          return !1;
        }
    }
    return y || !1;
  }
  function N(A, y, w, x = {}) {
    const { lowS: D, prehash: E, format: I } = uo(x, p);
    if (w = Re("publicKey", w), y = P(Re("message", y), E), "strict" in x)
      throw new Error("options.strict was renamed to lowS");
    const T = I === void 0 ? k(A) : b.fromBytes(Re("sig", A), I);
    if (T === !1)
      return !1;
    try {
      const L = t.fromBytes(w);
      if (D && T.hasHighS())
        return !1;
      const { r: j, s: z } = T, q = $(y), V = o.inv(z), W = o.create(q * V), Z = o.create(j * V), K = t.BASE.multiplyUnsafe(W).add(L.multiplyUnsafe(Z));
      return K.is0() ? !1 : o.create(K.x) === j;
    } catch {
      return !1;
    }
  }
  function v(A, y, w = {}) {
    const { prehash: x } = uo(w, p);
    return y = P(y, x), b.fromBytes(A, "recovered").recoverPublicKey(y).toBytes();
  }
  return Object.freeze({
    keygen: l,
    getPublicKey: u,
    getSharedSecret: h,
    utils: f,
    lengths: d,
    Point: t,
    sign: U,
    verify: N,
    recoverPublicKey: v,
    Signature: b,
    hash: e
  });
}
function ex(t) {
  const e = {
    a: t.a,
    b: t.b,
    p: t.Fp.ORDER,
    n: t.n,
    h: t.h,
    Gx: t.Gx,
    Gy: t.Gy
  }, r = t.Fp;
  let n = t.allowedPrivateKeyLengths ? Array.from(new Set(t.allowedPrivateKeyLengths.map((o) => Math.ceil(o / 2)))) : void 0;
  const s = yr(e.n, {
    BITS: t.nBitLength,
    allowedLengths: n,
    modFromBytes: t.wrapPrivateKey
  }), i = {
    Fp: r,
    Fn: s,
    allowInfinityPoint: t.allowInfinityPoint,
    endo: t.endo,
    isTorsionFree: t.isTorsionFree,
    clearCofactor: t.clearCofactor,
    fromBytes: t.fromBytes,
    toBytes: t.toBytes
  };
  return { CURVE: e, curveOpts: i };
}
function tx(t) {
  const { CURVE: e, curveOpts: r } = ex(t), n = {
    hmac: t.hmac,
    randomBytes: t.randomBytes,
    lowS: t.lowS,
    bits2int: t.bits2int,
    bits2int_modN: t.bits2int_modN
  };
  return { CURVE: e, curveOpts: r, hash: t.hash, ecdsaOpts: n };
}
function rx(t, e) {
  const r = e.Point;
  return Object.assign({}, e, {
    ProjectivePoint: r,
    CURVE: Object.assign({}, t, Tf(r.Fn.ORDER, r.Fn.BITS))
  });
}
function nx(t) {
  const { CURVE: e, curveOpts: r, hash: n, ecdsaOpts: s } = tx(t), i = Xv(e, r), o = Qv(i, n, s);
  return rx(t, o);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Ba(t, e) {
  const r = (n) => nx({ ...t, hash: n });
  return { ...r(e), create: r };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Mf = {
  p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"),
  n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
  h: BigInt(1),
  a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
  b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
  Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
  Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
}, Ff = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"),
  n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
  h: BigInt(1),
  a: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc"),
  b: BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef"),
  Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
  Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f")
}, qf = {
  p: BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
  n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
  h: BigInt(1),
  a: BigInt("0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc"),
  b: BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00"),
  Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
  Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650")
}, sx = yr(Mf.p), ix = yr(Ff.p), ox = yr(qf.p), ax = Ba({ ...Mf, Fp: sx, lowS: !1 }, mi);
Ba({ ...Ff, Fp: ix, lowS: !1 }, y2);
Ba({ ...qf, Fp: ox, lowS: !1, allowedPrivateKeyLengths: [130, 131, 132] }, g2);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const cx = ax, lx = { waku: { publish: "waku_publish", batchPublish: "waku_batchPublish", subscribe: "waku_subscribe", batchSubscribe: "waku_batchSubscribe", subscription: "waku_subscription", unsubscribe: "waku_unsubscribe", batchUnsubscribe: "waku_batchUnsubscribe", batchFetchMessages: "waku_batchFetchMessages" }, irn: { publish: "irn_publish", batchPublish: "irn_batchPublish", subscribe: "irn_subscribe", batchSubscribe: "irn_batchSubscribe", subscription: "irn_subscription", unsubscribe: "irn_unsubscribe", batchUnsubscribe: "irn_batchUnsubscribe", batchFetchMessages: "irn_batchFetchMessages" }, iridium: { publish: "iridium_publish", batchPublish: "iridium_batchPublish", subscribe: "iridium_subscribe", batchSubscribe: "iridium_batchSubscribe", subscription: "iridium_subscription", unsubscribe: "iridium_unsubscribe", batchUnsubscribe: "iridium_batchUnsubscribe", batchFetchMessages: "iridium_batchFetchMessages" } }, ux = "Input must be an string, Buffer or Uint8Array";
function hx(t) {
  let e;
  if (t instanceof Uint8Array)
    e = t;
  else if (typeof t == "string")
    e = new TextEncoder().encode(t);
  else
    throw new Error(ux);
  return e;
}
function fx(t) {
  return Array.prototype.map.call(t, function(e) {
    return (e < 16 ? "0" : "") + e.toString(16);
  }).join("");
}
function Is(t) {
  return (4294967296 + t).toString(16).substring(1);
}
function dx(t, e, r) {
  let n = `
` + t + " = ";
  for (let s = 0; s < e.length; s += 2) {
    if (r === 32)
      n += Is(e[s]).toUpperCase(), n += " ", n += Is(e[s + 1]).toUpperCase();
    else if (r === 64)
      n += Is(e[s + 1]).toUpperCase(), n += Is(e[s]).toUpperCase();
    else throw new Error("Invalid size " + r);
    s % 6 === 4 ? n += `
` + new Array(t.length + 4).join(" ") : s < e.length - 2 && (n += " ");
  }
  console.log(n);
}
function px(t, e, r) {
  let n = (/* @__PURE__ */ new Date()).getTime();
  const s = new Uint8Array(e);
  for (let o = 0; o < e; o++)
    s[o] = o % 256;
  const i = (/* @__PURE__ */ new Date()).getTime();
  console.log("Generated random input in " + (i - n) + "ms"), n = i;
  for (let o = 0; o < r; o++) {
    const a = t(s), c = (/* @__PURE__ */ new Date()).getTime(), l = c - n;
    n = c, console.log("Hashed in " + l + "ms: " + a.substring(0, 20) + "..."), console.log(
      Math.round(e / (1 << 20) / (l / 1e3) * 100) / 100 + " MB PER SECOND"
    );
  }
}
var zf = {
  normalizeInput: hx,
  toHex: fx,
  debugPrint: dx,
  testSpeed: px
};
const Ps = zf;
function Ds(t, e, r) {
  const n = t[e] + t[r];
  let s = t[e + 1] + t[r + 1];
  n >= 4294967296 && s++, t[e] = n, t[e + 1] = s;
}
function Rl(t, e, r, n) {
  let s = t[e] + r;
  r < 0 && (s += 4294967296);
  let i = t[e + 1] + n;
  s >= 4294967296 && i++, t[e] = s, t[e + 1] = i;
}
function jf(t, e) {
  return t[e] ^ t[e + 1] << 8 ^ t[e + 2] << 16 ^ t[e + 3] << 24;
}
function Qt(t, e, r, n, s, i) {
  const o = Cn[s], a = Cn[s + 1], c = Cn[i], l = Cn[i + 1];
  Ds(Y, t, e), Rl(Y, t, o, a);
  let u = Y[n] ^ Y[t], h = Y[n + 1] ^ Y[t + 1];
  Y[n] = h, Y[n + 1] = u, Ds(Y, r, n), u = Y[e] ^ Y[r], h = Y[e + 1] ^ Y[r + 1], Y[e] = u >>> 24 ^ h << 8, Y[e + 1] = h >>> 24 ^ u << 8, Ds(Y, t, e), Rl(Y, t, c, l), u = Y[n] ^ Y[t], h = Y[n + 1] ^ Y[t + 1], Y[n] = u >>> 16 ^ h << 16, Y[n + 1] = h >>> 16 ^ u << 16, Ds(Y, r, n), u = Y[e] ^ Y[r], h = Y[e + 1] ^ Y[r + 1], Y[e] = h >>> 31 ^ u << 1, Y[e + 1] = u >>> 31 ^ h << 1;
}
const Hf = new Uint32Array([
  4089235720,
  1779033703,
  2227873595,
  3144134277,
  4271175723,
  1013904242,
  1595750129,
  2773480762,
  2917565137,
  1359893119,
  725511199,
  2600822924,
  4215389547,
  528734635,
  327033209,
  1541459225
]), gx = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9,
  12,
  5,
  1,
  15,
  14,
  13,
  4,
  10,
  0,
  7,
  6,
  3,
  9,
  2,
  8,
  11,
  13,
  11,
  7,
  14,
  12,
  1,
  3,
  9,
  5,
  0,
  15,
  4,
  8,
  6,
  2,
  10,
  6,
  15,
  14,
  9,
  11,
  3,
  0,
  8,
  12,
  2,
  13,
  7,
  1,
  4,
  10,
  5,
  10,
  2,
  8,
  4,
  7,
  6,
  1,
  5,
  15,
  11,
  9,
  14,
  3,
  12,
  13,
  0,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3
], Te = new Uint8Array(
  gx.map(function(t) {
    return t * 2;
  })
), Y = new Uint32Array(32), Cn = new Uint32Array(32);
function Kf(t, e) {
  let r = 0;
  for (r = 0; r < 16; r++)
    Y[r] = t.h[r], Y[r + 16] = Hf[r];
  for (Y[24] = Y[24] ^ t.t, Y[25] = Y[25] ^ t.t / 4294967296, e && (Y[28] = ~Y[28], Y[29] = ~Y[29]), r = 0; r < 32; r++)
    Cn[r] = jf(t.b, 4 * r);
  for (r = 0; r < 12; r++)
    Qt(0, 8, 16, 24, Te[r * 16 + 0], Te[r * 16 + 1]), Qt(2, 10, 18, 26, Te[r * 16 + 2], Te[r * 16 + 3]), Qt(4, 12, 20, 28, Te[r * 16 + 4], Te[r * 16 + 5]), Qt(6, 14, 22, 30, Te[r * 16 + 6], Te[r * 16 + 7]), Qt(0, 10, 20, 30, Te[r * 16 + 8], Te[r * 16 + 9]), Qt(2, 12, 22, 24, Te[r * 16 + 10], Te[r * 16 + 11]), Qt(4, 14, 16, 26, Te[r * 16 + 12], Te[r * 16 + 13]), Qt(6, 8, 18, 28, Te[r * 16 + 14], Te[r * 16 + 15]);
  for (r = 0; r < 16; r++)
    t.h[r] = t.h[r] ^ Y[r] ^ Y[r + 16];
}
const er = new Uint8Array([
  0,
  0,
  0,
  0,
  //  0: outlen, keylen, fanout, depth
  0,
  0,
  0,
  0,
  //  4: leaf length, sequential mode
  0,
  0,
  0,
  0,
  //  8: node offset
  0,
  0,
  0,
  0,
  // 12: node offset
  0,
  0,
  0,
  0,
  // 16: node depth, inner length, rfu
  0,
  0,
  0,
  0,
  // 20: rfu
  0,
  0,
  0,
  0,
  // 24: rfu
  0,
  0,
  0,
  0,
  // 28: rfu
  0,
  0,
  0,
  0,
  // 32: salt
  0,
  0,
  0,
  0,
  // 36: salt
  0,
  0,
  0,
  0,
  // 40: salt
  0,
  0,
  0,
  0,
  // 44: salt
  0,
  0,
  0,
  0,
  // 48: personal
  0,
  0,
  0,
  0,
  // 52: personal
  0,
  0,
  0,
  0,
  // 56: personal
  0,
  0,
  0,
  0
  // 60: personal
]);
function Vf(t, e, r, n) {
  if (t === 0 || t > 64)
    throw new Error("Illegal output length, expected 0 < length <= 64");
  if (e && e.length > 64)
    throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
  if (r && r.length !== 16)
    throw new Error("Illegal salt, expected Uint8Array with length is 16");
  if (n && n.length !== 16)
    throw new Error("Illegal personal, expected Uint8Array with length is 16");
  const s = {
    b: new Uint8Array(128),
    h: new Uint32Array(16),
    t: 0,
    // input count
    c: 0,
    // pointer within buffer
    outlen: t
    // output length in bytes
  };
  er.fill(0), er[0] = t, e && (er[1] = e.length), er[2] = 1, er[3] = 1, r && er.set(r, 32), n && er.set(n, 48);
  for (let i = 0; i < 16; i++)
    s.h[i] = Hf[i] ^ jf(er, i * 4);
  return e && (Ra(s, e), s.c = 128), s;
}
function Ra(t, e) {
  for (let r = 0; r < e.length; r++)
    t.c === 128 && (t.t += t.c, Kf(t, !1), t.c = 0), t.b[t.c++] = e[r];
}
function Wf(t) {
  for (t.t += t.c; t.c < 128; )
    t.b[t.c++] = 0;
  Kf(t, !0);
  const e = new Uint8Array(t.outlen);
  for (let r = 0; r < t.outlen; r++)
    e[r] = t.h[r >> 2] >> 8 * (r & 3);
  return e;
}
function Gf(t, e, r, n, s) {
  r = r || 64, t = Ps.normalizeInput(t), n && (n = Ps.normalizeInput(n)), s && (s = Ps.normalizeInput(s));
  const i = Vf(r, e, n, s);
  return Ra(i, t), Wf(i);
}
function yx(t, e, r, n, s) {
  const i = Gf(t, e, r, n, s);
  return Ps.toHex(i);
}
var wx = {
  blake2b: Gf,
  blake2bHex: yx,
  blake2bInit: Vf,
  blake2bUpdate: Ra,
  blake2bFinal: Wf
};
const Yf = zf;
function mx(t, e) {
  return t[e] ^ t[e + 1] << 8 ^ t[e + 2] << 16 ^ t[e + 3] << 24;
}
function tr(t, e, r, n, s, i) {
  ee[t] = ee[t] + ee[e] + s, ee[n] = As(ee[n] ^ ee[t], 16), ee[r] = ee[r] + ee[n], ee[e] = As(ee[e] ^ ee[r], 12), ee[t] = ee[t] + ee[e] + i, ee[n] = As(ee[n] ^ ee[t], 8), ee[r] = ee[r] + ee[n], ee[e] = As(ee[e] ^ ee[r], 7);
}
function As(t, e) {
  return t >>> e ^ t << 32 - e;
}
const Zf = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Be = new Uint8Array([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  14,
  10,
  4,
  8,
  9,
  15,
  13,
  6,
  1,
  12,
  0,
  2,
  11,
  7,
  5,
  3,
  11,
  8,
  12,
  0,
  5,
  2,
  15,
  13,
  10,
  14,
  3,
  6,
  7,
  1,
  9,
  4,
  7,
  9,
  3,
  1,
  13,
  12,
  11,
  14,
  2,
  6,
  5,
  10,
  4,
  0,
  15,
  8,
  9,
  0,
  5,
  7,
  2,
  4,
  10,
  15,
  14,
  1,
  11,
  12,
  6,
  8,
  3,
  13,
  2,
  12,
  6,
  10,
  0,
  11,
  8,
  3,
  4,
  13,
  7,
  5,
  15,
  14,
  1,
  9,
  12,
  5,
  1,
  15,
  14,
  13,
  4,
  10,
  0,
  7,
  6,
  3,
  9,
  2,
  8,
  11,
  13,
  11,
  7,
  14,
  12,
  1,
  3,
  9,
  5,
  0,
  15,
  4,
  8,
  6,
  2,
  10,
  6,
  15,
  14,
  9,
  11,
  3,
  0,
  8,
  12,
  2,
  13,
  7,
  1,
  4,
  10,
  5,
  10,
  2,
  8,
  4,
  7,
  6,
  1,
  5,
  15,
  11,
  9,
  14,
  3,
  12,
  13,
  0
]), ee = new Uint32Array(16), xe = new Uint32Array(16);
function Xf(t, e) {
  let r = 0;
  for (r = 0; r < 8; r++)
    ee[r] = t.h[r], ee[r + 8] = Zf[r];
  for (ee[12] ^= t.t, ee[13] ^= t.t / 4294967296, e && (ee[14] = ~ee[14]), r = 0; r < 16; r++)
    xe[r] = mx(t.b, 4 * r);
  for (r = 0; r < 10; r++)
    tr(0, 4, 8, 12, xe[Be[r * 16 + 0]], xe[Be[r * 16 + 1]]), tr(1, 5, 9, 13, xe[Be[r * 16 + 2]], xe[Be[r * 16 + 3]]), tr(2, 6, 10, 14, xe[Be[r * 16 + 4]], xe[Be[r * 16 + 5]]), tr(3, 7, 11, 15, xe[Be[r * 16 + 6]], xe[Be[r * 16 + 7]]), tr(0, 5, 10, 15, xe[Be[r * 16 + 8]], xe[Be[r * 16 + 9]]), tr(1, 6, 11, 12, xe[Be[r * 16 + 10]], xe[Be[r * 16 + 11]]), tr(2, 7, 8, 13, xe[Be[r * 16 + 12]], xe[Be[r * 16 + 13]]), tr(3, 4, 9, 14, xe[Be[r * 16 + 14]], xe[Be[r * 16 + 15]]);
  for (r = 0; r < 8; r++)
    t.h[r] ^= ee[r] ^ ee[r + 8];
}
function Jf(t, e) {
  if (!(t > 0 && t <= 32))
    throw new Error("Incorrect output length, should be in [1, 32]");
  const r = e ? e.length : 0;
  if (e && !(r > 0 && r <= 32))
    throw new Error("Incorrect key length, should be in [1, 32]");
  const n = {
    h: new Uint32Array(Zf),
    // hash state
    b: new Uint8Array(64),
    // input block
    c: 0,
    // pointer within block
    t: 0,
    // input count
    outlen: t
    // output length in bytes
  };
  return n.h[0] ^= 16842752 ^ r << 8 ^ t, r > 0 && (Pa(n, e), n.c = 64), n;
}
function Pa(t, e) {
  for (let r = 0; r < e.length; r++)
    t.c === 64 && (t.t += t.c, Xf(t, !1), t.c = 0), t.b[t.c++] = e[r];
}
function Qf(t) {
  for (t.t += t.c; t.c < 64; )
    t.b[t.c++] = 0;
  Xf(t, !0);
  const e = new Uint8Array(t.outlen);
  for (let r = 0; r < t.outlen; r++)
    e[r] = t.h[r >> 2] >> 8 * (r & 3) & 255;
  return e;
}
function ed(t, e, r) {
  r = r || 32, t = Yf.normalizeInput(t);
  const n = Jf(r, e);
  return Pa(n, t), Qf(n);
}
function bx(t, e, r) {
  const n = ed(t, e, r);
  return Yf.toHex(n);
}
var Ex = {
  blake2s: ed,
  blake2sHex: bx,
  blake2sInit: Jf,
  blake2sUpdate: Pa,
  blake2sFinal: Qf
};
const An = wx, On = Ex;
var vx = {
  blake2b: An.blake2b,
  blake2bHex: An.blake2bHex,
  blake2bInit: An.blake2bInit,
  blake2bUpdate: An.blake2bUpdate,
  blake2bFinal: An.blake2bFinal,
  blake2s: On.blake2s,
  blake2sHex: On.blake2sHex,
  blake2sInit: On.blake2sInit,
  blake2sUpdate: On.blake2sUpdate,
  blake2sFinal: On.blake2sFinal
};
const xx = ":";
function Cs(t) {
  const [e, r] = t.split(xx);
  return { namespace: e, reference: r };
}
function td(t, e) {
  return t.includes(":") ? [t] : e.chains || [];
}
const _x = { INVALID_METHOD: { message: "Invalid method.", code: 1001 }, INVALID_EVENT: { message: "Invalid event.", code: 1002 }, INVALID_UPDATE_REQUEST: { message: "Invalid update request.", code: 1003 }, INVALID_EXTEND_REQUEST: { message: "Invalid extend request.", code: 1004 }, INVALID_SESSION_SETTLE_REQUEST: { message: "Invalid session settle request.", code: 1005 }, UNAUTHORIZED_METHOD: { message: "Unauthorized method.", code: 3001 }, UNAUTHORIZED_EVENT: { message: "Unauthorized event.", code: 3002 }, UNAUTHORIZED_UPDATE_REQUEST: { message: "Unauthorized update request.", code: 3003 }, UNAUTHORIZED_EXTEND_REQUEST: { message: "Unauthorized extend request.", code: 3004 }, USER_REJECTED: { message: "User rejected.", code: 5e3 }, USER_REJECTED_CHAINS: { message: "User rejected chains.", code: 5001 }, USER_REJECTED_METHODS: { message: "User rejected methods.", code: 5002 }, USER_REJECTED_EVENTS: { message: "User rejected events.", code: 5003 }, UNSUPPORTED_CHAINS: { message: "Unsupported chains.", code: 5100 }, UNSUPPORTED_METHODS: { message: "Unsupported methods.", code: 5101 }, UNSUPPORTED_EVENTS: { message: "Unsupported events.", code: 5102 }, UNSUPPORTED_ACCOUNTS: { message: "Unsupported accounts.", code: 5103 }, UNSUPPORTED_NAMESPACE_KEY: { message: "Unsupported namespace key.", code: 5104 }, USER_DISCONNECTED: { message: "User disconnected.", code: 6e3 }, SESSION_SETTLEMENT_FAILED: { message: "Session settlement failed.", code: 7e3 }, WC_METHOD_UNSUPPORTED: { message: "Unsupported wc_ method.", code: 10001 } }, Sx = { NOT_INITIALIZED: { message: "Not initialized.", code: 1 }, NO_MATCHING_KEY: { message: "No matching key.", code: 2 }, RESTORE_WILL_OVERRIDE: { message: "Restore will override.", code: 3 }, RESUBSCRIBED: { message: "Resubscribed.", code: 4 }, MISSING_OR_INVALID: { message: "Missing or invalid.", code: 5 }, EXPIRED: { message: "Expired.", code: 6 }, UNKNOWN_TYPE: { message: "Unknown type.", code: 7 }, MISMATCHED_TOPIC: { message: "Mismatched topic.", code: 8 }, NON_CONFORMING_NAMESPACES: { message: "Non conforming namespaces.", code: 9 } };
function F(t, e) {
  const { message: r, code: n } = Sx[t];
  return { message: e ? `${r} ${e}` : r, code: n };
}
function oe(t, e) {
  const { message: r, code: n } = _x[t];
  return { message: e ? `${r} ${e}` : r, code: n };
}
const Ix = "ReactNative", Ye = { reactNative: "react-native", node: "node", browser: "browser", unknown: "unknown" }, Dx = "js";
function Js() {
  return typeof process < "u" && typeof process.versions < "u" && typeof process.versions.node < "u";
}
function wr() {
  return !Nr() && !!ua() && navigator.product === Ix;
}
function Ax() {
  return wr() && typeof global < "u" && typeof (global == null ? void 0 : global.Platform) < "u" && (global == null ? void 0 : global.Platform.OS) === "android";
}
function Ox() {
  return wr() && typeof global < "u" && typeof (global == null ? void 0 : global.Platform) < "u" && (global == null ? void 0 : global.Platform.OS) === "ios";
}
function wn() {
  return !Js() && !!ua() && !!Nr();
}
function as() {
  return wr() ? Ye.reactNative : Js() ? Ye.node : wn() ? Ye.browser : Ye.unknown;
}
function Pl() {
  var t;
  try {
    return wr() && typeof global < "u" && typeof (global == null ? void 0 : global.Application) < "u" ? (t = global.Application) == null ? void 0 : t.applicationId : void 0;
  } catch {
    return;
  }
}
function $x(t, e) {
  const r = new URLSearchParams(t);
  return Object.entries(e).sort(([n], [s]) => n.localeCompare(s)).forEach(([n, s]) => {
    s != null && r.set(n, String(s));
  }), r.toString();
}
function Tx(t) {
  var r, n;
  const e = rd();
  try {
    return t != null && t.url && e.url && new URL(t.url).host !== new URL(e.url).host && (console.warn(`The configured WalletConnect 'metadata.url':${t.url} differs from the actual page url:${e.url}. This is probably unintended and can lead to issues.`), t.url = e.url), (r = t == null ? void 0 : t.icons) != null && r.length && t.icons.length > 0 && (t.icons = t.icons.filter((s) => s !== "")), { ...e, ...t, url: (t == null ? void 0 : t.url) || e.url, name: (t == null ? void 0 : t.name) || e.name, description: (t == null ? void 0 : t.description) || e.description, icons: (n = t == null ? void 0 : t.icons) != null && n.length && t.icons.length > 0 ? t.icons : e.icons };
  } catch (s) {
    return console.warn("Error populating app metadata", s), t || e;
  }
}
function rd() {
  return uh() || { name: "", description: "", url: "", icons: [""] };
}
function Bx() {
  if (as() === Ye.reactNative && typeof global < "u" && typeof (global == null ? void 0 : global.Platform) < "u") {
    const { OS: r, Version: n } = global.Platform;
    return [r, n].join("-");
  }
  const t = ob();
  if (t === null) return "unknown";
  const e = t.os ? t.os.replace(" ", "").toLowerCase() : "unknown";
  return t.type === "browser" ? [e, t.name, t.version].join("-") : [e, t.version].join("-");
}
function Rx() {
  var e;
  const t = as();
  return t === Ye.browser ? [t, ((e = lh()) == null ? void 0 : e.host) || "unknown"].join(":") : t;
}
function nd(t, e, r) {
  const n = Bx(), s = Rx();
  return [[t, e].join("-"), [Dx, r].join("-"), n, s].join("/");
}
function Px({ protocol: t, version: e, relayUrl: r, sdkVersion: n, auth: s, projectId: i, useOnCloseEvent: o, bundleId: a, packageName: c }) {
  const l = r.split("?"), u = nd(t, e, n), h = { auth: s, ua: u, projectId: i, useOnCloseEvent: o, packageName: c || void 0, bundleId: a || void 0 }, f = $x(l[1] || "", h);
  return l[0] + "?" + f;
}
function Tr(t, e) {
  return t.filter((r) => e.includes(r)).length === t.length;
}
function Ko(t) {
  return Object.fromEntries(t.entries());
}
function Vo(t) {
  return new Map(Object.entries(t));
}
function _r(t = M.FIVE_MINUTES, e) {
  const r = M.toMiliseconds(t || M.FIVE_MINUTES);
  let n, s, i, o;
  return { resolve: (a) => {
    i && n && (clearTimeout(i), n(a), o = Promise.resolve(a));
  }, reject: (a) => {
    i && s && (clearTimeout(i), s(a));
  }, done: () => new Promise((a, c) => {
    if (o) return a(o);
    i = setTimeout(() => {
      const l = F("EXPIRED"), u = new Error(e || l.message);
      u.code = l.code, c(u);
    }, r), n = a, s = c;
  }) };
}
function ut(t, e, r) {
  return new Promise(async (n, s) => {
    const i = setTimeout(() => s(new Error(r)), e);
    try {
      const o = await t;
      n(o);
    } catch (o) {
      s(o);
    }
    clearTimeout(i);
  });
}
function sd(t, e) {
  if (typeof e == "string" && e.startsWith(`${t}:`)) return e;
  if (t.toLowerCase() === "topic") {
    if (typeof e != "string") throw new Error('Value must be "string" for expirer target type: topic');
    return `topic:${e}`;
  } else if (t.toLowerCase() === "id") {
    if (typeof e != "number") throw new Error('Value must be "number" for expirer target type: id');
    return `id:${e}`;
  }
  throw new Error(`Unknown expirer target type: ${t}`);
}
function Cx(t) {
  return sd("topic", t);
}
function Nx(t) {
  return sd("id", t);
}
function id(t) {
  const [e, r] = t.split(":"), n = { id: void 0, topic: void 0 };
  if (e === "topic" && typeof r == "string") n.topic = r;
  else if (e === "id" && Number.isInteger(Number(r))) n.id = Number(r);
  else throw new Error(`Invalid target, expected id:number or topic:string, got ${e}:${r}`);
  return n;
}
function de(t, e) {
  return M.fromMiliseconds(Date.now() + M.toMiliseconds(t));
}
function or(t) {
  return Date.now() >= M.toMiliseconds(t);
}
function te(t, e) {
  return `${t}${e ? `:${e}` : ""}`;
}
function Cr(t = [], e = []) {
  return [.../* @__PURE__ */ new Set([...t, ...e])];
}
async function Ux({ id: t, topic: e, wcDeepLink: r }) {
  var n, s;
  try {
    if (!r) return;
    const i = (n = typeof r == "string" ? JSON.parse(r) : r) == null ? void 0 : n.href;
    if (typeof i != "string") return;
    const o = Lx(i, t, e), a = as();
    if (a === Ye.browser) {
      if (!((s = Nr()) != null && s.hasFocus())) {
        console.warn("Document does not have focus, skipping deeplink.");
        return;
      }
      kx(o);
    } else a === Ye.reactNative && typeof (global == null ? void 0 : global.Linking) < "u" && await global.Linking.openURL(o);
  } catch (i) {
    console.error(i);
  }
}
function Lx(t, e, r) {
  const n = `requestId=${e}&sessionTopic=${r}`;
  t.endsWith("/") && (t = t.slice(0, -1));
  let s = `${t}`;
  if (t.startsWith("https://t.me")) {
    const i = t.includes("?") ? "&startapp=" : "?startapp=";
    s = `${s}${i}${zx(n, !0)}`;
  } else s = `${s}/wc?${n}`;
  return s;
}
function kx(t) {
  let e = "_self";
  qx() ? e = "_top" : (Fx() || t.startsWith("https://") || t.startsWith("http://")) && (e = "_blank"), window.open(t, e, "noreferrer noopener");
}
async function Mx(t, e) {
  let r = "";
  try {
    if (wn() && (r = localStorage.getItem(e), r)) return r;
    r = await t.getItem(e);
  } catch (n) {
    console.error(n);
  }
  return r;
}
function Cl(t, e) {
  if (!t.includes(e)) return null;
  const r = t.split(/([&,?,=])/), n = r.indexOf(e);
  return r[n + 2];
}
function Nl() {
  return typeof crypto < "u" && (crypto != null && crypto.randomUUID) ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu, (t) => {
    const e = Math.random() * 16 | 0;
    return (t === "x" ? e : e & 3 | 8).toString(16);
  });
}
function Ca() {
  return typeof process < "u" && process.env.IS_VITEST === "true";
}
function Fx() {
  return typeof window < "u" && (!!window.TelegramWebviewProxy || !!window.Telegram || !!window.TelegramWebviewProxyProto);
}
function qx() {
  try {
    return window.self !== window.top;
  } catch {
    return !1;
  }
}
function zx(t, e = !1) {
  const r = new TextEncoder().encode(t), n = new Array(r.length);
  for (let i = 0; i < r.length; i++) n[i] = String.fromCharCode(r[i]);
  const s = btoa(n.join(""));
  return e ? s.replace(/[=]/g, "") : s;
}
function od(t) {
  const e = t + "=".repeat((4 - t.length % 4) % 4), r = atob(e), n = new Uint8Array(r.length);
  for (let s = 0; s < r.length; s++) n[s] = r.charCodeAt(s);
  return new TextDecoder().decode(n);
}
function jx(t) {
  return new Promise((e) => setTimeout(e, t));
}
class Hx {
  constructor({ limit: e }) {
    this.limit = e, this.set = /* @__PURE__ */ new Set();
  }
  add(e) {
    if (!this.set.has(e)) {
      if (this.set.size >= this.limit) {
        const r = this.set.values().next().value;
        r && this.set.delete(r);
      }
      this.set.add(e);
    }
  }
  has(e) {
    return this.set.has(e);
  }
}
const Kx = "https://rpc.walletconnect.org/v1";
function an(t) {
  const e = t + "=".repeat((4 - t.length % 4) % 4), r = atob(e), n = new Uint8Array(r.length);
  for (let s = 0; s < r.length; s++) n[s] = r.charCodeAt(s);
  return n;
}
function ad(t) {
  const e = `Ethereum Signed Message:
${t.length}`, r = new TextEncoder().encode(e + t);
  return "0x" + Ee(Wb(r), "base16");
}
async function Vx(t, e, r, n, s, i) {
  switch (r.t) {
    case "eip191":
      return await Wx(t, e, r.s);
    case "eip1271":
      return await Gx(t, e, r.s, n, s, i);
    default:
      throw new Error(`verifySignature failed: Attempted to verify CacaoSignature with unknown type: ${r.t}`);
  }
}
function Wx(t, e, r) {
  const n = ME(r);
  return YE({ payload: ad(e), signature: n }).toLowerCase() === t.toLowerCase();
}
async function Gx(t, e, r, n, s, i) {
  const o = Cs(n);
  if (!o.namespace || !o.reference) throw new Error(`isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${n}`);
  try {
    const a = "0x1626ba7e", c = "0000000000000000000000000000000000000000000000000000000000000040", l = r.substring(2), u = (l.length / 2).toString(16).padStart(64, "0"), h = (e.startsWith("0x") ? e : ad(e)).substring(2), f = a + h + c + u + l, d = await fetch(`${i || Kx}/?chainId=${n}&projectId=${s}`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ id: Yx(), jsonrpc: "2.0", method: "eth_call", params: [{ to: t, data: f }, "latest"] }) }), { result: p } = await d.json();
    return p ? p.slice(0, a.length).toLowerCase() === a.toLowerCase() : !1;
  } catch (a) {
    return console.error("isValidEip1271Signature: ", a), !1;
  }
}
function Yx() {
  return Date.now() + Math.floor(Math.random() * 1e3);
}
function Zx(t) {
  const e = an(t), r = e[0];
  if (r === 0) throw new Error("No signatures found");
  const n = 1 + r * 64;
  if (e.length < n) throw new Error("Transaction data too short for claimed signature count");
  if (e.length < 100) throw new Error("Transaction too short");
  const s = e.slice(1, 65);
  return is.encode(s);
}
function Xx(t) {
  const e = an(t), r = new TextEncoder().encode("TransactionData::"), n = new Uint8Array(r.length + e.length);
  n.set(r), n.set(e, r.length);
  const s = x2(n, { dkLen: 32 });
  return is.encode(s);
}
function Ul(t) {
  const e = new Uint8Array(mi(Jx(t)));
  return is.encode(e);
}
function Jx(t) {
  if (t instanceof Uint8Array) return t;
  if (Array.isArray(t)) return new Uint8Array(t);
  if (typeof t == "object" && (t != null && t.data)) return new Uint8Array(Object.values(t.data));
  if (typeof t == "object" && t) return new Uint8Array(Object.values(t));
  throw new Error("getNearUint8ArrayFromBytes: Unexpected result type from bytes array");
}
function Ll(t) {
  const e = an(t), r = rv(e).txn;
  if (!r) throw new Error("Invalid signed transaction: missing 'txn' field");
  const n = G2(r), s = new TextEncoder().encode("TX"), i = Pr([s, new Uint8Array(n)]), o = w2(i);
  return WE.encode(o).replace(/=+$/, "");
}
function ho(t) {
  const e = [];
  let r = BigInt(t);
  for (; r >= 0x80n; ) e.push(Number(r & 0x7fn | 0x80n)), r >>= 7n;
  return e.push(Number(r)), new Uint8Array(e);
}
function Qx(t) {
  const e = an(t.signed.bodyBytes), r = an(t.signed.authInfoBytes), n = an(t.signature.signature), s = [];
  s.push(new Uint8Array([10])), s.push(ho(e.length)), s.push(e), s.push(new Uint8Array([18])), s.push(ho(r.length)), s.push(r), s.push(new Uint8Array([26])), s.push(ho(n.length)), s.push(n);
  const i = Pr(s), o = mi(i);
  return Ee(o, "base16").toUpperCase();
}
function e_(t) {
  var r, n;
  const e = [];
  try {
    if (typeof t == "string") return e.push(t), e;
    if (typeof t != "object") return e;
    t != null && t.id && e.push(t.id);
    const s = (n = (r = t == null ? void 0 : t.capabilities) == null ? void 0 : r.caip345) == null ? void 0 : n.transactionHashes;
    s && e.push(...s);
  } catch (s) {
    console.warn("getWalletSendCallsHashes failed: ", s);
  }
  return e;
}
const cd = "did:pkh:", t_ = { eip155: "Ethereum", solana: "Solana", bip122: "Bitcoin" }, r_ = (t) => t ? t_[t] || t : "", _i = (t) => t == null ? void 0 : t.split(":"), n_ = (t) => {
  const e = t && _i(t);
  if (e) return t.includes(cd) ? e[3] : e[1];
}, s_ = (t) => {
  const e = t && _i(t);
  if (e) return t.includes(cd) ? e[2] : e[0];
}, Wo = (t) => {
  const e = t && _i(t);
  if (e) return e[2] + ":" + e[3];
}, Qs = (t) => {
  const e = t && _i(t);
  if (e) return e.pop();
};
async function kl(t) {
  const { cacao: e, projectId: r } = t, { s: n, p: s } = e;
  let i;
  try {
    i = ld(s, s.iss);
  } catch {
    return !1;
  }
  const o = Qs(s.iss);
  return await Vx(o, i, n, Wo(s.iss), r);
}
const ld = (t, e) => {
  const r = s_(e);
  if (!r) throw new Error("Invalid issuer: " + e);
  const n = `${t.domain} wants you to sign in with your ${r_(r)} account:`, s = Qs(e);
  if (!t.aud && !t.uri) throw new Error("Either `aud` or `uri` is required to construct the message");
  let i = t.statement || void 0;
  const o = `URI: ${t.aud || t.uri}`, a = `Version: ${t.version}`, c = `Chain ID: ${n_(e)}`, l = `Nonce: ${t.nonce}`, u = `Issued At: ${t.iat}`, h = t.exp ? `Expiration Time: ${t.exp}` : void 0, f = t.nbf ? `Not Before: ${t.nbf}` : void 0, d = t.requestId ? `Request ID: ${t.requestId}` : void 0, p = t.resources ? `Resources:${t.resources.map((m) => `
- ${m}`).join("")}` : void 0, g = Ns(t.resources);
  if (g) {
    const m = Wn(g);
    i = d_(i, m);
  }
  if (i && /\r|\n/.test(i)) throw new Error("Statement must not contain line breaks (`\\r` or `\\n`)");
  return [n, s, "", i, "", o, a, c, l, u, h, f, d, p].filter((m) => m != null).join(`
`);
};
function i_(t) {
  const e = JSON.stringify(t), r = new TextEncoder().encode(e), n = new Array(r.length);
  for (let s = 0; s < r.length; s++) n[s] = String.fromCharCode(r[s]);
  return btoa(n.join(""));
}
function o_(t) {
  const e = t + "=".repeat((4 - t.length % 4) % 4), r = atob(e), n = new Uint8Array(r.length);
  for (let s = 0; s < r.length; s++) n[s] = r.charCodeAt(s);
  return JSON.parse(new TextDecoder().decode(n));
}
function Lr(t) {
  if (!t) throw new Error("No recap provided, value is undefined");
  if (!t.att) throw new Error("No `att` property found");
  const e = Object.keys(t.att);
  if (!(e != null && e.length)) throw new Error("No resources found in `att` property");
  e.forEach((r) => {
    const n = t.att[r];
    if (Array.isArray(n)) throw new Error(`Resource must be an object: ${r}`);
    if (typeof n != "object") throw new Error(`Resource must be an object: ${r}`);
    if (!Object.keys(n).length) throw new Error(`Resource object is empty: ${r}`);
    Object.keys(n).forEach((s) => {
      const i = n[s];
      if (!Array.isArray(i)) throw new Error(`Ability limits ${s} must be an array of objects, found: ${i}`);
      if (!i.length) throw new Error(`Value of ${s} is empty array, must be an array with objects`);
      i.forEach((o) => {
        if (typeof o != "object") throw new Error(`Ability limits (${s}) must be an array of objects, found: ${o}`);
      });
    });
  });
}
function a_(t, e, r, n = {}) {
  return r == null || r.sort((s, i) => s.localeCompare(i)), { att: { [t]: c_(e, r, n) } };
}
function c_(t, e, r = {}) {
  e = e == null ? void 0 : e.sort((s, i) => s.localeCompare(i));
  const n = e.map((s) => ({ [`${t}/${s}`]: [r] }));
  return Object.assign({}, ...n);
}
function ud(t) {
  return Lr(t), `urn:recap:${i_(t).replace(/=/g, "")}`;
}
function Wn(t) {
  const e = o_(t.replace("urn:recap:", ""));
  return Lr(e), e;
}
function l_(t, e, r) {
  const n = a_(t, e, r);
  return ud(n);
}
function u_(t) {
  return t && t.includes("urn:recap:");
}
function h_(t, e) {
  const r = Wn(t), n = Wn(e), s = f_(r, n);
  return ud(s);
}
function f_(t, e) {
  Lr(t), Lr(e);
  const r = Object.keys(t.att).concat(Object.keys(e.att)).sort((s, i) => s.localeCompare(i)), n = { att: {} };
  return r.forEach((s) => {
    var i, o;
    Object.keys(((i = t.att) == null ? void 0 : i[s]) || {}).concat(Object.keys(((o = e.att) == null ? void 0 : o[s]) || {})).sort((a, c) => a.localeCompare(c)).forEach((a) => {
      var c, l;
      n.att[s] = { ...n.att[s], [a]: ((c = t.att[s]) == null ? void 0 : c[a]) || ((l = e.att[s]) == null ? void 0 : l[a]) };
    });
  }), n;
}
function d_(t = "", e) {
  Lr(e);
  const r = "I further authorize the stated URI to perform the following actions on my behalf: ";
  if (t.includes(r)) return t;
  const n = [];
  let s = 0;
  Object.keys(e.att).forEach((a) => {
    const c = Object.keys(e.att[a]).map((h) => ({ ability: h.split("/")[0], action: h.split("/")[1] }));
    c.sort((h, f) => h.action.localeCompare(f.action));
    const l = {};
    c.forEach((h) => {
      l[h.ability] || (l[h.ability] = []), l[h.ability].push(h.action);
    });
    const u = Object.keys(l).map((h) => (s++, `(${s}) '${h}': '${l[h].join("', '")}' for '${a}'.`));
    n.push(u.join(", ").replace(".,", "."));
  });
  const i = n.join(" "), o = `${r}${i}`;
  return `${t ? t + " " : ""}${o}`;
}
function Ml(t) {
  var n;
  const e = Wn(t);
  Lr(e);
  const r = (n = e.att) == null ? void 0 : n.eip155;
  return r ? Object.keys(r).map((s) => s.split("/")[1]) : [];
}
function Fl(t) {
  const e = Wn(t);
  Lr(e);
  const r = [];
  return Object.values(e.att).forEach((n) => {
    Object.values(n).forEach((s) => {
      var i;
      (i = s == null ? void 0 : s[0]) != null && i.chains && r.push(s[0].chains);
    });
  }), [...new Set(r.flat())];
}
function Ns(t) {
  if (!t) return;
  const e = t == null ? void 0 : t[t.length - 1];
  return u_(e) ? e : void 0;
}
const hd = "base10", Le = "base16", Se = "base64pad", vt = "base64url", cs = "utf8", fd = 0, Ft = 1, kr = 2, p_ = 0, ql = 1, Ln = 12, Na = 32;
function g_() {
  const t = jo.utils.randomPrivateKey(), e = jo.getPublicKey(t);
  return { privateKey: Ee(t, Le), publicKey: Ee(e, Le) };
}
function Go() {
  const t = Hr(Na);
  return Ee(t, Le);
}
function y_(t, e) {
  const r = jo.getSharedSecret(Pe(t, Le), Pe(e, Le)), n = Ev(Ei, r, void 0, void 0, Na);
  return Ee(n, Le);
}
function Us(t) {
  const e = Ei(Pe(t, Le));
  return Ee(e, Le);
}
function rt(t) {
  const e = Ei(Pe(t, cs));
  return Ee(e, Le);
}
function dd(t) {
  return Pe(`${t}`, hd);
}
function Mr(t) {
  return Number(Ee(t, hd));
}
function pd(t) {
  return t.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function ei(t) {
  const e = t.replace(/-/g, "+").replace(/_/g, "/"), r = (4 - e.length % 4) % 4;
  return e + "=".repeat(r);
}
function w_(t) {
  const e = dd(typeof t.type < "u" ? t.type : fd);
  if (Mr(e) === Ft && typeof t.senderPublicKey > "u") throw new Error("Missing sender public key for type 1 envelope");
  const r = typeof t.senderPublicKey < "u" ? Pe(t.senderPublicKey, Le) : void 0, n = typeof t.iv < "u" ? Pe(t.iv, Le) : Hr(Ln), s = Pe(t.symKey, Le), i = mf(s, n).encrypt(Pe(t.message, cs)), o = gd({ type: e, sealed: i, iv: n, senderPublicKey: r });
  return t.encoding === vt ? pd(o) : o;
}
function m_(t) {
  const e = Pe(t.symKey, Le), { sealed: r, iv: n } = Gn({ encoded: t.encoded, encoding: t.encoding }), s = mf(e, n).decrypt(r);
  if (s === null) throw new Error("Failed to decrypt");
  return Ee(s, cs);
}
function b_(t, e) {
  const r = dd(kr), n = Hr(Ln), s = Pe(t, cs), i = gd({ type: r, sealed: s, iv: n });
  return e === vt ? pd(i) : i;
}
function E_(t, e) {
  const { sealed: r } = Gn({ encoded: t, encoding: e });
  return Ee(r, cs);
}
function gd(t) {
  if (Mr(t.type) === kr) return Ee(Pr([t.type, t.sealed]), Se);
  if (Mr(t.type) === Ft) {
    if (typeof t.senderPublicKey > "u") throw new Error("Missing sender public key for type 1 envelope");
    return Ee(Pr([t.type, t.senderPublicKey, t.iv, t.sealed]), Se);
  }
  return Ee(Pr([t.type, t.iv, t.sealed]), Se);
}
function Gn(t) {
  const e = (t.encoding || Se) === vt ? ei(t.encoded) : t.encoded, r = Pe(e, Se), n = r.slice(p_, ql), s = ql;
  if (Mr(n) === Ft) {
    const c = s + Na, l = c + Ln, u = r.slice(s, c), h = r.slice(c, l), f = r.slice(l);
    return { type: n, sealed: f, iv: h, senderPublicKey: u };
  }
  if (Mr(n) === kr) {
    const c = r.slice(s), l = Hr(Ln);
    return { type: n, sealed: c, iv: l };
  }
  const i = s + Ln, o = r.slice(s, i), a = r.slice(i);
  return { type: n, sealed: a, iv: o };
}
function v_(t, e) {
  const r = Gn({ encoded: t, encoding: e == null ? void 0 : e.encoding });
  return yd({ type: Mr(r.type), senderPublicKey: typeof r.senderPublicKey < "u" ? Ee(r.senderPublicKey, Le) : void 0, receiverPublicKey: e == null ? void 0 : e.receiverPublicKey });
}
function yd(t) {
  const e = (t == null ? void 0 : t.type) || fd;
  if (e === Ft) {
    if (typeof (t == null ? void 0 : t.senderPublicKey) > "u") throw new Error("missing sender public key");
    if (typeof (t == null ? void 0 : t.receiverPublicKey) > "u") throw new Error("missing receiver public key");
  }
  return { type: e, senderPublicKey: t == null ? void 0 : t.senderPublicKey, receiverPublicKey: t == null ? void 0 : t.receiverPublicKey };
}
function zl(t) {
  return t.type === Ft && typeof t.senderPublicKey == "string" && typeof t.receiverPublicKey == "string";
}
function jl(t) {
  return t.type === kr;
}
function x_(t) {
  const e = Pe(ei(t.x), Se), r = Pe(ei(t.y), Se);
  return Pr([new Uint8Array([4]), e, r]);
}
function __(t, e) {
  const [r, n, s] = t.split("."), i = Pe(ei(s), Se);
  if (i.length !== 64) throw new Error("Invalid signature length");
  const o = i.slice(0, 32), a = i.slice(32, 64), c = `${r}.${n}`, l = Ei(c), u = x_(e);
  if (!cx.verify(Pr([o, a]), l, u)) throw new Error("Invalid signature");
  return $o(t).payload;
}
const S_ = "irn";
function ti(t) {
  return (t == null ? void 0 : t.relay) || { protocol: S_ };
}
function en(t) {
  const e = lx[t];
  if (typeof e > "u") throw new Error(`Relay Protocol not supported: ${t}`);
  return e;
}
function I_(t, e = "-") {
  const r = {}, n = "relay" + e;
  return Object.keys(t).forEach((s) => {
    if (s.startsWith(n)) {
      const i = s.replace(n, ""), o = t[s];
      r[i] = o;
    }
  }), r;
}
function Hl(t) {
  if (!t.includes("wc:")) {
    const l = od(t);
    l != null && l.includes("wc:") && (t = l);
  }
  t = t.includes("wc://") ? t.replace("wc://", "") : t, t = t.includes("wc:") ? t.replace("wc:", "") : t;
  const e = t.indexOf(":"), r = t.indexOf("?") !== -1 ? t.indexOf("?") : void 0, n = t.substring(0, e), s = t.substring(e + 1, r).split("@"), i = typeof r < "u" ? t.substring(r) : "", o = new URLSearchParams(i), a = Object.fromEntries(o.entries()), c = typeof a.methods == "string" ? a.methods.split(",") : void 0;
  return { protocol: n, topic: D_(s[0]), version: parseInt(s[1], 10), symKey: a.symKey, relay: I_(a), methods: c, expiryTimestamp: a.expiryTimestamp ? parseInt(a.expiryTimestamp, 10) : void 0 };
}
function D_(t) {
  return t.startsWith("//") ? t.substring(2) : t;
}
function A_(t, e = "-") {
  const r = "relay", n = {};
  return Object.keys(t).forEach((s) => {
    const i = s, o = r + e + i;
    t[i] && (n[o] = t[i]);
  }), n;
}
function Kl(t) {
  const e = new URLSearchParams(), r = { ...A_(t.relay), symKey: t.symKey, ...t.expiryTimestamp && { expiryTimestamp: t.expiryTimestamp.toString() }, ...t.methods && { methods: t.methods.join(",") } };
  return Object.entries(r).sort(([n], [s]) => n.localeCompare(s)).forEach(([n, s]) => {
    s !== void 0 && e.append(n, String(s));
  }), `${t.protocol}:${t.topic}@${t.version}?${e}`;
}
function Os(t, e, r) {
  return `${t}?wc_ev=${r}&topic=${e}`;
}
function mn(t) {
  const e = [];
  return t.forEach((r) => {
    const [n, s] = r.split(":");
    e.push(`${n}:${s}`);
  }), e;
}
function wd(t) {
  const e = [];
  return Object.values(t).forEach((r) => {
    e.push(...mn(r.accounts));
  }), [...new Set(e)];
}
function O_(t) {
  const e = [];
  return Object.values(t).forEach((r) => {
    e.push(...r.methods);
  }), [...new Set(e)];
}
function $_(t) {
  const e = [];
  return Object.values(t).forEach((r) => {
    e.push(...r.events);
  }), [...new Set(e)];
}
function T_(t, e) {
  const r = [];
  return Object.values(t).forEach((n) => {
    mn(n.accounts).includes(e) && r.push(...n.methods);
  }), r;
}
function B_(t, e) {
  const r = [];
  return Object.values(t).forEach((n) => {
    mn(n.accounts).includes(e) && r.push(...n.events);
  }), r;
}
function md(t) {
  return t.includes(":");
}
function R_(t) {
  return md(t) ? t.split(":")[0] : t;
}
function Vl(t) {
  var r, n, s;
  const e = {};
  if (!Yn(t)) return e;
  for (const [i, o] of Object.entries(t)) {
    const a = md(i) ? [i] : o.chains, c = o.methods || [], l = o.events || [], u = R_(i);
    e[u] = { ...e[u], chains: Cr(a, (r = e[u]) == null ? void 0 : r.chains), methods: Cr(c, (n = e[u]) == null ? void 0 : n.methods), events: Cr(l, (s = e[u]) == null ? void 0 : s.events) };
  }
  return e;
}
function P_(t) {
  const e = {};
  return t == null || t.forEach((r) => {
    var i;
    const [n, s] = r.split(":");
    e[n] || (e[n] = { accounts: [], chains: [], events: [], methods: [] }), e[n].accounts.push(r), (i = e[n].chains) == null || i.push(`${n}:${s}`);
  }), e;
}
function Wl(t, e) {
  e = e.map((n) => n.replace("did:pkh:", ""));
  const r = P_(e);
  for (const [n, s] of Object.entries(r)) s.methods ? s.methods = Cr(s.methods, t) : s.methods = t, s.events = ["chainChanged", "accountsChanged"];
  return r;
}
function C_(t, e) {
  var o, a, c, l, u, h;
  const r = Vl(t), n = Vl(e), s = {}, i = Object.keys(r).concat(Object.keys(n));
  for (const f of i) s[f] = { chains: Cr((o = r[f]) == null ? void 0 : o.chains, (a = n[f]) == null ? void 0 : a.chains), methods: Cr((c = r[f]) == null ? void 0 : c.methods, (l = n[f]) == null ? void 0 : l.methods), events: Cr((u = r[f]) == null ? void 0 : u.events, (h = n[f]) == null ? void 0 : h.events) };
  return s;
}
function pn(t, e) {
  return !!Array.isArray(t);
}
function Yn(t) {
  return Object.getPrototypeOf(t) === Object.prototype && Object.keys(t).length;
}
function ge(t) {
  return typeof t > "u";
}
function ue(t, e) {
  return e && ge(t) ? !0 : typeof t == "string" && !!t.trim().length;
}
function Ua(t, e) {
  return e && ge(t) ? !0 : typeof t == "number" && !isNaN(t);
}
function N_(t, e) {
  const { requiredNamespaces: r } = e, n = Object.keys(t.namespaces), s = Object.keys(r);
  let i = !0;
  return Tr(s, n) ? (n.forEach((o) => {
    const { accounts: a, methods: c, events: l } = t.namespaces[o], u = mn(a), h = r[o];
    (!Tr(td(o, h), u) || !Tr(h.methods, c) || !Tr(h.events, l)) && (i = !1);
  }), i) : !1;
}
function ri(t) {
  return ue(t, !1) && t.includes(":") ? t.split(":").length === 2 : !1;
}
function U_(t) {
  if (ue(t, !1) && t.includes(":")) {
    const e = t.split(":");
    if (e.length === 3) {
      const r = e[0] + ":" + e[1];
      return !!e[2] && ri(r);
    }
  }
  return !1;
}
function L_(t) {
  function e(r) {
    try {
      return typeof new URL(r) < "u";
    } catch {
      return !1;
    }
  }
  try {
    if (ue(t, !1)) {
      if (e(t)) return !0;
      const r = od(t);
      return e(r);
    }
  } catch {
  }
  return !1;
}
function k_(t) {
  var e;
  return (e = t == null ? void 0 : t.proposer) == null ? void 0 : e.publicKey;
}
function M_(t) {
  return t == null ? void 0 : t.topic;
}
function F_(t, e) {
  let r = null;
  return ue(t == null ? void 0 : t.publicKey, !1) || (r = F("MISSING_OR_INVALID", `${e} controller public key should be a string`)), r;
}
function Gl(t) {
  let e = !0;
  return pn(t) ? t.length && (e = t.every((r) => ue(r, !1))) : e = !1, e;
}
function q_(t, e, r) {
  let n = null;
  return pn(e) && e.length ? e.forEach((s) => {
    n || ri(s) || (n = oe("UNSUPPORTED_CHAINS", `${r}, chain ${s} should be a string and conform to "namespace:chainId" format`));
  }) : ri(t) || (n = oe("UNSUPPORTED_CHAINS", `${r}, chains must be defined as "namespace:chainId" e.g. "eip155:1": {...} in the namespace key OR as an array of CAIP-2 chainIds e.g. eip155: { chains: ["eip155:1", "eip155:5"] }`)), n;
}
function z_(t, e, r) {
  let n = null;
  return Object.entries(t).forEach(([s, i]) => {
    if (n) return;
    const o = q_(s, td(s, i), `${e} ${r}`);
    o && (n = o);
  }), n;
}
function j_(t, e) {
  let r = null;
  return pn(t) ? t.forEach((n) => {
    r || U_(n) || (r = oe("UNSUPPORTED_ACCOUNTS", `${e}, account ${n} should be a string and conform to "namespace:chainId:address" format`));
  }) : r = oe("UNSUPPORTED_ACCOUNTS", `${e}, accounts should be an array of strings conforming to "namespace:chainId:address" format`), r;
}
function H_(t, e) {
  let r = null;
  return Object.values(t).forEach((n) => {
    if (r) return;
    const s = j_(n == null ? void 0 : n.accounts, `${e} namespace`);
    s && (r = s);
  }), r;
}
function K_(t, e) {
  let r = null;
  return Gl(t == null ? void 0 : t.methods) ? Gl(t == null ? void 0 : t.events) || (r = oe("UNSUPPORTED_EVENTS", `${e}, events should be an array of strings or empty array for no events`)) : r = oe("UNSUPPORTED_METHODS", `${e}, methods should be an array of strings or empty array for no methods`), r;
}
function bd(t, e) {
  let r = null;
  return Object.values(t).forEach((n) => {
    if (r) return;
    const s = K_(n, `${e}, namespace`);
    s && (r = s);
  }), r;
}
function V_(t, e, r) {
  let n = null;
  if (t && Yn(t)) {
    const s = bd(t, e);
    s && (n = s);
    const i = z_(t, e, r);
    i && (n = i);
  } else n = F("MISSING_OR_INVALID", `${e}, ${r} should be an object with data`);
  return n;
}
function fo(t, e) {
  let r = null;
  if (t && Yn(t)) {
    const n = bd(t, e);
    n && (r = n);
    const s = H_(t, e);
    s && (r = s);
  } else r = F("MISSING_OR_INVALID", `${e}, namespaces should be an object with data`);
  return r;
}
function Ed(t) {
  return ue(t.protocol, !0);
}
function W_(t, e) {
  let r = !1;
  return t ? t && pn(t) && t.length && t.forEach((n) => {
    r = Ed(n);
  }) : r = !0, r;
}
function G_(t) {
  return typeof t == "number";
}
function Fe(t) {
  return typeof t < "u" && typeof t !== null;
}
function Y_(t) {
  return !(!t || typeof t != "object" || !t.code || !Ua(t.code, !1) || !t.message || !ue(t.message, !1));
}
function Z_(t) {
  return !(ge(t) || !ue(t.method, !1));
}
function X_(t) {
  return !(ge(t) || ge(t.result) && ge(t.error) || !Ua(t.id, !1) || !ue(t.jsonrpc, !1));
}
function J_(t) {
  return !(ge(t) || !ue(t.name, !1));
}
function Yl(t, e) {
  return !(!ri(e) || !wd(t).includes(e));
}
function Q_(t, e, r) {
  return ue(r, !1) ? T_(t, e).includes(r) : !1;
}
function e3(t, e, r) {
  return ue(r, !1) ? B_(t, e).includes(r) : !1;
}
function Zl(t, e, r) {
  let n = null;
  const s = t3(t), i = r3(e), o = Object.keys(s), a = Object.keys(i), c = Xl(Object.keys(t)), l = Xl(Object.keys(e)), u = c.filter((h) => !l.includes(h));
  return u.length && (n = F("NON_CONFORMING_NAMESPACES", `${r} namespaces keys don't satisfy requiredNamespaces.
      Required: ${u.toString()}
      Received: ${Object.keys(e).toString()}`)), Tr(o, a) || (n = F("NON_CONFORMING_NAMESPACES", `${r} namespaces chains don't satisfy required namespaces.
      Required: ${o.toString()}
      Approved: ${a.toString()}`)), Object.keys(e).forEach((h) => {
    if (!h.includes(":") || n) return;
    const f = mn(e[h].accounts);
    f.includes(h) || (n = F("NON_CONFORMING_NAMESPACES", `${r} namespaces accounts don't satisfy namespace accounts for ${h}
        Required: ${h}
        Approved: ${f.toString()}`));
  }), o.forEach((h) => {
    n || (Tr(s[h].methods, i[h].methods) ? Tr(s[h].events, i[h].events) || (n = F("NON_CONFORMING_NAMESPACES", `${r} namespaces events don't satisfy namespace events for ${h}`)) : n = F("NON_CONFORMING_NAMESPACES", `${r} namespaces methods don't satisfy namespace methods for ${h}`));
  }), n;
}
function t3(t) {
  const e = {};
  return Object.keys(t).forEach((r) => {
    var n;
    r.includes(":") ? e[r] = t[r] : (n = t[r].chains) == null || n.forEach((s) => {
      e[s] = { methods: t[r].methods, events: t[r].events };
    });
  }), e;
}
function Xl(t) {
  return [...new Set(t.map((e) => e.includes(":") ? e.split(":")[0] : e))];
}
function r3(t) {
  const e = {};
  return Object.keys(t).forEach((r) => {
    var n;
    r.includes(":") ? e[r] = t[r] : (n = mn(t[r].accounts)) == null || n.forEach((s) => {
      e[s] = { accounts: t[r].accounts.filter((i) => i.includes(`${s}:`)), methods: t[r].methods, events: t[r].events };
    });
  }), e;
}
function n3(t, e) {
  return Ua(t, !1) && t <= e.max && t >= e.min;
}
function Jl() {
  const t = as();
  return new Promise((e) => {
    switch (t) {
      case Ye.browser:
        e(s3());
        break;
      case Ye.reactNative:
        e(i3());
        break;
      case Ye.node:
        e(o3());
        break;
      default:
        e(!0);
    }
  });
}
function s3() {
  return wn() && (navigator == null ? void 0 : navigator.onLine);
}
async function i3() {
  var t;
  return wr() && typeof global < "u" && (global != null && global.NetInfo) ? (t = await (global == null ? void 0 : global.NetInfo.fetch())) == null ? void 0 : t.isConnected : !0;
}
function o3() {
  return !0;
}
function a3(t) {
  switch (as()) {
    case Ye.browser:
      c3(t);
      break;
    case Ye.reactNative:
      l3(t);
      break;
  }
}
function c3(t) {
  !wr() && wn() && (window.addEventListener("online", () => t(!0)), window.addEventListener("offline", () => t(!1)));
}
function l3(t) {
  wr() && typeof global < "u" && (global != null && global.NetInfo) && (global == null || global.NetInfo.addEventListener((e) => t(e == null ? void 0 : e.isConnected)));
}
function u3() {
  var t;
  return wn() && Nr() ? ((t = Nr()) == null ? void 0 : t.visibilityState) === "visible" : !0;
}
const po = {};
class $n {
  static get(e) {
    return po[e];
  }
  static set(e, r) {
    po[e] = r;
  }
  static delete(e) {
    delete po[e];
  }
}
function h3(t) {
  const e = is.decode(t);
  if (e.length < 33) throw new Error("Too short to contain a public key");
  return e.slice(1, 33);
}
function f3({ publicKey: t, signature: e, payload: r }) {
  var d;
  const n = ni(r.method), s = 128 | parseInt(((d = r.version) == null ? void 0 : d.toString()) || "4"), i = g3(r.address), o = r.era === "00" ? new Uint8Array([0]) : ni(r.era);
  if (o.length !== 1 && o.length !== 2) throw new Error("Invalid era length");
  const a = parseInt(r.nonce, 16), c = new Uint8Array([a & 255, a >> 8 & 255]), l = BigInt(`0x${p3(r.tip)}`), u = w3(l), h = new Uint8Array([0, ...t, i, ...e, ...o, ...c, ...u, ...n]), f = y3(h.length + 1);
  return new Uint8Array([...f, s, ...h]);
}
function d3(t) {
  const e = ni(t), r = vx.blake2b(e, void 0, 32);
  return "0x" + Ee(r, "base16");
}
function ni(t) {
  return new Uint8Array(t.replace(/^0x/, "").match(/.{1,2}/g).map((e) => parseInt(e, 16)));
}
function p3(t) {
  return t.startsWith("0x") ? t.slice(2) : t;
}
function g3(t) {
  const e = is.decode(t)[0];
  return e === 42 ? 0 : e === 60 ? 2 : 1;
}
function y3(t) {
  if (t < 64) return new Uint8Array([t << 2]);
  if (t < 16384) {
    const e = t << 2 | 1;
    return new Uint8Array([e & 255, e >> 8 & 255]);
  } else if (t < 1 << 30) {
    const e = t << 2 | 2;
    return new Uint8Array([e & 255, e >> 8 & 255, e >> 16 & 255, e >> 24 & 255]);
  } else throw new Error("Compact encoding > 2^30 not supported");
}
function w3(t) {
  if (t < 1n << 6n) return new Uint8Array([Number(t << 2n)]);
  if (t < 1n << 14n) {
    const e = t << 2n | 0x01n;
    return new Uint8Array([Number(e & 0xffn), Number(e >> 8n & 0xffn)]);
  } else if (t < 1n << 30n) {
    const e = t << 2n | 0x02n;
    return new Uint8Array([Number(e & 0xffn), Number(e >> 8n & 0xffn), Number(e >> 16n & 0xffn), Number(e >> 24n & 0xffn)]);
  } else throw new Error("BigInt compact encoding not supported > 2^30");
}
function m3(t) {
  const e = ni(t.signature), r = h3(t.transaction.address), n = f3({ publicKey: r, signature: e, payload: t.transaction }), s = Ee(n, "base16");
  return d3(s);
}
const b3 = /* @__PURE__ */ new Set(["TransferFactory_Transfer", "DelegateProxy_TransferFactory_Transfer"]);
function E3(t) {
  var n, s;
  const e = t == null ? void 0 : t.commands;
  if (!Array.isArray(e)) return [];
  const r = [];
  for (const i of e) {
    const o = i == null ? void 0 : i.ExerciseCommand;
    if (!o || !b3.has(o.choice)) continue;
    const a = (n = o.choiceArgument) == null ? void 0 : n.transfer;
    !(a != null && a.amount) || !((s = a == null ? void 0 : a.instrumentId) != null && s.id) || r.push({ amount: String(a.amount), instrumentId: String(a.instrumentId.id) });
  }
  return r;
}
function v3(t, e) {
  var s;
  const r = (s = e == null ? void 0 : e.payload) == null ? void 0 : s.updateId;
  if (!r) return [];
  const n = E3(t);
  return n.length === 0 ? [String(r)] : n.map((i) => `${r}:${i.amount}:${i.instrumentId}`);
}
function vd({ logger: t, name: e }) {
  const r = typeof t == "string" ? Ou({ opts: { level: t, name: e } }).logger : t;
  return r.level = typeof t == "string" ? t : t.level, r;
}
const x3 = "PARSE_ERROR", _3 = "INVALID_REQUEST", S3 = "METHOD_NOT_FOUND", I3 = "INVALID_PARAMS", xd = "INTERNAL_ERROR", La = "SERVER_ERROR", D3 = [-32700, -32600, -32601, -32602, -32603], kn = {
  [x3]: { code: -32700, message: "Parse error" },
  [_3]: { code: -32600, message: "Invalid Request" },
  [S3]: { code: -32601, message: "Method not found" },
  [I3]: { code: -32602, message: "Invalid params" },
  [xd]: { code: -32603, message: "Internal error" },
  [La]: { code: -32e3, message: "Server error" }
}, _d = La;
function A3(t) {
  return D3.includes(t);
}
function Ql(t) {
  return Object.keys(kn).includes(t) ? kn[t] : kn[_d];
}
function O3(t) {
  const e = Object.values(kn).find((r) => r.code === t);
  return e || kn[_d];
}
function $3(t, e, r) {
  return t.message.includes("getaddrinfo ENOTFOUND") || t.message.includes("connect ECONNREFUSED") ? new Error(`Unavailable ${r} RPC url at ${e}`) : t;
}
var Sd = {}, $t = {}, eu;
function T3() {
  if (eu) return $t;
  eu = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.isBrowserCryptoAvailable = $t.getSubtleCrypto = $t.getBrowerCrypto = void 0;
  function t() {
    return (Vr == null ? void 0 : Vr.crypto) || (Vr == null ? void 0 : Vr.msCrypto) || {};
  }
  $t.getBrowerCrypto = t;
  function e() {
    const n = t();
    return n.subtle || n.webkitSubtle;
  }
  $t.getSubtleCrypto = e;
  function r() {
    return !!t() && !!e();
  }
  return $t.isBrowserCryptoAvailable = r, $t;
}
var Tt = {}, tu;
function B3() {
  if (tu) return Tt;
  tu = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.isBrowser = Tt.isNode = Tt.isReactNative = void 0;
  function t() {
    return typeof document > "u" && typeof navigator < "u" && navigator.product === "ReactNative";
  }
  Tt.isReactNative = t;
  function e() {
    return typeof process < "u" && typeof process.versions < "u" && typeof process.versions.node < "u";
  }
  Tt.isNode = e;
  function r() {
    return !t() && !e();
  }
  return Tt.isBrowser = r, Tt;
}
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const e = Zn;
  e.__exportStar(T3(), t), e.__exportStar(B3(), t);
})(Sd);
function bt(t = 3) {
  const e = Date.now() * Math.pow(10, t), r = Math.floor(Math.random() * Math.pow(10, t));
  return e + r;
}
function ur(t = 6) {
  return BigInt(bt(t));
}
function Ut(t, e, r) {
  return {
    id: r || bt(),
    jsonrpc: "2.0",
    method: t,
    params: e
  };
}
function si(t, e) {
  return {
    id: t,
    jsonrpc: "2.0",
    result: e
  };
}
function ka(t, e, r) {
  return {
    id: t,
    jsonrpc: "2.0",
    error: R3(e)
  };
}
function R3(t, e) {
  return typeof t > "u" ? Ql(xd) : (typeof t == "string" && (t = Object.assign(Object.assign({}, Ql(La)), { message: t })), A3(t.code) && (t = O3(t.code)), t);
}
class P3 {
}
class C3 extends P3 {
  constructor() {
    super();
  }
}
class N3 extends C3 {
  constructor(e) {
    super();
  }
}
const U3 = "^wss?:";
function L3(t) {
  const e = t.match(new RegExp(/^\w+:/, "gi"));
  if (!(!e || !e.length))
    return e[0];
}
function k3(t, e) {
  const r = L3(t);
  return typeof r > "u" ? !1 : new RegExp(e).test(r);
}
function ru(t) {
  return k3(t, U3);
}
function M3(t) {
  return new RegExp("wss?://localhost(:d{2,5})?").test(t);
}
function Id(t) {
  return typeof t == "object" && "id" in t && "jsonrpc" in t && t.jsonrpc === "2.0";
}
function Ma(t) {
  return Id(t) && "method" in t;
}
function Si(t) {
  return Id(t) && (Et(t) || nt(t));
}
function Et(t) {
  return "result" in t;
}
function nt(t) {
  return "error" in t;
}
class F3 extends N3 {
  constructor(e) {
    super(e), this.events = new dt.EventEmitter(), this.hasRegisteredEventListeners = !1, this.connection = this.setConnection(e), this.connection.connected && this.registerEventListeners();
  }
  async connect(e = this.connection) {
    await this.open(e);
  }
  async disconnect() {
    await this.close();
  }
  on(e, r) {
    this.events.on(e, r);
  }
  once(e, r) {
    this.events.once(e, r);
  }
  off(e, r) {
    this.events.off(e, r);
  }
  removeListener(e, r) {
    this.events.removeListener(e, r);
  }
  async request(e, r) {
    return this.requestStrict(Ut(e.method, e.params || [], e.id || ur().toString()), r);
  }
  async requestStrict(e, r) {
    return new Promise(async (n, s) => {
      if (!this.connection.connected) try {
        await this.open();
      } catch (i) {
        s(i);
      }
      this.events.on(`${e.id}`, (i) => {
        nt(i) ? s(i.error) : n(i.result);
      });
      try {
        await this.connection.send(e, r);
      } catch (i) {
        s(i);
      }
    });
  }
  setConnection(e = this.connection) {
    return e;
  }
  onPayload(e) {
    this.events.emit("payload", e), Si(e) ? this.events.emit(`${e.id}`, e) : this.events.emit("message", { type: e.method, data: e.params });
  }
  onClose(e) {
    e && e.code === 3e3 && this.events.emit("error", new Error(`WebSocket connection closed abnormally with code: ${e.code} ${e.reason ? `(${e.reason})` : ""}`)), this.events.emit("disconnect");
  }
  async open(e = this.connection) {
    this.connection === e && this.connection.connected || (this.connection.connected && this.close(), typeof e == "string" && (await this.connection.open(e), e = this.connection), this.connection = this.setConnection(e), await this.connection.open(), this.registerEventListeners(), this.events.emit("connect"));
  }
  async close() {
    await this.connection.close();
  }
  registerEventListeners() {
    this.hasRegisteredEventListeners || (this.connection.on("payload", (e) => this.onPayload(e)), this.connection.on("close", (e) => this.onClose(e)), this.connection.on("error", (e) => this.events.emit("error", e)), this.connection.on("register_error", (e) => this.onClose()), this.hasRegisteredEventListeners = !0);
  }
}
const q3 = () => typeof WebSocket < "u" ? WebSocket : typeof global < "u" && typeof global.WebSocket < "u" ? global.WebSocket : typeof window < "u" && typeof window.WebSocket < "u" ? window.WebSocket : typeof self < "u" && typeof self.WebSocket < "u" ? self.WebSocket : require("ws"), z3 = () => typeof WebSocket < "u" || typeof global < "u" && typeof global.WebSocket < "u" || typeof window < "u" && typeof window.WebSocket < "u" || typeof self < "u" && typeof self.WebSocket < "u", nu = (t) => t.split("?")[0], su = 10, j3 = q3();
class H3 {
  constructor(e) {
    if (this.url = e, this.events = new dt.EventEmitter(), this.registering = !1, !ru(e)) throw new Error(`Provided URL is not compatible with WebSocket connection: ${e}`);
    this.url = e;
  }
  get connected() {
    return typeof this.socket < "u";
  }
  get connecting() {
    return this.registering;
  }
  on(e, r) {
    this.events.on(e, r);
  }
  once(e, r) {
    this.events.once(e, r);
  }
  off(e, r) {
    this.events.off(e, r);
  }
  removeListener(e, r) {
    this.events.removeListener(e, r);
  }
  async open(e = this.url) {
    await this.register(e);
  }
  async close() {
    return new Promise((e, r) => {
      if (typeof this.socket > "u") {
        r(new Error("Connection already closed"));
        return;
      }
      this.socket.onclose = (n) => {
        this.onClose(n), e();
      }, this.socket.close();
    });
  }
  async send(e) {
    typeof this.socket > "u" && (this.socket = await this.register());
    try {
      this.socket.send(Jn(e));
    } catch (r) {
      this.onError(e.id, r);
    }
  }
  register(e = this.url) {
    if (!ru(e)) throw new Error(`Provided URL is not compatible with WebSocket connection: ${e}`);
    if (this.registering) {
      const r = this.events.getMaxListeners();
      return (this.events.listenerCount("register_error") >= r || this.events.listenerCount("open") >= r) && this.events.setMaxListeners(r + 1), new Promise((n, s) => {
        this.events.once("register_error", (i) => {
          this.resetMaxListeners(), s(i);
        }), this.events.once("open", () => {
          if (this.resetMaxListeners(), typeof this.socket > "u") return s(new Error("WebSocket connection is missing or invalid"));
          n(this.socket);
        });
      });
    }
    return this.url = e, this.registering = !0, new Promise((r, n) => {
      const s = Sd.isReactNative() ? void 0 : { rejectUnauthorized: !M3(e) }, i = new j3(e, [], s);
      z3() ? i.onerror = (o) => {
        const a = o;
        n(this.emitError(a.error));
      } : i.on("error", (o) => {
        n(this.emitError(o));
      }), i.onopen = () => {
        this.onOpen(i), r(i);
      };
    });
  }
  onOpen(e) {
    e.onmessage = (r) => this.onPayload(r), e.onclose = (r) => this.onClose(r), this.socket = e, this.registering = !1, this.events.emit("open");
  }
  onClose(e) {
    this.socket = void 0, this.registering = !1, this.events.emit("close", e);
  }
  onPayload(e) {
    if (typeof e.data > "u") return;
    const r = typeof e.data == "string" ? ln(e.data) : e.data;
    this.events.emit("payload", r);
  }
  onError(e, r) {
    const n = this.parseError(r), s = n.message || n.toString(), i = ka(e, s);
    this.events.emit("payload", i);
  }
  parseError(e, r = this.url) {
    return $3(e, nu(r), "WS");
  }
  resetMaxListeners() {
    this.events.getMaxListeners() > su && this.events.setMaxListeners(su);
  }
  emitError(e) {
    const r = this.parseError(new Error((e == null ? void 0 : e.message) || `WebSocket connection failed for host: ${nu(this.url)}`));
    return this.events.emit("register_error", r), r;
  }
}
function K3(t, e) {
  return t === e || Number.isNaN(t) && Number.isNaN(e);
}
function iu(t) {
  return Object.getOwnPropertySymbols(t).filter((e) => Object.prototype.propertyIsEnumerable.call(t, e));
}
function ou(t) {
  return t == null ? t === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(t);
}
const V3 = "[object RegExp]", W3 = "[object String]", G3 = "[object Number]", Y3 = "[object Boolean]", au = "[object Arguments]", Z3 = "[object Symbol]", X3 = "[object Date]", J3 = "[object Map]", Q3 = "[object Set]", eS = "[object Array]", tS = "[object Function]", rS = "[object ArrayBuffer]", go = "[object Object]", nS = "[object Error]", sS = "[object DataView]", iS = "[object Uint8Array]", oS = "[object Uint8ClampedArray]", aS = "[object Uint16Array]", cS = "[object Uint32Array]", lS = "[object BigUint64Array]", uS = "[object Int8Array]", hS = "[object Int16Array]", fS = "[object Int32Array]", dS = "[object BigInt64Array]", pS = "[object Float32Array]", gS = "[object Float64Array]";
function cu(t) {
  if (!t || typeof t != "object")
    return !1;
  const e = Object.getPrototypeOf(t);
  return e === null || e === Object.prototype || Object.getPrototypeOf(e) === null ? Object.prototype.toString.call(t) === "[object Object]" : !1;
}
function yS(t, e, r) {
  return Nn(t, e, void 0, void 0, void 0, void 0, r);
}
function Nn(t, e, r, n, s, i, o) {
  const a = o(t, e, r, n, s, i);
  if (a !== void 0)
    return a;
  if (typeof t == typeof e)
    switch (typeof t) {
      case "bigint":
      case "string":
      case "boolean":
      case "symbol":
      case "undefined":
        return t === e;
      case "number":
        return t === e || Object.is(t, e);
      case "function":
        return t === e;
      case "object":
        return Mn(t, e, i, o);
    }
  return Mn(t, e, i, o);
}
function Mn(t, e, r, n) {
  if (Object.is(t, e))
    return !0;
  let s = ou(t), i = ou(e);
  if (s === au && (s = go), i === au && (i = go), s !== i)
    return !1;
  switch (s) {
    case W3:
      return t.toString() === e.toString();
    case G3: {
      const c = t.valueOf(), l = e.valueOf();
      return K3(c, l);
    }
    case Y3:
    case X3:
    case Z3:
      return Object.is(t.valueOf(), e.valueOf());
    case V3:
      return t.source === e.source && t.flags === e.flags;
    case tS:
      return t === e;
  }
  r = r ?? /* @__PURE__ */ new Map();
  const o = r.get(t), a = r.get(e);
  if (o != null && a != null)
    return o === e;
  r.set(t, e), r.set(e, t);
  try {
    switch (s) {
      case J3: {
        if (t.size !== e.size)
          return !1;
        for (const [c, l] of t.entries())
          if (!e.has(c) || !Nn(l, e.get(c), c, t, e, r, n))
            return !1;
        return !0;
      }
      case Q3: {
        if (t.size !== e.size)
          return !1;
        const c = Array.from(t.values()), l = Array.from(e.values());
        for (let u = 0; u < c.length; u++) {
          const h = c[u], f = l.findIndex((d) => Nn(h, d, void 0, t, e, r, n));
          if (f === -1)
            return !1;
          l.splice(f, 1);
        }
        return !0;
      }
      case eS:
      case iS:
      case oS:
      case aS:
      case cS:
      case lS:
      case uS:
      case hS:
      case fS:
      case dS:
      case pS:
      case gS: {
        if (typeof Buffer < "u" && Buffer.isBuffer(t) !== Buffer.isBuffer(e) || t.length !== e.length)
          return !1;
        for (let c = 0; c < t.length; c++)
          if (!Nn(t[c], e[c], c, t, e, r, n))
            return !1;
        return !0;
      }
      case rS:
        return t.byteLength !== e.byteLength ? !1 : Mn(new Uint8Array(t), new Uint8Array(e), r, n);
      case sS:
        return t.byteLength !== e.byteLength || t.byteOffset !== e.byteOffset ? !1 : Mn(new Uint8Array(t), new Uint8Array(e), r, n);
      case nS:
        return t.name === e.name && t.message === e.message;
      case go: {
        if (!(Mn(t.constructor, e.constructor, r, n) || cu(t) && cu(e)))
          return !1;
        const l = [...Object.keys(t), ...iu(t)], u = [...Object.keys(e), ...iu(e)];
        if (l.length !== u.length)
          return !1;
        for (let h = 0; h < l.length; h++) {
          const f = l[h], d = t[f];
          if (!Object.hasOwn(e, f))
            return !1;
          const p = e[f];
          if (!Nn(d, p, f, t, e, r, n))
            return !1;
        }
        return !0;
      }
      default:
        return !1;
    }
  } finally {
    r.delete(t), r.delete(e);
  }
}
function wS() {
}
function mS(t, e) {
  return yS(t, e, wS);
}
const Dd = "wc", Ad = 2, Yo = "core", _t = `${Dd}@2:${Yo}:`, bS = { logger: "error" }, ES = { database: ":memory:" }, vS = "crypto", lu = "client_ed25519_seed", xS = M.ONE_DAY, _S = "keychain", SS = "0.3", IS = "messages", DS = "0.3", AS = M.SIX_HOURS, OS = "publisher", Od = "irn", $S = "error", $d = "wss://relay.walletconnect.org", TS = "relayer", ce = { message: "relayer_message", message_ack: "relayer_message_ack", connect: "relayer_connect", disconnect: "relayer_disconnect", error: "relayer_error", connection_stalled: "relayer_connection_stalled", transport_closed: "relayer_transport_closed", publish: "relayer_publish" }, BS = "_subscription", Qe = { payload: "payload", connect: "connect", disconnect: "disconnect", error: "error" }, RS = 0.1, Zo = "2.23.10", ne = { link_mode: "link_mode", relay: "relay" }, Ls = { inbound: "inbound", outbound: "outbound" }, PS = "0.3", CS = "WALLETCONNECT_CLIENT_ID", uu = "WALLETCONNECT_LINK_MODE_APPS", Ve = { created: "subscription_created", deleted: "subscription_deleted", expired: "subscription_expired", disabled: "subscription_disabled", sync: "subscription_sync", resubscribed: "subscription_resubscribed" }, NS = "subscription", US = "0.3", LS = "pairing", kS = "0.3", Tn = { wc_pairingDelete: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 1e3 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 1001 } }, wc_pairingPing: { req: { ttl: M.THIRTY_SECONDS, prompt: !1, tag: 1002 }, res: { ttl: M.THIRTY_SECONDS, prompt: !1, tag: 1003 } }, unregistered_method: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 0 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 0 } } }, Ir = { create: "pairing_create", expire: "pairing_expire", delete: "pairing_delete", ping: "pairing_ping" }, ot = { created: "history_created", updated: "history_updated", deleted: "history_deleted", sync: "history_sync" }, MS = "history", FS = "0.3", qS = "expirer", et = { created: "expirer_created", deleted: "expirer_deleted", expired: "expirer_expired", sync: "expirer_sync" }, zS = "0.3", jS = "verify-api", HS = "https://verify.walletconnect.com", Td = "https://verify.walletconnect.org", Fn = Td, KS = `${Fn}/v3`, VS = [HS, Td], WS = "echo", GS = "https://echo.walletconnect.com", mt = { pairing_started: "pairing_started", pairing_uri_validation_success: "pairing_uri_validation_success", pairing_uri_not_expired: "pairing_uri_not_expired", store_new_pairing: "store_new_pairing", subscribing_pairing_topic: "subscribing_pairing_topic", subscribe_pairing_topic_success: "subscribe_pairing_topic_success", existing_pairing: "existing_pairing", pairing_not_expired: "pairing_not_expired", emit_inactive_pairing: "emit_inactive_pairing", emit_session_proposal: "emit_session_proposal", subscribing_to_pairing_topic: "subscribing_to_pairing_topic" }, Rt = { no_wss_connection: "no_wss_connection", no_internet_connection: "no_internet_connection", malformed_pairing_uri: "malformed_pairing_uri", active_pairing_already_exists: "active_pairing_already_exists", subscribe_pairing_topic_failure: "subscribe_pairing_topic_failure", pairing_expired: "pairing_expired", proposal_expired: "proposal_expired", proposal_listener_not_found: "proposal_listener_not_found" }, at = { session_approve_started: "session_approve_started", proposal_not_expired: "proposal_not_expired", session_namespaces_validation_success: "session_namespaces_validation_success", create_session_topic: "create_session_topic", subscribing_session_topic: "subscribing_session_topic", subscribe_session_topic_success: "subscribe_session_topic_success", publishing_session_approve: "publishing_session_approve", session_approve_publish_success: "session_approve_publish_success", store_session: "store_session", publishing_session_settle: "publishing_session_settle", session_settle_publish_success: "session_settle_publish_success", session_request_response_started: "session_request_response_started", session_request_response_validation_success: "session_request_response_validation_success", session_request_response_publish_started: "session_request_response_publish_started" }, vr = { no_internet_connection: "no_internet_connection", no_wss_connection: "no_wss_connection", proposal_expired: "proposal_expired", subscribe_session_topic_failure: "subscribe_session_topic_failure", session_approve_publish_failure: "session_approve_publish_failure", session_settle_publish_failure: "session_settle_publish_failure", session_approve_namespace_validation_failure: "session_approve_namespace_validation_failure", proposal_not_found: "proposal_not_found", session_request_response_validation_failure: "session_request_response_validation_failure", session_request_response_publish_failure: "session_request_response_publish_failure" }, xr = { authenticated_session_approve_started: "authenticated_session_approve_started", create_authenticated_session_topic: "create_authenticated_session_topic", cacaos_verified: "cacaos_verified", store_authenticated_session: "store_authenticated_session", subscribing_authenticated_session_topic: "subscribing_authenticated_session_topic", subscribe_authenticated_session_topic_success: "subscribe_authenticated_session_topic_success", publishing_authenticated_session_approve: "publishing_authenticated_session_approve" }, Bn = { no_internet_connection: "no_internet_connection", invalid_cacao: "invalid_cacao", subscribe_authenticated_session_topic_failure: "subscribe_authenticated_session_topic_failure", authenticated_session_approve_publish_failure: "authenticated_session_approve_publish_failure", authenticated_session_pending_request_not_found: "authenticated_session_pending_request_not_found" }, YS = 0.1, ZS = "event-client", XS = 86400, JS = "https://pulse.walletconnect.org/batch";
class QS {
  constructor(e, r) {
    this.core = e, this.logger = r, this.keychain = /* @__PURE__ */ new Map(), this.name = _S, this.version = SS, this.initialized = !1, this.storagePrefix = _t, this.init = async () => {
      if (!this.initialized) {
        const n = await this.getKeyChain();
        typeof n < "u" && (this.keychain = n), this.initialized = !0;
      }
    }, this.has = (n) => (this.isInitialized(), this.keychain.has(n)), this.set = async (n, s) => {
      this.isInitialized(), this.keychain.set(n, s), await this.persist();
    }, this.get = (n) => {
      this.isInitialized();
      const s = this.keychain.get(n);
      if (typeof s > "u") {
        const { message: i } = F("NO_MATCHING_KEY", `${this.name}: ${n}`);
        throw new Error(i);
      }
      return s;
    }, this.del = async (n) => {
      this.isInitialized(), this.keychain.delete(n), await this.persist();
    }, this.core = e, this.logger = Ze(r, this.name);
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  async setKeyChain(e) {
    await this.core.storage.setItem(this.storageKey, Ko(e));
  }
  async getKeyChain() {
    const e = await this.core.storage.getItem(this.storageKey);
    return typeof e < "u" ? Vo(e) : void 0;
  }
  async persist() {
    await this.setKeyChain(this.keychain);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
let eI = class {
  constructor(e, r, n) {
    this.core = e, this.logger = r, this.name = vS, this.randomSessionIdentifier = Go(), this.initialized = !1, this.init = async () => {
      this.initialized || (await this.keychain.init(), this.initialized = !0);
    }, this.hasKeys = (s) => (this.isInitialized(), this.keychain.has(s)), this.getClientId = async () => {
      if (this.isInitialized(), this.clientId) return this.clientId;
      const s = await this.getClientSeed(), i = Uc(s), o = nh(i.publicKey);
      return this.clientId = o, o;
    }, this.generateKeyPair = () => {
      this.isInitialized();
      const s = g_();
      return this.setPrivateKey(s.publicKey, s.privateKey);
    }, this.signJWT = async (s) => {
      this.isInitialized();
      const i = await this.getClientSeed(), o = Uc(i), a = this.randomSessionIdentifier;
      return await tm(a, s, xS, o);
    }, this.generateSharedKey = (s, i, o) => {
      this.isInitialized();
      const a = this.getPrivateKey(s), c = y_(a, i);
      return this.setSymKey(c, o);
    }, this.setSymKey = async (s, i) => {
      this.isInitialized();
      const o = i || Us(s);
      return await this.keychain.set(o, s), o;
    }, this.deleteKeyPair = async (s) => {
      this.isInitialized(), await this.keychain.del(s);
    }, this.deleteSymKey = async (s) => {
      this.isInitialized(), await this.keychain.del(s);
    }, this.encode = async (s, i, o) => {
      this.isInitialized();
      const a = yd(o), c = Jn(i);
      if (jl(a)) return b_(c, o == null ? void 0 : o.encoding);
      if (zl(a)) {
        const f = a.senderPublicKey, d = a.receiverPublicKey;
        s = await this.generateSharedKey(f, d);
      }
      const l = this.getSymKey(s), { type: u, senderPublicKey: h } = a;
      return w_({ type: u, symKey: l, message: c, senderPublicKey: h, encoding: o == null ? void 0 : o.encoding });
    }, this.decode = async (s, i, o) => {
      this.isInitialized();
      const a = v_(i, o);
      if (jl(a)) {
        const c = E_(i, o == null ? void 0 : o.encoding);
        return ln(c);
      }
      if (zl(a)) {
        const c = a.receiverPublicKey, l = a.senderPublicKey;
        s = await this.generateSharedKey(c, l);
      }
      try {
        const c = this.getSymKey(s), l = m_({ symKey: c, encoded: i, encoding: o == null ? void 0 : o.encoding });
        return ln(l);
      } catch (c) {
        this.logger.error(`Failed to decode message from topic: '${s}', clientId: '${await this.getClientId()}'`), this.logger.error(c);
      }
    }, this.getPayloadType = (s, i = Se) => {
      const o = Gn({ encoded: s, encoding: i });
      return Mr(o.type);
    }, this.getPayloadSenderPublicKey = (s, i = Se) => {
      const o = Gn({ encoded: s, encoding: i });
      return o.senderPublicKey ? Ee(o.senderPublicKey, Le) : void 0;
    }, this.core = e, this.logger = Ze(r, this.name), this.keychain = n || new QS(this.core, this.logger);
  }
  get context() {
    return Ke(this.logger);
  }
  async setPrivateKey(e, r) {
    return await this.keychain.set(e, r), e;
  }
  getPrivateKey(e) {
    return this.keychain.get(e);
  }
  async getClientSeed() {
    let e = "";
    try {
      e = this.keychain.get(lu);
    } catch {
      e = Go(), await this.keychain.set(lu, e);
    }
    return Pe(e, "base16");
  }
  getSymKey(e) {
    return this.keychain.get(e);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}, tI = class extends t0 {
  constructor(e, r) {
    super(e, r), this.logger = e, this.core = r, this.messages = /* @__PURE__ */ new Map(), this.messagesWithoutClientAck = /* @__PURE__ */ new Map(), this.name = IS, this.version = DS, this.initialized = !1, this.storagePrefix = _t, this.init = async () => {
      if (!this.initialized) {
        this.logger.trace("Initialized");
        try {
          const n = await this.getRelayerMessages();
          typeof n < "u" && (this.messages = n);
          const s = await this.getRelayerMessagesWithoutClientAck();
          typeof s < "u" && (this.messagesWithoutClientAck = s), this.logger.debug(`Successfully Restored records for ${this.name}`), this.logger.trace({ type: "method", method: "restore", size: this.messages.size });
        } catch (n) {
          this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(n);
        } finally {
          this.initialized = !0;
        }
      }
    }, this.set = async (n, s, i) => {
      this.isInitialized();
      const o = rt(s);
      let a = this.messages.get(n);
      if (typeof a > "u" && (a = {}), typeof a[o] < "u") return o;
      if (a[o] = s, this.messages.set(n, a), i === Ls.inbound) {
        const c = this.messagesWithoutClientAck.get(n) || {};
        this.messagesWithoutClientAck.set(n, { ...c, [o]: s });
      }
      return await this.persist(), o;
    }, this.get = (n) => {
      this.isInitialized();
      let s = this.messages.get(n);
      return typeof s > "u" && (s = {}), s;
    }, this.getWithoutAck = (n) => {
      this.isInitialized();
      const s = {};
      for (const i of n) {
        const o = this.messagesWithoutClientAck.get(i) || {};
        s[i] = Object.values(o);
      }
      return s;
    }, this.has = (n, s) => {
      this.isInitialized();
      const i = this.get(n), o = rt(s);
      return typeof i[o] < "u";
    }, this.ack = async (n, s) => {
      this.isInitialized();
      const i = this.messagesWithoutClientAck.get(n);
      if (typeof i > "u") return;
      const o = rt(s);
      delete i[o], Object.keys(i).length === 0 ? this.messagesWithoutClientAck.delete(n) : this.messagesWithoutClientAck.set(n, i), await this.persist();
    }, this.del = async (n) => {
      this.isInitialized(), this.messages.delete(n), this.messagesWithoutClientAck.delete(n), await this.persist();
    }, this.logger = Ze(e, this.name), this.core = r;
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get storageKeyWithoutClientAck() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name + "_withoutClientAck";
  }
  async setRelayerMessages(e) {
    await this.core.storage.setItem(this.storageKey, Ko(e));
  }
  async setRelayerMessagesWithoutClientAck(e) {
    await this.core.storage.setItem(this.storageKeyWithoutClientAck, Ko(e));
  }
  async getRelayerMessages() {
    const e = await this.core.storage.getItem(this.storageKey);
    return typeof e < "u" ? Vo(e) : void 0;
  }
  async getRelayerMessagesWithoutClientAck() {
    const e = await this.core.storage.getItem(this.storageKeyWithoutClientAck);
    return typeof e < "u" ? Vo(e) : void 0;
  }
  async persist() {
    await this.setRelayerMessages(this.messages), await this.setRelayerMessagesWithoutClientAck(this.messagesWithoutClientAck);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
};
class rI extends r0 {
  constructor(e, r) {
    super(e, r), this.relayer = e, this.logger = r, this.events = new dt.EventEmitter(), this.name = OS, this.queue = /* @__PURE__ */ new Map(), this.publishTimeout = M.toMiliseconds(M.ONE_MINUTE), this.initialPublishTimeout = M.toMiliseconds(M.ONE_SECOND * 15), this.needsTransportRestart = !1, this.publish = async (n, s, i) => {
      var d, p, g, m, _;
      this.logger.debug("Publishing Payload"), this.logger.trace({ type: "method", method: "publish", params: { topic: n, message: s, opts: i } });
      const o = (i == null ? void 0 : i.ttl) || AS, a = (i == null ? void 0 : i.prompt) || !1, c = (i == null ? void 0 : i.tag) || 0, l = (i == null ? void 0 : i.id) || ur().toString(), u = en(ti().protocol), h = { id: l, method: (i == null ? void 0 : i.publishMethod) || u.publish, params: { topic: n, message: s, ttl: o, prompt: a, tag: c, attestation: i == null ? void 0 : i.attestation, ...i == null ? void 0 : i.tvf } }, f = `Failed to publish payload, please try again. id:${l} tag:${c}`;
      try {
        ge((d = h.params) == null ? void 0 : d.prompt) && ((p = h.params) == null || delete p.prompt), ge((g = h.params) == null ? void 0 : g.tag) && ((m = h.params) == null || delete m.tag);
        const R = new Promise(async (b) => {
          const S = ({ id: B }) => {
            var C;
            ((C = h.id) == null ? void 0 : C.toString()) === B.toString() && (this.removeRequestFromQueue(B), this.relayer.events.removeListener(ce.publish, S), b());
          };
          this.relayer.events.on(ce.publish, S);
          const $ = ut(new Promise((B, C) => {
            this.rpcPublish(h, i).then(B).catch((P) => {
              this.logger.warn(P, P == null ? void 0 : P.message), C(P);
            });
          }), this.initialPublishTimeout, `Failed initial publish, retrying.... id:${l} tag:${c}`);
          try {
            await $, this.events.removeListener(ce.publish, S);
          } catch (B) {
            this.queue.set(l, { request: h, opts: i, attempt: 1 }), this.logger.warn(B, B == null ? void 0 : B.message);
          }
        });
        this.logger.trace({ type: "method", method: "publish", params: { id: l, topic: n, message: s, opts: i } }), await ut(R, this.publishTimeout, f);
      } catch (R) {
        if (this.logger.debug("Failed to Publish Payload"), this.logger.error(R), (_ = i == null ? void 0 : i.internal) == null ? void 0 : _.throwOnFailedPublish) throw R;
      } finally {
        this.queue.delete(l);
      }
    }, this.publishCustom = async (n) => {
      var _, R, b, S, $;
      this.logger.debug("Publishing custom payload"), this.logger.trace({ type: "method", method: "publishCustom", params: n });
      const { payload: s, opts: i = {} } = n, { attestation: o, tvf: a, publishMethod: c, prompt: l, tag: u, ttl: h = M.FIVE_MINUTES } = i, f = i.id || ur().toString(), d = en(ti().protocol), p = c || d.publish, g = { id: f, method: p, params: { ...s, ttl: h, prompt: l, tag: u, attestation: o, ...a } }, m = `Failed to publish custom payload, please try again. id:${f} tag:${u}`;
      try {
        ge((_ = g.params) == null ? void 0 : _.prompt) && ((R = g.params) == null || delete R.prompt), ge((b = g.params) == null ? void 0 : b.tag) && ((S = g.params) == null || delete S.tag);
        const B = new Promise(async (C) => {
          const P = ({ id: U }) => {
            var k;
            ((k = g.id) == null ? void 0 : k.toString()) === U.toString() && (this.removeRequestFromQueue(U), this.relayer.events.removeListener(ce.publish, P), C());
          };
          this.relayer.events.on(ce.publish, P);
          const O = ut(new Promise((U, k) => {
            this.rpcPublish(g, i).then(U).catch((N) => {
              this.logger.warn(N, N == null ? void 0 : N.message), k(N);
            });
          }), this.initialPublishTimeout, `Failed initial custom payload publish, retrying.... method:${p} id:${f} tag:${u}`);
          try {
            await O, this.events.removeListener(ce.publish, P);
          } catch (U) {
            this.queue.set(f, { request: g, opts: i, attempt: 1 }), this.logger.warn(U, U == null ? void 0 : U.message);
          }
        });
        this.logger.trace({ type: "method", method: "publish", params: { id: f, payload: s, opts: i } }), await ut(B, this.publishTimeout, m);
      } catch (B) {
        if (this.logger.debug("Failed to Publish Payload"), this.logger.error(B), ($ = i == null ? void 0 : i.internal) == null ? void 0 : $.throwOnFailedPublish) throw B;
      } finally {
        this.queue.delete(f);
      }
    }, this.on = (n, s) => {
      this.events.on(n, s);
    }, this.once = (n, s) => {
      this.events.once(n, s);
    }, this.off = (n, s) => {
      this.events.off(n, s);
    }, this.removeListener = (n, s) => {
      this.events.removeListener(n, s);
    }, this.relayer = e, this.logger = Ze(r, this.name), this.registerEventListeners();
  }
  get context() {
    return Ke(this.logger);
  }
  async rpcPublish(e, r) {
    this.logger.debug("Outgoing Relay Payload"), this.logger.trace({ type: "message", direction: "outgoing", request: e });
    const n = await this.relayer.request(e);
    return this.relayer.events.emit(ce.publish, { ...e, ...r }), this.logger.debug("Successfully Published Payload"), n;
  }
  removeRequestFromQueue(e) {
    this.queue.delete(e);
  }
  checkQueue() {
    this.queue.forEach(async (e, r) => {
      var s;
      const n = e.attempt + 1;
      this.queue.set(r, { ...e, attempt: n }), this.logger.warn({}, `Publisher: queue->publishing: ${e.request.id}, tag: ${(s = e.request.params) == null ? void 0 : s.tag}, attempt: ${n}`), await this.rpcPublish(e.request, e.opts), this.logger.warn({}, `Publisher: queue->published: ${e.request.id}`);
    });
  }
  registerEventListeners() {
    this.relayer.core.heartbeat.on(qr.pulse, () => {
      if (this.needsTransportRestart) {
        this.needsTransportRestart = !1, this.relayer.events.emit(ce.connection_stalled);
        return;
      }
      this.checkQueue();
    }), this.relayer.on(ce.message_ack, (e) => {
      this.removeRequestFromQueue(e.id.toString());
    });
  }
}
class nI {
  constructor() {
    this.map = /* @__PURE__ */ new Map(), this.set = (e, r) => {
      const n = this.get(e);
      this.exists(e, r) || this.map.set(e, [...n, r]);
    }, this.get = (e) => this.map.get(e) || [], this.exists = (e, r) => this.get(e).includes(r), this.delete = (e, r) => {
      if (typeof r > "u") {
        this.map.delete(e);
        return;
      }
      if (!this.map.has(e)) return;
      const n = this.get(e);
      if (!this.exists(e, r)) return;
      const s = n.filter((i) => i !== r);
      if (!s.length) {
        this.map.delete(e);
        return;
      }
      this.map.set(e, s);
    }, this.clear = () => {
      this.map.clear();
    };
  }
  get topics() {
    return Array.from(this.map.keys());
  }
}
class sI extends i0 {
  constructor(e, r) {
    super(e, r), this.relayer = e, this.logger = r, this.subscriptions = /* @__PURE__ */ new Map(), this.topicMap = new nI(), this.events = new dt.EventEmitter(), this.name = NS, this.version = US, this.pending = /* @__PURE__ */ new Map(), this.cached = [], this.initialized = !1, this.storagePrefix = _t, this.subscribeTimeout = M.toMiliseconds(M.ONE_MINUTE), this.initialSubscribeTimeout = M.toMiliseconds(M.ONE_SECOND * 15), this.batchSubscribeTopicsLimit = 500, this.init = async () => {
      this.initialized || (this.logger.trace("Initialized"), this.registerEventListeners(), await this.restore()), this.initialized = !0;
    }, this.subscribe = async (n, s) => {
      var i;
      this.isInitialized(), this.logger.debug("Subscribing Topic"), this.logger.trace({ type: "method", method: "subscribe", params: { topic: n, opts: s } });
      try {
        const o = ti(s), a = { topic: n, relay: o, transportType: s == null ? void 0 : s.transportType };
        (i = s == null ? void 0 : s.internal) != null && i.skipSubscribe || this.pending.set(n, a);
        const c = await this.rpcSubscribe(n, o, s);
        return typeof c == "string" && (this.onSubscribe(c, a), this.logger.debug("Successfully Subscribed Topic"), this.logger.trace({ type: "method", method: "subscribe", params: { topic: n, opts: s } })), c;
      } catch (o) {
        throw this.logger.debug("Failed to Subscribe Topic"), this.logger.error(o), o;
      }
    }, this.unsubscribe = async (n, s) => {
      this.isInitialized(), typeof (s == null ? void 0 : s.id) < "u" ? await this.unsubscribeById(n, s.id, s) : await this.unsubscribeByTopic(n, s);
    }, this.isSubscribed = (n) => new Promise((s) => {
      s(this.topicMap.topics.includes(n));
    }), this.isKnownTopic = (n) => new Promise((s) => {
      s(this.topicMap.topics.includes(n) || this.pending.has(n) || this.cached.some((i) => i.topic === n));
    }), this.on = (n, s) => {
      this.events.on(n, s);
    }, this.once = (n, s) => {
      this.events.once(n, s);
    }, this.off = (n, s) => {
      this.events.off(n, s);
    }, this.removeListener = (n, s) => {
      this.events.removeListener(n, s);
    }, this.start = async () => {
      await this.onConnect();
    }, this.stop = async () => {
      await this.onDisconnect();
    }, this.restart = async () => {
      await this.restore(), await this.onRestart();
    }, this.checkPending = async () => {
      if (this.pending.size === 0 && (!this.initialized || !this.relayer.connected)) return;
      const n = [];
      this.pending.forEach((s) => {
        n.push(s);
      }), await this.batchSubscribe(n);
    }, this.registerEventListeners = () => {
      this.relayer.core.heartbeat.on(qr.pulse, async () => {
        await this.checkPending();
      }), this.events.on(Ve.created, async (n) => {
        const s = Ve.created;
        this.logger.info(`Emitting ${s}`), this.logger.debug({ type: "event", event: s, data: n }), await this.persist();
      }), this.events.on(Ve.deleted, async (n) => {
        const s = Ve.deleted;
        this.logger.info(`Emitting ${s}`), this.logger.debug({ type: "event", event: s, data: n }), await this.persist();
      });
    }, this.relayer = e, this.logger = Ze(r, this.name), this.clientId = "";
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.relayer.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.subscriptions.size;
  }
  get ids() {
    return Array.from(this.subscriptions.keys());
  }
  get values() {
    return Array.from(this.subscriptions.values());
  }
  get topics() {
    return this.topicMap.topics;
  }
  get hasAnyTopics() {
    return this.topicMap.topics.length > 0 || this.pending.size > 0 || this.cached.length > 0 || this.subscriptions.size > 0;
  }
  hasSubscription(e, r) {
    let n = !1;
    try {
      n = this.getSubscription(e).topic === r;
    } catch {
    }
    return n;
  }
  reset() {
    this.cached = [], this.initialized = !0;
  }
  onDisable() {
    this.values.length > 0 && (this.cached = this.values), this.subscriptions.clear(), this.topicMap.clear();
  }
  async unsubscribeByTopic(e, r) {
    const n = this.topicMap.get(e);
    await Promise.all(n.map(async (s) => await this.unsubscribeById(e, s, r)));
  }
  async unsubscribeById(e, r, n) {
    this.logger.debug("Unsubscribing Topic"), this.logger.trace({ type: "method", method: "unsubscribe", params: { topic: e, id: r, opts: n } });
    try {
      const s = oe("USER_DISCONNECTED", `${this.name}, ${e}`);
      await this.onUnsubscribe(e, r, s);
      const i = ti(n);
      await this.restartToComplete({ topic: e, id: r, relay: i }), await this.rpcUnsubscribe(e, r, i), this.logger.debug("Successfully Unsubscribed Topic"), this.logger.trace({ type: "method", method: "unsubscribe", params: { topic: e, id: r, opts: n } });
    } catch (s) {
      throw this.logger.debug("Failed to Unsubscribe Topic"), this.logger.error(s), s;
    }
  }
  async rpcSubscribe(e, r, n) {
    var a, c;
    const s = await this.getSubscriptionId(e);
    if ((a = n == null ? void 0 : n.internal) != null && a.skipSubscribe) return s;
    (!n || (n == null ? void 0 : n.transportType) === ne.relay) && await this.restartToComplete({ topic: e, id: e, relay: r });
    const i = { method: en(r.protocol).subscribe, params: { topic: e } };
    this.logger.debug("Outgoing Relay Payload"), this.logger.trace({ type: "payload", direction: "outgoing", request: i });
    const o = (c = n == null ? void 0 : n.internal) == null ? void 0 : c.throwOnFailedPublish;
    try {
      if ((n == null ? void 0 : n.transportType) === ne.link_mode) return setTimeout(() => {
        (this.relayer.connected || this.relayer.connecting) && this.relayer.request(i).catch((h) => this.logger.warn(h));
      }, M.toMiliseconds(M.ONE_SECOND)), s;
      const l = new Promise(async (h) => {
        const f = (d) => {
          d.topic === e && (this.events.removeListener(Ve.created, f), h(d.id));
        };
        this.events.on(Ve.created, f);
        try {
          const d = await ut(new Promise((p, g) => {
            this.relayer.request(i).catch((m) => {
              this.logger.warn(m, m == null ? void 0 : m.message), g(m);
            }).then(p);
          }), this.initialSubscribeTimeout, `Subscribing to ${e} failed, please try again`);
          this.events.removeListener(Ve.created, f), h(d);
        } catch {
        }
      }), u = await ut(l, this.subscribeTimeout, `Subscribing to ${e} failed, please try again`);
      if (!u && o) throw new Error(`Subscribing to ${e} failed, please try again`);
      return u ? s : null;
    } catch (l) {
      if (this.logger.debug("Outgoing Relay Subscribe Payload stalled"), this.relayer.events.emit(ce.connection_stalled), o) throw l;
    }
    return null;
  }
  async rpcBatchSubscribe(e) {
    if (!e.length) return !0;
    const r = e[0].relay, n = { method: en(r.protocol).batchSubscribe, params: { topics: e.map((s) => s.topic) } };
    this.logger.debug("Outgoing Relay Payload"), this.logger.trace({ type: "payload", direction: "outgoing", request: n });
    try {
      return await ut(new Promise((s, i) => {
        this.relayer.request(n).then(s).catch((o) => {
          this.logger.warn(o), i(o);
        });
      }), this.subscribeTimeout, "rpcBatchSubscribe failed, please try again"), !0;
    } catch {
      return this.relayer.events.emit(ce.connection_stalled), !1;
    }
  }
  async rpcBatchFetchMessages(e) {
    if (!e.length) return;
    const r = e[0].relay, n = { method: en(r.protocol).batchFetchMessages, params: { topics: e.map((i) => i.topic) } };
    this.logger.debug("Outgoing Relay Payload"), this.logger.trace({ type: "payload", direction: "outgoing", request: n });
    let s;
    try {
      s = await await ut(new Promise((i, o) => {
        this.relayer.request(n).catch((a) => {
          this.logger.warn(a), o(a);
        }).then(i);
      }), this.subscribeTimeout, "rpcBatchFetchMessages failed, please try again");
    } catch {
      this.relayer.events.emit(ce.connection_stalled);
    }
    return s;
  }
  rpcUnsubscribe(e, r, n) {
    const s = { method: en(n.protocol).unsubscribe, params: { topic: e, id: r } };
    return this.logger.debug("Outgoing Relay Payload"), this.logger.trace({ type: "payload", direction: "outgoing", request: s }), this.relayer.request(s);
  }
  onSubscribe(e, r) {
    this.setSubscription(e, { ...r, id: e }), this.pending.delete(r.topic);
  }
  onBatchSubscribe(e) {
    e.length && e.forEach((r) => {
      this.setSubscription(r.id, { ...r }), this.pending.delete(r.topic);
    });
  }
  async onUnsubscribe(e, r, n) {
    this.events.removeAllListeners(r), this.hasSubscription(r, e) && this.deleteSubscription(r, n), await this.relayer.messages.del(e);
  }
  async setRelayerSubscriptions(e) {
    await this.relayer.core.storage.setItem(this.storageKey, e);
  }
  async getRelayerSubscriptions() {
    return await this.relayer.core.storage.getItem(this.storageKey);
  }
  setSubscription(e, r) {
    this.logger.debug("Setting subscription"), this.logger.trace({ type: "method", method: "setSubscription", id: e, subscription: r }), this.addSubscription(e, r);
  }
  addSubscription(e, r) {
    this.subscriptions.set(e, { ...r }), this.topicMap.set(r.topic, e), this.events.emit(Ve.created, r);
  }
  getSubscription(e) {
    this.logger.debug("Getting subscription"), this.logger.trace({ type: "method", method: "getSubscription", id: e });
    const r = this.subscriptions.get(e);
    if (!r) {
      const { message: n } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw new Error(n);
    }
    return r;
  }
  deleteSubscription(e, r) {
    this.logger.debug("Deleting subscription"), this.logger.trace({ type: "method", method: "deleteSubscription", id: e, reason: r });
    const n = this.getSubscription(e);
    this.subscriptions.delete(e), this.topicMap.delete(n.topic, e), this.events.emit(Ve.deleted, { ...n, reason: r });
  }
  async persist() {
    await this.setRelayerSubscriptions(this.values), this.events.emit(Ve.sync);
  }
  async onRestart() {
    if (this.cached.length) {
      const e = [...this.cached], r = Math.ceil(this.cached.length / this.batchSubscribeTopicsLimit);
      for (let n = 0; n < r; n++) {
        const s = e.splice(0, this.batchSubscribeTopicsLimit);
        await this.batchSubscribe(s);
      }
    }
    this.events.emit(Ve.resubscribed);
  }
  async restore() {
    try {
      const e = await this.getRelayerSubscriptions();
      if (typeof e > "u" || !e.length) return;
      if (this.subscriptions.size && !e.every((r) => {
        var n;
        return r.topic === ((n = this.subscriptions.get(r.id)) == null ? void 0 : n.topic);
      })) {
        const { message: r } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw this.logger.error(r), this.logger.error(`${this.name}: ${JSON.stringify(this.values)}`), new Error(r);
      }
      this.cached = e, this.logger.debug(`Successfully Restored subscriptions for ${this.name}`), this.logger.trace({ type: "method", method: "restore", subscriptions: this.values });
    } catch (e) {
      this.logger.debug(`Failed to Restore subscriptions for ${this.name}`), this.logger.error(e);
    }
  }
  async batchSubscribe(e) {
    if (e.length) {
      if (!await this.rpcBatchSubscribe(e)) {
        this.logger.warn(`Batch subscribe failed for ${e.length} topics, adding to pending for retry`), e.forEach((r) => {
          this.pending.set(r.topic, r);
        });
        return;
      }
      this.onBatchSubscribe(await Promise.all(e.map(async (r) => ({ ...r, id: await this.getSubscriptionId(r.topic) }))));
    }
  }
  async batchFetchMessages(e) {
    if (!e.length) return;
    this.logger.trace(`Fetching batch messages for ${e.length} subscriptions`);
    const r = await this.rpcBatchFetchMessages(e);
    r && r.messages && (await jx(M.toMiliseconds(M.ONE_SECOND)), await this.relayer.handleBatchMessageEvents(r.messages));
  }
  async onConnect() {
    await this.restart(), this.reset();
  }
  onDisconnect() {
    this.onDisable();
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async restartToComplete(e) {
    !this.relayer.connected && !this.relayer.connecting && (this.cached.push(e), await this.relayer.transportOpen());
  }
  async getClientId() {
    return this.clientId || (this.clientId = await this.relayer.core.crypto.getClientId()), this.clientId;
  }
  async getSubscriptionId(e) {
    return rt(e + await this.getClientId());
  }
}
let iI = class extends n0 {
  constructor(e) {
    super(e), this.protocol = "wc", this.version = 2, this.events = new dt.EventEmitter(), this.name = TS, this.transportExplicitlyClosed = !1, this.initialized = !1, this.connectionAttemptInProgress = !1, this.hasExperiencedNetworkDisruption = !1, this.heartBeatTimeout = M.toMiliseconds(M.THIRTY_SECONDS + M.FIVE_SECONDS), this.reconnectInProgress = !1, this.requestsInFlight = [], this.connectTimeout = M.toMiliseconds(M.ONE_SECOND * 15), this.stalledRestartInProgress = !1, this.stalledRestartBackoff = 0, this.stalledRestartBaseInterval = M.toMiliseconds(M.ONE_SECOND * 2), this.stalledRestartMaxInterval = M.toMiliseconds(M.THIRTY_SECONDS), this.request = async (r) => {
      var s, i;
      this.logger.debug("Publishing Request Payload");
      const n = r.id || ur().toString();
      await this.toEstablishConnection();
      try {
        this.logger.trace({ id: n, method: r.method, topic: (s = r.params) == null ? void 0 : s.topic }, "relayer.request - publishing...");
        const o = `${n}:${((i = r.params) == null ? void 0 : i.tag) || ""}`;
        this.requestsInFlight.push(o);
        const a = await this.provider.request(r);
        return this.requestsInFlight = this.requestsInFlight.filter((c) => c !== o), a;
      } catch (o) {
        throw this.logger.debug(`Failed to Publish Request: ${n}`), o;
      }
    }, this.resetPingTimeout = () => {
      Js() && (clearTimeout(this.pingTimeout), this.pingTimeout = setTimeout(() => {
        var r, n, s, i;
        try {
          this.logger.debug({}, "pingTimeout: Connection stalled, terminating..."), (i = (s = (n = (r = this.provider) == null ? void 0 : r.connection) == null ? void 0 : n.socket) == null ? void 0 : s.terminate) == null || i.call(s);
        } catch (o) {
          this.logger.warn(o, o == null ? void 0 : o.message);
        }
      }, this.heartBeatTimeout));
    }, this.onPayloadHandler = (r) => {
      this.onProviderPayload(r), this.resetPingTimeout();
    }, this.onConnectHandler = () => {
      this.logger.warn({}, "Relayer connected 🛜"), this.startPingTimeout(), this.stalledRestartBackoff = 0, this.events.emit(ce.connect);
    }, this.onDisconnectHandler = () => {
      this.logger.warn({}, "Relayer disconnected 🛑"), this.requestsInFlight = [], this.onProviderDisconnect();
    }, this.onProviderErrorHandler = (r) => {
      this.logger.fatal(`Fatal socket error: ${r.message}`), this.events.emit(ce.error, r), this.logger.fatal("Fatal socket error received, closing transport"), this.transportExplicitlyClosed = !0, clearTimeout(this.reconnectTimeout), this.reconnectTimeout = void 0, this.reconnectInProgress = !1, this.transportClose().catch((n) => this.logger.warn(n));
    }, this.registerProviderListeners = () => {
      this.provider.on(Qe.payload, this.onPayloadHandler), this.provider.on(Qe.connect, this.onConnectHandler), this.provider.on(Qe.disconnect, this.onDisconnectHandler), this.provider.on(Qe.error, this.onProviderErrorHandler);
    }, this.core = e.core, this.logger = vd({ logger: e.logger ?? $S, name: this.name }), this.messages = new tI(this.logger, e.core), this.subscriber = new sI(this, this.logger), this.publisher = new rI(this, this.logger), this.projectId = e.projectId, this.relayUrl = e.relayUrl || $d, Ax() ? this.packageName = Pl() : Ox() && (this.bundleId = Pl()), this.provider = {};
  }
  async init() {
    this.logger.trace("Initialized"), this.registerEventListeners(), await Promise.all([this.messages.init(), this.subscriber.init()]), this.initialized = !0, this.transportOpen().catch((e) => this.logger.warn(e, e == null ? void 0 : e.message));
  }
  get context() {
    return Ke(this.logger);
  }
  get connected() {
    var e, r, n;
    return ((n = (r = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : r.socket) == null ? void 0 : n.readyState) === 1;
  }
  get connecting() {
    var e, r, n;
    return ((n = (r = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : r.socket) == null ? void 0 : n.readyState) === 0 || this.connectPromise !== void 0;
  }
  async publish(e, r, n) {
    this.isInitialized(), await this.publisher.publish(e, r, n), await this.recordMessageEvent({ topic: e, message: r, publishedAt: Date.now(), transportType: ne.relay }, Ls.outbound);
  }
  async publishCustom(e) {
    this.isInitialized(), await this.publisher.publishCustom(e);
  }
  async subscribe(e, r) {
    var a, c;
    this.isInitialized(), (!(r != null && r.transportType) || (r == null ? void 0 : r.transportType) === "relay") && await this.toEstablishConnection();
    const n = ((a = r == null ? void 0 : r.internal) == null ? void 0 : a.throwOnFailedPublish) ?? !0;
    let s = ((c = this.subscriber.topicMap.get(e)) == null ? void 0 : c[0]) || "", i;
    const o = (l) => {
      l.topic === e && (this.subscriber.off(Ve.created, o), i());
    };
    return await Promise.all([new Promise((l) => {
      i = l, this.subscriber.on(Ve.created, o);
    }), new Promise((l, u) => {
      this.subscriber.subscribe(e, { internal: { throwOnFailedPublish: n }, ...r }).then((h) => {
        s = h || s, l();
      }).catch((h) => {
        n ? u(h) : l();
      });
    })]), s;
  }
  async unsubscribe(e, r) {
    this.isInitialized(), await this.subscriber.unsubscribe(e, r);
  }
  on(e, r) {
    this.events.on(e, r);
  }
  once(e, r) {
    this.events.once(e, r);
  }
  off(e, r) {
    this.events.off(e, r);
  }
  removeListener(e, r) {
    this.events.removeListener(e, r);
  }
  async transportDisconnect() {
    this.provider.disconnect && (this.hasExperiencedNetworkDisruption || this.connected) ? await ut(this.provider.disconnect(), 2e3, "provider.disconnect()").catch(() => this.onProviderDisconnect()) : this.onProviderDisconnect();
  }
  async transportClose() {
    this.transportExplicitlyClosed = !0, clearTimeout(this.stalledRestartTimeout), this.stalledRestartInProgress = !1, this.stalledRestartBackoff = 0, await this.resetTransport();
  }
  async transportOpen(e) {
    if (!this.subscriber.hasAnyTopics) {
      this.logger.info("Starting WS connection skipped because the client has no topics to work with.");
      return;
    }
    if (this.connectPromise ? (this.logger.debug({}, "Waiting for existing connection attempt to resolve..."), await this.connectPromise, this.logger.debug({}, "Existing connection attempt resolved")) : (this.connectPromise = this.connect(e).finally(() => {
      this.connectPromise = void 0;
    }), await this.connectPromise), !this.connected) throw new Error(`Couldn't establish socket connection to the relay server: ${this.relayUrl}`);
  }
  async restartTransport(e) {
    this.logger.debug({}, "Restarting transport..."), !this.connectionAttemptInProgress && (this.relayUrl = e || this.relayUrl, await this.confirmOnlineStateOrThrow(), await this.resetTransport(), await this.transportOpen());
  }
  async resetTransport() {
    this.reconnectInProgress = !0, clearTimeout(this.reconnectTimeout), this.reconnectTimeout = void 0, await this.transportDisconnect(), await this.subscriber.stop(), this.reconnectInProgress = !1;
  }
  async confirmOnlineStateOrThrow() {
    if (!await Jl()) throw new Error("No internet connection detected. Please restart your network and try again.");
  }
  async handleBatchMessageEvents(e) {
    if ((e == null ? void 0 : e.length) === 0) {
      this.logger.trace("Batch message events is empty. Ignoring...");
      return;
    }
    const r = e.sort((n, s) => n.publishedAt - s.publishedAt);
    this.logger.debug(`Batch of ${r.length} message events sorted`);
    for (const n of r) try {
      await this.onMessageEvent(n);
    } catch (s) {
      this.logger.warn(s, "Error while processing batch message event: " + (s == null ? void 0 : s.message));
    }
    this.logger.trace(`Batch of ${r.length} message events processed`);
  }
  async onLinkMessageEvent(e, r) {
    const { topic: n } = e;
    if (!r.sessionExists) {
      const s = de(M.FIVE_MINUTES), i = { topic: n, expiry: s, relay: { protocol: "irn" }, active: !1 };
      await this.core.pairing.pairings.set(n, i);
    }
    this.events.emit(ce.message, e), await this.recordMessageEvent(e, Ls.inbound);
  }
  async connect(e) {
    await this.confirmOnlineStateOrThrow(), e && e !== this.relayUrl && (this.relayUrl = e, await this.transportDisconnect()), this.transportExplicitlyClosed = !1;
    let r = 1;
    try {
      for (; r < 6; ) {
        this.connectionAttemptInProgress = !0;
        try {
          if (this.transportExplicitlyClosed) break;
          this.logger.debug({}, `Connecting to ${this.relayUrl}, attempt: ${r}...`), await this.createProvider(), await new Promise((n, s) => {
            const i = () => {
              s(new Error("Connection interrupted while trying to connect"));
            };
            this.provider.once(Qe.disconnect, i), ut(this.provider.connect(), this.connectTimeout, `Socket stalled when trying to connect to ${this.relayUrl}`).then(() => n()).catch(s).finally(() => {
              this.provider.off(Qe.disconnect, i), clearTimeout(this.reconnectTimeout);
            });
          }), await new Promise((n, s) => {
            const i = () => {
              s(new Error("Connection interrupted while trying to subscribe"));
            };
            this.provider.once(Qe.disconnect, i), this.subscriber.start().then(n).catch(s).finally(() => {
              this.provider.off(Qe.disconnect, i);
            });
          }), this.hasExperiencedNetworkDisruption = !1;
        } catch (n) {
          await this.subscriber.stop();
          const s = n;
          this.logger.warn({}, s.message), this.hasExperiencedNetworkDisruption = !0;
        }
        if (this.connected) {
          this.logger.debug({}, `Connected to ${this.relayUrl} successfully on attempt: ${r}`);
          break;
        }
        await new Promise((n) => setTimeout(n, M.toMiliseconds(r * 1))), r++;
      }
    } finally {
      this.connectionAttemptInProgress = !1, clearTimeout(this.reconnectTimeout), this.reconnectTimeout = void 0, this.reconnectInProgress = !1;
    }
  }
  startPingTimeout() {
    var e, r, n;
    if (Js()) try {
      (n = (r = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : r.socket) == null || n.on("ping", () => {
        this.resetPingTimeout();
      }), this.resetPingTimeout();
    } catch (s) {
      this.logger.warn(s, s == null ? void 0 : s.message);
    }
  }
  async createProvider() {
    if (this.provider.connection && (this.unregisterProviderListeners(), this.connected)) try {
      await ut(this.provider.disconnect(), 1e3, "Closing previous provider");
    } catch {
    }
    const e = await this.core.crypto.signJWT(this.relayUrl);
    this.provider = new F3(new H3(Px({ sdkVersion: Zo, protocol: this.protocol, version: this.version, relayUrl: this.relayUrl, projectId: this.projectId, auth: e, useOnCloseEvent: !0, bundleId: this.bundleId, packageName: this.packageName }))), this.registerProviderListeners();
  }
  async recordMessageEvent(e, r) {
    const { topic: n, message: s } = e;
    await this.messages.set(n, s, r);
  }
  async shouldIgnoreMessageEvent(e) {
    const { topic: r, message: n } = e;
    if (!n || n.length === 0) return this.logger.warn(`Ignoring invalid/empty message: ${n}`), !0;
    if (!await this.subscriber.isKnownTopic(r)) return this.logger.warn(`Ignoring message for unknown topic ${r}`), !0;
    const s = this.messages.has(r, n);
    return s && this.logger.warn(`Ignoring duplicate message: ${n}`), s;
  }
  async onProviderPayload(e) {
    if (this.logger.debug("Incoming Relay Payload"), this.logger.trace({ type: "payload", direction: "incoming", payload: e }), Ma(e)) {
      if (!e.method.endsWith(BS)) return;
      const r = e.params, { topic: n, message: s, publishedAt: i, attestation: o } = r.data, a = { topic: n, message: s, publishedAt: i, transportType: ne.relay, attestation: o };
      this.logger.debug("Emitting Relayer Payload"), this.logger.trace({ type: "event", event: r.id, ...a }), this.events.emit(r.id, a), await this.acknowledgePayload(e), await this.onMessageEvent(a);
    } else Si(e) && this.events.emit(ce.message_ack, e);
  }
  async onMessageEvent(e) {
    await this.shouldIgnoreMessageEvent(e) || (await this.recordMessageEvent(e, Ls.inbound), this.events.emit(ce.message, e));
  }
  async acknowledgePayload(e) {
    const r = si(e.id, !0);
    await this.provider.connection.send(r);
  }
  unregisterProviderListeners() {
    this.provider.off(Qe.payload, this.onPayloadHandler), this.provider.off(Qe.connect, this.onConnectHandler), this.provider.off(Qe.disconnect, this.onDisconnectHandler), this.provider.off(Qe.error, this.onProviderErrorHandler), clearTimeout(this.pingTimeout);
  }
  async registerEventListeners() {
    let e = await Jl();
    a3(async (r) => {
      e !== r && (e = r, r ? await this.transportOpen().catch((n) => this.logger.error(n, n == null ? void 0 : n.message)) : (this.hasExperiencedNetworkDisruption = !0, await this.transportDisconnect(), this.transportExplicitlyClosed = !1));
    }), this.core.heartbeat.on(qr.pulse, async () => {
      if (!this.transportExplicitlyClosed && !this.connected && u3()) try {
        await this.confirmOnlineStateOrThrow(), await this.transportOpen();
      } catch (r) {
        this.logger.warn(r, r == null ? void 0 : r.message);
      }
    }), this.events.on(ce.connection_stalled, () => {
      if (this.transportExplicitlyClosed || this.stalledRestartInProgress) return;
      this.stalledRestartInProgress = !0;
      const r = this.stalledRestartBackoff === 0 ? 0 : Math.min(Math.pow(2, this.stalledRestartBackoff - 1) * this.stalledRestartBaseInterval, this.stalledRestartMaxInterval);
      this.stalledRestartBackoff++, this.logger.warn(`Connection stalled, restarting transport${r ? ` in ${r}ms` : ""}...`), this.stalledRestartTimeout = setTimeout(async () => {
        try {
          if (this.transportExplicitlyClosed) return;
          await this.restartTransport();
        } catch (n) {
          this.logger.error(n, n == null ? void 0 : n.message);
        } finally {
          this.stalledRestartInProgress = !1;
        }
      }, r);
    });
  }
  async onProviderDisconnect() {
    if (clearTimeout(this.pingTimeout), this.events.emit(ce.disconnect), !this.reconnectInProgress) {
      this.reconnectInProgress = !0;
      try {
        await this.subscriber.stop();
      } catch (e) {
        this.logger.warn(e, "subscriber.stop() failed during disconnect");
      }
      if (!this.subscriber.hasAnyTopics || this.transportExplicitlyClosed) {
        this.reconnectInProgress = !1;
        return;
      }
      this.reconnectTimeout = setTimeout(async () => {
        await this.transportOpen().catch((e) => this.logger.error(e, e == null ? void 0 : e.message)), this.reconnectTimeout = void 0, this.reconnectInProgress = !1;
      }, M.toMiliseconds(RS));
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async toEstablishConnection() {
    if (await this.confirmOnlineStateOrThrow(), !this.connected) {
      if (this.connectPromise) {
        await this.connectPromise;
        return;
      }
      this.connectPromise = this.connect().finally(() => {
        this.connectPromise = void 0;
      }), await this.connectPromise;
    }
  }
};
class Kr extends s0 {
  constructor(e, r, n, s = _t, i = void 0) {
    super(e, r, n, s), this.core = e, this.logger = r, this.name = n, this.map = /* @__PURE__ */ new Map(), this.version = PS, this.cached = [], this.initialized = !1, this.storagePrefix = _t, this.recentlyDeleted = [], this.recentlyDeletedLimit = 200, this.init = async () => {
      this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((o) => {
        this.getKey && o !== null && !ge(o) ? this.map.set(this.getKey(o), o) : k_(o) ? this.map.set(o.id, o) : M_(o) && this.map.set(o.topic, o);
      }), this.cached = [], this.initialized = !0);
    }, this.set = async (o, a) => {
      this.isInitialized(), this.map.has(o) ? await this.update(o, a) : (this.logger.debug("Setting value"), this.logger.trace({ type: "method", method: "set", key: o, value: a }), this.map.set(o, a), await this.persist());
    }, this.get = (o) => (this.isInitialized(), this.logger.debug("Getting value"), this.logger.trace({ type: "method", method: "get", key: o }), this.getData(o)), this.getAll = (o) => (this.isInitialized(), o ? this.values.filter((a) => Object.keys(o).every((c) => mS(a[c], o[c]))) : this.values), this.update = async (o, a) => {
      this.isInitialized(), this.logger.debug("Updating value"), this.logger.trace({ type: "method", method: "update", key: o, update: a });
      const c = { ...this.getData(o), ...a };
      this.map.set(o, c), await this.persist();
    }, this.delete = async (o, a) => {
      this.isInitialized(), this.map.has(o) && (this.logger.debug("Deleting value"), this.logger.trace({ type: "method", method: "delete", key: o, reason: a }), this.map.delete(o), this.addToRecentlyDeleted(o), await this.persist());
    }, this.logger = Ze(r, this.name), this.storagePrefix = s, this.getKey = i;
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.map.size;
  }
  get keys() {
    return Array.from(this.map.keys());
  }
  get values() {
    return Array.from(this.map.values());
  }
  addToRecentlyDeleted(e) {
    this.recentlyDeleted.push(e), this.recentlyDeleted.length >= this.recentlyDeletedLimit && this.recentlyDeleted.splice(0, this.recentlyDeletedLimit / 2);
  }
  async setDataStore(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getDataStore() {
    return await this.core.storage.getItem(this.storageKey);
  }
  getData(e) {
    const r = this.map.get(e);
    if (!r) {
      if (this.recentlyDeleted.includes(e)) {
        const { message: s } = F("MISSING_OR_INVALID", `Record was recently deleted - ${this.name}: ${e}`);
        throw this.logger.error(s), new Error(s);
      }
      const { message: n } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw this.logger.error(n), new Error(n);
    }
    return r;
  }
  async persist() {
    await this.setDataStore(this.values);
  }
  async restore() {
    try {
      const e = await this.getDataStore();
      if (typeof e > "u" || !e.length) return;
      if (this.map.size) {
        const { message: r } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw this.logger.error(r), new Error(r);
      }
      this.cached = e, this.logger.debug(`Successfully Restored value for ${this.name}`), this.logger.trace({ type: "method", method: "restore", value: this.values });
    } catch (e) {
      this.logger.debug(`Failed to Restore value for ${this.name}`), this.logger.error(e);
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
class oI {
  constructor(e, r) {
    this.core = e, this.logger = r, this.name = LS, this.version = kS, this.events = new vu(), this.initialized = !1, this.storagePrefix = _t, this.ignoredPayloadTypes = [Ft], this.registeredMethods = [], this.init = async () => {
      this.initialized || (await this.pairings.init(), await this.cleanup(), this.registerRelayerEvents(), this.registerExpirerEvents(), this.initialized = !0, this.logger.trace("Initialized"));
    }, this.register = ({ methods: n }) => {
      this.isInitialized(), this.registeredMethods = [.../* @__PURE__ */ new Set([...this.registeredMethods, ...n])];
    }, this.create = async (n) => {
      this.isInitialized();
      const s = Go(), i = await this.core.crypto.setSymKey(s), o = de(M.FIVE_MINUTES), a = { protocol: Od }, c = { topic: i, expiry: o, relay: a, active: !1, methods: n == null ? void 0 : n.methods }, l = Kl({ protocol: this.core.protocol, version: this.core.version, topic: i, symKey: s, relay: a, expiryTimestamp: o, methods: n == null ? void 0 : n.methods });
      return this.events.emit(Ir.create, c), this.core.expirer.set(i, o), await this.pairings.set(i, c), await this.core.relayer.subscribe(i, { transportType: n == null ? void 0 : n.transportType, internal: n == null ? void 0 : n.internal }), { topic: i, uri: l };
    }, this.pair = async (n) => {
      this.isInitialized();
      const s = this.core.eventClient.createEvent({ properties: { topic: n == null ? void 0 : n.uri, trace: [mt.pairing_started] } });
      this.isValidPair(n, s);
      const { topic: i, symKey: o, relay: a, expiryTimestamp: c, methods: l } = Hl(n.uri);
      s.props.properties.topic = i, s.addTrace(mt.pairing_uri_validation_success), s.addTrace(mt.pairing_uri_not_expired);
      let u;
      if (this.pairings.keys.includes(i)) {
        if (u = this.pairings.get(i), s.addTrace(mt.existing_pairing), u.active) throw s.setError(Rt.active_pairing_already_exists), new Error(`Pairing already exists: ${i}. Please try again with a new connection URI.`);
        s.addTrace(mt.pairing_not_expired);
      }
      const h = c || de(M.FIVE_MINUTES), f = { topic: i, relay: a, expiry: h, active: !1, methods: l };
      this.core.expirer.set(i, h), await this.pairings.set(i, f), s.addTrace(mt.store_new_pairing), n.activatePairing && await this.activate({ topic: i }), this.events.emit(Ir.create, f), s.addTrace(mt.emit_inactive_pairing), this.core.crypto.keychain.has(i) || await this.core.crypto.setSymKey(o, i), s.addTrace(mt.subscribing_pairing_topic);
      try {
        await this.core.relayer.confirmOnlineStateOrThrow();
      } catch {
        s.setError(Rt.no_internet_connection);
      }
      try {
        await this.core.relayer.subscribe(i, { relay: a });
      } catch (d) {
        throw s.setError(Rt.subscribe_pairing_topic_failure), d;
      }
      return s.addTrace(mt.subscribe_pairing_topic_success), f;
    }, this.activate = async ({ topic: n }) => {
      this.isInitialized();
      const s = de(M.FIVE_MINUTES);
      this.core.expirer.set(n, s), await this.pairings.update(n, { active: !0, expiry: s });
    }, this.ping = async (n) => {
      this.isInitialized(), await this.isValidPing(n), this.logger.warn("ping() is deprecated and will be removed in the next major release.");
      const { topic: s } = n;
      if (this.pairings.keys.includes(s)) {
        const i = await this.sendRequest(s, "wc_pairingPing", {}), { done: o, resolve: a, reject: c } = _r();
        this.events.once(te("pairing_ping", i), ({ error: l }) => {
          l ? c(l) : a();
        }), await o();
      }
    }, this.updateExpiry = async ({ topic: n, expiry: s }) => {
      this.isInitialized(), await this.pairings.update(n, { expiry: s });
    }, this.updateMetadata = async ({ topic: n, metadata: s }) => {
      this.isInitialized(), await this.pairings.update(n, { peerMetadata: s });
    }, this.getPairings = () => (this.isInitialized(), this.pairings.values), this.disconnect = async (n) => {
      this.isInitialized(), await this.isValidDisconnect(n);
      const { topic: s } = n;
      this.pairings.keys.includes(s) && (await this.sendRequest(s, "wc_pairingDelete", oe("USER_DISCONNECTED")), await this.deletePairing(s));
    }, this.formatUriFromPairing = (n) => {
      this.isInitialized();
      const { topic: s, relay: i, expiry: o, methods: a } = n, c = this.core.crypto.keychain.get(s);
      return Kl({ protocol: this.core.protocol, version: this.core.version, topic: s, symKey: c, relay: i, expiryTimestamp: o, methods: a });
    }, this.sendRequest = async (n, s, i) => {
      const o = Ut(s, i), a = await this.core.crypto.encode(n, o), c = Tn[s].req;
      return this.core.history.set(n, o), this.core.relayer.publish(n, a, c), o.id;
    }, this.sendResult = async (n, s, i) => {
      const o = si(n, i), a = await this.core.crypto.encode(s, o), c = (await this.core.history.get(s, n)).request.method, l = Tn[c].res;
      await this.core.relayer.publish(s, a, l), await this.core.history.resolve(o);
    }, this.sendError = async (n, s, i) => {
      const o = ka(n, i), a = await this.core.crypto.encode(s, o), c = (await this.core.history.get(s, n)).request.method, l = Tn[c] ? Tn[c].res : Tn.unregistered_method.res;
      await this.core.relayer.publish(s, a, l), await this.core.history.resolve(o);
    }, this.deletePairing = async (n, s) => {
      await this.core.relayer.unsubscribe(n), await Promise.all([this.pairings.delete(n, oe("USER_DISCONNECTED")), this.core.crypto.deleteSymKey(n), s ? Promise.resolve() : this.core.expirer.del(n)]);
    }, this.cleanup = async () => {
      const n = this.pairings.getAll().filter((s) => or(s.expiry));
      await Promise.all(n.map((s) => this.deletePairing(s.topic)));
    }, this.onRelayEventRequest = async (n) => {
      const { topic: s, payload: i } = n;
      switch (i.method) {
        case "wc_pairingPing":
          return await this.onPairingPingRequest(s, i);
        case "wc_pairingDelete":
          return await this.onPairingDeleteRequest(s, i);
        default:
          return await this.onUnknownRpcMethodRequest(s, i);
      }
    }, this.onRelayEventResponse = async (n) => {
      const { topic: s, payload: i } = n, o = (await this.core.history.get(s, i.id)).request.method;
      switch (o) {
        case "wc_pairingPing":
          return this.onPairingPingResponse(s, i);
        default:
          return this.onUnknownRpcMethodResponse(o);
      }
    }, this.onPairingPingRequest = async (n, s) => {
      const { id: i } = s;
      try {
        this.isValidPing({ topic: n }), await this.sendResult(i, n, !0), this.events.emit(Ir.ping, { id: i, topic: n });
      } catch (o) {
        await this.sendError(i, n, o), this.logger.error(o);
      }
    }, this.onPairingPingResponse = (n, s) => {
      const { id: i } = s;
      setTimeout(() => {
        Et(s) ? this.events.emit(te("pairing_ping", i), {}) : nt(s) && this.events.emit(te("pairing_ping", i), { error: s.error });
      }, 500);
    }, this.onPairingDeleteRequest = async (n, s) => {
      const { id: i } = s;
      try {
        this.isValidDisconnect({ topic: n }), await this.deletePairing(n), this.events.emit(Ir.delete, { id: i, topic: n });
      } catch (o) {
        await this.sendError(i, n, o), this.logger.error(o);
      }
    }, this.onUnknownRpcMethodRequest = async (n, s) => {
      const { id: i, method: o } = s;
      try {
        if (this.registeredMethods.includes(o)) return;
        const a = oe("WC_METHOD_UNSUPPORTED", o);
        await this.sendError(i, n, a), this.logger.error(a);
      } catch (a) {
        await this.sendError(i, n, a), this.logger.error(a);
      }
    }, this.onUnknownRpcMethodResponse = (n) => {
      this.registeredMethods.includes(n) || this.logger.error(oe("WC_METHOD_UNSUPPORTED", n));
    }, this.isValidPair = (n, s) => {
      var o;
      if (!Fe(n)) {
        const { message: a } = F("MISSING_OR_INVALID", `pair() params: ${n}`);
        throw s.setError(Rt.malformed_pairing_uri), new Error(a);
      }
      if (!L_(n.uri)) {
        const { message: a } = F("MISSING_OR_INVALID", `pair() uri: ${n.uri}`);
        throw s.setError(Rt.malformed_pairing_uri), new Error(a);
      }
      const i = Hl(n == null ? void 0 : n.uri);
      if (!((o = i == null ? void 0 : i.relay) != null && o.protocol)) {
        const { message: a } = F("MISSING_OR_INVALID", "pair() uri#relay-protocol");
        throw s.setError(Rt.malformed_pairing_uri), new Error(a);
      }
      if (!(i != null && i.symKey)) {
        const { message: a } = F("MISSING_OR_INVALID", "pair() uri#symKey");
        throw s.setError(Rt.malformed_pairing_uri), new Error(a);
      }
      if (i != null && i.expiryTimestamp && M.toMiliseconds(i == null ? void 0 : i.expiryTimestamp) < Date.now()) {
        s.setError(Rt.pairing_expired);
        const { message: a } = F("EXPIRED", "pair() URI has expired. Please try again with a new connection URI.");
        throw new Error(a);
      }
    }, this.isValidPing = async (n) => {
      if (!Fe(n)) {
        const { message: i } = F("MISSING_OR_INVALID", `ping() params: ${n}`);
        throw new Error(i);
      }
      const { topic: s } = n;
      await this.isValidPairingTopic(s);
    }, this.isValidDisconnect = async (n) => {
      if (!Fe(n)) {
        const { message: i } = F("MISSING_OR_INVALID", `disconnect() params: ${n}`);
        throw new Error(i);
      }
      const { topic: s } = n;
      await this.isValidPairingTopic(s);
    }, this.isValidPairingTopic = async (n) => {
      if (!ue(n, !1)) {
        const { message: s } = F("MISSING_OR_INVALID", `pairing topic should be a string: ${n}`);
        throw new Error(s);
      }
      if (!this.pairings.keys.includes(n)) {
        const { message: s } = F("NO_MATCHING_KEY", `pairing topic doesn't exist: ${n}`);
        throw new Error(s);
      }
      if (or(this.pairings.get(n).expiry)) {
        await this.deletePairing(n);
        const { message: s } = F("EXPIRED", `pairing topic: ${n}`);
        throw new Error(s);
      }
    }, this.core = e, this.logger = Ze(r, this.name), this.pairings = new Kr(this.core, this.logger, this.name, this.storagePrefix);
  }
  get context() {
    return Ke(this.logger);
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  registerRelayerEvents() {
    this.core.relayer.on(ce.message, async (e) => {
      const { topic: r, message: n, transportType: s } = e;
      if (this.pairings.keys.includes(r) && s !== ne.link_mode) {
        try {
          if (this.core.crypto.getPayloadType(n, vt) === kr) {
            this.logger.warn(`registerRelayerEvents() -> non-link mode TYPE_2 payload ignored: ${n}`);
            return;
          }
        } catch {
        }
        if (!this.ignoredPayloadTypes.includes(this.core.crypto.getPayloadType(n))) try {
          const i = await this.core.crypto.decode(r, n);
          Ma(i) ? (this.core.history.set(r, i), await this.onRelayEventRequest({ topic: r, payload: i })) : Si(i) && (await this.core.history.resolve(i), await this.onRelayEventResponse({ topic: r, payload: i }), this.core.history.delete(r, i.id)), await this.core.relayer.messages.ack(r, n);
        } catch (i) {
          this.logger.error(i);
        }
      }
    });
  }
  registerExpirerEvents() {
    this.core.expirer.on(et.expired, async (e) => {
      const { topic: r } = id(e.target);
      r && this.pairings.keys.includes(r) && (await this.deletePairing(r, !0), this.events.emit(Ir.expire, { topic: r }));
    });
  }
}
class aI extends e0 {
  constructor(e, r) {
    super(e, r), this.core = e, this.logger = r, this.records = /* @__PURE__ */ new Map(), this.events = new dt.EventEmitter(), this.name = MS, this.version = FS, this.cached = [], this.initialized = !1, this.storagePrefix = _t, this.init = async () => {
      this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((n) => this.records.set(n.id, n)), this.cached = [], this.registerEventListeners(), this.initialized = !0);
    }, this.set = (n, s, i) => {
      if (this.isInitialized(), this.logger.debug("Setting JSON-RPC request history record"), this.logger.trace({ type: "method", method: "set", topic: n, request: s, chainId: i }), this.records.has(s.id)) return;
      const o = { id: s.id, topic: n, request: { method: s.method, params: s.params || null }, chainId: i, expiry: de(M.THIRTY_DAYS) };
      this.records.set(o.id, o), this.persist(), this.events.emit(ot.created, o);
    }, this.resolve = async (n) => {
      if (this.isInitialized(), this.logger.debug("Updating JSON-RPC response history record"), this.logger.trace({ type: "method", method: "update", response: n }), !this.records.has(n.id)) return;
      const s = await this.getRecord(n.id);
      typeof s.response < "u" || (s.response = nt(n) ? { error: n.error } : { result: n.result }, this.records.set(s.id, s), this.persist(), this.events.emit(ot.updated, s));
    }, this.get = async (n, s) => (this.isInitialized(), this.logger.debug("Getting record"), this.logger.trace({ type: "method", method: "get", topic: n, id: s }), await this.getRecord(s)), this.delete = (n, s) => {
      this.isInitialized(), this.logger.debug("Deleting record"), this.logger.trace({ type: "method", method: "delete", id: s }), this.values.forEach((i) => {
        if (i.topic === n) {
          if (typeof s < "u" && i.id !== s) return;
          this.records.delete(i.id), this.events.emit(ot.deleted, i);
        }
      }), this.persist();
    }, this.exists = async (n, s) => (this.isInitialized(), this.records.has(s) ? (await this.getRecord(s)).topic === n : !1), this.on = (n, s) => {
      this.events.on(n, s);
    }, this.once = (n, s) => {
      this.events.once(n, s);
    }, this.off = (n, s) => {
      this.events.off(n, s);
    }, this.removeListener = (n, s) => {
      this.events.removeListener(n, s);
    }, this.logger = Ze(r, this.name);
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get size() {
    return this.records.size;
  }
  get keys() {
    return Array.from(this.records.keys());
  }
  get values() {
    return Array.from(this.records.values());
  }
  get pending() {
    const e = [];
    return this.values.forEach((r) => {
      if (typeof r.response < "u") return;
      const n = { topic: r.topic, request: Ut(r.request.method, r.request.params, r.id), chainId: r.chainId };
      return e.push(n);
    }), e;
  }
  async setJsonRpcRecords(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getJsonRpcRecords() {
    return await this.core.storage.getItem(this.storageKey);
  }
  getRecord(e) {
    this.isInitialized();
    const r = this.records.get(e);
    if (!r) {
      const { message: n } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw new Error(n);
    }
    return r;
  }
  async persist() {
    await this.setJsonRpcRecords(this.values), this.events.emit(ot.sync);
  }
  async restore() {
    try {
      const e = await this.getJsonRpcRecords();
      if (typeof e > "u" || !e.length) return;
      if (this.records.size) {
        const { message: r } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw this.logger.error(r), new Error(r);
      }
      this.cached = e, this.logger.debug(`Successfully Restored records for ${this.name}`), this.logger.trace({ type: "method", method: "restore", records: this.values });
    } catch (e) {
      this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(e);
    }
  }
  registerEventListeners() {
    this.events.on(ot.created, (e) => {
      const r = ot.created;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, record: e });
    }), this.events.on(ot.updated, (e) => {
      const r = ot.updated;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, record: e });
    }), this.events.on(ot.deleted, (e) => {
      const r = ot.deleted;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, record: e });
    }), this.core.heartbeat.on(qr.pulse, () => {
      this.cleanup();
    });
  }
  cleanup() {
    try {
      this.isInitialized();
      let e = !1;
      this.records.forEach((r) => {
        M.toMiliseconds(r.expiry || 0) - Date.now() <= 0 && (this.logger.info(`Deleting expired history log: ${r.id}`), this.records.delete(r.id), this.events.emit(ot.deleted, r, !1), e = !0);
      }), e && this.persist();
    } catch (e) {
      this.logger.warn(e);
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
class cI extends o0 {
  constructor(e, r) {
    super(e, r), this.core = e, this.logger = r, this.expirations = /* @__PURE__ */ new Map(), this.events = new dt.EventEmitter(), this.name = qS, this.version = zS, this.cached = [], this.initialized = !1, this.storagePrefix = _t, this.init = async () => {
      this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((n) => this.expirations.set(n.target, n)), this.cached = [], this.registerEventListeners(), this.initialized = !0);
    }, this.has = (n) => {
      try {
        const s = this.formatTarget(n);
        return typeof this.getExpiration(s) < "u";
      } catch {
        return !1;
      }
    }, this.set = (n, s) => {
      this.isInitialized();
      const i = this.formatTarget(n), o = { target: i, expiry: s };
      this.expirations.set(i, o), this.checkExpiry(i, o), this.events.emit(et.created, { target: i, expiration: o });
    }, this.get = (n) => {
      this.isInitialized();
      const s = this.formatTarget(n);
      return this.getExpiration(s);
    }, this.del = (n) => {
      if (this.isInitialized(), this.has(n)) {
        const s = this.formatTarget(n), i = this.getExpiration(s);
        this.expirations.delete(s), this.events.emit(et.deleted, { target: s, expiration: i });
      }
    }, this.on = (n, s) => {
      this.events.on(n, s);
    }, this.once = (n, s) => {
      this.events.once(n, s);
    }, this.off = (n, s) => {
      this.events.off(n, s);
    }, this.removeListener = (n, s) => {
      this.events.removeListener(n, s);
    }, this.logger = Ze(r, this.name);
  }
  get context() {
    return Ke(this.logger);
  }
  get storageKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
  }
  get length() {
    return this.expirations.size;
  }
  get keys() {
    return Array.from(this.expirations.keys());
  }
  get values() {
    return Array.from(this.expirations.values());
  }
  formatTarget(e) {
    if (typeof e == "string") return Cx(e);
    if (typeof e == "number") return Nx(e);
    const { message: r } = F("UNKNOWN_TYPE", `Target type: ${typeof e}`);
    throw new Error(r);
  }
  async setExpirations(e) {
    await this.core.storage.setItem(this.storageKey, e);
  }
  async getExpirations() {
    return await this.core.storage.getItem(this.storageKey);
  }
  async persist() {
    await this.setExpirations(this.values), this.events.emit(et.sync);
  }
  async restore() {
    try {
      const e = await this.getExpirations();
      if (typeof e > "u" || !e.length) return;
      if (this.expirations.size) {
        const { message: r } = F("RESTORE_WILL_OVERRIDE", this.name);
        throw this.logger.error(r), new Error(r);
      }
      this.cached = e, this.logger.debug(`Successfully Restored expirations for ${this.name}`), this.logger.trace({ type: "method", method: "restore", expirations: this.values });
    } catch (e) {
      this.logger.debug(`Failed to Restore expirations for ${this.name}`), this.logger.error(e);
    }
  }
  getExpiration(e) {
    const r = this.expirations.get(e);
    if (!r) {
      const { message: n } = F("NO_MATCHING_KEY", `${this.name}: ${e}`);
      throw this.logger.warn(n), new Error(n);
    }
    return r;
  }
  checkExpiry(e, r) {
    const { expiry: n } = r;
    M.toMiliseconds(n) - Date.now() <= 0 && this.expire(e, r);
  }
  expire(e, r) {
    this.expirations.delete(e), this.events.emit(et.expired, { target: e, expiration: r });
  }
  checkExpirations() {
    this.core.relayer.connected && this.expirations.forEach((e, r) => this.checkExpiry(r, e));
  }
  registerEventListeners() {
    this.core.heartbeat.on(qr.pulse, () => this.checkExpirations()), this.events.on(et.created, (e) => {
      const r = et.created;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, data: e }), this.persist();
    }), this.events.on(et.expired, (e) => {
      const r = et.expired;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, data: e }), this.persist();
    }), this.events.on(et.deleted, (e) => {
      const r = et.deleted;
      this.logger.info(`Emitting ${r}`), this.logger.debug({ type: "event", event: r, data: e }), this.persist();
    });
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
}
class lI extends a0 {
  constructor(e, r, n) {
    super(e, r, n), this.core = e, this.logger = r, this.store = n, this.name = jS, this.verifyUrlV3 = KS, this.storagePrefix = _t, this.version = Ad, this.init = async () => {
      var s;
      this.isDevEnv || (this.publicKey = await this.store.getItem(this.storeKey), this.publicKey && M.toMiliseconds((s = this.publicKey) == null ? void 0 : s.expiresAt) < Date.now() && (this.logger.debug("verify v2 public key expired"), await this.removePublicKey()));
    }, this.register = async (s) => {
      if (!wn() || this.isDevEnv) return;
      const i = window.location.origin, { id: o, decryptedId: a } = s, c = `${this.verifyUrlV3}/attestation?projectId=${this.core.projectId}&origin=${i}&id=${o}&decryptedId=${a}`;
      try {
        const l = Nr(), u = this.startAbortTimer(M.ONE_SECOND * 5), h = await new Promise((f, d) => {
          const p = () => {
            window.removeEventListener("message", m), l.body.removeChild(g), d("attestation aborted");
          };
          this.abortController.signal.addEventListener("abort", p);
          const g = l.createElement("iframe");
          g.src = c, g.style.display = "none", g.addEventListener("error", p, { signal: this.abortController.signal });
          const m = (_) => {
            if (_.data && typeof _.data == "string") try {
              const R = JSON.parse(_.data);
              if (R.type === "verify_attestation") {
                if ($o(R.attestation).payload.id !== o) return;
                clearInterval(u), l.body.removeChild(g), this.abortController.signal.removeEventListener("abort", p), window.removeEventListener("message", m), f(R.attestation === null ? "" : R.attestation);
              }
            } catch (R) {
              this.logger.warn(R);
            }
          };
          l.body.appendChild(g), window.addEventListener("message", m, { signal: this.abortController.signal });
        });
        return this.logger.debug(h, "jwt attestation"), h;
      } catch (l) {
        this.logger.warn(l);
      }
      return "";
    }, this.resolve = async (s) => {
      if (this.isDevEnv) return "";
      const { attestationId: i, hash: o, encryptedId: a } = s;
      if (i === "") {
        this.logger.debug("resolve: attestationId is empty, skipping");
        return;
      }
      if (i) {
        if ($o(i).payload.id !== a) return;
        const l = await this.isValidJwtAttestation(i);
        if (l) {
          if (!l.isVerified) {
            this.logger.warn("resolve: jwt attestation: origin url not verified");
            return;
          }
          return l;
        }
      }
      if (!o) return;
      const c = this.getVerifyUrl(s == null ? void 0 : s.verifyUrl);
      return this.fetchAttestation(o, c);
    }, this.fetchAttestation = async (s, i) => {
      this.logger.debug(`resolving attestation: ${s} from url: ${i}`);
      const o = this.startAbortTimer(M.ONE_SECOND * 5), a = await fetch(`${i}/attestation/${s}?v2Supported=true`, { signal: this.abortController.signal });
      return clearTimeout(o), a.status === 200 ? await a.json() : void 0;
    }, this.getVerifyUrl = (s) => {
      let i = s || Fn;
      return VS.includes(i) || (this.logger.info(`verify url: ${i}, not included in trusted list, assigning default: ${Fn}`), i = Fn), i;
    }, this.fetchPublicKey = async () => {
      try {
        this.logger.debug(`fetching public key from: ${this.verifyUrlV3}`);
        const s = this.startAbortTimer(M.FIVE_SECONDS), i = await fetch(`${this.verifyUrlV3}/public-key`, { signal: this.abortController.signal });
        return clearTimeout(s), await i.json();
      } catch (s) {
        this.logger.warn(s);
      }
    }, this.persistPublicKey = async (s) => {
      this.logger.debug(s, "persisting public key to local storage"), await this.store.setItem(this.storeKey, s), this.publicKey = s;
    }, this.removePublicKey = async () => {
      this.logger.debug("removing verify v2 public key from storage"), await this.store.removeItem(this.storeKey), this.publicKey = void 0;
    }, this.isValidJwtAttestation = async (s) => {
      const i = await this.getPublicKey();
      try {
        if (i) return this.validateAttestation(s, i);
      } catch (a) {
        this.logger.error(a), this.logger.warn("error validating attestation");
      }
      const o = await this.fetchAndPersistPublicKey();
      try {
        if (o) return this.validateAttestation(s, o);
      } catch (a) {
        this.logger.error(a), this.logger.warn("error validating attestation");
      }
    }, this.getPublicKey = async () => this.publicKey ? this.publicKey : await this.fetchAndPersistPublicKey(), this.fetchAndPersistPublicKey = async () => {
      if (this.fetchPromise) return await this.fetchPromise, this.publicKey;
      this.fetchPromise = new Promise(async (i) => {
        const o = await this.fetchPublicKey();
        o && (await this.persistPublicKey(o), i(o));
      });
      const s = await this.fetchPromise;
      return this.fetchPromise = void 0, s;
    }, this.validateAttestation = (s, i) => {
      const o = __(s, i.publicKey), a = { hasExpired: M.toMiliseconds(o.exp) < Date.now(), payload: o };
      if (a.hasExpired) throw this.logger.warn("resolve: jwt attestation expired"), new Error("JWT attestation expired");
      return { origin: a.payload.origin, isScam: a.payload.isScam, isVerified: a.payload.isVerified };
    }, this.logger = Ze(r, this.name), this.abortController = new AbortController(), this.isDevEnv = Ca(), this.init();
  }
  get storeKey() {
    return this.storagePrefix + this.version + this.core.customStoragePrefix + "//verify:public:key";
  }
  get context() {
    return Ke(this.logger);
  }
  startAbortTimer(e) {
    return this.abortController = new AbortController(), setTimeout(() => this.abortController.abort(), M.toMiliseconds(e));
  }
}
class uI extends c0 {
  constructor(e, r) {
    super(e, r), this.projectId = e, this.logger = r, this.context = WS, this.registerDeviceToken = async (n) => {
      const { clientId: s, token: i, notificationType: o, enableEncrypted: a = !1 } = n, c = `${GS}/${this.projectId}/clients`;
      await fetch(c, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: s, type: o, token: i, always_raw: a }) });
    }, this.logger = Ze(r, this.context);
  }
}
let hI = class extends l0 {
  constructor(e, r, n = !0) {
    super(e, r, n), this.core = e, this.logger = r, this.context = ZS, this.storagePrefix = _t, this.storageVersion = YS, this.events = /* @__PURE__ */ new Map(), this.shouldPersist = !1, this.init = async () => {
      if (!Ca()) try {
        const s = { eventId: Nl(), timestamp: Date.now(), domain: this.getAppDomain(), props: { event: "INIT", type: "", properties: { client_id: await this.core.crypto.getClientId(), user_agent: nd(this.core.relayer.protocol, this.core.relayer.version, Zo) } } };
        await this.sendEvent([s]);
      } catch (s) {
        this.logger.warn(s);
      }
    }, this.createEvent = (s) => {
      const { event: i = "ERROR", type: o = "", properties: { topic: a, trace: c } } = s, l = Nl(), u = this.core.projectId || "", h = Date.now(), f = { eventId: l, timestamp: h, props: { event: i, type: o, properties: { topic: a, trace: c } }, bundleId: u, domain: this.getAppDomain(), ...this.setMethods(l) };
      return this.telemetryEnabled && (this.events.set(l, f), this.shouldPersist = !0), f;
    }, this.getEvent = (s) => {
      const { eventId: i, topic: o } = s;
      if (i) return this.events.get(i);
      const a = Array.from(this.events.values()).find((c) => c.props.properties.topic === o);
      if (a) return { ...a, ...this.setMethods(a.eventId) };
    }, this.deleteEvent = (s) => {
      const { eventId: i } = s;
      this.events.delete(i), this.shouldPersist = !0;
    }, this.setEventListeners = () => {
      this.core.heartbeat.on(qr.pulse, async () => {
        this.shouldPersist && await this.persist(), this.events.forEach((s) => {
          M.fromMiliseconds(Date.now()) - M.fromMiliseconds(s.timestamp) > XS && (this.events.delete(s.eventId), this.shouldPersist = !0);
        });
      });
    }, this.setMethods = (s) => ({ addTrace: (i) => this.addTrace(s, i), setError: (i) => this.setError(s, i) }), this.addTrace = (s, i) => {
      const o = this.events.get(s);
      o && (o.props.properties.trace.push(i), this.events.set(s, o), this.shouldPersist = !0);
    }, this.setError = (s, i) => {
      const o = this.events.get(s);
      o && (o.props.type = i, o.timestamp = Date.now(), this.events.set(s, o), this.shouldPersist = !0);
    }, this.persist = async () => {
      await this.core.storage.setItem(this.storageKey, Array.from(this.events.values())), this.shouldPersist = !1;
    }, this.restore = async () => {
      try {
        const s = await this.core.storage.getItem(this.storageKey) || [];
        if (!s.length) return;
        s.forEach((i) => {
          this.events.set(i.eventId, { ...i, ...this.setMethods(i.eventId) });
        });
      } catch (s) {
        this.logger.warn(s);
      }
    }, this.submit = async () => {
      if (!this.telemetryEnabled || this.events.size === 0) return;
      const s = [];
      for (const [i, o] of this.events) o.props.type && s.push(o);
      if (s.length !== 0) try {
        if ((await this.sendEvent(s)).ok) for (const i of s) this.events.delete(i.eventId), this.shouldPersist = !0;
      } catch (i) {
        this.logger.warn(i);
      }
    }, this.sendEvent = async (s) => {
      const i = this.getAppDomain() ? "" : "&sp=desktop";
      return await fetch(`${JS}?projectId=${this.core.projectId}&st=events_sdk&sv=js-${Zo}${i}`, { method: "POST", body: JSON.stringify(s) });
    }, this.getAppDomain = () => rd().url, this.logger = Ze(r, this.context), this.telemetryEnabled = n, n ? this.restore().then(async () => {
      await this.submit(), this.setEventListeners();
    }) : this.persist();
  }
  get storageKey() {
    return this.storagePrefix + this.storageVersion + this.core.customStoragePrefix + "//" + this.context;
  }
}, fI = class Bd extends Qg {
  constructor(e) {
    var o;
    super(e), this.protocol = Dd, this.version = Ad, this.name = Yo, this.events = new dt.EventEmitter(), this.initialized = !1, this.on = (a, c) => this.events.on(a, c), this.once = (a, c) => this.events.once(a, c), this.off = (a, c) => this.events.off(a, c), this.removeListener = (a, c) => this.events.removeListener(a, c), this.dispatchEnvelope = ({ topic: a, message: c, sessionExists: l }) => {
      if (!a || !c) return;
      const u = { topic: a, message: c, publishedAt: Date.now(), transportType: ne.link_mode };
      this.relayer.onLinkMessageEvent(u, { sessionExists: l });
    };
    const r = this.getGlobalCore(e == null ? void 0 : e.customStoragePrefix);
    if (r) try {
      return this.customStoragePrefix = r.customStoragePrefix, this.logger = r.logger, this.heartbeat = r.heartbeat, this.crypto = r.crypto, this.history = r.history, this.expirer = r.expirer, this.storage = r.storage, this.relayer = r.relayer, this.pairing = r.pairing, this.verify = r.verify, this.echoClient = r.echoClient, this.linkModeSupportedApps = r.linkModeSupportedApps, this.eventClient = r.eventClient, this.initialized = r.initialized, this.logChunkController = r.logChunkController, r;
    } catch (a) {
      console.warn("Failed to copy global core", a);
    }
    this.projectId = e == null ? void 0 : e.projectId, this.relayUrl = (e == null ? void 0 : e.relayUrl) || $d, this.customStoragePrefix = e != null && e.customStoragePrefix ? `:${e.customStoragePrefix}` : "";
    const n = Gg({ level: typeof (e == null ? void 0 : e.logger) == "string" && e.logger ? e.logger : bS.logger, name: Yo }), { logger: s, chunkLoggerController: i } = Ou({ opts: n, maxSizeInBytes: e == null ? void 0 : e.maxLogBlobSizeInBytes, loggerOverride: e == null ? void 0 : e.logger });
    this.logChunkController = i, (o = this.logChunkController) != null && o.downloadLogsBlobInBrowser && (window.downloadLogsBlobInBrowser = async () => {
      var a, c;
      (a = this.logChunkController) != null && a.downloadLogsBlobInBrowser && ((c = this.logChunkController) == null || c.downloadLogsBlobInBrowser({ clientId: await this.crypto.getClientId() }));
    }), this.logger = Ze(s, this.name), this.heartbeat = new Jo(), this.crypto = new eI(this, this.logger, e == null ? void 0 : e.keychain), this.history = new aI(this, this.logger), this.expirer = new cI(this, this.logger), this.storage = e != null && e.storage ? e.storage : new lg({ ...ES, ...e == null ? void 0 : e.storageOptions }), this.relayer = new iI({ core: this, logger: this.logger, relayUrl: this.relayUrl, projectId: this.projectId }), this.pairing = new oI(this, this.logger), this.verify = new lI(this, this.logger, this.storage), this.echoClient = new uI(this.projectId || "", this.logger), this.linkModeSupportedApps = [], this.eventClient = new hI(this, this.logger, e == null ? void 0 : e.telemetryEnabled), this.setGlobalCore(this);
  }
  static async init(e) {
    const r = new Bd(e);
    await r.initialize();
    const n = await r.crypto.getClientId();
    return await r.storage.setItem(CS, n), r;
  }
  get context() {
    return Ke(this.logger);
  }
  async start() {
    this.initialized || await this.initialize();
  }
  async getLogsBlob() {
    var e;
    return (e = this.logChunkController) == null ? void 0 : e.logsToBlob({ clientId: await this.crypto.getClientId() });
  }
  async addLinkModeSupportedApp(e) {
    this.linkModeSupportedApps.includes(e) || (this.linkModeSupportedApps.push(e), await this.storage.setItem(uu, this.linkModeSupportedApps));
  }
  async initialize() {
    this.logger.trace("Initialized");
    try {
      await this.crypto.init(), await this.history.init(), await this.expirer.init(), await this.relayer.init(), await this.heartbeat.init(), await this.pairing.init(), this.linkModeSupportedApps = await this.storage.getItem(uu) || [], this.initialized = !0, this.logger.info("Core Initialization Success");
    } catch (e) {
      throw this.logger.warn(e, `Core Initialization Failure at epoch ${Date.now()}`), this.logger.error(e.message), e;
    }
  }
  getGlobalCore(e = "") {
    try {
      if (this.isGlobalCoreDisabled()) return;
      const r = `_walletConnectCore_${e}`, n = `${r}_count`;
      return globalThis[n] = (globalThis[n] || 0) + 1, globalThis[n] > 1 && console.warn(`WalletConnect Core is already initialized. This is probably a mistake and can lead to unexpected behavior. Init() was called ${globalThis[n]} times.`), globalThis[r];
    } catch (r) {
      console.warn("Failed to get global WalletConnect core", r);
      return;
    }
  }
  setGlobalCore(e) {
    var r;
    try {
      if (this.isGlobalCoreDisabled()) return;
      const n = `_walletConnectCore_${((r = e.opts) == null ? void 0 : r.customStoragePrefix) || ""}`;
      globalThis[n] = e;
    } catch (n) {
      console.warn("Failed to set global WalletConnect core", n);
    }
  }
  isGlobalCoreDisabled() {
    try {
      return typeof process < "u" && process.env.DISABLE_GLOBAL_CORE === "true";
    } catch {
      return !0;
    }
  }
};
const dI = fI, Rd = "wc", Pd = 2, Cd = "client", Fa = `${Rd}@${Pd}:${Cd}:`, yo = { name: Cd, logger: "error" }, hu = "WALLETCONNECT_DEEPLINK_CHOICE", pI = "proposal", fu = "Proposal expired", gI = "session", Jr = M.SEVEN_DAYS, yI = "engine", _e = { wc_sessionPropose: { req: { ttl: M.FIVE_MINUTES, prompt: !0, tag: 1100 }, res: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1101 }, reject: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1120 }, autoReject: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1121 } }, wc_sessionSettle: { req: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1102 }, res: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1103 } }, wc_sessionUpdate: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 1104 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 1105 } }, wc_sessionExtend: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 1106 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 1107 } }, wc_sessionRequest: { req: { ttl: M.FIVE_MINUTES * 3, prompt: !0, tag: 1108 }, res: { ttl: M.FIVE_MINUTES * 3, prompt: !1, tag: 1109 } }, wc_sessionEvent: { req: { ttl: M.FIVE_MINUTES, prompt: !0, tag: 1110 }, res: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1111 } }, wc_sessionDelete: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 1112 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 1113 } }, wc_sessionPing: { req: { ttl: M.ONE_DAY, prompt: !1, tag: 1114 }, res: { ttl: M.ONE_DAY, prompt: !1, tag: 1115 } }, wc_sessionAuthenticate: { req: { ttl: M.ONE_HOUR, prompt: !0, tag: 1116 }, res: { ttl: M.ONE_HOUR, prompt: !1, tag: 1117 }, reject: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1118 }, autoReject: { ttl: M.FIVE_MINUTES, prompt: !1, tag: 1119 } } }, wo = { min: M.FIVE_MINUTES, max: M.SEVEN_DAYS }, wt = { idle: "IDLE", active: "ACTIVE" }, wI = { eth_sendTransaction: { key: "" }, eth_sendRawTransaction: { key: "" }, wallet_sendCalls: { key: "" }, solana_signTransaction: { key: "signature" }, solana_signAllTransactions: { key: "transactions" }, solana_signAndSendTransaction: { key: "signature" }, sui_signAndExecuteTransaction: { key: "digest" }, sui_signTransaction: { key: "" }, hedera_signAndExecuteTransaction: { key: "transactionId" }, hedera_executeTransaction: { key: "transactionId" }, near_signTransaction: { key: "" }, near_signTransactions: { key: "" }, tron_signTransaction: { key: "txID" }, xrpl_signTransaction: { key: "" }, xrpl_signTransactionFor: { key: "" }, algo_signTxn: { key: "" }, sendTransfer: { key: "txid" }, stacks_stxTransfer: { key: "txId" }, polkadot_signTransaction: { key: "" }, cosmos_signDirect: { key: "" }, canton_prepareSignExecute: { key: "" } }, mI = "request", bI = ["wc_sessionPropose", "wc_sessionRequest", "wc_authRequest", "wc_sessionAuthenticate"], EI = "wc", vI = "auth", xI = "authKeys", _I = "pairingTopics", SI = "requests", Ii = `${EI}@${1.5}:${vI}:`, rr = `${Ii}:PUB_KEY`;
class II extends h0 {
  constructor(e) {
    super(e), this.name = yI, this.events = new vu(), this.initialized = !1, this.requestQueue = { state: wt.idle, queue: [] }, this.sessionRequestQueue = { state: wt.idle, queue: [] }, this.emittedSessionRequests = new Hx({ limit: 500 }), this.requestQueueDelay = M.ONE_SECOND, this.expectedPairingMethodMap = /* @__PURE__ */ new Map(), this.recentlyDeletedMap = /* @__PURE__ */ new Map(), this.recentlyDeletedLimit = 200, this.relayMessageCache = [], this.pendingSessions = /* @__PURE__ */ new Map(), this.init = async () => {
      this.initialized || (await this.cleanup(), this.registerRelayerEvents(), this.registerExpirerEvents(), this.registerPairingEvents(), this.registerSubscriptionCleanup(), await this.registerLinkModeListeners(), this.client.core.pairing.register({ methods: Object.keys(_e) }), this.initialized = !0, setTimeout(async () => {
        await this.processPendingMessageEvents(), this.sessionRequestQueue.queue = this.getPendingSessionRequests(), this.processSessionRequestQueue();
      }, M.toMiliseconds(this.requestQueueDelay)));
    }, this.connect = async (r) => {
      var P;
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      const n = { ...r, requiredNamespaces: r.requiredNamespaces || {}, optionalNamespaces: r.optionalNamespaces || {} };
      await this.isValidConnect(n), n.optionalNamespaces = C_(n.requiredNamespaces, n.optionalNamespaces), n.requiredNamespaces = {};
      const { pairingTopic: s, requiredNamespaces: i, optionalNamespaces: o, sessionProperties: a, scopedProperties: c, relays: l, authentication: u, walletPay: h } = n, f = ((P = u == null ? void 0 : u[0]) == null ? void 0 : P.ttl) || _e.wc_sessionPropose.req.ttl || M.FIVE_MINUTES;
      this.validateRequestExpiry(f);
      let d = s, p, g = !1;
      try {
        if (d) {
          const O = this.client.core.pairing.pairings.get(d);
          this.client.logger.warn("connect() with existing pairing topic is deprecated and will be removed in the next major release."), g = O.active;
        }
      } catch (O) {
        throw this.client.logger.error(`connect() -> pairing.get(${d}) failed`), O;
      }
      if (!d || !g) {
        const { topic: O, uri: U } = await this.client.core.pairing.create({ internal: { skipSubscribe: !0 } });
        d = O, p = U;
      }
      if (!d) {
        const { message: O } = F("NO_MATCHING_KEY", `connect() pairing topic: ${d}`);
        throw new Error(O);
      }
      const m = await this.client.core.crypto.generateKeyPair(), _ = de(f), R = { requiredNamespaces: i, optionalNamespaces: o, relays: l ?? [{ protocol: Od }], proposer: { publicKey: m, metadata: this.client.metadata }, expiryTimestamp: _, pairingTopic: d, ...a && { sessionProperties: a }, ...c && { scopedProperties: c }, id: bt(), ...(u || h) && { requests: { authentication: u == null ? void 0 : u.map((O) => {
        const { domain: U, chains: k, nonce: N, uri: v, exp: A, nbf: y, type: w, statement: x, requestId: D, resources: E, signatureTypes: I } = O;
        return { domain: U, chains: k, nonce: N, type: w ?? "caip122", aud: v, version: "1", iat: (/* @__PURE__ */ new Date()).toISOString(), exp: A, nbf: y, statement: x, requestId: D, resources: E, signatureTypes: I };
      }), walletPay: h } } }, b = te("session_connect", R.id), { reject: S, resolve: $, done: B } = _r(f, fu), C = ({ id: O }) => {
        if (O === R.id) {
          this.client.events.off("proposal_expire", C);
          const U = this.pendingSessions.get(R.id);
          if (U) {
            const { sessionTopic: k, publicKey: N } = U;
            Promise.all([this.client.core.relayer.unsubscribe(k), this.client.core.crypto.keychain.has(k) ? this.client.core.crypto.deleteSymKey(k) : Promise.resolve(), this.client.core.crypto.keychain.has(N) ? this.client.core.crypto.deleteKeyPair(N) : Promise.resolve()]).catch((v) => this.client.logger.warn(v));
          }
          this.pendingSessions.delete(R.id), this.events.emit(b, { error: { message: fu, code: 0 } });
        }
      };
      return this.client.events.on("proposal_expire", C), this.events.once(b, ({ error: O, session: U }) => {
        this.client.events.off("proposal_expire", C), O ? S(O) : U && $(U);
      }), await this.setProposal(R.id, R), await this.sendProposeSession({ proposal: R, publishOpts: { internal: { throwOnFailedPublish: !0 }, tvf: { correlationId: R.id } } }).catch((O) => {
        throw this.deleteProposal(R.id), O;
      }), { uri: p, approval: B };
    }, this.pair = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      try {
        return await this.client.core.pairing.pair(r);
      } catch (n) {
        throw this.client.logger.error("pair() failed"), n;
      }
    }, this.approve = async (r) => {
      var C, P, O;
      const n = this.client.core.eventClient.createEvent({ properties: { topic: (C = r == null ? void 0 : r.id) == null ? void 0 : C.toString(), trace: [at.session_approve_started] } });
      try {
        this.isInitialized(), await this.confirmOnlineStateOrThrow();
      } catch (U) {
        throw n.setError(vr.no_internet_connection), U;
      }
      try {
        await this.isValidProposalId(r == null ? void 0 : r.id);
      } catch (U) {
        throw this.client.logger.error(`approve() -> proposal.get(${r == null ? void 0 : r.id}) failed`), n.setError(vr.proposal_not_found), U;
      }
      try {
        await this.isValidApprove(r);
      } catch (U) {
        throw this.client.logger.error("approve() -> isValidApprove() failed"), n.setError(vr.session_approve_namespace_validation_failure), U;
      }
      const { id: s, relayProtocol: i, namespaces: o, sessionProperties: a, scopedProperties: c, sessionConfig: l, proposalRequestsResponses: u } = r, h = this.client.proposal.get(s);
      this.client.core.eventClient.deleteEvent({ eventId: n.eventId });
      const { pairingTopic: f, proposer: d, requiredNamespaces: p, optionalNamespaces: g } = h;
      let m = (P = this.client.core.eventClient) == null ? void 0 : P.getEvent({ topic: f });
      m || (m = (O = this.client.core.eventClient) == null ? void 0 : O.createEvent({ type: at.session_approve_started, properties: { topic: f, trace: [at.session_approve_started, at.session_namespaces_validation_success] } }));
      const _ = await this.client.core.crypto.generateKeyPair(), R = d.publicKey, b = await this.client.core.crypto.generateSharedKey(_, R), S = { relay: { protocol: i ?? "irn" }, namespaces: o, controller: { publicKey: _, metadata: this.client.metadata }, expiry: de(Jr), ...a && { sessionProperties: a }, ...c && { scopedProperties: c }, ...l && { sessionConfig: l }, proposalRequestsResponses: u }, $ = ne.relay;
      m.addTrace(at.subscribing_session_topic);
      try {
        await this.client.core.relayer.subscribe(b, { transportType: $, internal: { skipSubscribe: !0 } });
      } catch (U) {
        throw m.setError(vr.subscribe_session_topic_failure), U;
      }
      m.addTrace(at.subscribe_session_topic_success);
      const B = { ...S, topic: b, requiredNamespaces: p, optionalNamespaces: g, pairingTopic: f, acknowledged: !1, self: S.controller, peer: { publicKey: d.publicKey, metadata: d.metadata }, controller: _, transportType: ne.relay, authentication: u == null ? void 0 : u.authentication, walletPayResult: u == null ? void 0 : u.walletPay };
      await this.client.session.set(b, B), m.addTrace(at.store_session);
      try {
        await this.sendApproveSession({ sessionTopic: b, proposal: h, pairingProposalResponse: { relay: { protocol: i ?? "irn" }, responderPublicKey: _ }, sessionSettleRequest: S, publishOpts: { internal: { throwOnFailedPublish: !0 }, tvf: { correlationId: s, ...this.getTVFApproveParams(B) } } }), m.addTrace(at.session_approve_publish_success);
      } catch (U) {
        throw this.client.logger.error(U), this.client.session.delete(b, oe("USER_DISCONNECTED")), await this.client.core.relayer.unsubscribe(b), U;
      }
      return this.client.core.eventClient.deleteEvent({ eventId: m.eventId }), await this.client.core.pairing.updateMetadata({ topic: f, metadata: d.metadata }), await this.deleteProposal(s), await this.client.core.pairing.activate({ topic: f }), await this.setExpiry(b, de(Jr)), { topic: b, acknowledged: () => Promise.resolve(this.client.session.get(b)) };
    }, this.reject = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      try {
        await this.isValidReject(r);
      } catch (o) {
        throw this.client.logger.error("reject() -> isValidReject() failed"), o;
      }
      const { id: n, reason: s } = r;
      let i;
      try {
        i = this.client.proposal.get(n).pairingTopic;
      } catch (o) {
        throw this.client.logger.error(`reject() -> proposal.get(${n}) failed`), o;
      }
      i && await this.sendError({ id: n, topic: i, error: s, rpcOpts: _e.wc_sessionPropose.reject }), await this.deleteProposal(n);
    }, this.update = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      try {
        await this.isValidUpdate(r);
      } catch (f) {
        throw this.client.logger.error("update() -> isValidUpdate() failed"), f;
      }
      const { topic: n, namespaces: s } = r, i = this.client.session.get(n);
      if (i.self.publicKey !== i.controller) {
        const { message: f } = oe("UNAUTHORIZED_UPDATE_REQUEST");
        throw new Error(f);
      }
      const { done: o, resolve: a, reject: c } = _r(M.FIVE_MINUTES, "Session update request expired without receiving any acknowledgement"), l = bt(), u = ur().toString(), h = this.client.session.get(n).namespaces;
      return this.events.once(te("session_update", l), ({ error: f }) => {
        f ? c(f) : a();
      }), await this.client.session.update(n, { namespaces: s }), await this.sendRequest({ topic: n, method: "wc_sessionUpdate", params: { namespaces: s }, throwOnFailedPublish: !0, clientRpcId: l, relayRpcId: u }).catch((f) => {
        this.client.logger.error(f), this.client.session.update(n, { namespaces: h }), c(f);
      }), { acknowledged: o };
    }, this.extend = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      try {
        await this.isValidExtend(r);
      } catch (c) {
        throw this.client.logger.error("extend() -> isValidExtend() failed"), c;
      }
      const { topic: n } = r, s = bt(), { done: i, resolve: o, reject: a } = _r(M.FIVE_MINUTES, "Session extend request expired without receiving any acknowledgement");
      return this.events.once(te("session_extend", s), ({ error: c }) => {
        c ? a(c) : o();
      }), await this.setExpiry(n, de(Jr)), this.sendRequest({ topic: n, method: "wc_sessionExtend", params: {}, clientRpcId: s, throwOnFailedPublish: !0 }).catch((c) => {
        a(c);
      }), { acknowledged: i };
    }, this.request = async (r) => {
      this.isInitialized();
      try {
        await this.isValidRequest(r);
      } catch (m) {
        throw this.client.logger.error("request() -> isValidRequest() failed"), m;
      }
      const { chainId: n, request: s, topic: i, expiry: o = _e.wc_sessionRequest.req.ttl } = r, a = this.client.session.get(i);
      (a == null ? void 0 : a.transportType) === ne.relay && await this.confirmOnlineStateOrThrow();
      const c = bt(), l = ur().toString(), { done: u, resolve: h, reject: f } = _r(o, "Request expired. Please try again.");
      this.events.once(te("session_request", c), ({ error: m, result: _ }) => {
        m ? f(m) : h(_);
      });
      const d = "wc_sessionRequest", p = this.getAppLinkIfEnabled(a.peer.metadata, a.transportType);
      if (p) return await this.sendRequest({ clientRpcId: c, relayRpcId: l, topic: i, method: d, params: { request: { ...s, expiryTimestamp: de(o) }, chainId: n }, expiry: o, throwOnFailedPublish: !0, appLink: p }).catch((m) => f(m)), this.client.events.emit("session_request_sent", { topic: i, request: s, chainId: n, id: c }), await u();
      const g = { request: { ...s, expiryTimestamp: de(o) }, chainId: n };
      return await Promise.all([new Promise(async (m) => {
        await this.sendRequest({ clientRpcId: c, relayRpcId: l, topic: i, method: d, params: g, expiry: o, throwOnFailedPublish: !0, tvf: this.getTVFParams(c, g) }).catch((_) => f(_)), this.client.events.emit("session_request_sent", { topic: i, request: s, chainId: n, id: c }), m();
      }), new Promise(async (m) => {
        var _;
        if (!((_ = a.sessionConfig) != null && _.disableDeepLink)) {
          const R = await Mx(this.client.core.storage, hu);
          await Ux({ id: c, topic: i, wcDeepLink: R });
        }
        m();
      }), u()]).then((m) => m[2]);
    }, this.respond = async (r) => {
      var l, u;
      this.isInitialized();
      const n = this.client.core.eventClient.createEvent({ properties: { topic: (r == null ? void 0 : r.topic) || ((u = (l = r == null ? void 0 : r.response) == null ? void 0 : l.id) == null ? void 0 : u.toString()), trace: [at.session_request_response_started] } });
      try {
        await this.isValidRespond(r);
      } catch (h) {
        throw n.addTrace(h == null ? void 0 : h.message), n.setError(vr.session_request_response_validation_failure), h;
      }
      n.addTrace(at.session_request_response_validation_success);
      const { topic: s, response: i } = r, { id: o } = i, a = this.client.session.get(s);
      a.transportType === ne.relay && await this.confirmOnlineStateOrThrow();
      const c = this.getAppLinkIfEnabled(a.peer.metadata, a.transportType);
      try {
        n.addTrace(at.session_request_response_publish_started), Et(i) ? await this.sendResult({ id: o, topic: s, result: i.result, throwOnFailedPublish: !0, appLink: c }) : nt(i) && await this.sendError({ id: o, topic: s, error: i.error, appLink: c }), this.cleanupAfterResponse(r);
      } catch (h) {
        throw n.addTrace(h == null ? void 0 : h.message), n.setError(vr.session_request_response_publish_failure), h;
      }
    }, this.ping = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow();
      try {
        await this.isValidPing(r);
      } catch (s) {
        throw this.client.logger.error("ping() -> isValidPing() failed"), s;
      }
      const { topic: n } = r;
      if (this.client.session.keys.includes(n)) {
        const s = bt(), i = ur().toString(), { done: o, resolve: a, reject: c } = _r(M.FIVE_MINUTES, "Ping request expired without receiving any acknowledgement");
        this.events.once(te("session_ping", s), ({ error: l }) => {
          l ? c(l) : a();
        }), await Promise.all([this.sendRequest({ topic: n, method: "wc_sessionPing", params: {}, throwOnFailedPublish: !0, clientRpcId: s, relayRpcId: i }), o()]);
      } else this.client.core.pairing.pairings.keys.includes(n) && (this.client.logger.warn("ping() on pairing topic is deprecated and will be removed in the next major release."), await this.client.core.pairing.ping({ topic: n }));
    }, this.emit = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow(), await this.isValidEmit(r);
      const { topic: n, event: s, chainId: i } = r, o = ur().toString(), a = bt();
      await this.sendRequest({ topic: n, method: "wc_sessionEvent", params: { event: s, chainId: i }, throwOnFailedPublish: !0, relayRpcId: o, clientRpcId: a });
    }, this.disconnect = async (r) => {
      this.isInitialized(), await this.confirmOnlineStateOrThrow(), await this.isValidDisconnect(r);
      const { topic: n } = r;
      if (this.client.session.keys.includes(n)) await this.sendRequest({ topic: n, method: "wc_sessionDelete", params: oe("USER_DISCONNECTED"), throwOnFailedPublish: !0 }), await this.deleteSession({ topic: n, emitEvent: !1 });
      else if (this.client.core.pairing.pairings.keys.includes(n)) await this.client.core.pairing.disconnect({ topic: n });
      else {
        const { message: s } = F("MISMATCHED_TOPIC", `Session or pairing topic not found: ${n}`);
        throw new Error(s);
      }
    }, this.find = (r) => (this.isInitialized(), this.client.session.getAll().filter((n) => N_(n, r))), this.getPendingSessionRequests = () => this.client.pendingRequest.getAll(), this.authenticate = async (r, n) => {
      var D;
      this.isInitialized(), this.isValidAuthenticate(r);
      const s = n && this.client.core.linkModeSupportedApps.includes(n) && ((D = this.client.metadata.redirect) == null ? void 0 : D.linkMode), i = s ? ne.link_mode : ne.relay;
      i === ne.relay && await this.confirmOnlineStateOrThrow();
      const { chains: o, statement: a = "", uri: c, domain: l, nonce: u, type: h, exp: f, nbf: d, methods: p = [], expiry: g } = r, m = [...r.resources || []], { topic: _, uri: R } = await this.client.core.pairing.create({ methods: ["wc_sessionAuthenticate"], transportType: i });
      if (this.client.logger.info({ message: "Generated new pairing", pairing: { topic: _, uri: R } }), this.client.auth.authKeys.keys.includes(rr)) {
        const { responseTopic: E, publicKey: I } = this.client.auth.authKeys.get(rr);
        E && (await this.client.core.relayer.unsubscribe(E).catch((T) => this.client.logger.warn(T)), await this.client.auth.pairingTopics.delete(E, { message: "replaced", code: 0 }).catch((T) => this.client.logger.warn(T))), I && this.client.core.crypto.keychain.has(I) && await this.client.core.crypto.deleteKeyPair(I);
      }
      const b = await this.client.core.crypto.generateKeyPair(), S = Us(b);
      if (await Promise.all([this.client.auth.authKeys.set(rr, { responseTopic: S, publicKey: b }), this.client.auth.pairingTopics.set(S, { topic: S, pairingTopic: _ })]), await this.client.core.relayer.subscribe(S, { transportType: i }), this.client.logger.info(`sending request to new pairing topic: ${_}`), p.length > 0) {
        const { namespace: E } = Cs(o[0]);
        let I = l_(E, "request", p);
        Ns(m) && (I = h_(I, m.pop())), m.push(I);
      }
      const $ = g && g > _e.wc_sessionAuthenticate.req.ttl ? g : _e.wc_sessionAuthenticate.req.ttl, B = { authPayload: { type: h ?? "caip122", chains: o, statement: a, aud: c, domain: l, version: "1", nonce: u, iat: (/* @__PURE__ */ new Date()).toISOString(), exp: f, nbf: d, resources: m }, requester: { publicKey: b, metadata: this.client.metadata }, expiryTimestamp: de($) }, C = { eip155: { chains: o, methods: [.../* @__PURE__ */ new Set(["personal_sign", ...p])], events: ["chainChanged", "accountsChanged"] } }, P = { requiredNamespaces: {}, optionalNamespaces: C, relays: [{ protocol: "irn" }], pairingTopic: _, proposer: { publicKey: b, metadata: this.client.metadata }, expiryTimestamp: de(_e.wc_sessionPropose.req.ttl), id: bt() }, { done: O, resolve: U, reject: k } = _r($, "Request expired"), N = bt(), v = te("session_connect", P.id), A = te("session_request", N), y = async ({ error: E, session: I }) => {
        this.events.off(A, w), E ? k(E) : I && U({ session: I });
      }, w = async (E) => {
        var V, W, Z;
        if (await this.deletePendingAuthRequest(N, { message: "fulfilled", code: 0 }), E.error) {
          const K = oe("WC_METHOD_UNSUPPORTED", "wc_sessionAuthenticate");
          return E.error.code === K.code ? void 0 : (this.events.off(v, y), k(E.error.message));
        }
        await this.deleteProposal(P.id), this.events.off(v, y);
        const { cacaos: I, responder: T } = E.result, L = [], j = [];
        for (const K of I) {
          await kl({ cacao: K, projectId: this.client.core.projectId }) || (this.client.logger.error(K, "Signature verification failed"), k(oe("SESSION_SETTLEMENT_FAILED", "Signature verification failed")));
          const { p: J } = K, ae = Ns(J.resources), he = [Wo(J.iss)], ye = Qs(J.iss);
          if (ae) {
            const Ce = Ml(ae), Xe = Fl(ae);
            L.push(...Ce), he.push(...Xe);
          }
          for (const Ce of he) j.push(`${Ce}:${ye}`);
        }
        const z = await this.client.core.crypto.generateSharedKey(b, T.publicKey);
        let q;
        L.length > 0 && (q = { topic: z, acknowledged: !0, self: { publicKey: b, metadata: this.client.metadata }, peer: T, controller: T.publicKey, expiry: de(Jr), requiredNamespaces: {}, optionalNamespaces: {}, relay: { protocol: "irn" }, pairingTopic: _, namespaces: Wl([...new Set(L)], [...new Set(j)]), transportType: i }, await this.client.core.relayer.subscribe(z, { transportType: i }), await this.client.session.set(z, q), _ && await this.client.core.pairing.updateMetadata({ topic: _, metadata: T.metadata }), q = this.client.session.get(z)), (V = this.client.metadata.redirect) != null && V.linkMode && ((W = T.metadata.redirect) != null && W.linkMode) && ((Z = T.metadata.redirect) != null && Z.universal) && n && (this.client.core.addLinkModeSupportedApp(T.metadata.redirect.universal), this.client.session.update(z, { transportType: ne.link_mode })), U({ auths: I, session: q });
      };
      this.events.once(v, y), this.events.once(A, w);
      let x;
      try {
        if (s) {
          const E = Ut("wc_sessionAuthenticate", B, N);
          this.client.core.history.set(_, E);
          const I = await this.client.core.crypto.encode("", E, { type: kr, encoding: vt });
          x = Os(n, _, I);
        } else await Promise.all([this.sendRequest({ topic: _, method: "wc_sessionAuthenticate", params: B, expiry: r.expiry, throwOnFailedPublish: !0, clientRpcId: N }), this.sendRequest({ topic: _, method: "wc_sessionPropose", params: P, expiry: _e.wc_sessionPropose.req.ttl, throwOnFailedPublish: !0, clientRpcId: P.id })]);
      } catch (E) {
        throw this.events.off(v, y), this.events.off(A, w), E;
      }
      return await this.setProposal(P.id, P), await this.setAuthRequest(N, { request: { ...B, verifyContext: {} }, pairingTopic: _, transportType: i }), { uri: x ?? R, response: O };
    }, this.approveSessionAuthenticate = async (r) => {
      const { id: n, auths: s } = r, i = this.client.core.eventClient.createEvent({ properties: { topic: n.toString(), trace: [xr.authenticated_session_approve_started] } });
      try {
        this.isInitialized();
      } catch (m) {
        throw i.setError(Bn.no_internet_connection), m;
      }
      const o = this.getPendingAuthRequest(n);
      if (!o) throw i.setError(Bn.authenticated_session_pending_request_not_found), new Error(`Could not find pending auth request with id ${n}`);
      const a = o.transportType || ne.relay;
      a === ne.relay && await this.confirmOnlineStateOrThrow();
      const c = o.requester.publicKey, l = await this.client.core.crypto.generateKeyPair(), u = Us(c), h = { type: Ft, receiverPublicKey: c, senderPublicKey: l }, f = [], d = [];
      for (const m of s) {
        if (!await kl({ cacao: m, projectId: this.client.core.projectId })) {
          i.setError(Bn.invalid_cacao);
          const $ = oe("SESSION_SETTLEMENT_FAILED", "Signature verification failed");
          throw await this.sendError({ id: n, topic: u, error: $, encodeOpts: h }), new Error($.message);
        }
        i.addTrace(xr.cacaos_verified);
        const { p: _ } = m, R = Ns(_.resources), b = [Wo(_.iss)], S = Qs(_.iss);
        if (R) {
          const $ = Ml(R), B = Fl(R);
          f.push(...$), b.push(...B);
        }
        for (const $ of b) d.push(`${$}:${S}`);
      }
      const p = await this.client.core.crypto.generateSharedKey(l, c);
      i.addTrace(xr.create_authenticated_session_topic);
      let g;
      if ((f == null ? void 0 : f.length) > 0) {
        g = { topic: p, acknowledged: !0, self: { publicKey: l, metadata: this.client.metadata }, peer: { publicKey: c, metadata: o.requester.metadata }, controller: c, expiry: de(Jr), authentication: s, requiredNamespaces: {}, optionalNamespaces: {}, relay: { protocol: "irn" }, pairingTopic: o.pairingTopic, namespaces: Wl([...new Set(f)], [...new Set(d)]), transportType: a }, i.addTrace(xr.subscribing_authenticated_session_topic);
        try {
          await this.client.core.relayer.subscribe(p, { transportType: a });
        } catch (m) {
          throw i.setError(Bn.subscribe_authenticated_session_topic_failure), m;
        }
        i.addTrace(xr.subscribe_authenticated_session_topic_success), await this.client.session.set(p, g), i.addTrace(xr.store_authenticated_session), await this.client.core.pairing.updateMetadata({ topic: o.pairingTopic, metadata: o.requester.metadata });
      }
      i.addTrace(xr.publishing_authenticated_session_approve);
      try {
        await this.sendResult({ topic: u, id: n, result: { cacaos: s, responder: { publicKey: l, metadata: this.client.metadata } }, encodeOpts: h, throwOnFailedPublish: !0, appLink: this.getAppLinkIfEnabled(o.requester.metadata, a) });
      } catch (m) {
        throw i.setError(Bn.authenticated_session_approve_publish_failure), m;
      }
      return await this.client.auth.requests.delete(n, { message: "fulfilled", code: 0 }), await this.client.core.pairing.activate({ topic: o.pairingTopic }), this.client.core.eventClient.deleteEvent({ eventId: i.eventId }), { session: g };
    }, this.rejectSessionAuthenticate = async (r) => {
      this.isInitialized();
      const { id: n, reason: s } = r, i = this.getPendingAuthRequest(n);
      if (!i) throw new Error(`Could not find pending auth request with id ${n}`);
      i.transportType === ne.relay && await this.confirmOnlineStateOrThrow();
      const o = i.requester.publicKey, a = await this.client.core.crypto.generateKeyPair(), c = Us(o), l = { type: Ft, receiverPublicKey: o, senderPublicKey: a };
      await this.sendError({ id: n, topic: c, error: s, encodeOpts: l, rpcOpts: _e.wc_sessionAuthenticate.reject, appLink: this.getAppLinkIfEnabled(i.requester.metadata, i.transportType) }), await this.client.auth.requests.delete(n, { message: "rejected", code: 0 }), await this.deleteProposal(n);
    }, this.formatAuthMessage = (r) => {
      this.isInitialized();
      const { request: n, iss: s } = r;
      return ld(n, s);
    }, this.processRelayMessageCache = () => {
      setTimeout(async () => {
        if (this.relayMessageCache.length !== 0) for (; this.relayMessageCache.length > 0; ) try {
          const r = this.relayMessageCache.shift();
          r && await this.onRelayMessage(r);
        } catch (r) {
          this.client.logger.error(r);
        }
      }, 50);
    }, this.cleanupDuplicatePairings = async (r) => {
      if (r.pairingTopic) try {
        const n = this.client.core.pairing.pairings.get(r.pairingTopic), s = this.client.core.pairing.pairings.getAll().filter((i) => {
          var o, a;
          return ((o = i.peerMetadata) == null ? void 0 : o.url) && ((a = i.peerMetadata) == null ? void 0 : a.url) === r.peer.metadata.url && i.topic && i.topic !== n.topic;
        });
        if (s.length === 0) return;
        this.client.logger.info(`Cleaning up ${s.length} duplicate pairing(s)`), await Promise.all(s.map((i) => this.client.core.pairing.disconnect({ topic: i.topic }))), this.client.logger.info("Duplicate pairings clean up finished");
      } catch (n) {
        this.client.logger.error(n);
      }
    }, this.deleteSession = async (r) => {
      var c;
      const { topic: n, expirerHasDeleted: s = !1, emitEvent: i = !0, id: o = 0 } = r, { self: a } = this.client.session.get(n);
      await this.client.core.relayer.unsubscribe(n), await this.client.session.delete(n, oe("USER_DISCONNECTED")), this.addToRecentlyDeleted(n, "session"), this.client.core.crypto.keychain.has(a.publicKey) && await this.client.core.crypto.deleteKeyPair(a.publicKey), this.client.core.crypto.keychain.has(n) && await this.client.core.crypto.deleteSymKey(n), s || this.client.core.expirer.del(n), this.client.core.storage.removeItem(hu).catch((l) => this.client.logger.warn(l)), n === ((c = this.sessionRequestQueue.queue[0]) == null ? void 0 : c.topic) && (this.sessionRequestQueue.state = wt.idle), await Promise.all(this.getPendingSessionRequests().filter((l) => l.topic === n).map((l) => this.deletePendingSessionRequest(l.id, oe("USER_DISCONNECTED")))), i && this.client.events.emit("session_delete", { id: o, topic: n });
    }, this.deleteProposal = async (r, n) => {
      var s;
      if (n) try {
        const i = this.client.proposal.get(r);
        (s = this.client.core.eventClient.getEvent({ topic: i.pairingTopic })) == null || s.setError(vr.proposal_expired);
      } catch {
      }
      await Promise.all([this.client.proposal.delete(r, oe("USER_DISCONNECTED")), n ? Promise.resolve() : this.client.core.expirer.del(r)]), this.addToRecentlyDeleted(r, "proposal");
    }, this.deletePendingSessionRequest = async (r, n, s = !1) => {
      await Promise.all([this.client.pendingRequest.delete(r, n), s ? Promise.resolve() : this.client.core.expirer.del(r)]), this.addToRecentlyDeleted(r, "request"), this.sessionRequestQueue.queue = this.sessionRequestQueue.queue.filter((i) => i.id !== r), s && (this.sessionRequestQueue.state = wt.idle, this.client.events.emit("session_request_expire", { id: r }));
    }, this.deletePendingAuthRequest = async (r, n, s = !1) => {
      await Promise.all([this.client.auth.requests.delete(r, n), s ? Promise.resolve() : this.client.core.expirer.del(r)]);
    }, this.setExpiry = async (r, n) => {
      this.client.session.keys.includes(r) && (this.client.core.expirer.set(r, n), await this.client.session.update(r, { expiry: n }));
    }, this.setProposal = async (r, n) => {
      this.client.core.expirer.set(r, de(_e.wc_sessionPropose.req.ttl)), await this.client.proposal.set(r, n);
    }, this.setAuthRequest = async (r, n) => {
      const { request: s, pairingTopic: i, transportType: o = ne.relay } = n;
      this.client.core.expirer.set(r, s.expiryTimestamp), await this.client.auth.requests.set(r, { authPayload: s.authPayload, requester: s.requester, expiryTimestamp: s.expiryTimestamp, id: r, pairingTopic: i, verifyContext: s.verifyContext, transportType: o });
    }, this.setPendingSessionRequest = async (r) => {
      const { id: n, topic: s, params: i, verifyContext: o } = r, a = i.request.expiryTimestamp || de(_e.wc_sessionRequest.req.ttl);
      this.client.core.expirer.set(n, a), await this.client.pendingRequest.set(n, { id: n, topic: s, params: i, verifyContext: o });
    }, this.sendRequest = async (r) => {
      const { topic: n, method: s, params: i, expiry: o, relayRpcId: a, clientRpcId: c, throwOnFailedPublish: l, appLink: u, tvf: h, publishOpts: f = {} } = r, d = Ut(s, i, c);
      let p;
      const g = !!u;
      try {
        const R = g ? vt : Se;
        p = await this.client.core.crypto.encode(n, d, { encoding: R });
      } catch (R) {
        throw await this.cleanup(), this.client.logger.error(`sendRequest() -> core.crypto.encode() for topic ${n} failed`), R;
      }
      let m;
      if (bI.includes(s)) {
        const R = rt(JSON.stringify(d)), b = rt(p);
        m = await this.client.core.verify.register({ id: b, decryptedId: R });
      }
      const _ = { ..._e[s].req, ...f };
      if (_.attestation = m, o && (_.ttl = o), a && (_.id = a), this.client.core.history.set(n, d), g) {
        const R = Os(u, n, p);
        await global.Linking.openURL(R, this.client.name);
      } else _.tvf = { ...h, correlationId: d.id }, l ? (_.internal = { ..._.internal, throwOnFailedPublish: !0 }, await this.client.core.relayer.publish(n, p, _)) : this.client.core.relayer.publish(n, p, _).catch((R) => this.client.logger.error(R));
      return d.id;
    }, this.sendProposeSession = async (r) => {
      const { proposal: n, publishOpts: s } = r, i = Ut("wc_sessionPropose", n, n.id);
      this.client.core.history.set(n.pairingTopic, i);
      const o = await this.client.core.crypto.encode(n.pairingTopic, i, { encoding: Se }), a = rt(JSON.stringify(i)), c = rt(o), l = await this.client.core.verify.register({ id: c, decryptedId: a });
      await this.client.core.relayer.publishCustom({ payload: { pairingTopic: n.pairingTopic, sessionProposal: o }, opts: { ...s, publishMethod: "wc_proposeSession", attestation: l } });
    }, this.sendApproveSession = async (r) => {
      const { sessionTopic: n, pairingProposalResponse: s, proposal: i, sessionSettleRequest: o, publishOpts: a } = r, c = si(i.id, s), l = await this.client.core.crypto.encode(i.pairingTopic, c, { encoding: Se }), u = Ut("wc_sessionSettle", o, a == null ? void 0 : a.id), h = await this.client.core.crypto.encode(n, u, { encoding: Se });
      this.client.core.history.set(n, u), await this.client.core.relayer.publishCustom({ payload: { sessionTopic: n, pairingTopic: i.pairingTopic, sessionProposalResponse: l, sessionSettlementRequest: h }, opts: { ...a, publishMethod: "wc_approveSession" } });
    }, this.sendResult = async (r) => {
      const { id: n, topic: s, result: i, throwOnFailedPublish: o, encodeOpts: a, appLink: c } = r, l = si(n, i);
      let u;
      const h = c && typeof (global == null ? void 0 : global.Linking) < "u";
      try {
        const p = h ? vt : Se;
        u = await this.client.core.crypto.encode(s, l, { ...a || {}, encoding: p });
      } catch (p) {
        throw await this.cleanup(), this.client.logger.error(`sendResult() -> core.crypto.encode() for topic ${s} failed`), p;
      }
      let f, d;
      try {
        f = await this.client.core.history.get(s, n);
        const p = f.request;
        try {
          d = this.getTVFParams(n, p.params, i);
        } catch (g) {
          this.client.logger.warn(`sendResult() -> getTVFParams() failed: ${g == null ? void 0 : g.message}`);
        }
      } catch (p) {
        throw this.client.logger.error(`sendResult() -> history.get(${s}, ${n}) failed`), p;
      }
      if (h) {
        const p = Os(c, s, u);
        await global.Linking.openURL(p, this.client.name);
      } else {
        const p = f.request.method, g = _e[p].res;
        g.tvf = { ...d, correlationId: n }, o ? (g.internal = { ...g.internal, throwOnFailedPublish: !0 }, await this.client.core.relayer.publish(s, u, g)) : this.client.core.relayer.publish(s, u, g).catch((m) => this.client.logger.error(m));
      }
      await this.client.core.history.resolve(l);
    }, this.sendError = async (r) => {
      const { id: n, topic: s, error: i, encodeOpts: o, rpcOpts: a, appLink: c } = r, l = ka(n, i);
      let u;
      const h = c && typeof (global == null ? void 0 : global.Linking) < "u";
      try {
        const d = h ? vt : Se;
        u = await this.client.core.crypto.encode(s, l, { ...o || {}, encoding: d });
      } catch (d) {
        throw await this.cleanup(), this.client.logger.error(`sendError() -> core.crypto.encode() for topic ${s} failed`), d;
      }
      let f;
      try {
        f = await this.client.core.history.get(s, n);
      } catch (d) {
        throw this.client.logger.error(`sendError() -> history.get(${s}, ${n}) failed`), d;
      }
      if (h) {
        const d = Os(c, s, u);
        await global.Linking.openURL(d, this.client.name);
      } else {
        const d = f.request.method, p = a || _e[d].res;
        this.client.core.relayer.publish(s, u, p);
      }
      await this.client.core.history.resolve(l);
    }, this.cleanup = async () => {
      const r = [], n = [];
      this.client.session.getAll().forEach((s) => {
        let i = !1;
        or(s.expiry) && (i = !0), this.client.core.crypto.keychain.has(s.topic) || (i = !0), i && r.push(s.topic);
      }), this.client.proposal.getAll().forEach((s) => {
        or(s.expiryTimestamp) && n.push(s.id);
      }), await Promise.all([...r.map((s) => this.deleteSession({ topic: s })), ...n.map((s) => this.deleteProposal(s))]);
    }, this.onProviderMessageEvent = async (r) => {
      !this.initialized || this.relayMessageCache.length > 0 ? this.relayMessageCache.push(r) : await this.onRelayMessage(r);
    }, this.onRelayEventRequest = async (r) => {
      this.requestQueue.queue.push(r), await this.processRequestsQueue();
    }, this.processRequestsQueue = async () => {
      if (this.requestQueue.state === wt.active) {
        this.client.logger.info("Request queue already active, skipping...");
        return;
      }
      for (this.client.logger.info(`Request queue starting with ${this.requestQueue.queue.length} requests`); this.requestQueue.queue.length > 0; ) {
        this.requestQueue.state = wt.active;
        const r = this.requestQueue.queue.shift();
        if (r) try {
          await this.processRequest(r);
        } catch (n) {
          this.client.logger.warn(n);
        }
      }
      this.requestQueue.state = wt.idle;
    }, this.processRequest = async (r) => {
      const { topic: n, payload: s, attestation: i, transportType: o, encryptedId: a } = r, c = s.method;
      if (!this.shouldIgnorePairingRequest({ topic: n, requestMethod: c })) switch (c) {
        case "wc_sessionPropose":
          return await this.onSessionProposeRequest({ topic: n, payload: s, attestation: i, encryptedId: a });
        case "wc_sessionSettle":
          return await this.onSessionSettleRequest(n, s);
        case "wc_sessionUpdate":
          return await this.onSessionUpdateRequest(n, s);
        case "wc_sessionExtend":
          return await this.onSessionExtendRequest(n, s);
        case "wc_sessionPing":
          return await this.onSessionPingRequest(n, s);
        case "wc_sessionDelete":
          return await this.onSessionDeleteRequest(n, s);
        case "wc_sessionRequest":
          return await this.onSessionRequest({ topic: n, payload: s, attestation: i, encryptedId: a, transportType: o });
        case "wc_sessionEvent":
          return await this.onSessionEventRequest(n, s);
        case "wc_sessionAuthenticate":
          return await this.onSessionAuthenticateRequest({ topic: n, payload: s, attestation: i, encryptedId: a, transportType: o });
        default:
          return this.client.logger.info(`Unsupported request method ${c}`);
      }
    }, this.onRelayEventResponse = async (r) => {
      const { topic: n, payload: s, transportType: i } = r, o = (await this.client.core.history.get(n, s.id)).request.method;
      switch (o) {
        case "wc_sessionPropose":
          return this.onSessionProposeResponse(n, s, i);
        case "wc_sessionSettle":
          return this.onSessionSettleResponse(n, s);
        case "wc_sessionUpdate":
          return this.onSessionUpdateResponse(n, s);
        case "wc_sessionExtend":
          return this.onSessionExtendResponse(n, s);
        case "wc_sessionPing":
          return this.onSessionPingResponse(n, s);
        case "wc_sessionRequest":
          return this.onSessionRequestResponse(n, s);
        case "wc_sessionAuthenticate":
          return this.onSessionAuthenticateResponse(n, s);
        default:
          return this.client.logger.info(`Unsupported response method ${o}`);
      }
    }, this.onRelayEventUnknownPayload = (r) => {
      const { topic: n } = r, { message: s } = F("MISSING_OR_INVALID", `Decoded payload on topic ${n} is not identifiable as a JSON-RPC request or a response.`);
      throw new Error(s);
    }, this.shouldIgnorePairingRequest = (r) => {
      const { topic: n, requestMethod: s } = r, i = this.expectedPairingMethodMap.get(n);
      return !i || i.includes(s) ? !1 : !!(i.includes("wc_sessionAuthenticate") && this.client.events.listenerCount("session_authenticate") > 0);
    }, this.onSessionProposeRequest = async (r) => {
      const { topic: n, payload: s, attestation: i, encryptedId: o } = r, { params: a, id: c } = s;
      try {
        const l = this.client.core.eventClient.getEvent({ topic: n });
        this.client.events.listenerCount("session_proposal") === 0 && (console.warn("No listener for session_proposal event"), l == null || l.setError(Rt.proposal_listener_not_found)), this.isValidConnect({ ...s.params });
        const u = a.expiryTimestamp || de(_e.wc_sessionPropose.req.ttl), h = { id: c, pairingTopic: n, expiryTimestamp: u, attestation: i, encryptedId: o, ...a };
        await this.setProposal(c, h);
        const f = await this.getVerifyContext({ attestationId: i, hash: rt(JSON.stringify(s)), encryptedId: o, metadata: h.proposer.metadata });
        l == null || l.addTrace(mt.emit_session_proposal), this.client.events.emit("session_proposal", { id: c, params: h, verifyContext: f });
      } catch (l) {
        await this.sendError({ id: c, topic: n, error: l, rpcOpts: _e.wc_sessionPropose.autoReject }), this.client.logger.error(l);
      }
    }, this.onSessionProposeResponse = async (r, n, s) => {
      const { id: i } = n;
      if (Et(n)) {
        const { result: o } = n;
        this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", result: o });
        const a = this.client.proposal.get(i);
        this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", proposal: a });
        const c = a.proposer.publicKey;
        this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", selfPublicKey: c });
        const l = o.responderPublicKey;
        this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", peerPublicKey: l });
        const u = await this.client.core.crypto.generateSharedKey(c, l);
        this.pendingSessions.set(i, { sessionTopic: u, pairingTopic: r, proposalId: i, publicKey: c });
        const h = await this.client.core.relayer.subscribe(u, { transportType: s });
        this.client.logger.trace({ type: "method", method: "onSessionProposeResponse", subscriptionId: h }), await this.client.core.pairing.activate({ topic: r });
      } else if (nt(n)) {
        await this.deleteProposal(i);
        const o = te("session_connect", i);
        if (this.events.listenerCount(o) === 0) throw new Error(`emitting ${o} without any listeners, 954`);
        this.events.emit(o, { error: n.error });
      }
    }, this.onSessionSettleRequest = async (r, n) => {
      const { id: s, params: i } = n;
      try {
        this.isValidSessionSettleRequest(i);
        const { relay: o, controller: a, expiry: c, namespaces: l, sessionProperties: u, scopedProperties: h, sessionConfig: f, proposalRequestsResponses: d } = n.params, p = [...this.pendingSessions.values()].find((_) => _.sessionTopic === r);
        if (!p) return this.client.logger.error(`Pending session not found for topic ${r}`);
        const g = this.client.proposal.get(p.proposalId), m = { topic: r, relay: o, expiry: c, namespaces: l, acknowledged: !0, pairingTopic: p.pairingTopic, requiredNamespaces: g.requiredNamespaces, optionalNamespaces: g.optionalNamespaces, controller: a.publicKey, self: { publicKey: p.publicKey, metadata: this.client.metadata }, peer: { publicKey: a.publicKey, metadata: a.metadata }, ...u && { sessionProperties: u }, ...h && { scopedProperties: h }, ...f && { sessionConfig: f }, transportType: ne.relay, authentication: d == null ? void 0 : d.authentication, walletPayResult: d == null ? void 0 : d.walletPay };
        await this.client.session.set(m.topic, m), await this.setExpiry(m.topic, m.expiry), await this.client.core.pairing.updateMetadata({ topic: p.pairingTopic, metadata: m.peer.metadata }), this.pendingSessions.delete(p.proposalId), this.deleteProposal(p.proposalId, !1), this.cleanupDuplicatePairings(m), await this.sendResult({ id: n.id, topic: r, throwOnFailedPublish: !0, result: !0 }), this.client.events.emit("session_connect", { session: m }), this.events.emit(te("session_connect", p.proposalId), { session: m });
      } catch (o) {
        await this.sendError({ id: s, topic: r, error: o }), this.client.logger.error(o);
      }
    }, this.onSessionSettleResponse = async (r, n) => {
      const { id: s } = n;
      Et(n) ? (await this.client.session.update(r, { acknowledged: !0 }), this.events.emit(te("session_approve", s), {})) : nt(n) && (await this.deleteSession({ topic: r, emitEvent: !1 }), this.events.emit(te("session_approve", s), { error: n.error }));
    }, this.onSessionUpdateRequest = async (r, n) => {
      const { params: s, id: i } = n;
      try {
        const o = `${r}_session_update`, a = $n.get(o);
        if (a && this.isRequestOutOfSync(a, i)) {
          this.client.logger.warn(`Discarding out of sync request - ${i}`), this.sendError({ id: i, topic: r, error: oe("INVALID_UPDATE_REQUEST") });
          return;
        }
        await this.isValidUpdate({ topic: r, ...s });
        const c = this.client.session.get(r);
        if (c.peer.publicKey !== c.controller) throw oe("UNAUTHORIZED_UPDATE_REQUEST");
        try {
          $n.set(o, i), await this.client.session.update(r, { namespaces: s.namespaces }), await this.sendResult({ id: i, topic: r, result: !0 });
        } catch (l) {
          throw $n.delete(o), l;
        }
        this.client.events.emit("session_update", { id: i, topic: r, params: s });
      } catch (o) {
        await this.sendError({ id: i, topic: r, error: o }), this.client.logger.error(o);
      }
    }, this.isRequestOutOfSync = (r, n) => n.toString().slice(0, -3) < r.toString().slice(0, -3), this.onSessionUpdateResponse = (r, n) => {
      const { id: s } = n, i = te("session_update", s);
      if (this.events.listenerCount(i) === 0) throw new Error(`emitting ${i} without any listeners`);
      Et(n) ? this.events.emit(te("session_update", s), {}) : nt(n) && this.events.emit(te("session_update", s), { error: n.error });
    }, this.onSessionExtendRequest = async (r, n) => {
      const { id: s } = n;
      try {
        await this.isValidExtend({ topic: r }), await this.setExpiry(r, de(Jr)), await this.sendResult({ id: s, topic: r, result: !0 }), this.client.events.emit("session_extend", { id: s, topic: r });
      } catch (i) {
        await this.sendError({ id: s, topic: r, error: i }), this.client.logger.error(i);
      }
    }, this.onSessionExtendResponse = (r, n) => {
      const { id: s } = n, i = te("session_extend", s);
      if (this.events.listenerCount(i) === 0) throw new Error(`emitting ${i} without any listeners`);
      Et(n) ? this.events.emit(te("session_extend", s), {}) : nt(n) && this.events.emit(te("session_extend", s), { error: n.error });
    }, this.onSessionPingRequest = async (r, n) => {
      const { id: s } = n;
      try {
        this.isValidPing({ topic: r }), await this.sendResult({ id: s, topic: r, result: !0, throwOnFailedPublish: !0 }), this.client.events.emit("session_ping", { id: s, topic: r });
      } catch (i) {
        await this.sendError({ id: s, topic: r, error: i }), this.client.logger.error(i);
      }
    }, this.onSessionPingResponse = (r, n) => {
      const { id: s } = n, i = te("session_ping", s);
      setTimeout(() => {
        if (this.events.listenerCount(i) === 0) throw new Error(`emitting ${i} without any listeners 2176`);
        Et(n) ? this.events.emit(te("session_ping", s), {}) : nt(n) && this.events.emit(te("session_ping", s), { error: n.error });
      }, 500);
    }, this.onSessionDeleteRequest = async (r, n) => {
      const { id: s } = n;
      try {
        await this.isValidDisconnect({ topic: r, reason: n.params }), this.cleanupPendingSentRequestsForTopic({ topic: r, error: oe("USER_DISCONNECTED") }), await this.deleteSession({ topic: r, id: s });
      } catch (i) {
        this.client.logger.error(i);
      }
    }, this.onSessionRequest = async (r) => {
      var u, h, f;
      const { topic: n, payload: s, attestation: i, encryptedId: o, transportType: a } = r, { id: c, params: l } = s;
      try {
        await this.isValidRequest({ topic: n, ...l });
        const d = this.client.session.get(n), p = await this.getVerifyContext({ attestationId: i, hash: rt(JSON.stringify(Ut("wc_sessionRequest", l, c))), encryptedId: o, metadata: d.peer.metadata, transportType: a }), g = { id: c, topic: n, params: l, verifyContext: p };
        await this.setPendingSessionRequest(g), a === ne.link_mode && ((u = d.peer.metadata.redirect) != null && u.universal) && this.client.core.addLinkModeSupportedApp((h = d.peer.metadata.redirect) == null ? void 0 : h.universal), (f = this.client.signConfig) != null && f.disableRequestQueue ? this.emitSessionRequest(g) : (this.addSessionRequestToSessionRequestQueue(g), this.processSessionRequestQueue());
      } catch (d) {
        await this.sendError({ id: c, topic: n, error: d }), this.client.logger.error(d);
      }
    }, this.onSessionRequestResponse = (r, n) => {
      const { id: s } = n, i = te("session_request", s);
      if (this.events.listenerCount(i) === 0) throw new Error(`emitting ${i} without any listeners`);
      Et(n) ? this.events.emit(te("session_request", s), { result: n.result }) : nt(n) && this.events.emit(te("session_request", s), { error: n.error });
    }, this.onSessionEventRequest = async (r, n) => {
      const { id: s, params: i } = n;
      try {
        const o = `${r}_session_event_${i.event.name}`, a = $n.get(o);
        if (a && this.isRequestOutOfSync(a, s)) {
          this.client.logger.info(`Discarding out of sync request - ${s}`);
          return;
        }
        this.isValidEmit({ topic: r, ...i }), this.client.events.emit("session_event", { id: s, topic: r, params: i }), $n.set(o, s);
      } catch (o) {
        await this.sendError({ id: s, topic: r, error: o }), this.client.logger.error(o);
      }
    }, this.onSessionAuthenticateResponse = (r, n) => {
      const { id: s } = n;
      this.client.logger.trace({ type: "method", method: "onSessionAuthenticateResponse", topic: r, payload: n }), Et(n) ? this.events.emit(te("session_request", s), { result: n.result }) : nt(n) && this.events.emit(te("session_request", s), { error: n.error });
    }, this.onSessionAuthenticateRequest = async (r) => {
      var c;
      const { topic: n, payload: s, attestation: i, encryptedId: o, transportType: a } = r;
      try {
        const { requester: l, authPayload: u, expiryTimestamp: h } = s.params, f = await this.getVerifyContext({ attestationId: i, hash: rt(JSON.stringify(s)), encryptedId: o, metadata: l.metadata, transportType: a }), d = { requester: l, pairingTopic: n, id: s.id, authPayload: u, verifyContext: f, expiryTimestamp: h };
        await this.setAuthRequest(s.id, { request: d, pairingTopic: n, transportType: a }), a === ne.link_mode && ((c = l.metadata.redirect) != null && c.universal) && this.client.core.addLinkModeSupportedApp(l.metadata.redirect.universal), this.client.events.emit("session_authenticate", { topic: n, params: s.params, id: s.id, verifyContext: f });
      } catch (l) {
        this.client.logger.error(l);
        const u = s.params.requester.publicKey, h = await this.client.core.crypto.generateKeyPair(), f = this.getAppLinkIfEnabled(s.params.requester.metadata, a), d = { type: Ft, receiverPublicKey: u, senderPublicKey: h };
        await this.sendError({ id: s.id, topic: n, error: l, encodeOpts: d, rpcOpts: _e.wc_sessionAuthenticate.autoReject, appLink: f });
      }
    }, this.addSessionRequestToSessionRequestQueue = (r) => {
      this.sessionRequestQueue.queue.push(r);
    }, this.cleanupAfterResponse = (r) => {
      this.deletePendingSessionRequest(r.response.id, { message: "fulfilled", code: 0 }), setTimeout(() => {
        this.sessionRequestQueue.state = wt.idle, this.processSessionRequestQueue();
      }, M.toMiliseconds(this.requestQueueDelay));
    }, this.cleanupPendingSentRequestsForTopic = ({ topic: r, error: n }) => {
      const s = this.client.core.history.pending;
      s.length > 0 && s.filter((i) => i.topic === r && i.request.method === "wc_sessionRequest").forEach((i) => {
        this.events.emit(te("session_request", i.request.id), { error: n });
      });
    }, this.processSessionRequestQueue = () => {
      if (this.sessionRequestQueue.state === wt.active) {
        this.client.logger.info("session request queue is already active.");
        return;
      }
      const r = this.sessionRequestQueue.queue[0];
      if (!r) {
        this.client.logger.info("session request queue is empty.");
        return;
      }
      try {
        this.emitSessionRequest(r);
      } catch (n) {
        this.client.logger.error(n);
      }
    }, this.emitSessionRequest = (r) => {
      if (this.emittedSessionRequests.has(r.id)) {
        this.client.logger.warn({ id: r.id }, `Skipping emitting \`session_request\` event for duplicate request. id: ${r.id}`);
        return;
      }
      this.sessionRequestQueue.state = wt.active, this.emittedSessionRequests.add(r.id), this.client.events.emit("session_request", r);
    }, this.cleanupInProgress = !1, this.cleanupOrphanedSubscriptions = async () => {
      const r = this.client.core.relayer.subscriber.topics;
      if (r.length === 0) return;
      const n = new Set(this.client.session.keys), s = new Set(this.client.core.pairing.pairings.keys), i = new Set([...this.pendingSessions.values()].map((a) => a.sessionTopic));
      let o;
      if (this.client.auth.authKeys.keys.includes(rr)) {
        const { responseTopic: a } = this.client.auth.authKeys.get(rr);
        o = a;
      }
      for (const a of r) if (!n.has(a) && !s.has(a) && !i.has(a) && a !== o) {
        this.client.logger.info(`Cleaning up orphaned subscriber topic: ${a}`);
        try {
          await this.client.core.relayer.subscriber.unsubscribe(a);
        } catch (c) {
          this.client.logger.warn(c, `Failed to clean up orphaned subscription: ${a}`);
        }
      }
    }, this.onPairingCreated = (r) => {
      if (r.methods && this.expectedPairingMethodMap.set(r.topic, r.methods), r.active) return;
      const n = this.client.proposal.getAll().find((s) => s.pairingTopic === r.topic);
      n && this.onSessionProposeRequest({ topic: r.topic, payload: Ut("wc_sessionPropose", { ...n, requiredNamespaces: n.requiredNamespaces, optionalNamespaces: n.optionalNamespaces, relays: n.relays, proposer: n.proposer, sessionProperties: n.sessionProperties, scopedProperties: n.scopedProperties }, n.id), attestation: n.attestation, encryptedId: n.encryptedId });
    }, this.isValidConnect = async (r) => {
      if (!Fe(r)) {
        const { message: l } = F("MISSING_OR_INVALID", `connect() params: ${JSON.stringify(r)}`);
        throw new Error(l);
      }
      const { pairingTopic: n, requiredNamespaces: s, optionalNamespaces: i, sessionProperties: o, scopedProperties: a, relays: c } = r;
      if (ge(n) || await this.isValidPairingTopic(n), !W_(c)) {
        const { message: l } = F("MISSING_OR_INVALID", `connect() relays: ${c}`);
        throw new Error(l);
      }
      if (s && !ge(s) && Yn(s) !== 0) {
        const l = "requiredNamespaces are deprecated and are automatically assigned to optionalNamespaces";
        ["fatal", "error", "silent"].includes(this.client.logger.level) ? console.warn(l) : this.client.logger.warn(l), this.validateNamespaces(s, "requiredNamespaces");
      }
      if (i && !ge(i) && Yn(i) !== 0 && this.validateNamespaces(i, "optionalNamespaces"), o && !ge(o) && this.validateSessionProps(o, "sessionProperties"), a && !ge(a)) {
        this.validateSessionProps(a, "scopedProperties");
        const l = Object.keys(s || {}).concat(Object.keys(i || {}));
        if (!Object.keys(a).every((u) => l.includes(u.split(":")[0]))) throw new Error(`Scoped properties must be a subset of required/optional namespaces, received: ${JSON.stringify(a)}, required/optional namespaces: ${JSON.stringify(l)}`);
      }
    }, this.validateNamespaces = (r, n) => {
      const s = V_(r, "connect()", n);
      if (s) throw new Error(s.message);
    }, this.isValidApprove = async (r) => {
      if (!Fe(r)) throw new Error(F("MISSING_OR_INVALID", `approve() params: ${r}`).message);
      const { id: n, namespaces: s, relayProtocol: i, sessionProperties: o, scopedProperties: a } = r;
      this.checkRecentlyDeleted(n), await this.isValidProposalId(n);
      const c = this.client.proposal.get(n), l = fo(s, "approve()");
      if (l) throw new Error(l.message);
      const u = Zl(c.requiredNamespaces, s, "approve()");
      if (u) throw new Error(u.message);
      if (!ue(i, !0)) {
        const { message: h } = F("MISSING_OR_INVALID", `approve() relayProtocol: ${i}`);
        throw new Error(h);
      }
      if (o && !ge(o) && this.validateSessionProps(o, "sessionProperties"), a && !ge(a)) {
        this.validateSessionProps(a, "scopedProperties");
        const h = new Set(Object.keys(s));
        if (!Object.keys(a).every((f) => h.has(f.split(":")[0]))) throw new Error(`Scoped properties must be a subset of approved namespaces, received: ${JSON.stringify(a)}, approved namespaces: ${Array.from(h).join(", ")}`);
      }
    }, this.isValidReject = async (r) => {
      if (!Fe(r)) {
        const { message: i } = F("MISSING_OR_INVALID", `reject() params: ${r}`);
        throw new Error(i);
      }
      const { id: n, reason: s } = r;
      if (this.checkRecentlyDeleted(n), await this.isValidProposalId(n), !Y_(s)) {
        const { message: i } = F("MISSING_OR_INVALID", `reject() reason: ${JSON.stringify(s)}`);
        throw new Error(i);
      }
    }, this.isValidSessionSettleRequest = (r) => {
      if (!Fe(r)) {
        const { message: l } = F("MISSING_OR_INVALID", `onSessionSettleRequest() params: ${r}`);
        throw new Error(l);
      }
      const { relay: n, controller: s, namespaces: i, expiry: o } = r;
      if (!Ed(n)) {
        const { message: l } = F("MISSING_OR_INVALID", "onSessionSettleRequest() relay protocol should be a string");
        throw new Error(l);
      }
      const a = F_(s, "onSessionSettleRequest()");
      if (a) throw new Error(a.message);
      const c = fo(i, "onSessionSettleRequest()");
      if (c) throw new Error(c.message);
      if (or(o)) {
        const { message: l } = F("EXPIRED", "onSessionSettleRequest()");
        throw new Error(l);
      }
    }, this.isValidUpdate = async (r) => {
      if (!Fe(r)) {
        const { message: c } = F("MISSING_OR_INVALID", `update() params: ${r}`);
        throw new Error(c);
      }
      const { topic: n, namespaces: s } = r;
      this.checkRecentlyDeleted(n), await this.isValidSessionTopic(n);
      const i = this.client.session.get(n), o = fo(s, "update()");
      if (o) throw new Error(o.message);
      const a = Zl(i.requiredNamespaces, s, "update()");
      if (a) throw new Error(a.message);
    }, this.isValidExtend = async (r) => {
      if (!Fe(r)) {
        const { message: s } = F("MISSING_OR_INVALID", `extend() params: ${r}`);
        throw new Error(s);
      }
      const { topic: n } = r;
      this.checkRecentlyDeleted(n), await this.isValidSessionTopic(n);
    }, this.isValidRequest = async (r) => {
      if (!Fe(r)) {
        const { message: c } = F("MISSING_OR_INVALID", `request() params: ${r}`);
        throw new Error(c);
      }
      const { topic: n, request: s, chainId: i, expiry: o } = r;
      this.checkRecentlyDeleted(n), await this.isValidSessionTopic(n);
      const { namespaces: a } = this.client.session.get(n);
      if (!Yl(a, i)) {
        const { message: c } = F("MISSING_OR_INVALID", `request() chainId: ${i}`);
        throw new Error(c);
      }
      if (!Z_(s)) {
        const { message: c } = F("MISSING_OR_INVALID", `request() ${JSON.stringify(s)}`);
        throw new Error(c);
      }
      if (!Q_(a, i, s.method)) {
        const { message: c } = F("MISSING_OR_INVALID", `request() method: ${s.method}`);
        throw new Error(c);
      }
      this.validateRequestExpiry(o);
    }, this.isValidRespond = async (r) => {
      var o;
      if (!Fe(r)) {
        const { message: a } = F("MISSING_OR_INVALID", `respond() params: ${r}`);
        throw new Error(a);
      }
      const { topic: n, response: s } = r;
      try {
        await this.isValidSessionTopic(n);
      } catch (a) {
        throw (o = r == null ? void 0 : r.response) != null && o.id && this.cleanupAfterResponse(r), a;
      }
      if (!X_(s)) {
        const { message: a } = F("MISSING_OR_INVALID", `respond() response: ${JSON.stringify(s)}`);
        throw new Error(a);
      }
      const i = this.client.pendingRequest.get(s.id);
      if (i.topic !== n) {
        const { message: a } = F("MISMATCHED_TOPIC", `Request response topic mismatch. reqId: ${s.id}, expected topic: ${i.topic}, received topic: ${n}`);
        throw new Error(a);
      }
    }, this.isValidPing = async (r) => {
      if (!Fe(r)) {
        const { message: s } = F("MISSING_OR_INVALID", `ping() params: ${r}`);
        throw new Error(s);
      }
      const { topic: n } = r;
      await this.isValidSessionOrPairingTopic(n);
    }, this.isValidEmit = async (r) => {
      if (!Fe(r)) {
        const { message: a } = F("MISSING_OR_INVALID", `emit() params: ${r}`);
        throw new Error(a);
      }
      const { topic: n, event: s, chainId: i } = r;
      await this.isValidSessionTopic(n);
      const { namespaces: o } = this.client.session.get(n);
      if (!Yl(o, i)) {
        const { message: a } = F("MISSING_OR_INVALID", `emit() chainId: ${i}`);
        throw new Error(a);
      }
      if (!J_(s)) {
        const { message: a } = F("MISSING_OR_INVALID", `emit() event: ${JSON.stringify(s)}`);
        throw new Error(a);
      }
      if (!e3(o, i, s.name)) {
        const { message: a } = F("MISSING_OR_INVALID", `emit() event: ${JSON.stringify(s)}`);
        throw new Error(a);
      }
    }, this.isValidDisconnect = async (r) => {
      if (!Fe(r)) {
        const { message: s } = F("MISSING_OR_INVALID", `disconnect() params: ${r}`);
        throw new Error(s);
      }
      const { topic: n } = r;
      await this.isValidSessionOrPairingTopic(n);
    }, this.isValidAuthenticate = (r) => {
      const { chains: n, uri: s, domain: i, nonce: o } = r;
      if (!Array.isArray(n) || n.length === 0) throw new Error("chains is required and must be a non-empty array");
      if (!ue(s, !1)) throw new Error("uri is required parameter");
      if (!ue(i, !1)) throw new Error("domain is required parameter");
      if (!ue(o, !1)) throw new Error("nonce is required parameter");
      if ([...new Set(n.map((c) => Cs(c).namespace))].length > 1) throw new Error("Multi-namespace requests are not supported. Please request single namespace only.");
      const { namespace: a } = Cs(n[0]);
      if (a !== "eip155") throw new Error("Only eip155 namespace is supported for authenticated sessions. Please use .connect() for non-eip155 chains.");
    }, this.getVerifyContext = async (r) => {
      const { attestationId: n, hash: s, encryptedId: i, metadata: o, transportType: a } = r, c = { verified: { verifyUrl: o.verifyUrl || Fn, validation: "UNKNOWN", origin: o.url || "" } };
      try {
        if (a === ne.link_mode) {
          const u = this.getAppLinkIfEnabled(o, a);
          return c.verified.validation = u && new URL(u).origin === new URL(o.url).origin ? "VALID" : "INVALID", c;
        }
        const l = await this.client.core.verify.resolve({ attestationId: n, hash: s, encryptedId: i, verifyUrl: o.verifyUrl });
        l && (c.verified.origin = l.origin, c.verified.isScam = l.isScam, c.verified.validation = l.origin === new URL(o.url).origin ? "VALID" : "INVALID");
      } catch (l) {
        this.client.logger.warn(l);
      }
      return this.client.logger.debug(`Verify context: ${JSON.stringify(c)}`), c;
    }, this.validateSessionProps = (r, n) => {
      Object.values(r).forEach((s, i) => {
        if (s == null) {
          const { message: o } = F("MISSING_OR_INVALID", `${n} must contain an existing value for each key. Received: ${s} for key ${Object.keys(r)[i]}`);
          throw new Error(o);
        }
      });
    }, this.getPendingAuthRequest = (r) => {
      const n = this.client.auth.requests.get(r);
      return typeof n == "object" ? n : void 0;
    }, this.addToRecentlyDeleted = (r, n) => {
      if (this.recentlyDeletedMap.set(r, n), this.recentlyDeletedMap.size >= this.recentlyDeletedLimit) {
        let s = 0;
        const i = this.recentlyDeletedLimit / 2;
        for (const o of this.recentlyDeletedMap.keys()) {
          if (s++ >= i) break;
          this.recentlyDeletedMap.delete(o);
        }
      }
    }, this.checkRecentlyDeleted = (r) => {
      const n = this.recentlyDeletedMap.get(r);
      if (n) {
        const { message: s } = F("MISSING_OR_INVALID", `Record was recently deleted - ${n}: ${r}`);
        throw new Error(s);
      }
    }, this.isLinkModeEnabled = (r, n) => {
      var s, i, o, a, c, l, u, h, f;
      return !r || n !== ne.link_mode ? !1 : ((i = (s = this.client.metadata) == null ? void 0 : s.redirect) == null ? void 0 : i.linkMode) === !0 && ((a = (o = this.client.metadata) == null ? void 0 : o.redirect) == null ? void 0 : a.universal) !== void 0 && ((l = (c = this.client.metadata) == null ? void 0 : c.redirect) == null ? void 0 : l.universal) !== "" && ((u = r == null ? void 0 : r.redirect) == null ? void 0 : u.universal) !== void 0 && ((h = r == null ? void 0 : r.redirect) == null ? void 0 : h.universal) !== "" && ((f = r == null ? void 0 : r.redirect) == null ? void 0 : f.linkMode) === !0 && this.client.core.linkModeSupportedApps.includes(r.redirect.universal) && typeof (global == null ? void 0 : global.Linking) < "u";
    }, this.getAppLinkIfEnabled = (r, n) => {
      var s;
      return this.isLinkModeEnabled(r, n) ? (s = r == null ? void 0 : r.redirect) == null ? void 0 : s.universal : void 0;
    }, this.handleLinkModeMessage = ({ url: r }) => {
      if (!r || !r.includes("wc_ev") || !r.includes("topic")) return;
      const n = Cl(r, "topic") || "", s = decodeURIComponent(Cl(r, "wc_ev") || ""), i = this.client.session.keys.includes(n);
      i && this.client.session.update(n, { transportType: ne.link_mode }), this.client.core.dispatchEnvelope({ topic: n, message: s, sessionExists: i });
    }, this.registerLinkModeListeners = async () => {
      var r;
      if (Ca() || wr() && ((r = this.client.metadata.redirect) != null && r.linkMode)) {
        const n = global == null ? void 0 : global.Linking;
        if (typeof n < "u") {
          n.addEventListener("url", this.handleLinkModeMessage, this.client.name);
          const s = await n.getInitialURL();
          s && setTimeout(() => {
            this.handleLinkModeMessage({ url: s });
          }, 50);
        }
      }
    }, this.getTVFApproveParams = (r) => {
      try {
        const n = wd(r.namespaces), s = O_(r.namespaces), i = $_(r.namespaces), o = r.sessionProperties, a = r.scopedProperties;
        return { approvedChains: n, approvedMethods: s, approvedEvents: i, sessionProperties: o, scopedProperties: a };
      } catch (n) {
        return this.client.logger.warn(n, "Error getting TVF approve params"), {};
      }
    }, this.getTVFParams = (r, n, s) => {
      var o, a, c;
      if (!((o = n.request) != null && o.method)) return {};
      const i = { correlationId: r, rpcMethods: [n.request.method], chainId: n.chainId };
      try {
        const l = this.extractTxHashesFromResult(n.request, s);
        i.txHashes = l, i.contractAddresses = this.isValidContractData(n.request.params) ? [(c = (a = n.request.params) == null ? void 0 : a[0]) == null ? void 0 : c.to] : [];
      } catch (l) {
        this.client.logger.warn(l, "Error getting TVF params");
      }
      return i;
    }, this.isValidContractData = (r) => {
      var n;
      if (!r) return !1;
      try {
        const s = (r == null ? void 0 : r.data) || ((n = r == null ? void 0 : r[0]) == null ? void 0 : n.data);
        if (!s.startsWith("0x")) return !1;
        const i = s.slice(2);
        return /^[0-9a-fA-F]*$/.test(i) ? i.length % 2 === 0 : !1;
      } catch {
      }
      return !1;
    }, this.extractTxHashesFromResult = (r, n) => {
      var s;
      try {
        if (!n) return [];
        const i = r.method, o = wI[i];
        if (i === "sui_signTransaction") return [Xx(n.transactionBytes)];
        if (i === "near_signTransaction") return [Ul(n)];
        if (i === "near_signTransactions") return n.map((c) => Ul(c));
        if (i === "xrpl_signTransactionFor" || i === "xrpl_signTransaction") return [(s = n.tx_json) == null ? void 0 : s.hash];
        if (i === "polkadot_signTransaction") return [m3({ transaction: r.params.transactionPayload, signature: n.signature })];
        if (i === "algo_signTxn") return pn(n) ? n.map((c) => Ll(c)) : [Ll(n)];
        if (i === "cosmos_signDirect") return [Qx(n)];
        if (i === "wallet_sendCalls") return e_(n);
        if (i === "canton_prepareSignExecute") return v3(r.params, n);
        if (typeof n == "string") return [n];
        const a = n[o.key];
        if (pn(a)) return i === "solana_signAllTransactions" ? a.map((c) => Zx(c)) : a;
        if (typeof a == "string") return [a];
      } catch (i) {
        this.client.logger.warn(i, "Error extracting tx hashes from result");
      }
      return [];
    };
  }
  async processPendingMessageEvents() {
    try {
      const e = this.client.session.keys, r = this.client.core.relayer.messages.getWithoutAck(e);
      for (const [n, s] of Object.entries(r)) for (const i of s) try {
        await this.onProviderMessageEvent({ topic: n, message: i, publishedAt: Date.now() });
      } catch {
        this.client.logger.warn(`Error processing pending message event for topic: ${n}, message: ${i}`);
      }
    } catch (e) {
      this.client.logger.warn(e, "processPendingMessageEvents failed");
    }
  }
  isInitialized() {
    if (!this.initialized) {
      const { message: e } = F("NOT_INITIALIZED", this.name);
      throw new Error(e);
    }
  }
  async confirmOnlineStateOrThrow() {
    await this.client.core.relayer.confirmOnlineStateOrThrow();
  }
  registerRelayerEvents() {
    this.client.core.relayer.on(ce.message, (e) => {
      this.onProviderMessageEvent(e);
    });
  }
  async onRelayMessage(e) {
    const { topic: r, message: n, attestation: s, transportType: i } = e, { publicKey: o } = this.client.auth.authKeys.keys.includes(rr) ? this.client.auth.authKeys.get(rr) : { publicKey: void 0 };
    try {
      try {
        if (i !== ne.link_mode && this.client.core.crypto.getPayloadType(n, vt) === kr) {
          this.client.logger.warn(`onRelayMessage() -> non-link mode TYPE_2 payload ignored: ${n}`);
          return;
        }
      } catch {
      }
      const a = await this.client.core.crypto.decode(r, n, { receiverPublicKey: o, encoding: i === ne.link_mode ? vt : Se });
      Ma(a) ? (this.client.core.history.set(r, a), await this.onRelayEventRequest({ topic: r, payload: a, attestation: s, transportType: i, encryptedId: rt(n) })) : Si(a) ? (await this.client.core.history.resolve(a), await this.onRelayEventResponse({ topic: r, payload: a, transportType: i }), this.client.core.history.delete(r, a.id)) : (this.client.logger.error(`onRelayMessage() -> unknown payload: ${JSON.stringify(a)}`), await this.onRelayEventUnknownPayload({ topic: r, payload: a, transportType: i })), await this.client.core.relayer.messages.ack(r, n);
    } catch (a) {
      this.client.logger.error(`onRelayMessage() -> failed to process an inbound message: ${n}`), this.client.logger.error(a == null ? void 0 : a.message);
    }
  }
  registerExpirerEvents() {
    this.client.core.expirer.on(et.expired, async (e) => {
      const { topic: r, id: n } = id(e.target);
      if (n && this.client.pendingRequest.keys.includes(n)) return await this.deletePendingSessionRequest(n, F("EXPIRED"), !0);
      if (n && this.client.auth.requests.keys.includes(n)) return await this.deletePendingAuthRequest(n, F("EXPIRED"), !0);
      r ? this.client.session.keys.includes(r) && (await this.deleteSession({ topic: r, expirerHasDeleted: !0 }), this.client.events.emit("session_expire", { topic: r })) : n && (await this.deleteProposal(n, !0), this.client.events.emit("proposal_expire", { id: n }));
    });
  }
  registerSubscriptionCleanup() {
    this.client.core.heartbeat.on("heartbeat_pulse", async () => {
      if (!this.cleanupInProgress) {
        this.cleanupInProgress = !0;
        try {
          await this.cleanupOrphanedSubscriptions();
        } catch (e) {
          this.client.logger.warn(e);
        } finally {
          this.cleanupInProgress = !1;
        }
      }
    });
  }
  registerPairingEvents() {
    this.client.core.pairing.events.on(Ir.create, (e) => this.onPairingCreated(e)), this.client.core.pairing.events.on(Ir.delete, (e) => {
      this.addToRecentlyDeleted(e.topic, "pairing");
    });
  }
  isValidPairingTopic(e) {
    if (!ue(e, !1)) {
      const { message: r } = F("MISSING_OR_INVALID", `pairing topic should be a string: ${e}`);
      throw new Error(r);
    }
    if (!this.client.core.pairing.pairings.keys.includes(e)) {
      const { message: r } = F("NO_MATCHING_KEY", `pairing topic doesn't exist: ${e}`);
      throw new Error(r);
    }
    if (or(this.client.core.pairing.pairings.get(e).expiry)) {
      const { message: r } = F("EXPIRED", `pairing topic: ${e}`);
      throw new Error(r);
    }
  }
  async isValidSessionTopic(e) {
    if (!ue(e, !1)) {
      const { message: r } = F("MISSING_OR_INVALID", `session topic should be a string: ${e}`);
      throw new Error(r);
    }
    if (this.checkRecentlyDeleted(e), !this.client.session.keys.includes(e)) {
      const { message: r } = F("NO_MATCHING_KEY", `session topic doesn't exist: ${e}`);
      throw new Error(r);
    }
    if (or(this.client.session.get(e).expiry)) {
      await this.deleteSession({ topic: e });
      const { message: r } = F("EXPIRED", `session topic: ${e}`);
      throw new Error(r);
    }
    if (!this.client.core.crypto.keychain.has(e)) {
      const { message: r } = F("MISSING_OR_INVALID", `session topic does not exist in keychain: ${e}`);
      throw await this.deleteSession({ topic: e }), new Error(r);
    }
  }
  async isValidSessionOrPairingTopic(e) {
    if (this.checkRecentlyDeleted(e), this.client.session.keys.includes(e)) await this.isValidSessionTopic(e);
    else if (this.client.core.pairing.pairings.keys.includes(e)) this.isValidPairingTopic(e);
    else if (ue(e, !1)) {
      const { message: r } = F("NO_MATCHING_KEY", `session or pairing topic doesn't exist: ${e}`);
      throw new Error(r);
    } else {
      const { message: r } = F("MISSING_OR_INVALID", `session or pairing topic should be a string: ${e}`);
      throw new Error(r);
    }
  }
  async isValidProposalId(e) {
    if (!G_(e)) {
      const { message: r } = F("MISSING_OR_INVALID", `proposal id should be a number: ${e}`);
      throw new Error(r);
    }
    if (!this.client.proposal.keys.includes(e)) {
      const { message: r } = F("NO_MATCHING_KEY", `proposal id doesn't exist: ${e}`);
      throw new Error(r);
    }
    if (or(this.client.proposal.get(e).expiryTimestamp)) {
      await this.deleteProposal(e);
      const { message: r } = F("EXPIRED", `proposal id: ${e}`);
      throw new Error(r);
    }
  }
  validateRequestExpiry(e) {
    if (e && !n3(e, wo)) {
      const { message: r } = F("MISSING_OR_INVALID", `request() expiry: ${e}. Expiry must be a number (in seconds) between ${wo.min} and ${wo.max}`);
      throw new Error(r);
    }
  }
}
class DI extends Kr {
  constructor(e, r) {
    super(e, r, pI, Fa), this.core = e, this.logger = r;
  }
}
class AI extends Kr {
  constructor(e, r) {
    super(e, r, gI, Fa), this.core = e, this.logger = r;
  }
}
class OI extends Kr {
  constructor(e, r) {
    super(e, r, mI, Fa, (n) => n.id), this.core = e, this.logger = r;
  }
}
class $I extends Kr {
  constructor(e, r) {
    super(e, r, xI, Ii, () => rr), this.core = e, this.logger = r;
  }
}
class TI extends Kr {
  constructor(e, r) {
    super(e, r, _I, Ii), this.core = e, this.logger = r;
  }
}
class BI extends Kr {
  constructor(e, r) {
    super(e, r, SI, Ii, (n) => n.id), this.core = e, this.logger = r;
  }
}
class RI {
  constructor(e, r) {
    this.core = e, this.logger = r, this.authKeys = new $I(this.core, this.logger), this.pairingTopics = new TI(this.core, this.logger), this.requests = new BI(this.core, this.logger);
  }
  async init() {
    await this.authKeys.init(), await this.pairingTopics.init(), await this.requests.init();
  }
}
let PI = class Nd extends u0 {
  constructor(e) {
    super(e), this.protocol = Rd, this.version = Pd, this.name = yo.name, this.events = new dt.EventEmitter(), this.on = (n, s) => this.events.on(n, s), this.once = (n, s) => this.events.once(n, s), this.off = (n, s) => this.events.off(n, s), this.removeListener = (n, s) => this.events.removeListener(n, s), this.removeAllListeners = (n) => this.events.removeAllListeners(n), this.connect = async (n) => {
      try {
        return await this.engine.connect(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.pair = async (n) => {
      try {
        return await this.engine.pair(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.approve = async (n) => {
      try {
        return await this.engine.approve(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.reject = async (n) => {
      try {
        return await this.engine.reject(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.update = async (n) => {
      try {
        return await this.engine.update(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.extend = async (n) => {
      try {
        return await this.engine.extend(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.request = async (n) => {
      try {
        return await this.engine.request(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.respond = async (n) => {
      try {
        return await this.engine.respond(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.ping = async (n) => {
      try {
        return await this.engine.ping(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.emit = async (n) => {
      try {
        return await this.engine.emit(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.disconnect = async (n) => {
      try {
        return await this.engine.disconnect(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.find = (n) => {
      try {
        return this.engine.find(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.getPendingSessionRequests = () => {
      try {
        return this.engine.getPendingSessionRequests();
      } catch (n) {
        throw this.logger.error(n.message), n;
      }
    }, this.authenticate = async (n, s) => {
      try {
        return console.warn("[WalletConnect] `authenticate` is deprecated and will be removed in a future release. Use `connect()`'s `authentication` instead to establish an authenticated session."), await this.engine.authenticate(n, s);
      } catch (i) {
        throw this.logger.error(i.message), i;
      }
    }, this.formatAuthMessage = (n) => {
      try {
        return this.engine.formatAuthMessage(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.approveSessionAuthenticate = async (n) => {
      try {
        return await this.engine.approveSessionAuthenticate(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.rejectSessionAuthenticate = async (n) => {
      try {
        return await this.engine.rejectSessionAuthenticate(n);
      } catch (s) {
        throw this.logger.error(s.message), s;
      }
    }, this.name = (e == null ? void 0 : e.name) || yo.name, this.metadata = Tx(e == null ? void 0 : e.metadata), this.signConfig = e == null ? void 0 : e.signConfig;
    const r = vd({ logger: (e == null ? void 0 : e.logger) || yo.logger, name: this.name });
    this.logger = r, this.core = (e == null ? void 0 : e.core) || new dI(e), this.session = new AI(this.core, this.logger), this.proposal = new DI(this.core, this.logger), this.pendingRequest = new OI(this.core, this.logger), this.engine = new II(this), this.auth = new RI(this.core, this.logger);
  }
  static async init(e) {
    const r = new Nd(e);
    return await r.initialize(), r;
  }
  get context() {
    return Ke(this.logger);
  }
  get pairing() {
    return this.core.pairing.pairings;
  }
  async initialize() {
    this.logger.trace("Initialized");
    try {
      await this.core.start(), await this.session.init(), await this.proposal.init(), await this.pendingRequest.init(), await this.auth.init(), await this.engine.init(), this.logger.info("SignClient Initialization Success");
    } catch (e) {
      throw this.logger.info("SignClient Initialization Failure"), this.logger.error(e.message), e;
    }
  }
};
const CI = "ecbfcc1ab5cd740e0f242913bf1ff040";
let Br = null, cn = null, qa = null;
async function NI() {
  return Br || (Br = await PI.init({
    projectId: CI,
    relayUrl: "wss://relay.walletconnect.com",
    metadata: {
      name: "Whaleroom",
      description: "Encrypted P2P intelligence terminal",
      url: typeof window < "u" ? window.location.origin : "https://whaleroom.app",
      icons: typeof window < "u" ? [window.location.origin + "/icons/favicon.png"] : []
    }
  }), Br);
}
async function _8() {
  const t = await NI(), { uri: e, approval: r } = await t.connect({
    requiredNamespaces: {
      eip155: {
        methods: ["eth_sendTransaction", "eth_sign", "personal_sign", "eth_requestAccounts", "eth_accounts", "eth_chainId", "wallet_switchEthereumChain"],
        chains: ["eip155:1"],
        events: ["accountsChanged", "chainChanged"]
      }
    }
  });
  return { uri: e, approval: r };
}
function Ud(t) {
  var r, n;
  if (!t) return null;
  const e = (r = t.namespaces) == null ? void 0 : r.eip155;
  return (n = e == null ? void 0 : e.accounts) != null && n.length ? e.accounts[0].split(":")[2] : null;
}
async function S8(t) {
  cn = await t();
  const e = Ud(cn);
  return qa = UI(cn), e;
}
function UI(t) {
  var n, s, i, o;
  const e = Ud(t), r = ((o = (i = (s = (n = t.namespaces) == null ? void 0 : n.eip155) == null ? void 0 : s.chains) == null ? void 0 : i[0]) == null ? void 0 : o.split(":")[1]) || "1";
  return {
    request: async ({ method: a, params: c }) => a === "eth_requestAccounts" || a === "eth_accounts" ? [e] : a === "eth_chainId" ? "0x" + parseInt(r, 10).toString(16) : Br.request({
      topic: t.topic,
      chainId: "eip155:" + r,
      request: { method: a, params: c || [] }
    })
  };
}
function I8() {
  return qa;
}
async function D8() {
  if (Br && cn)
    try {
      await Br.disconnect({ topic: cn.topic, reason: { code: 0, message: "user disconnect" } });
    } catch {
    }
  cn = null, qa = null;
}
export {
  S8 as awaitApproval,
  _8 as connectWallet,
  D8 as disconnect,
  Ud as getAddress,
  I8 as getProvider,
  NI as initSignClient
};
