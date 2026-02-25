import { App, PluginSettingTab, Setting } from "obsidian";
import { DEBUG, LOG_PREFIX, debug } from "./main";
import MyPlugin from "./main";

export interface RepeatIndentSettings {
	symbols: string[]; // user editable
}

export const DEFAULT_SETTINGS: RepeatIndentSettings = {
	symbols: ["->", "-", "*"],
};

export class RepeatIndentSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Repeated symbols")
			.setDesc("One per line");

		const textArea = containerEl.createEl("textarea");
		textArea.value = this.plugin.settings.symbols.join("\n");

		textArea.onchange = async () => {
			debug("Settings textarea changed");

			this.plugin.settings.symbols = textArea.value
				.split("\n")
				.filter(Boolean);

			debug("New symbols:", this.plugin.settings.symbols);

			await this.plugin.saveSettings();
			this.plugin.buildSymbolSet();
		};
	}
}
