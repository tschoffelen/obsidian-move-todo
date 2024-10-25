import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import moment from "moment";

import { showDateModal } from "./date-modal";
import { getCurrentlySelectedTodos } from "./editor";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";
import {
	DEFAULT_SETTINGS,
	MoveTodoSettings,
	MoveTodoSettingTab,
} from "./settings";

export default class MoveTodoPlugin extends Plugin {
	settings: MoveTodoSettings;

	async onload() {
		// Prepare settings
		await this.loadSettings();
		this.addSettingTab(new MoveTodoSettingTab(this.app, this));

		// Add menu command
		this.addCommand({
			id: "move-todo",
			name: "move todo to...",
			icon: "calendar-arrow-down",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!appHasDailyNotesPluginLoaded()) {
					new Notice(
						"Daily notes plugin not loaded. Please install it to use the 'Move todo' plugin."
					);
					return;
				}

				const todos = getCurrentlySelectedTodos(editor);
				if (!todos.length) {
					new Notice("No todo item selected");
					return;
				}

				const date = await showDateModal(this.app);
				console.log(`Moving todos`, todos, date);

				// Get target note
				const dailyNotes = getAllDailyNotes();
				let note = getDailyNote(moment(date), dailyNotes);
				if (!note) {
					note = await createDailyNote(moment(date));
				}

				let cancelled = false;
				const newContent = todos.map((todo) => todo.content).join("\n");
				await this.app.vault.process(note, (data) => {
					if (this.settings.heading) {
						console.log(data);
						const heading = data.indexOf(this.settings.heading);
						if (heading === -1) {
							new Notice(
								`Heading "${this.settings.heading}" not found in target note.`
							);
							cancelled = true;
							return data;
						}

						const headingEnd = data.indexOf("\n", heading);
						data =
							data.slice(0, headingEnd) +
							`\n${newContent.trim()}` +
							data.slice(headingEnd);
					} else {
						data += `\n${newContent}`;
					}
					return data;
				});
				if (cancelled) return;

				// Remove item from current range
				for (const todo of todos.reverse()) {
					editor.replaceRange(
						"",
						editor.offsetToPos(todo.from),
						editor.offsetToPos(todo.to)
					);
				}

				new Notice(
					`Moved ${todos.length} todo${
						todos.length === 1 ? "" : "s"
					} to ${note.basename}`
				);
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
