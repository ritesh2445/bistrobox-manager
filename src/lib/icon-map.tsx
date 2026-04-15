import { Beef, Utensils, Coffee, Flame, Cake, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  hamburger: Beef,
  utensils: Utensils,
  coffee: Coffee,
  flame: Flame,
  cake: Cake,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Utensils;
}
