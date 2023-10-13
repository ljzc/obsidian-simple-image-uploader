export interface Uploader {
	upload(file: Blob, fileName: string): Promise<string>;
	onDestroy(): void;
}
