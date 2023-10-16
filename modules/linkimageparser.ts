import {  TFile, TFolder } from 'obsidian';
import { IMAGE_EXTENTION_REGEX, WIKI_IMAGE_REGEX } from './constants';
import { FileSearcher } from './filesearcher/filesearcher';
export interface ImageLink {
	file: TFile;
	source: string;
	begin: number
	end: number;
}

export interface SingleLinkParser {
	/**
	 * parse links in text.
	 * @param text text to parse.
	 * @param currentFolder current folder of the file.
	 */
	parseLink(text: string, currentFolder: TFolder): ImageLink | undefined;
}


/**
 * Parses a single line of text for a wiki link.
 * 
 */
export class SimpleWikiLinkParser implements SingleLinkParser {
	constructor(private fileManager: FileSearcher) {
	}

	parseLink(text: string, currentFolder: TFolder): ImageLink | undefined {
		const match = RegExp(WIKI_IMAGE_REGEX).exec(text);
		if (match?.index !== undefined) {
			const link = match[1];
			if (link.startsWith('http://') || link.startsWith('https://') || link.match(IMAGE_EXTENTION_REGEX) === null) {
				return undefined;
			}
			const file = this.findLinkFile(link, currentFolder);
			if (file) {
				return {
					file,
					source: match[0],
					begin: match.index,
					end: match.index + match[0].length
				};
			}
		}
	}

	/**
	 * Only files in the vault are considered.
	 * @param encodedLink 
	 * @param currentFolder 
	 * @returns 
	 */
	private findLinkFile(encodedLink: string, currentFolder: TFolder): TFile | undefined {
		const link = decodeURI(encodedLink);
		let file = this.fileManager.FindFileByName(link) ?? this.fileManager.FindFileByPath(link);
		if (!file){
			const normalizedPath = this.normalizeLink(link, currentFolder);
			if(normalizedPath !== null){
				file = this.fileManager.FindFileByPath(normalizedPath);
			}
		}
		return file;
	}

	private normalizeLink(link: string, currentFolder: TFolder): string | null {
		const pathNodes = (currentFolder.isRoot() ? link : (currentFolder.path + '/' + link)).split('/');
		const output: string[] = [];
		pathNodes.forEach((node) => {
			if (node === '..') {
				if (output.length > 0) {
					output.pop();
				}else{
					return null;
				}
			} else if (node !== '.') {
				output.push(node);
			}
		})
		return output.join('/');
	}
}
