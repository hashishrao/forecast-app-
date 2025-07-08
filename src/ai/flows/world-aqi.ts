'use server';

/**
 * @fileOverview World AQI data generation AI agent.
 *
 * - worldAqi - A function that generates a list of countries with their current AQI.
 * - WorldAqiOutput - The return type for the worldAqi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// No input needed for this flow.
const WorldAqiInputSchema = z.object({});
export type WorldAqiInput = z.infer<typeof WorldAqiInputSchema>;


const WorldAqiOutputSchema = z.object({
  countries: z.array(z.object({
    name: z.string().describe("The name of the country."),
    aqi: z.number().describe("The simulated current AQI value for the country's capital or major city."),
  })).describe("A list of countries and their AQI data."),
});
export type WorldAqiOutput = z.infer<typeof WorldAqiOutputSchema>;


export async function worldAqi(): Promise<WorldAqiOutput> {
  return worldAqiFlow({});
}

const prompt = ai.definePrompt({
  name: 'worldAqiPrompt',
  input: {schema: WorldAqiInputSchema},
  output: {schema: WorldAqiOutputSchema},
  prompt: `You are a global air quality data provider. Your task is to generate a list of approximately 15-20 countries from around the world with their current, realistic Air Quality Index (AQI) values.

Please ensure the list:
- Includes a diverse range of countries from different continents.
- Features a wide spectrum of AQI values, from "Good" (under 50) to "Hazardous" (over 300).
- Reflects plausible current environmental conditions (e.g., some industrial nations might have higher AQI, some pristine nations lower).

Return the data in the specified JSON format.
`,
});

const worldAqiFlow = ai.defineFlow(
  {
    name: 'worldAqiFlow',
    inputSchema: WorldAqiInputSchema,
    outputSchema: WorldAqiOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    // Sort the countries by AQI in descending order before returning
    if (output?.countries) {
      output.countries.sort((a, b) => b.aqi - a.aqi);
    }
    return output!;
  }
);
