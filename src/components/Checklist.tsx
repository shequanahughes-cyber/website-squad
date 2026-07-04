import {
  DesktopIcon,
  MobileIcon,
  MailIcon,
  WorldIcon,
  RocketIcon,
  RefreshIcon,
} from "@/components/icons";
import { CHECKLIST_ITEMS } from "@/lib/offer";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "device-desktop": DesktopIcon,
  "device-mobile": MobileIcon,
  mail: MailIcon,
  world: WorldIcon,
  rocket: RocketIcon,
  refresh: RefreshIcon,
};

export default function Checklist() {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      {CHECKLIST_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <div key={item.title} className="flex items-start gap-2.5">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-accent-tint">
              <Icon className="h-4 w-4 text-accent-text" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-headline">{item.title}</p>
              <p className="text-[12px] text-body">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
