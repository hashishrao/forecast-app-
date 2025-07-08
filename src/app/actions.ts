"use server";

import { forecastAqi, type ForecastAqiInput, type ForecastAqiOutput } from "@/ai/flows/forecast-aqi";
import { textToSpeech, type TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { chat, type ChatInput, type ChatOutput } from "@/ai/flows/chat-flow";
import { worldAqi, type WorldAqiOutput } from "@/ai/flows/world-aqi";

type AqiActionResult = {
    success: boolean;
    data?: ForecastAqiOutput;
    error?: string;
}

export async function getAqiForecastAction(input: ForecastAqiInput): Promise<AqiActionResult> {
    try {
        const result = await forecastAqi(input);
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

type SpeechActionResult = {
    success: boolean;
    data?: TextToSpeechOutput;
    error?: string;
}

export async function getTextToSpeechAction(text: string): Promise<SpeechActionResult> {
    try {
        const result = await textToSpeech({ text });
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

type ChatActionResult = {
    success: boolean;
    data?: ChatOutput;
    error?: string;
}

export async function chatAction(input: ChatInput): Promise<ChatActionResult> {
    try {
        const result = await chat(input);
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

type WorldAqiActionResult = {
    success: boolean;
    data?: WorldAqiOutput;
    error?: string;
}

export async function getWorldAqiAction(): Promise<WorldAqiActionResult> {
    try {
        const result = await worldAqi();
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
