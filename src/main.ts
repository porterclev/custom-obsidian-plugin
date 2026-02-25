import { App, Editor, MarkdownView, Modal, Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	RepeatIndentSettings,
	RepeatIndentSettingTab,
} from "./settings";

// Remember to rename these classes and interfaces!

// export default class MyPlugin extends Plugin {
// 	settings: MyPluginSettings;

// 	async onload() {
// 		await this.loadSettings();

// 		// This creates an icon in the left ribbon.
// 		this.addRibbonIcon('dice', 'Sample', (evt: MouseEvent) => {
// 			// Called when the user clicks the icon.
// 			new Notice('This is a notice!');
// 		});

// 		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
// 		const statusBarItemEl = this.addStatusBarItem();
// 		statusBarItemEl.setText('Status bar text');

// 		// This adds a simple command that can be triggered anywhere
// 		this.addCommand({
// 			id: 'open-modal-simple',
// 			name: 'Open modal (simple)',
// 			callback: () => {
// 				new SampleModal(this.app).open();
// 			}
// 		});
// 		// This adds an editor command that can perform some operation on the current editor instance
// 		this.addCommand({
// 			id: 'replace-selected',
// 			name: 'Replace selected content',
// 			editorCallback: (editor: Editor, view: MarkdownView) => {
// 				editor.replaceSelection('Sample editor command');
// 			}
// 		});
// 		// This adds a complex command that can check whether the current state of the app allows execution of the command
// 		this.addCommand({
// 			id: 'open-modal-complex',
// 			name: 'Open modal (complex)',
// 			checkCallback: (checking: boolean) => {
// 				// Conditions to check
// 				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
// 				if (markdownView) {
// 					// If checking is true, we're simply "checking" if the command can be run.
// 					// If checking is false, then we want to actually perform the operation.
// 					if (!checking) {
// 						new SampleModal(this.app).open();
// 					}

// 					// This command will only show up in Command Palette when the check function returns true
// 					return true;
// 				}
// 				return false;
// 			}
// 		});

// 		// This adds a settings tab so the user can configure various aspects of the plugin
// 		this.addSettingTab(new SampleSettingTab(this.app, this));

// 		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
// 		// Using this function will automatically remove the event listener when this plugin is disabled.
// 		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
// 			new Notice("Click!");
// 		});

// 		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
// 		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

// 	}

// 	onunload() {
// 	}

// 	async loadSettings() {
// 		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
// 	}

// 	async saveSettings() {
// 		await this.saveData(this.settings);
// 	}
// }

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		let {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

export const DEBUG = false;
export const LOG_PREFIX = "[repeat-indent]";

export function debug(...args: any[]) {
	if (DEBUG) console.log(LOG_PREFIX, ...args);
}

export default class RepeatIndentPlugin extends Plugin {
	settings: RepeatIndentSettings;
	symbolSet: Set<string>;

	async onload() {
		debug("Plugin loading…");

		await this.loadSettings();
		this.buildSymbolSet();

		this.addSettingTab(new RepeatIndentSettingTab(this.app, this));

		this.registerDomEvent(document, "keydown", (evt: KeyboardEvent) => {
			debug("Key pressed:", evt.key);

			if (evt.key !== "Enter") return;

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			debug("Active view:", view);

			if (!view) {
				debug("No MarkdownView found — aborting");
				return;
			}

			const editor = view.editor;
			const cursor = editor.getCursor();
			const line = editor.getLine(cursor.line - 1);

			debug("Cursor:", cursor);
			debug("Current line:", line);

			if (!line) {
				debug("Line is empty — aborting");
				return;
			}

			const match = line.match(/^(\s*)([^\w\s]+)/);
			debug("Regex match:", match);

			if (!match) {
				debug("No indent + symbol match — aborting");
				return;
			}

			const symbol = match[2];

			debug("Symbol detected:", symbol);
			debug("Symbol in set?:", this.symbolSet.has(symbol));

			if (!this.symbolSet.has(symbol)) return;

			evt.preventDefault();

			const insertion = `${symbol} `;
			debug("Inserting text:", JSON.stringify(insertion));

			editor.replaceRange(insertion, cursor);

			editor.setCursor({
				line: cursor.line,
				ch: cursor.ch + insertion.length,
			});

			debug("Insertion complete");
		});

		debug("Plugin loaded");
	}

	buildSymbolSet() {
		this.symbolSet = new Set(this.settings.symbols);
		debug("Symbol set built:", this.symbolSet);
	}

	async loadSettings() {
		debug("Loading settings…");

		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);

		debug("Settings loaded:", this.settings);
	}

	async saveSettings() {
		debug("Saving settings:", this.settings);
		await this.saveData(this.settings);
	}
}
