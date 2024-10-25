import { App, PluginSettingTab, Setting } from "obsidian";
import MoveTodoPlugin from "./main";

export interface MoveTodoSettings {
	heading: string;
}

export const DEFAULT_SETTINGS: MoveTodoSettings = {
	heading: "",
};

export class MoveTodoSettingTab extends PluginSettingTab {
	plugin: MoveTodoPlugin;

	constructor(app: App, plugin: MoveTodoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Tasks heading")
			.setDesc("Heading under which to place tasks (optional)")
			.addText((text) =>
				text
					.setPlaceholder("# Tasks")
					.setValue(this.plugin.settings.heading)
					.onChange(async (value) => {
						this.plugin.settings.heading = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
