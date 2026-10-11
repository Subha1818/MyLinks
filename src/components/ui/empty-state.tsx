import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./card";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-16 px-6">
      {/* Colorful CSS geometric composition */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center select-none" aria-hidden="true">
        {/* Playful background shapes */}
        <div className="absolute -top-1 -left-1 w-12 h-12 rounded-full bg-lime border border-black/5 rotate-12 transition-transform hover:rotate-45" />
        <div className="absolute -bottom-1 -right-1 w-14 h-8 rounded-full bg-mint border border-black/5 -rotate-12" />
        <div className="absolute top-2 -right-2 w-8 h-8 rounded-2xl bg-lilac border border-black/5 rotate-45" />
        
        {/* Foreground badge with icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-hairline shadow-md flex items-center justify-center text-forest">
          {Icon ? (
            <Icon className="w-8 h-8 stroke-[2.2]" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-forest" />
          )}
        </div>
      </div>

      <h3 className="font-heading font-extrabold text-2xl text-ink mb-2">
        {title}
      </h3>
      <p className="text-ink/65 font-medium text-[15px] sm:text-base max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {action && (
        <Button variant="primary" size="48px" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Card>
  );
}
