import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  iconColor?: string;
  trends?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, description, iconColor, trends }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {trends && (
          <div className="mt-2">
            <p
              className={cn(
                "text-xs font-medium",
                trends.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
              {trends.isPositive ? "↑" : "↓"} {Math.abs(trends.value)}% from last month
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
