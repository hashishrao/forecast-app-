import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Range = {
  label: string;
  color: string; // tailwind color class e.g., 'bg-green-500'
  value: number;
};

type BulletGraphProps = {
  title: string;
  value: number;
  unit: string;
  ranges: Range[];
  max: number;
};

export default function BulletGraph({ title, value, unit, ranges, max }: BulletGraphProps) {
  const getRangeForValue = (val: number): Range | undefined => {
    // Find the first range where the value is less than or equal to the range's upper bound
    return ranges.find(range => val <= range.value);
  }
  
  const currentRange = getRangeForValue(value);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-baseline">
          <span>{title}</span>
          <span className="text-2xl font-bold text-foreground">{value.toFixed(1)}</span>
        </CardTitle>
        <CardDescription className="flex justify-between items-baseline">
            <span>{currentRange?.label || 'High'}</span>
            <span className="text-muted-foreground">{unit}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
          {ranges.map((range, index) => {
            const prevRangeValue = index > 0 ? ranges[index - 1].value : 0;
            const width = ((range.value - prevRangeValue) / max) * 100;
            return (
              <div
                key={range.label}
                className={cn("absolute h-full", range.color)}
                style={{
                  left: `${(prevRangeValue / max) * 100}%`,
                  width: `${width}%`,
                }}
                title={`${range.label}: <= ${range.value}`}
              />
            );
          })}
           <div
            className="absolute top-0 h-3 w-1 bg-foreground/70 -translate-x-1/2 rounded-full"
            style={{ left: `${Math.min((value / max) * 100, 100)}%` }}
            title={`Current: ${value}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
