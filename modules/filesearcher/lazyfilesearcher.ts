import {TAbstractFile, TFile, Vault} from "obsidian";
import { IMAGE_EXTENTION_REGEX } from "modules/constants";
import { FileSearcher } from "./filesearcher";

type ImageName = string;
type ImagePath = string;

export class LazyImageSearcher implements FileSearcher{
	private imageNameCache: Map<ImageName, ImagePath> = new Map();
	private fileMap: Map<ImagePath, TFile> = new Map();
	constructor(private vault: Vault){
		this.registerListeners();

	}

	private registerListeners(){
		this.vault.on("create", (file: TAbstractFile) => {
			console.log("file created")
			if (file instanceof TFile){
				this.addImage(file);
			}
		});

		this.vault.on("delete", (file: TAbstractFile) => {
			console.log("file deleted")
			if (file instanceof TFile){
				this.removeImage(file.path);
			}
		});

		this.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
			console.log("file renamed")
			if(file instanceof TFile){
				this.removeImage(oldPath);
				this.addImage(file);
			}
		});
	}

	private addImage(file: TFile){
		const name = file.name;
		const path = file.path;
		const valid = name.match(IMAGE_EXTENTION_REGEX);
		console.log("add image", name, path, valid);
		
		if(valid){
			console.log("image name valid", name, path);
			this.imageNameCache.set(name, path);
			this.fileMap.set(path, file);
			console.log("image added", name, path);
		}
	}

	private removeImage(path: ImagePath){
		const valid = path.match(IMAGE_EXTENTION_REGEX);
		console.log("remove image", path, valid);
		if (valid && this.fileMap.has(path)){
			const name = this.fileMap.get(path)?.name;
			this.fileMap.delete(path);
			if(name && this.imageNameCache.get(name) === path){
				this.imageNameCache.delete(name);
				console.log("image removed from name cache", name, path);
			}
			console.log("image removed", path);
		}
	}
	
	FindFileByPath(path: string): TFile | undefined {
		const file = this.fileMap.get(path);
		return file;
	}
	FindFileByName(name: string): TFile | undefined {
		const path = this.imageNameCache.get(name);
		let file
		if(path){
			file = this.fileMap.get(path);
		}
		return file;
	}
}
