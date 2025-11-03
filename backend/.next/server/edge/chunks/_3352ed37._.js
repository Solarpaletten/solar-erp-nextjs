(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/_3352ed37._.js",
"[project]/backend/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    const { pathname } = request.nextUrl;
    console.log(`[Middleware] ${pathname}`);
    // Проверка аутентификации для защищённых маршрутов ITSolar
    const protectedPaths = [
        '/itsolar/account',
        '/itsolar/company'
    ];
    const isProtectedPath = protectedPaths.some((path)=>pathname.startsWith(path));
    if (isProtectedPath) {
        // ИСПРАВЛЕНО: Ищем правильное имя cookie
        const token = request.cookies.get('token'); // Было: 'auth-token'
        if (!token) {
            // Редирект на страницу логина с указанием откуда пришёл
            const loginUrl = new URL('/itsolar/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        }
    }
    // Редирект с корня на дашборд (опционально)
    if (pathname === '/') {
        // Если есть токен - на дашборд, иначе на логин
        const token = request.cookies.get('token'); // Было: 'auth-token'
        const redirectUrl = token ? new URL('/itsolar/account/companies', request.url) : new URL('/itsolar/login', request.url);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        /*
     * Применяем middleware ко всем путям кроме:
     * - api routes (начинаются с /api/)
     * - статические файлы (_next/static)
     * - картинки (_next/image)
     * - favicon.ico
     */ '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
(()=>{
    const e = new Error("Cannot find module '../server/web/exports/index'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
 //# sourceMappingURL=server.js.map
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
(()=>{
    const e = new Error("Cannot find module '../server/web/exports/index'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/http-access-fallback/http-access-fallback.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HTTPAccessErrorStatus",
    ()=>HTTPAccessErrorStatus,
    "HTTP_ERROR_FALLBACK_ERROR_CODE",
    ()=>HTTP_ERROR_FALLBACK_ERROR_CODE,
    "getAccessFallbackErrorTypeByStatus",
    ()=>getAccessFallbackErrorTypeByStatus,
    "getAccessFallbackHTTPStatus",
    ()=>getAccessFallbackHTTPStatus,
    "isHTTPAccessFallbackError",
    ()=>isHTTPAccessFallbackError
]);
const HTTPAccessErrorStatus = {
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    UNAUTHORIZED: 401
};
const ALLOWED_CODES = new Set(Object.values(HTTPAccessErrorStatus));
const HTTP_ERROR_FALLBACK_ERROR_CODE = 'NEXT_HTTP_ERROR_FALLBACK';
function isHTTPAccessFallbackError(error) {
    if (typeof error !== 'object' || error === null || !('digest' in error) || typeof error.digest !== 'string') {
        return false;
    }
    const [prefix, httpStatus] = error.digest.split(';');
    return prefix === HTTP_ERROR_FALLBACK_ERROR_CODE && ALLOWED_CODES.has(Number(httpStatus));
}
function getAccessFallbackHTTPStatus(error) {
    const httpStatus = error.digest.split(';')[1];
    return Number(httpStatus);
}
function getAccessFallbackErrorTypeByStatus(status) {
    switch(status){
        case 401:
            return 'unauthorized';
        case 403:
            return 'forbidden';
        case 404:
            return 'not-found';
        default:
            return;
    }
} //# sourceMappingURL=http-access-fallback.js.map
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/redirect-status-code.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RedirectStatusCode",
    ()=>RedirectStatusCode
]);
var RedirectStatusCode = /*#__PURE__*/ function(RedirectStatusCode) {
    RedirectStatusCode[RedirectStatusCode["SeeOther"] = 303] = "SeeOther";
    RedirectStatusCode[RedirectStatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    RedirectStatusCode[RedirectStatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
    return RedirectStatusCode;
}({}); //# sourceMappingURL=redirect-status-code.js.map
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/redirect-error.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REDIRECT_ERROR_CODE",
    ()=>REDIRECT_ERROR_CODE,
    "RedirectType",
    ()=>RedirectType,
    "isRedirectError",
    ()=>isRedirectError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$redirect$2d$status$2d$code$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/redirect-status-code.js [middleware-edge] (ecmascript)");
;
const REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';
var RedirectType = /*#__PURE__*/ function(RedirectType) {
    RedirectType["push"] = "push";
    RedirectType["replace"] = "replace";
    return RedirectType;
}({});
function isRedirectError(error) {
    if (typeof error !== 'object' || error === null || !('digest' in error) || typeof error.digest !== 'string') {
        return false;
    }
    const digest = error.digest.split(';');
    const [errorCode, type] = digest;
    const destination = digest.slice(2, -2).join(';');
    const status = digest.at(-2);
    const statusCode = Number(status);
    return errorCode === REDIRECT_ERROR_CODE && (type === 'replace' || type === 'push') && typeof destination === 'string' && !isNaN(statusCode) && statusCode in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$redirect$2d$status$2d$code$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["RedirectStatusCode"];
} //# sourceMappingURL=redirect-error.js.map
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/is-next-router-error.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isNextRouterError",
    ()=>isNextRouterError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$http$2d$access$2d$fallback$2f$http$2d$access$2d$fallback$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/http-access-fallback/http-access-fallback.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$redirect$2d$error$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/redirect-error.js [middleware-edge] (ecmascript)");
;
;
function isNextRouterError(error) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$redirect$2d$error$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isRedirectError"])(error) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$http$2d$access$2d$fallback$2f$http$2d$access$2d$fallback$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isHTTPAccessFallbackError"])(error);
} //# sourceMappingURL=is-next-router-error.js.map
}),
"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/build/templates/middleware.js { INNER_MIDDLEWARE_MODULE => \"[project]/backend/src/middleware.ts [middleware-edge] (ecmascript)\" } [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>nHandler
]);
(()=>{
    const e = new Error("Cannot find module 'next/dist/esm/server/web/globals'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module 'next/dist/esm/server/web/adapter'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
// Import the userland code.
var __TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/backend/src/middleware.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$is$2d$next$2d$router$2d$error$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/client/components/is-next-router-error.js [middleware-edge] (ecmascript)");
;
;
;
;
;
const mod = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$backend$2f$src$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__
};
const handler = mod.middleware || mod.default;
const page = "/middleware";
if (typeof handler !== 'function') {
    throw Object.defineProperty(new Error(`The Middleware "${page}" must export a \`middleware\` or a \`default\` function`), "__NEXT_ERROR_CODE", {
        value: "E120",
        enumerable: false,
        configurable: true
    });
}
// Middleware will only sent out the FetchEvent to next server,
// so load instrumentation module here and track the error inside middleware module.
function errorHandledHandler(fn) {
    return async (...args)=>{
        try {
            return await fn(...args);
        } catch (err) {
            // In development, error the navigation API usage in runtime,
            // since it's not allowed to be used in middleware as it's outside of react component tree.
            if ("TURBOPACK compile-time truthy", 1) {
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$3_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$client$2f$components$2f$is$2d$next$2d$router$2d$error$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isNextRouterError"])(err)) {
                    err.message = `Next.js navigation API is not allowed to be used in Middleware.`;
                    throw err;
                }
            }
            const req = args[0];
            const url = new URL(req.url);
            const resource = url.pathname + url.search;
            await edgeInstrumentationOnRequestError(err, {
                path: resource,
                method: req.method,
                headers: Object.fromEntries(req.headers.entries())
            }, {
                routerKind: 'Pages Router',
                routePath: '/middleware',
                routeType: 'middleware',
                revalidateReason: undefined
            });
            throw err;
        }
    };
}
function nHandler(opts) {
    return adapter({
        ...opts,
        page,
        handler: errorHandledHandler(handler)
    });
} //# sourceMappingURL=middleware.js.map
}),
"[project]/backend/edge-wrapper.js { MODULE => \"[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/build/templates/middleware.js { INNER_MIDDLEWARE_MODULE => \\\"[project]/backend/src/middleware.ts [middleware-edge] (ecmascript)\\\" } [middleware-edge] (ecmascript)\" } [middleware-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

self._ENTRIES ||= {};
const modProm = Promise.resolve().then(()=>__turbopack_context__.i('[project]/node_modules/.pnpm/next@15.5.3_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/esm/build/templates/middleware.js { INNER_MIDDLEWARE_MODULE => "[project]/backend/src/middleware.ts [middleware-edge] (ecmascript)" } [middleware-edge] (ecmascript)'));
modProm.catch(()=>{});
self._ENTRIES["middleware_middleware"] = new Proxy(modProm, {
    get (modProm, name) {
        if (name === "then") {
            return (res, rej)=>modProm.then(res, rej);
        }
        let result = (...args)=>modProm.then((mod)=>(0, mod[name])(...args));
        result.then = (res, rej)=>modProm.then((mod)=>mod[name]).then(res, rej);
        return result;
    }
});
}),
]);

//# sourceMappingURL=_3352ed37._.js.map