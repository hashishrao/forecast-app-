
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const trendsData = {
  daily: {
    aqi: [
      { label: "Mon", value: 105 }, { label: "Tue", value: 112 }, { label: "Wed", value: 125 }, 
      { label: "Thu", value: 118 }, { label: "Fri", value: 109 }, { label: "Sat", value: 135 }, { label: "Sun", value: 142 }
    ],
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
     aqi: [
      { label: "Week 1", value: 110 }, { label: "Week 2", value: 118 }, { label: "Week 3", value: 115 }, { label: "Week 4", value: 122 }
    ],
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
    aqi: [
      { label: "Jan", value: 120 }, { label: "Feb", value: 135 }, { label: "Mar", value: 95 }, 
      { label: "Apr", value: 70 }, { label: "May", value: 85 }, { label: "Jun", value: 100 }
    ],
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

const satelliteImages = {
  daily: [
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Monday", label: "Monday", dataAiHint: "satellite pollution" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Tuesday", label: "Tuesday", dataAiHint: "satellite haze" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Wednesday", label: "Wednesday", dataAiHint: "satellite smog" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Thursday", label: "Thursday", dataAiHint: "satellite clear" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Friday", label: "Friday", dataAiHint: "satellite pollution" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Saturday", label: "Saturday", dataAiHint: "satellite city" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Sunday", label: "Sunday", dataAiHint: "satellite city" },
  ],
  weekly: [
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Week 1", label: "Week 1", dataAiHint: "satellite city" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Week 2", label: "Week 2", dataAiHint: "satellite haze" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Week 3", label: "Week 3", dataAiHint: "satellite pollution" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Week 4", label: "Week 4", dataAiHint: "satellite clear" },
  ],
  monthly: [
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Jan", label: "January", dataAiHint: "satellite winter" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Feb", label: "February", dataAiHint: "satellite winter" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Mar", label: "March", dataAiHint: "satellite spring" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Apr", label: "April", dataAiHint: "satellite spring" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view May", label: "May", dataAiHint: "satellite summer" },
    { src: "https://placehold.co/600x400.png", alt: "Satellite view Jun", label: "June", dataAiHint: "satellite summer" },
  ]
};

const chartConfig = {
  aqi: {
    label: "AQI",
    color: "hsl(var(--chart-4))",
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
  const [activeTab, setActiveTab] = useState<Pollutant>('aqi');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');

  const chartData = useMemo(() => {
    return trendsData[timePeriod][activeTab] || [];
  }, [activeTab, timePeriod]);

  const currentImages = useMemo(() => {
    return satelliteImages[timePeriod] || [];
  }, [timePeriod]);
  
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
          <Tabs defaultValue="aqi" onValueChange={(value) => setActiveTab(value as Pollutant)}>
            <TabsList>
              <TabsTrigger value="aqi">AQI</TabsTrigger>
              <TabsTrigger value="pm25">PM2.5</TabsTrigger>
              <TabsTrigger value="pm10">PM10</TabsTrigger>
              <TabsTrigger value="no2">NO₂</TabsTrigger>
            </TabsList>
          </Tabs>

          <RadioGroup defaultValue="daily" onValueChange={(value) => setTimePeriod(value as TimePeriod)} className="flex items-center gap-4">
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
            <YAxis tickFormatter={(value) => activeTab === 'aqi' ? `${value}` : `${value} µg/m³`} />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              name={chartConfig[activeTab].label}
              fill={chartConfig[activeTab].color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">Visual Correlation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Satellite imagery corresponding to the selected time period.
          </p>
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {currentImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <CardContent className="flex aspect-video items-center justify-center p-0">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                          data-ai-hint={image.dataAiHint}
                        />
                      </CardContent>
                      <div className="p-3 bg-muted/50">
                        <p className="text-sm font-medium text-center text-foreground">{image.label}</p>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  )
}
