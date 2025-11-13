declare module 'node:fs' {
  const mod: any;
  export = mod;
}

declare module 'node:path' {
  const mod: any;
  export = mod;
}

declare namespace NodeJS {
  interface ErrnoException extends Error {
    code?: string;
  }
}

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  cwd(): string;
  exitCode?: number;
};

declare module 'dotenv' {
  export interface DotenvConfigOptions {
    path?: string;
  }

  export function config(options?: DotenvConfigOptions): void;
}
