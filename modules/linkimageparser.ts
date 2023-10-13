import { Vault, TFile, TFolder } from 'obsidian';

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
	private static readonly WikiImageRegex = /^!\[\[([^\]]+)\]\]$/g;
	private vault: Vault;

	constructor(vault: Vault) {
		this.vault = vault;
	}

	parseLink(text: string, currentFolder: TFolder): ImageLink | undefined {
		const match = RegExp(SimpleWikiLinkParser.WikiImageRegex).exec(text);
		if (match && match.index !== undefined) {
			const link = match[1];
			if (link.startsWith('http://') || link.startsWith('https://')) {
				return undefined;
			}
			const file = this.findLinkFile(link, currentFolder);
			if (file) {
			return {
				file: file,
				source: match[0],
				begin: match.index,
				end: match.index + match[0].length
			};}
		}
	}

	/**
	 * Only files in the vault are considered.
	 * @param encodedLink 
	 * @param currentFolder 
	 * @returns 
	 */
	private findLinkFile(encodedLink: string, currentFolder: TFolder): TFile | null {
		const link = decodeURI(encodedLink);
		const files = this.vault.getFiles();
		for (const file of files) {
			const normalizedPath = this.normalizeLink(link, currentFolder);
			if (normalizedPath !== null && file.path === normalizedPath) {
				return file;
			}
			if (file.name === link || file.path === link) {
				return file;
			}
		}
		return null;
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
