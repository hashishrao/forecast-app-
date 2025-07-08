import { AlertCircle, ShieldCheck, TriangleAlert, Wind } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HealthRecommendations() {
  const recommendations = [
    {
      level: "Good (0-50)",
      icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      advice: "It's a great day to be active outside. Enjoy the fresh air!",
      details: "Air quality is considered satisfactory, and air pollution poses little or no risk."
    },
    {
      level: "Moderate (51-100)",
      icon: <Wind className="h-5 w-5 text-yellow-500" />,
      advice: "Unusually sensitive people should consider reducing prolonged or heavy exertion.",
      details: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
    },
    {
      level: "Unhealthy for Sensitive Groups (101-150)",
      icon: <TriangleAlert className="h-5 w-5 text-orange-500" />,
      advice: "People with lung disease, older adults and children are at a greater risk from exposure to ozone, whereas persons with heart and lung disease, older adults and children are at greater risk from the presence of particles in the air.",
      details: "The general public is not likely to be affected at this AQI range."
    },
    {
      level: "Unhealthy (151-200)",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      advice: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
      details: "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion."
    },
    {
      level: "Hazardous (301+)",
      icon: <AlertCircle className="h-5 w-5 text-rose-700" />,
      advice: "Health warnings of emergency conditions. The entire population is more likely to be affected.",
      details: "Everyone should avoid all outdoor exertion. Stay indoors and keep activity levels low."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {recommendations.map((rec, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  {rec.icon}
                  <span className="font-medium">{rec.level}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="font-semibold mb-2">{rec.advice}</p>
                <p className="text-sm text-muted-foreground">{rec.details}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
