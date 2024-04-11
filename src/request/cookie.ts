import {dotenv} from "../deps.ts"

const env = await dotenv.load()

interface Cookie {
    name: string
    value: string
    domain: string
    path: string
}


class CookieManager {
    private _store: Map<string, Map<string, Cookie[]>>

    constructor() {
        // - domain1:
        //     - path1: [cookie1, cookie2]
        //     - path2: [cookie3, cookie4]
        // - domain2:
        //     - path3: []
        this._store = new Map<string, Map<string, Cookie[]>>()

        // 写入登录cookie
        this.set({
            name: 'fem_auth_mod',
            value: env['FEM_AUTH_MOD'],
            domain: '.frontendmasters.com',
            path: '/',
        })
    }

    parse(cookieStr: string, base: string) {
        // "CloudFront-Key-Pair-Id=APKAJWB4SBTOPQN6G6BQ; Path=/DTFDVKKHhY-oiNhkAmptL; Domain=frontendmasters.com; HttpOnly"
        const cookie: Partial<Cookie> = {}
        cookieStr.split(';').map(_ => _.trim()).forEach(kv => {
            const [key, value] = kv.split('=')
            switch (key.toLowerCase()) {
                case 'path':
                    cookie.path = value
                    break
                case 'domain':
                    if (value.startsWith('.')) {
                        cookie.domain = value
                    } else {
                        cookie.domain = '.' + value
                    }
                    break
                case 'httponly':
                case 'secure':
                case 'samesite':
                case 'expires':
                case 'max-age':
                case 'partitioned':
                    break
                default:
                    cookie.name = key
                    cookie.value = value
                    break
            }
        })
        if (!cookie.domain) {
            // set-cookie 中没有指定域名
            cookie.domain = new URL(base).hostname
        }
        if (!cookie.path) {
            cookie.path = '/'
        }
        if (!cookie.name || !cookie.value) {
            return null
        }
        return cookie as Cookie
    }

    // 添加新cookie
    set(cookie: Cookie) {
        let domainCookiesMap = this._store.get(cookie.domain)
        if (!domainCookiesMap) {
            domainCookiesMap = new Map<string, Cookie[]>()
            this._store.set(cookie.domain, domainCookiesMap)
        }
        let cookies = domainCookiesMap.get(cookie.path.replace(/\/$/, '') + '/')
        if (!cookies) {
            cookies = [cookie]
        } else {
            cookies = cookies.filter(_ => _.name !== cookie.name)
            cookies.push(cookie)
        }
        if (cookie.path.endsWith('/')) {
            domainCookiesMap.set(cookie.path, cookies)
        } else {
            domainCookiesMap.set(cookie.path + '/', cookies)
        }
    }

    // 根据请求url检索需要携带的cookie
    query(url: string) {
        const {pathname, hostname} = new URL(url)

        const cookies = []
        for (const domain of this._store.keys()) {
            if (
                domain.startsWith('.') && hostname.endsWith(domain) ||
                !domain.startsWith('.') && domain === hostname
            ) {
                if (hostname.endsWith(domain)) {
                    const domainCookies = this._store.get(domain)!
                    for (const path of domainCookies.keys()) {
                        if (pathname.startsWith(path)) {
                            cookies.push(...(domainCookies.get(path)!))
                        }
                    }
                }
            }
        }
        return cookies
    }

    all() {
        return this._store
    }
}

export const cookieManager = new CookieManager()
