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
    .describe('The AQI forecast for the next 72 hours, including a timestamp for each data point.'),
});
export type ForecastAqiOutput = z.infer<typeof ForecastAqiOutputSchema>;

export async function forecastAqi(input: ForecastAqiInput): Promise<ForecastAqiOutput> {
  return forecastAqiFlow(input);
}

const getAqiForecast = ai.defineTool(
    {
        name: 'getAqiForecast',
        description: 'Retrieves the AQI forecast for a given location for the next 72 hours.',
        inputSchema: z.object({
            location: z.string().describe('The location to get the AQI forecast for.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // TODO: Implement fetching the AQI forecast using an external API or model.
        // This is a placeholder implementation.
        return `AQI forecast for ${input.location} for the next 72 hours will be good.`;
    }
);

const prompt = ai.definePrompt({
  name: 'forecastAqiPrompt',
  tools: [getAqiForecast],
  input: {schema: ForecastAqiInputSchema},
  output: {schema: ForecastAqiOutputSchema},
  prompt: `You are an air quality expert.  A user has requested an AQI forecast for the next 72 hours.  Use the getAqiForecast tool to retrieve the AQI forecast for the user's location.

Location: {{{location}}}

Return the forecast to the user.
`,
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
