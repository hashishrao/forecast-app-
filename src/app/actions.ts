"use server";

import { forecastAqi, type ForecastAqiInput, type ForecastAqiOutput } from "@/ai/flows/forecast-aqi";

type ActionResult = {
    success: boolean;
    data?: ForecastAqiOutput;
    error?: string;
}

export async function getAqiForecastAction(input: ForecastAqiInput): Promise<ActionResult> {
    try {
        const result = await forecastAqi(input);
        return { success: true, data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
