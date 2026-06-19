'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="flex items-center justify-center py-16">
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl bg-muted p-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
