import { Notice, Plugin, TFile, PluginSettingTab, App, Setting} from 'obsidian';
import { SingleLinkParser, SimpleWikiLinkParser } from './modules/linkimageparser';
import { Uploader } from './modules/uploader/uploader';
import { AliyunUploader, AliyunUploaderSettings } from './modules/uploader/aliyunuploader';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	aliyunUploaderSettings: AliyunUploaderSettings;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	aliyunUploaderSettings: {
		accessKeyId: '',
		accessKeySecret: '',
		bucket: '',
		region: '',
		path: ''
	}
}
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	singleLinkParser: SingleLinkParser;
	uploader: Uploader;
	async onload() {
		this.singleLinkParser = new SimpleWikiLinkParser(this.app.vault);
		this.reinitUploader();
		await this.loadSettings();
		this.addCommand({
			id: 'show-all-files',
			name: 'Show All Files',
			callback: () => {
				const files = this.app.vault.getFiles();
				for (const file of files) {
					console.log(file);
				}
			}
		});
		this.addCommand({
			id: 'insert-image',
			name: 'Insert Image',
			callback: () => {
				const inputElement = document.createElement('input');
				inputElement.style.display = 'none';
				document.body.appendChild(inputElement);
				inputElement.type = 'file';
				inputElement.accept = 'image/*';
				inputElement.click();
				inputElement.onchange = async () => {
					const file = inputElement.files?.item(0);
					if (file) {
						console.log(file);
						document.body.removeChild(inputElement);
					}
				}
			}
		});
		this.registerWorkSpaceEvent();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	// registerVaultEvent(){
	// 	const { vault } = this.app;
	// 	vault.on('create', (file) => {
	// 		new Notice(`File ${file.path} created!`);
	// 	});
	// }

	registerWorkSpaceEvent(){
		const beginUpload = async (image: TFile) => {
			console.log(image);
			new Notice('Image link detected! Begin uploading...');
			const file = await this.app.vault.readBinary(image);
			const fileName = image.name;
			const url = await this.uploader.upload(new Blob([file]), fileName);
			return {url, fileName};
		}
		const { workspace } = this.app;
		workspace.on('editor-change', (editor, info) => {
			if(info.file && info.file.parent){
				const cursor = editor.getCursor();
				const textBeforeCursor = editor.getLine(cursor.line).slice(0, cursor.ch);
				let imageLink = this.singleLinkParser.parseLink(textBeforeCursor, info.file.parent);
				let line = cursor.line;
				if (!imageLink) {
					if (editor.lastLine() !== 0){
						const lastLineText = editor.getLine(editor.lastLine() - 1);
						const lastLineImageLink = this.singleLinkParser.parseLink(lastLineText, info.file.parent);
						if (lastLineImageLink) {
							imageLink = lastLineImageLink;
							line = editor.lastLine() - 1;
						}
					}
					
				}
				if (imageLink) {
					const targetImageLink = imageLink;
					const targetLine = line;
					beginUpload(imageLink.file).then(({url, fileName}) => {
						editor.replaceRange(`![${fileName}](${url})`, {line: targetLine, ch: targetImageLink.begin}, {line: targetLine, ch: targetImageLink.end});
						new Notice('Image uploaded!');
						this.app.vault.delete(targetImageLink.file);
					})
				}
			}
		});

		
	}

	reinitUploader(){
		if (this.uploader){
			this.uploader.onDestroy();
		}
		this.uploader = new AliyunUploader(this.settings.aliyunUploaderSettings);
	}

	onunload() {
   // TODO document why this method 'onunload' is empty
 

	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData()};
	}

	async onSettingsChange() {
		this.reinitUploader();
		await this.saveData(this.settings);
	}
}




class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Access Key ID')
			.setDesc('Access Key ID of your aliyun oss account')
			.addText(text => text
				.setPlaceholder('Access Key ID')
				.setValue(this.plugin.settings.aliyunUploaderSettings.accessKeyId)
				.onChange(async (value) => {
					this.plugin.settings.aliyunUploaderSettings.accessKeyId = value;
					await this.plugin.onSettingsChange();
		}));

		new Setting(containerEl)
		.setName('Access Key Secret')
		.setDesc('Access Key Secret of your aliyun oss account')
		.addText(text => text
			.setPlaceholder('Access Key Secret')
			.setValue(this.plugin.settings.aliyunUploaderSettings.accessKeySecret)
			.onChange(async (value) => {
				this.plugin.settings.aliyunUploaderSettings.accessKeySecret = value;
				await this.plugin.onSettingsChange();
		}));

		new Setting(containerEl)
		.setName('Bucket')
		.setDesc('Bucket of your oss')
		.addText(text => text
			.setPlaceholder('Bucket Name')
			.setValue(this.plugin.settings.aliyunUploaderSettings.bucket)
			.onChange(async (value) => {
				this.plugin.settings.aliyunUploaderSettings.bucket = value;
				await this.plugin.onSettingsChange();
		}));


		new Setting(containerEl)
		.setName('Region')
		.setDesc('Region of your bucket')
		.addText(text => text
			.setPlaceholder('something like "oss-cn-beijing"')
			.setValue(this.plugin.settings.aliyunUploaderSettings.region)
			.onChange(async (value) => {
				this.plugin.settings.aliyunUploaderSettings.region = value;
				await this.plugin.onSettingsChange();
		}));

		new Setting(containerEl)
		.setName('Path')
		.setDesc('Path within the bucket to store files')
		.addText(text => text
			.setPlaceholder('Path')
			.setValue(this.plugin.settings.aliyunUploaderSettings.path || '')
			.onChange(async (value) => {
				this.plugin.settings.aliyunUploaderSettings.path = value;
				await this.plugin.onSettingsChange();
		}));

	}
}
