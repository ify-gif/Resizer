declare module 'pica' {
  export default class Pica {
    resize(
      from: HTMLCanvasElement,
      to: HTMLCanvasElement,
      options?: {
        quality?: number;
        alpha?: boolean;
        unsharpAmount?: number;
        unsharpRadius?: number;
        unsharpThreshold?: number;
      }
    ): Promise<HTMLCanvasElement>;

    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>;
  }
}
