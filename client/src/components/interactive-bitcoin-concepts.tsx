import { ChevronDown } from 'lucide-react';
import { CONCEPTS, type Level } from '@/content/learn';

const LEVEL_STYLES: Record<Level, string> = {
  Beginner: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  Intermediate: 'text-[#f7931a] bg-[#f7931a]/10 border-[#f7931a]/25',
  Advanced: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
};

/** Expandable concept cards. Uses native <details> so it works without JS and is keyboard-accessible. */
export default function InteractiveBitcoinConcepts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CONCEPTS.map((c) => (
        <details
          key={c.id}
          id={c.id}
          className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 open:border-[#f7931a]/40 open:bg-[#f7931a]/[0.04] transition-colors scroll-mt-24"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7931a] rounded">
            <div>
              <h3 className="text-base font-semibold text-white">{c.title}</h3>
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span className={`rounded-full border px-2 py-0.5 ${LEVEL_STYLES[c.level]}`}>{c.level}</span>
                <span className="text-white/60">{c.readTime} read</span>
              </div>
              <p className="mt-3 text-sm text-white/70">{c.summary}</p>
            </div>
            <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-white/60 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-4 space-y-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/75">
            <p>{c.explanation}</p>
            <div>
              <h4 className="mb-2 font-semibold text-white">Key points</h4>
              <ul className="list-disc space-y-1 pl-5">
                {c.keyPoints.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <span className="font-semibold text-white">Example: </span>{c.example}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
