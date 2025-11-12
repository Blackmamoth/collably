import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
	throw new Error(
		"OPENAI_API_KEY environment variable is not set. Please set it in your Convex deployment.",
	);
}

export const model = openai("gpt-4o-mini");
