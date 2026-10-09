import { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-16">
      <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-ink/40" />
      </div>
      <h3 className="font-heading font-bold text-xl text-ink mb-2">
        {title}
      </h3>
      <p className="text-ink/60 font-medium max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-ink text-cream font-bold rounded-full hover:bg-ink/90 transition-colors text-sm"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
}
