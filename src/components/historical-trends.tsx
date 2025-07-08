"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartDataPM25 = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 52 },
  { month: "Mar", value: 38 },
  { month: "Apr", value: 25 },
  { month: "May", value: 32 },
  { month: "Jun", value: 40 },
]

const chartDataPM10 = [
  { month: "Jan", value: 88 },
  { month: "Feb", value: 95 },
  { month: "Mar", value: 72 },
  { month: "Apr", value: 55 },
  { month: "May", value: 68 },
  { month: "Jun", value: 80 },
]

const chartDataNO2 = [
  { month: "Jan", value: 30 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 28 },
  { month: "Apr", value: 22 },
  { month: "May", value: 25 },
  { month: "Jun", value: 29 },
]

const chartConfig = {
  value: {
    label: "µg/m³",
  },
  pm25: {
    label: "PM2.5",
    color: "hsl(var(--chart-1))",
  },
  pm10: {
    label: "PM10",
    color: "hsl(var(--chart-2))",
  },
  no2: {
    label: "NO₂",
    color: "hsl(var(--chart-3))",
  },
}

export default function HistoricalTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Trends</CardTitle>
        <CardDescription>Pollutant levels over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pm25">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pm25">PM2.5</TabsTrigger>
            <TabsTrigger value="pm10">PM10</TabsTrigger>
            <TabsTrigger value="no2">NO₂</TabsTrigger>
          </TabsList>
          <TabsContent value="pm25">
            <ChartContainer config={chartConfig} className="w-full h-[250px]">
              <BarChart accessibilityLayer data={chartDataPM25}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={chartConfig.pm25.color} radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="pm10">
            <ChartContainer config={chartConfig} className="w-full h-[250px]">
              <BarChart accessibilityLayer data={chartDataPM10}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={chartConfig.pm10.color} radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="no2">
            <ChartContainer config={chartConfig} className="w-full h-[250px]">
              <BarChart accessibilityLayer data={chartDataNO2}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={chartConfig.no2.color} radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
