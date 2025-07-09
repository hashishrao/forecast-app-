'use server';

/**
 * @fileOverview AI agent for generating pollution source heatmap data.
 *
 * - generateHeatmapData - A function that generates plausible heatmap data for a given location.
 * - GenerateHeatmapDataInput - The input type for the function.
 * - GenerateHeatmapDataOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeatmapDataInputSchema = z.object({
  location: z.string().describe("The central location (e.g., city name) for which to generate heatmap data."),
});
export type GenerateHeatmapDataInput = z.infer<typeof GenerateHeatmapDataInputSchema>;

const HeatmapPointSchema = z.object({
    lat: z.number().describe("The latitude of the heatmap point."),
    lng: z.number().describe("The longitude of the heatmap point."),
    weight: z.number().min(0).max(1).describe("The intensity of the pollution source, from 0 to 1."),
    type: z.enum(['traffic', 'industrial']).describe("The type of pollution source."),
});

const GenerateHeatmapDataOutputSchema = z.object({
  points: z.array(HeatmapPointSchema).describe("An array of heatmap data points for pollution sources."),
});
export type GenerateHeatmapDataOutput = z.infer<typeof GenerateHeatmapDataOutputSchema>;

export async function generateHeatmapData(input: GenerateHeatmapDataInput): Promise<GenerateHeatmapDataOutput> {
  return generateHeatmapDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHeatmapDataPrompt',
  input: {schema: GenerateHeatmapDataInputSchema},
  output: {schema: GenerateHeatmapDataOutputSchema},
  prompt: `You are a Geographic Information System (GIS) expert specializing in urban planning and environmental science.

A user has requested pollution source data for the following location: {{{location}}}.

Your task is to generate a realistic set of heatmap data points representing major pollution sources.
- Generate about 8-12 points for 'traffic' hotspots. These should correspond to major intersections, highways, and congested city centers.
- Generate about 4-6 points for 'industrial' hotspots. These should correspond to known industrial areas, power plants, or manufacturing zones near the specified location.
- Assign a 'weight' to each point from 0.0 to 1.0, representing the relative intensity of pollution from that source. Major highways or large industrial parks should have higher weights.

Return the data in the specified JSON format. Ensure the coordinates are plausible for the requested location.`,
});

const generateHeatmapDataFlow = ai.defineFlow(
  {
    name: 'generateHeatmapDataFlow',
    inputSchema: GenerateHeatmapDataInputSchema,
    outputSchema: GenerateHeatmapDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
