'use server';

/**
 * @fileOverview AQI forecast AI agent.
 *
 * - forecastAqi - A function that handles the AQI forecast process.
 * - ForecastAqiInput - The input type for the forecastAqi function.
 * - ForecastAqiOutput - The return type for the forecastAqi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastAqiInputSchema = z.object({
  location: z
    .string()
    .describe("The location for which to forecast AQI. Can be city name or lat/lon."),
});
export type ForecastAqiInput = z.infer<typeof ForecastAqiInputSchema>;

const ForecastAqiOutputSchema = z.object({
  forecast: z
    .string()
    .describe('A detailed 72-hour AQI forecast text.'),
  current: z.object({
      aqi: z.number().describe('The current overall AQI value.'),
      pm25: z.number().describe('The current PM2.5 concentration in µg/m³.'),
      pm10: z.number().describe('The current PM10 concentration in µg/m³.'),
      temp: z.number().describe('The current temperature in Celsius.'),
    }).describe('Current air quality conditions.'),
  lat: z.number().describe('The latitude of the location.'),
  lon: z.number().describe('The longitude of the location.'),
});
export type ForecastAqiOutput = z.infer<typeof ForecastAqiOutputSchema>;

export async function forecastAqi(input: ForecastAqiInput): Promise<ForecastAqiOutput> {
  return forecastAqiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastAqiPrompt',
  input: {schema: ForecastAqiInputSchema},
  output: {schema: ForecastAqiOutputSchema},
  prompt: `You are an air quality expert with access to global air quality data, similar to what's provided by CPCB and other international bodies. A user has requested an AQI forecast.

Location: {{{location}}}

Based on the location, provide:
1.  A detailed 72-hour AQI forecast text.
2.  The current AQI conditions (a realistic overall AQI value, PM2.5, PM10, and temperature in Celsius).
3.  The approximate latitude and longitude for the center of the provided location.

Return the data in the specified JSON format. Be realistic with the data.`,
});

const forecastAqiFlow = ai.defineFlow(
  {
    name: 'forecastAqiFlow',
    inputSchema: ForecastAqiInputSchema,
    outputSchema: ForecastAqiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
