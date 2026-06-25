import type { EvaluationResult, CoachResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n-context";

interface FeedbackCardProps {
  evaluation: EvaluationResult;
  coach: CoachResult;
}

function ScoreIndicator({ score }: { score: number }) {
  const color = score < 4 ? "text-red-600" : score <= 6 ? "text-yellow-600" : "text-green-600";

  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl font-bold">{score}</span>
      <span className={`text-lg ${color}`}>/ 10</span>
    </div>
  );
}

export default function FeedbackCard({ evaluation, coach }: FeedbackCardProps) {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{t.score}</h3>
        <ScoreIndicator score={evaluation.score} />
      </div>

      {evaluation.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-green-700">{t.strengths}</h4>
          <ul className="list-disc list-inside text-sm">
            {evaluation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.weaknesses.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-700">{t.weaknesses}</h4>
          <ul className="list-disc list-inside text-sm">
            {evaluation.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.recommendation && (
        <div className="mb-4">
          <h4 className="font-medium">{t.recommendation}</h4>
          <p className="text-sm">{evaluation.recommendation}</p>
        </div>
      )}

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">{t.answerAnalysis}</h3>
        <p className="text-sm mb-3">{coach.explanation}</p>

        {coach.improvedAnswer && (
          <div className="mb-3">
            <h4 className="font-medium text-sm">{t.improvedAnswer}:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">{coach.improvedAnswer}</pre>
          </div>
        )}

        {coach.tips.length > 0 && (
          <div>
            <h4 className="font-medium text-sm">{t.tips}:</h4>
            <ul className="list-disc list-inside text-sm">
              {coach.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
