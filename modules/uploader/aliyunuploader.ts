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
		this.client = null
	}

	async upload(file: Blob, fileName: string): Promise<string>{
		if (this.client === null){
            this.client = new OSS({
                region: this.settings.region,
                accessKeyId: this.settings.accessKeyId,
                accessKeySecret: this.settings.accessKeySecret,
                bucket: this.settings.bucket
            });
		}

		const filePath = this.settings.path ? `${this.settings.path}/${fileName}` : fileName;
		return this.client.put(filePath, file).then((res: any) => {
			return res.url;
		});

	}

	onDestroy(): void {
		
	}
}
