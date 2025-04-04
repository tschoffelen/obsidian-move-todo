import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import { _plugin } from "main";
import { MarkdownView } from "obsidian";

export class EmojiWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("div");
		div.className = "move-todo-widget";

		div.addEventListener("click", (e) => {
			e.preventDefault();
			const { workspace } = _plugin.app;
			const view = workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;

			_plugin.editorCallback(view.editor, view);
		});

		return div;
	}
}

class EmojiListPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();

		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					if (node.type.name.includes("HyperMD-task-line")) {
						const listCharFrom = node.from;

						builder.add(
							listCharFrom,
							listCharFrom,
							Decoration.line({
								class: "move-todo-line",
							})
						);

						builder.add(
							listCharFrom,
							listCharFrom,
							Decoration.widget({
								widget: new EmojiWidget(),
							})
						);
					}
				},
			});
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
	decorations: (value: EmojiListPlugin) => value.decorations,
};

export const moveWidgetPlugin = ViewPlugin.fromClass(
	EmojiListPlugin,
	pluginSpec
);
