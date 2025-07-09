import { config } from 'dotenv';
config();

import '@/ai/flows/forecast-aqi.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/world-aqi.ts';
import '@/ai/flows/generate-heatmap-data.ts';
import '@/ai/flows/find-nearby-hospitals.ts';
import '@/ai/flows/find-nearby-schools.ts';
