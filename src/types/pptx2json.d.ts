declare module 'pptx2json' {
  interface PPTXSlide {
    texts?: Array<{
      text?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }

  interface PPTXResult {
    slides: PPTXSlide[];
    [key: string]: any;
  }

  function parse(fileName: string, arrayBuffer: ArrayBuffer): Promise<PPTXResult>;
  
  export { parse };
}