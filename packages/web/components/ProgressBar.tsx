import { useI18n } from "@/lib/i18n-context";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const { t } = useI18n();
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>{t.question} {current} / {total}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
