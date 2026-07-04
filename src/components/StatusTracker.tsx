import { CheckIcon, FileIcon } from "@/components/icons";
import { STATUS_STEPS, getStepIndex, type OrderStatus } from "@/lib/orders";

export default function StatusTracker({ status }: { status: OrderStatus }) {
  const currentIndex = getStepIndex(status);

  return (
    <div className="flex items-start">
      {STATUS_STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isDone
                    ? "bg-accent"
                    : isCurrent
                      ? "border-[3px] border-accent-tint bg-accent"
                      : "bg-panel"
                }`}
              >
                {isDone || isCurrent ? (
                  isCurrent && !isDone && step.status === "draft_submitted" ? (
                    <FileIcon className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <CheckIcon className="h-3.5 w-3.5 text-white" />
                  )
                ) : (
                  <CheckIcon className="h-3.5 w-3.5 text-muted" />
                )}
              </div>
              <p
                className={`mt-2 text-center text-[11px] font-medium ${
                  isDone || isCurrent ? "text-headline" : "text-muted"
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mt-3.5 h-0.5 flex-1 ${
                  i < currentIndex ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
