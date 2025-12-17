// Minimal DOM-like globals for runtime (Request/Response/URL) to avoid using lib.dom
// Adjust if you need more precise typings.

declare class Request {
  constructor(input: any);
  url: string;
  method: string;
  json(): Promise<any>;
  headers?: Record<string, string>;
}

declare class Response {
  constructor(body?: any, init?: any);
}

declare const URL: {
  new(url: string): { href: string; pathname: string; search: string; toString(): string };
  prototype: any;
};

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};
