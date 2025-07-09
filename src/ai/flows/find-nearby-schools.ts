'use server';
/**
 * @fileOverview AI agent for finding nearby schools.
 *
 * - findNearbySchools - A function that generates a list of nearby schools with AQI data.
 * - FindNearbySchoolsInput - The input type for the function.
 * - FindNearbySchoolsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindNearbySchoolsInputSchema = z.object({
  lat: z.number().describe('The latitude of the user.'),
  lon: z.number().describe('The longitude of the user.'),
});
export type FindNearbySchoolsInput = z.infer<typeof FindNearbySchoolsInputSchema>;

const SchoolSchema = z.object({
    name: z.string().describe("The name of the school."),
    address: z.string().describe("The full address of the school."),
    lat: z.number().describe("The latitude of the school."),
    lon: z.number().describe("The longitude of the school."),
    aqi: z.number().describe("The current estimated Air Quality Index (AQI) at the school's location. Should be between 0 and 500."),
    imageUrl: z.string().describe("A placeholder image URL for the school, e.g., 'https://placehold.co/600x400.png'.")
});

const FindNearbySchoolsOutputSchema = z.object({
  schools: z.array(SchoolSchema).describe("An array of nearby schools."),
});
export type FindNearbySchoolsOutput = z.infer<typeof FindNearbySchoolsOutputSchema>;

export async function findNearbySchools(input: FindNearbySchoolsInput): Promise<FindNearbySchoolsOutput> {
  return findNearbySchoolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findNearbySchoolsPrompt',
  input: {schema: FindNearbySchoolsInputSchema},
  output: {schema: FindNearbySchoolsOutputSchema},
  prompt: `You are a helpful local services directory specializing in education and environmental data.

A user is at latitude: {{{lat}}}, longitude: {{{lon}}}.

Please provide a list of 5-7 real or realistic schools within an approximate 5km radius of this location. For each school, provide its name, full address, precise latitude and longitude, a realistic current Air Quality Index (AQI) value for its specific location, and a generic placeholder image URL (using https://placehold.co).

Return the data in the specified JSON format.`,
});

const findNearbySchoolsFlow = ai.defineFlow(
  {
    name: 'findNearbySchoolsFlow',
    inputSchema: FindNearbySchoolsInputSchema,
    outputSchema: FindNearbySchoolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
