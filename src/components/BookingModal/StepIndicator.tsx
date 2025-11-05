'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mt-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-colors ${
            index + 1 === currentStep
              ? 'bg-accent'
              : index + 1 < currentStep
              ? 'bg-black'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

