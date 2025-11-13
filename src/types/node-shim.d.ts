declare module 'node:fs' {
  const mod: any;
  export = mod;
}

declare module 'node:fs/promises' {
  export const readFile: any;
}

declare module 'node:path' {
  const mod: any;
  export = mod;
}

declare module 'node:crypto' {
  const mod: any;
  export = mod;
}

declare module 'node:http' {
  const mod: any;
  export = mod;
}

declare module 'node:https' {
  const mod: any;
  export = mod;
}

declare module 'node:url' {
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

declare const Buffer: any;
type Buffer = any;

declare const __dirname: string;

declare module 'dotenv' {
  export interface DotenvConfigOptions {
    path?: string;
  }

  export function config(options?: DotenvConfigOptions): void;
}
