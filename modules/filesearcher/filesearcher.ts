import { TFile } from "obsidian";

export interface FileSearcher {
	FindFileByPath(path: string): TFile | undefined;
	FindFileByName(name: string): TFile | undefined;
} 


