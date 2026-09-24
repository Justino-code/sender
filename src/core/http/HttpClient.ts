import { HttpMethod } from "../../shared/index.js";
import { TimeoutError } from "../errors/Error.js";
import { IHttpClient } from "../interfaces/index.js";

export class HttpClient implements IHttpClient {
    private timeoutMs = 10_000;
    private query: Record<string, string> = {};
    private baseUrl = "";

    private headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    public buildHeaders(headers: HeadersInit): IHttpClient {
        this.headers = headers;
        return this;
    }

    public setRequestTimeout(timeoutMs: number): IHttpClient {
        this.timeoutMs = timeoutMs;
        return this;
    }

    public setBaseUrl(baseUrl: string): IHttpClient {
        this.baseUrl = baseUrl;
        return this;
    }

    public setRequestQuery(
        query: Record<string, string>
    ): IHttpClient {
        this.query = query;
        return this;
    }

    public async get(url: string): Promise<Response> {
        return this.request("GET", url);
    }

    public async post(url: string, body?: unknown): Promise<Response> {
        return this.request("POST", url, body);
    }

    private async request(
        method: HttpMethod,
        url: string,
        body?: unknown
    ): Promise<Response> {
        const controller = new AbortController();

        const timeoutId = setTimeout(
            () => controller.abort(),
            this.timeoutMs
        );

        try {
            return await fetch(this.buildUrl(url), {
                method,
                headers: this.headers,
                body: body !== undefined
                    ? JSON.stringify(body)
                    : undefined,
                signal: controller.signal,
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.name === "AbortError"
            ) {
                throw new TimeoutError(this.timeoutMs);
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private buildUrl(url: string): string {
        const query = new URLSearchParams(this.query).toString();

        const separator = url.includes("?") ? "&" : "?";

        return query
            ? `${this.baseUrl}${url}${separator}${query}`
            : `${this.baseUrl}${url}`;
    }
}