"use strict";
// Security utilities — XSS prevention, input sanitization, rate limiting
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = sanitizeString;
exports.sanitizeObject = sanitizeObject;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.checkPasswordStrength = checkPasswordStrength;
exports.isStrongPassword = isStrongPassword;
exports.checkRateLimit = checkRateLimit;
exports.resetRateLimit = resetRateLimit;
exports.generateCSRFToken = generateCSRFToken;
exports.getOrCreateCSRFToken = getOrCreateCSRFToken;
exports.generateId = generateId;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.createSessionToken = createSessionToken;
exports.parseSessionToken = parseSessionToken;
// ── Sanitization ─────────────────────────────────────────────────────────────
/**
 * Strip HTML tags and dangerous characters from user input.
 * Use this on every string before storing or rendering.
 */
function sanitizeString(input) {
    if (typeof input !== 'string')
        return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .trim()
        .slice(0, 10000); // hard cap
}
/** Sanitize an object's string fields recursively. */
function sanitizeObject(obj) {
    var result = {};
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        var val = obj[key];
        if (typeof val === 'string') {
            result[key] = sanitizeString(val);
        }
        else if (Array.isArray(val)) {
            result[key] = val.map(function (v) { return (typeof v === 'string' ? sanitizeString(v) : v); });
        }
        else if (val && typeof val === 'object') {
            result[key] = sanitizeObject(val);
        }
        else {
            result[key] = val;
        }
    }
    return result;
}
// ── Email / URL validation ────────────────────────────────────────────────────
function isValidEmail(email) {
    var re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return re.test(email) && email.length <= 254;
}
function isValidUrl(url) {
    try {
        var u = new URL(url);
        return ['http:', 'https:'].includes(u.protocol);
    }
    catch (_a) {
        return false;
    }
}
function checkPasswordStrength(password) {
    var score = 0;
    if (password.length >= 8)
        score++;
    if (password.length >= 12)
        score++;
    if (/[A-Z]/.test(password))
        score++;
    if (/[0-9]/.test(password))
        score++;
    if (/[^A-Za-z0-9]/.test(password))
        score++;
    score = Math.min(score, 4);
    var labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
    var colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    return { score: score, label: labels[score], color: colors[score] };
}
function isStrongPassword(password) {
    return checkPasswordStrength(password).score >= 2;
}
var rateLimitMap = new Map();
/**
 * Simple sliding window rate limiter.
 * Returns true if the action is allowed.
 */
function checkRateLimit(key, maxAttempts, windowMs) {
    if (maxAttempts === void 0) { maxAttempts = 5; }
    if (windowMs === void 0) { windowMs = 60000; }
    var now = Date.now();
    var entry = rateLimitMap.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
        rateLimitMap.set(key, { count: 1, windowStart: now });
        return true;
    }
    if (entry.count >= maxAttempts)
        return false;
    entry.count++;
    return true;
}
function resetRateLimit(key) {
    rateLimitMap.delete(key);
}
// ── CSRF token ────────────────────────────────────────────────────────────────
function generateCSRFToken() {
    var arr = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(arr);
    }
    return Array.from(arr, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}
function getOrCreateCSRFToken() {
    if (typeof window === 'undefined')
        return '';
    var token = sessionStorage.getItem('_csrf');
    if (!token) {
        token = generateCSRFToken();
        sessionStorage.setItem('_csrf', token);
    }
    return token;
}
// ── UUID generation ───────────────────────────────────────────────────────────
function generateId() {
    var _a;
    if (typeof window !== 'undefined' && ((_a = window.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID)) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
// ── Simple password hashing (client-side simulation) ─────────────────────────
// In production this would be server-side bcrypt. Here we use a
// deterministic hash simulation for demo without exposing plaintext.
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, data, hashBuffer, hashArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === 'undefined')
                        return [2 /*return*/, password];
                    encoder = new TextEncoder();
                    data = encoder.encode(password + '_ideaforge_salt_2024');
                    return [4 /*yield*/, window.crypto.subtle.digest('SHA-256', data)];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    return [2 /*return*/, hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('')];
            }
        });
    });
}
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var computed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hashPassword(password)];
                case 1:
                    computed = _a.sent();
                    return [2 /*return*/, computed === hash];
            }
        });
    });
}
// ── Session token ─────────────────────────────────────────────────────────────
function createSessionToken(userId) {
    var payload = { userId: userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    return btoa(JSON.stringify(payload));
}
function parseSessionToken(token) {
    try {
        var payload = JSON.parse(atob(token));
        if (typeof payload.userId !== 'string' || typeof payload.exp !== 'number')
            return null;
        if (Date.now() > payload.exp)
            return null;
        return payload;
    }
    catch (_a) {
        return null;
    }
}
