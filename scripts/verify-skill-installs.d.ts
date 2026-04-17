declare module 'node:fs/promises' {
  export function copyFile(src: string, dest: string): Promise<void>;
  export function mkdir(
    path: string,
    options?: { recursive?: boolean },
  ): Promise<string | undefined>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function rm(
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<void>;
  export function stat(path: string): Promise<unknown>;
  export function writeFile(
    file: string,
    data: string,
    encoding?: 'utf8',
  ): Promise<void>;

  const fs: {
    copyFile: typeof copyFile;
    mkdir: typeof mkdir;
    mkdtemp: typeof mkdtemp;
    rm: typeof rm;
    stat: typeof stat;
    writeFile: typeof writeFile;
  };

  export default fs;
}

declare module 'node:os' {
  export function tmpdir(): string;

  const os: {
    tmpdir: typeof tmpdir;
  };

  export default os;
}

declare module 'node:path' {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;

  const path: {
    dirname: typeof dirname;
    join: typeof join;
    resolve: typeof resolve;
  };

  export default path;
}

declare const process: {
  argv: string[];
  cwd(): string;
  exitCode?: number;
  exit(code?: number): never;
};
