import { Modal, App, Setting} from "obsidian";


export class ConfirmModal extends Modal {
	private confirmed = false;
	
	constructor(app: App, private title: string, private message: string, private onConfirm: () => void, private onCancel: () => void) {
		super(app);
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.createEl('h1', {text: this.title});
		contentEl.createEl('p', {text: this.message});
		new Setting(contentEl)
		.addButton((button) => {
			button.setButtonText('Confirm');
			button.onClick(() => {
				this.confirmed = true;
				this.close();
			});
		})
		.addButton((button) => {
			button.setButtonText('Cancel');
			button.onClick(() => {
				this.confirmed = false;
				this.close();
			});
		});
	}

	onClose(): void {
		const {contentEl} = this;
		contentEl.empty();
		if (this.confirmed) {
			this.onConfirm();
		} else {
			this.onCancel();
		}
	}

}

export const showConfirmModal = (app: App,title: string, message: string) => {
	return new Promise((resolve) => {
		new ConfirmModal(app, title, message, () => resolve(true), () => resolve(false)).open();
	});
}
