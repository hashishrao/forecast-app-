'use server';
/**
 * @fileOverview AI agent for finding nearby hospitals.
 *
 * - findNearbyHospitals - A function that generates a list of nearby hospitals.
 * - FindNearbyHospitalsInput - The input type for the function.
 * - FindNearbyHospitalsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindNearbyHospitalsInputSchema = z.object({
  lat: z.number().describe('The latitude of the user.'),
  lon: z.number().describe('The longitude of the user.'),
});
export type FindNearbyHospitalsInput = z.infer<typeof FindNearbyHospitalsInputSchema>;

const HospitalSchema = z.object({
    name: z.string().describe("The name of the hospital."),
    address: z.string().describe("The full address of the hospital."),
    lat: z.number().describe("The latitude of the hospital."),
    lon: z.number().describe("The longitude of the hospital."),
    distance: z.string().describe("The approximate distance from the user's location, e.g., '5.2 km'."),
    imageUrl: z.string().describe("A placeholder image URL for the hospital, e.g., 'https://placehold.co/600x400.png'.")
});

const FindNearbyHospitalsOutputSchema = z.object({
  hospitals: z.array(HospitalSchema).describe("An array of nearby hospitals."),
});
export type FindNearbyHospitalsOutput = z.infer<typeof FindNearbyHospitalsOutputSchema>;

export async function findNearbyHospitals(input: FindNearbyHospitalsInput): Promise<FindNearbyHospitalsOutput> {
  return findNearbyHospitalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findNearbyHospitalsPrompt',
  input: {schema: FindNearbyHospitalsInputSchema},
  output: {schema: FindNearbyHospitalsOutputSchema},
  prompt: `You are a helpful local emergency services directory.

A user is at latitude: {{{lat}}}, longitude: {{{lon}}}.

Please provide a list of 5-7 real or realistic hospitals and medical centers near this location. For each hospital, provide its name, full address, precise latitude and longitude, the approximate distance from the user's location, and a generic placeholder image URL (using https://placehold.co).

Return the data in the specified JSON format.`,
});

const findNearbyHospitalsFlow = ai.defineFlow(
  {
    name: 'findNearbyHospitalsFlow',
    inputSchema: FindNearbyHospitalsInputSchema,
    outputSchema: FindNearbyHospitalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
