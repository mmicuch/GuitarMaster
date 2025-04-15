declare module 'expo-file-system' {
  export interface FileInfo {
    exists: boolean;
    isDirectory?: boolean;
    modificationTime?: number;
    size?: number;
    uri?: string;
    md5?: string;
  }

  export enum EncodingType {
    UTF8 = 'utf8',
    Base64 = 'base64',
  }

  export interface MakeDirectoryOptions {
    intermediates?: boolean;
  }

  export interface GetInfoAsyncOptions {
    md5?: boolean;
    size?: boolean;
  }

  export interface CopyAsyncOptions {
    from: string;
    to: string;
  }

  export interface MoveAsyncOptions {
    from: string;
    to: string;
  }

  export interface WriteAsyncOptions {
    encoding?: EncodingType;
  }

  export interface ReadAsyncOptions {
    encoding?: EncodingType;
    position?: number;
    length?: number;
  }

  export const documentDirectory: string;
  export const cacheDirectory: string;
  export const bundleDirectory: string;

  export function getInfoAsync(
    fileUri: string,
    options?: GetInfoAsyncOptions
  ): Promise<FileInfo>;

  export function readAsStringAsync(
    fileUri: string,
    options?: ReadAsyncOptions
  ): Promise<string>;

  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: WriteAsyncOptions
  ): Promise<void>;

  export function deleteAsync(
    fileUri: string,
    options?: { idempotent?: boolean }
  ): Promise<void>;

  export function moveAsync(options: MoveAsyncOptions): Promise<void>;
  
  export function copyAsync(options: CopyAsyncOptions): Promise<void>;

  export function makeDirectoryAsync(
    fileUri: string,
    options?: MakeDirectoryOptions
  ): Promise<void>;

  export function readDirectoryAsync(fileUri: string): Promise<string[]>;

  export function getContentUriAsync(fileUri: string): Promise<string>;

  export function getFreeDiskStorageAsync(): Promise<number>;

  export function getTotalDiskCapacityAsync(): Promise<number>;

  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: {
      md5?: boolean;
      headers?: { [name: string]: string };
    }
  ): Promise<FileInfo>;
}