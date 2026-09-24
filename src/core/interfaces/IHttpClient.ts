export interface IHttpClient {
    get(url: string): Promise<Response>;
    post(url: string, body?: unknown): Promise<Response>;

    buildHeaders(headers: HeadersInit): IHttpClient;
    setRequestTimeout(timeoutMs: number): IHttpClient
    setBaseUrl(url: string): IHttpClient;
    setRequestQuery(query: Record<string, string>): IHttpClient;
}