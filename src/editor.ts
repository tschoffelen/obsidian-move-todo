import { Editor } from "obsidian";
import { syntaxTree } from "@codemirror/language";

interface TodoItem {
	content: string;
	from: number;
	to: number;
	node: any;
}

export const getCurrentlySelectedTodos: (editor: Editor) => TodoItem[] = (
	editor: Editor
) => {
	let tasks: TodoItem[] = [];
	if ((editor as any)?.cm) {
		const cm = (editor as any).cm;
		const cursor = cm.state?.selection?.main as {
			from: number;
			to: number;
		};

		syntaxTree(cm.state).iterate({
			from: cursor.from,
			to: cursor.to,
			enter(node) {
				if (!node.name.includes("HyperMD-task-line")) return;
				tasks.push({
					content: cm.state.sliceDoc(node.from, node.to),
					from: node.from - 1,
					to: node.to,
					node: node,
				});
			},
		});
	}

	return tasks;
};
