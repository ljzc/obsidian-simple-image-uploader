import { Uploader } from "./uploader";
//@ts-ignore
import OSS from "ali-oss";

export interface AliyunUploaderSettings {
	accessKeyId: string;
	accessKeySecret: string;
	bucket: string;
	region: string;
	path?: string;
}



export class AliyunUploader implements Uploader {
	private client: OSS;
	private settings: AliyunUploaderSettings;
	constructor(settings: AliyunUploaderSettings) {
		this.settings = settings;
		this.client = new OSS({
			region: settings.region,
			accessKeyId: settings.accessKeyId,
			accessKeySecret: settings.accessKeySecret,
			bucket: settings.bucket
		});
	}

	async upload(file: Blob, fileName: string): Promise<string>{
		const filePath = this.settings.path ? `${this.settings.path}/${fileName}` : fileName;
		return this.client.put(filePath, file).then((res: any) => {
			return res.url;
		});

	}

	onDestroy(): void {
		
	}
}
