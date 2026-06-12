import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

const getCookiesArray = (): string[] => {
    return document.cookie
        .split(';')
        .reduce<string[]>((cookieArray, cookie) => {
            const [key] = cookie.split('=')
            if (key) cookieArray.push(key.trim())
            return cookieArray
        }, [])
}

/**
 * If http method is `post | put | delete` and XSRF-TOKEN cookie is
 * not present, call '/sanctum/csrf-cookie' to set CSRF token, then
 * proceed with the initial request 
 * @param {AxiosRequestConfig} axiosconfig 
 * @returns {Promise<AxiosRequestConfig>}
 */
const middlewareCSRF = async (axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const cookies = getCookiesArray()
    const isTokenMissing = !cookies.includes('x-xsrf-token') // TODO adapt to env

    // TODO Implement dual http only and normal cookie

    const methodsNeedCSRF: AxiosRequestConfig['method'][] = ['post', 'put', 'delete']
    const doesMethodRequireCSRF = methodsNeedCSRF.includes(axiosConfig.method ?? 'get')

    if (isTokenMissing && doesMethodRequireCSRF) {
        const pathCSRF = 'csrf-token'
        const apiHost = import.meta.env.API_HOST ?? 'http://localhost:8000' // TODO
        const urlToCall = `${apiHost}/${pathCSRF}`

        await axios.get(urlToCall, { withCredentials: true })
    }

    return axiosConfig
}

export default middlewareCSRF