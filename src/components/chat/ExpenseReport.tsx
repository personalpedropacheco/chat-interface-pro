import { useMemo } from "react";
import { FileText, Calendar, User, DollarSign } from "lucide-react";

export interface ExpenseLineItem {
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface ExpenseReportData {
  title: string;
  employee: string;
  dateRange: { from: string; to: string };
  lineItems: ExpenseLineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  status?: string;
}

interface ExpenseReportProps {
  data: ExpenseReportData;
}

export function ExpenseReport({ data }: ExpenseReportProps) {
  const currency = data.currency || "USD";
  const fmt = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency }),
    [currency]
  );

  const subtotal = data.subtotal ?? data.lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = data.tax ?? 0;
  const total = data.total ?? subtotal + tax;

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    data.lineItems.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + i.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [data.lineItems]);

  const statusColor =
    data.status === "approved"
      ? "bg-green-500/15 text-green-700 dark:text-green-400"
      : data.status === "rejected"
      ? "bg-red-500/15 text-red-700 dark:text-red-400"
      : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";

  return (
    <div className="my-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{data.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {data.employee}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {data.dateRange.from} — {data.dateRange.to}
                </span>
              </div>
            </div>
          </div>
          {data.status && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor}`}>
              {data.status}
            </span>
          )}
        </div>
      </div>

      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{item.date}</td>
                <td className="px-4 py-2.5">{item.description}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{fmt.format(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with category breakdown + totals */}
      <div className="border-t border-border bg-muted/30 px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between">
        {/* Category breakdown */}
        <div className="flex flex-wrap gap-3">
          {categoryTotals.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-primary/60" />
              <span className="text-muted-foreground">{cat}:</span>
              <span className="font-medium font-mono tabular-nums">{fmt.format(amt)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end gap-0.5 text-xs shrink-0">
          {tax > 0 && (
            <>
              <div className="flex gap-6 justify-between w-36">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono tabular-nums">{fmt.format(subtotal)}</span>
              </div>
              <div className="flex gap-6 justify-between w-36">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono tabular-nums">{fmt.format(tax)}</span>
              </div>
            </>
          )}
          <div className="flex gap-6 justify-between w-36 pt-1 border-t border-border mt-1">
            <span className="font-semibold flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Total
            </span>
            <span className="font-semibold font-mono tabular-nums">{fmt.format(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Parses message content looking for ```expense-report JSON blocks.
 * Returns segments of text and expense report data.
 */
export function parseExpenseReports(content: string): Array<{ type: "text"; value: string } | { type: "expense-report"; data: ExpenseReportData }> {
  const regex = /```expense-report\s*\n([\s\S]*?)```/g;
  const segments: Array<{ type: "text"; value: string } | { type: "expense-report"; data: ExpenseReportData }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    try {
      const data = JSON.parse(match[1]) as ExpenseReportData;
      segments.push({ type: "expense-report", data });
    } catch {
      // If JSON parsing fails, render as text
      segments.push({ type: "text", value: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  return segments;
}
