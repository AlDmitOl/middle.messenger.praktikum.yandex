import constants from '../constants';
import queryStringify from '../utils/queryStringify';

export enum METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

interface Options {
    method: METHOD;
    data?: Record<string | symbol, any> | FormData;
    headers?: Record<string, string>;
    timeout?: number;
}

type OptionsWithoutMethod = Omit<Options, 'method'>;

type HTTPMethod = <R=unknown>(url: string, options?: OptionsWithoutMethod) => Promise<R>;

class HTTPTransport {
    protected apiUrl: string = '';

    constructor(apiPath: string = '') {
        this.apiUrl = `${constants.HOST}${apiPath}`;
    }

    get:HTTPMethod = (url, options = {}) => {
        const { data, ...otherOptions } = options;
        let newUrl = url;
        if (data && Object.keys(data).length) {
            const queryPart = queryStringify(data);
            if (queryPart) {
                newUrl += `?${queryPart}`;
            }
        }

        return this.request(
            `${this.apiUrl}${newUrl}`,
            { ...otherOptions, method: METHOD.GET },
            options.timeout,
        );
    };

    post: HTTPMethod = (url, options = {}) => (this.request(
        `${this.apiUrl}${url}`,
        { ...options, method: METHOD.POST },
        options.timeout,
    ));

    put: HTTPMethod = (url, options = {}) => (this.request(
        `${this.apiUrl}${url}`,
        { ...options, method: METHOD.PUT },
        options.timeout,
    ));

    delete: HTTPMethod = (url, options = {}) => this.request(
        `${this.apiUrl}${url}`,
        { ...options, method: METHOD.DELETE },
        options.timeout,
    );

    request = async <TResponse>(
        url: string,
        options:Options = { method: METHOD.GET },
        timeout = 5000,
    ): Promise<TResponse> => {
        const { method, data, headers = {} } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(method || METHOD.GET, url);

            if (data instanceof FormData) {
                xhr.setRequestHeader('Accept', 'application/json');
            } else {
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            }

            Object.keys(headers).forEach((key) => {
                xhr.setRequestHeader(key, headers[key]);
            });

            xhr.onload = () => {
                if (xhr.status !== 200) {
                    reject(new Error(`Ошибка ${xhr.status}: ${xhr?.response?.reason || xhr.statusText}`));
                } else {
                    resolve(xhr.response);
                }
            };

            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;
            xhr.timeout = timeout;
            xhr.withCredentials = true;
            xhr.responseType = 'json';

            if (method === METHOD.GET || !data) {
                xhr.send();
            } else if (data instanceof FormData) {
                xhr.send(data);
            } else {
                xhr.send(JSON.stringify(data));
            }
        });
    };
}

export default HTTPTransport;
