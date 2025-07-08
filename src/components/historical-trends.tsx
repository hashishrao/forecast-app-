"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const trendsData = {
  daily: {
    pm25: [
      { label: "Mon", value: 42 }, { label: "Tue", value: 48 }, { label: "Wed", value: 55 }, 
      { label: "Thu", value: 51 }, { label: "Fri", value: 47 }, { label: "Sat", value: 58 }, { label: "Sun", value: 62 }
    ],
    pm10: [
      { label: "Mon", value: 85 }, { label: "Tue", value: 92 }, { label: "Wed", value: 101 }, 
      { label: "Thu", value: 98 }, { label: "Fri", value: 90 }, { label: "Sat", value: 110 }, { label: "Sun", value: 115 }
    ],
    no2: [
      { label: "Mon", value: 28 }, { label: "Tue", value: 33 }, { label: "Wed", value: 38 }, 
      { label: "Thu", value: 35 }, { label: "Fri", value: 31 }, { label: "Sat", value: 40 }, { label: "Sun", value: 42 }
    ],
  },
  weekly: {
    pm25: [
      { label: "Week 1", value: 45 }, { label: "Week 2", value: 50 }, { label: "Week 3", value: 48 }, { label: "Week 4", value: 52 }
    ],
    pm10: [
      { label: "Week 1", value: 90 }, { label: "Week 2", value: 98 }, { label: "Week 3", value: 95 }, { label: "Week 4", value: 102 }
    ],
    no2: [
      { label: "Week 1", value: 32 }, { label: "Week 2", value: 36 }, { label: "Week 3", value: 34 }, { label: "Week 4", value: 38 }
    ],
  },
  monthly: {
    pm25: [
      { label: "Jan", value: 45 }, { label: "Feb", value: 52 }, { label: "Mar", value: 38 }, 
      { label: "Apr", value: 25 }, { label: "May", value: 32 }, { label: "Jun", value: 40 }
    ],
    pm10: [
      { label: "Jan", value: 88 }, { label: "Feb", value: 95 }, { label: "Mar", value: 72 }, 
      { label: "Apr", value: 55 }, { label: "May", value: 68 }, { label: "Jun", value: 80 }
    ],
    no2: [
      { label: "Jan", value: 30 }, { label: "Feb", value: 35 }, { label: "Mar", value: 28 }, 
      { label: "Apr", value: 22 }, { label: "May", value: 25 }, { label: "Jun", value: 29 }
    ],
  }
};

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
} as const;

type Pollutant = keyof typeof trendsData.daily;
type TimePeriod = keyof typeof trendsData;

export default function HistoricalTrends() {
  const [activeTab, setActiveTab] = useState<Pollutant>('pm25');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const chartData = useMemo(() => {
    return trendsData[timePeriod][activeTab] || [];
  }, [activeTab, timePeriod]);
  
  const descriptionMap: Record<TimePeriod, string> = {
    daily: "Pollutant levels over the last 7 days.",
    weekly: "Pollutant levels over the last 4 weeks.",
    monthly: "Pollutant levels over the last 6 months."
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Trends</CardTitle>
        <CardDescription>{descriptionMap[timePeriod]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Tabs defaultValue="pm25" onValueChange={(value) => setActiveTab(value as Pollutant)}>
            <TabsList>
              <TabsTrigger value="pm25">PM2.5</TabsTrigger>
              <TabsTrigger value="pm10">PM10</TabsTrigger>
              <TabsTrigger value="no2">NO₂</TabsTrigger>
            </TabsList>
          </Tabs>

          <RadioGroup defaultValue="monthly" onValueChange={(value) => setTimePeriod(value as TimePeriod)} className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
          </RadioGroup>
        </div>

        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={chartConfig[activeTab].color} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
