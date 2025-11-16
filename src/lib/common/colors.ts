export const colorOptions = [
	{
		name: "yellow",
		bg: "bg-yellow-500/10",
		border: "border-yellow-500/20",
		text: "text-yellow-900 dark:text-yellow-100",
	},
	{
		name: "pink",
		bg: "bg-pink-500/10",
		border: "border-pink-500/20",
		text: "text-pink-900 dark:text-pink-100",
	},
	{
		name: "blue",
		bg: "bg-blue-500/10",
		border: "border-blue-500/20",
		text: "text-blue-900 dark:text-blue-100",
	},
	{
		name: "green",
		bg: "bg-green-500/10",
		border: "border-green-500/20",
		text: "text-green-900 dark:text-green-100",
	},
	{
		name: "purple",
		bg: "bg-purple-500/10",
		border: "border-purple-500/20",
		text: "text-purple-900 dark:text-purple-100",
	},
	{
		name: "orange",
		bg: "bg-orange-500/10",
		border: "border-orange-500/20",
		text: "text-orange-900 dark:text-orange-100",
	},
];

export const getColorClasses = (colorName: string) => {
	return colorOptions.find((c) => c.name === colorName) || colorOptions[0];
};

export const getStickyNoteColors = (colorName: string | undefined): {
	backgroundColor: string;
	color: string;
} => {
	const color = colorName || "yellow";
	
	const colorMap: Record<string, { backgroundColor: string; color: string }> = {
		yellow: { backgroundColor: "#fef3c7", color: "#78350f" },
		pink: { backgroundColor: "#fce7f3", color: "#831843" },
		blue: { backgroundColor: "#dbeafe", color: "#1e3a8a" },
		green: { backgroundColor: "#d1fae5", color: "#064e3b" },
		purple: { backgroundColor: "#e9d5ff", color: "#581c87" },
		orange: { backgroundColor: "#fed7aa", color: "#7c2d12" },
	};

	return colorMap[color] || colorMap.yellow;
};

