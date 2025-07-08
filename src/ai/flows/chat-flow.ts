'use server';

/**
 * @fileOverview A conversational AI agent for air quality.
 *
 * - chat - A function that handles the chat conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are an expert AI assistant for the BreatheEasy app. Your goal is to provide helpful, concise, and friendly information about air quality, pollution, and related health topics.

You can answer questions about:
- Air quality indexes (AQI) and what they mean.
- Different types of pollutants (e.g., PM2.5, PM10, NO2).
- Health effects of air pollution.
- Health recommendations for different AQI levels (e.g., "What should I do if the AQI is 150?").
- General knowledge about pollution sources and mitigation.

Keep your answers conversational and easy to understand for a general audience.

User's message: {{{message}}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
