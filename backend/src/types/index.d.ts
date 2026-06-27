declare module 'xmldom' {
  export class DOMParser {
    parseFromString(xml: string, mimeType: string): Document;
  }
  export class XMLSerializer {
    serializeToString(node: Node): string;
  }
}

declare namespace Express {
  interface Request {
    sessionId?: string;
    file?: any;
    files?: any;
  }
}