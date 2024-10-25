import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { startOfDay, addDays, format, startOfISOWeek } from "date-fns";

interface DateOption {
	title: string;
	date: Date;
}

export class DateModal extends FuzzySuggestModal<DateOption> {
	onSubmit: (result: DateOption) => void;

	constructor(app: App, onSubmit: (result: DateOption) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.setTitle("Target note");
		this.setPlaceholder("Select a date to move the todo to...");
	}

	getItems(): DateOption[] {
		const options = [
			{
				title: "Tomorrow",
				date: startOfDay(addDays(new Date(), 1)),
			},
			{
				title: "Next week",
				date: startOfISOWeek(addDays(new Date(), 7)),
			},
			{
				title: "Today",
				date: startOfDay(new Date()),
			},
		];

		for (let offset = 1; offset < 7; offset++) {
			const date = startOfDay(addDays(new Date(), offset));
			options.push({
				title: format(date, "EEEE"),
				date,
			});
		}

		return options;
	}

	getItemText(item: DateOption): string {
		return item.title + " " + item.date.toISOString().substring(0, 10);
	}

	onChooseItem(item: DateOption, evt: MouseEvent | KeyboardEvent): void {
		this.close();
		this.onSubmit(item);
	}

	renderSuggestion(item: FuzzyMatch<DateOption>, el: HTMLElement) {
		el.createEl("div", {
			text: item.item.title,
		}).setCssStyles({ fontWeight: "600" });
		el.createEl("small", {
			text: item.item.date.toISOString().substring(0, 10),
		});
	}
}

export const showDateModal: (app: App) => Promise<Date> = (app: App) =>
	new Promise((resolve) =>
		new DateModal(app, ({ date }) => resolve(date)).open()
	);
