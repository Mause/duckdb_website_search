declare module "duckdb" {
  class Database {
    constructor(filename: string) {}

    connect(): Connection;

    all: any;

    close(): void;
  }

  type CB<T> = (error: Error, result: T) => void;

  class Statement<T> {
    constructor(connection: Connection, text: string);
    all: any;
    run(a: string, b: string, cb?: CB): void;
    each(...args: any, cb?: CB): void;
    finalize(): void;
  }

  class Connection {
    run(text: string, cb?: CB): void;

    all: any;

    exec(text:string,cb:CB):void;

    prepare<T>(text: string, cb?: CB): Statement<T>;

    close(): void;
  }
}
