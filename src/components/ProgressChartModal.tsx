import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  exerciseName: string;
  data: { date: string; fullDate: string; max1RM: number; totalVolume: number }[];
  onClose: () => void;
};

export function ProgressChartModal({ exerciseName, data, onClose }: Props) {
  if (data.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <h2 className="mb-4 text-lg font-bold text-slate-100">{exerciseName} 성장 통계</h2>
          <p className="text-slate-400">아직 과거 기록이 없습니다.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary-500">{exerciseName} <span className="text-slate-200">성장 통계</span></h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-2 ms-1 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-primary-500">
            <span className="h-2 w-2 rounded-full bg-primary-500"></span>
            예상 1RM (kg)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
            총 볼륨 (kg)
          </span>
        </div>

        <div className="h-64 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickMargin={8} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                itemStyle={{ fontWeight: "bold" }}
                labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="max1RM" 
                name="예상 1RM"
                stroke="var(--color-primary-500)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-primary-500)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalVolume" 
                name="총 볼륨"
                stroke="#818cf8" 
                strokeWidth={2}
                dot={{ fill: "#818cf8", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          * 1RM은 Epley 공식을 사용하여 완료된 가장 높은 세트 기준으로 계산됩니다.
        </p>
      </div>
    </div>
  );
}
