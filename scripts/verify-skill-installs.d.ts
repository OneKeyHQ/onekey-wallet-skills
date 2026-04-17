declare module 'node:path' {
  export function resolve(...paths: string[]): string;

  const path: {
    resolve: typeof resolve;
  };

  export default path;
}

declare const process: {
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
};
