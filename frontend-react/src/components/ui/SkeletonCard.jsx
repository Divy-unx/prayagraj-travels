export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
          <div className="h-3 bg-slate-200 rounded-lg w-1/3" />
        </div>
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
      </div>
      <div className="mt-4 flex gap-8 items-center">
        <div className="space-y-1">
          <div className="h-7 bg-slate-200 rounded-lg w-16" />
          <div className="h-3 bg-slate-200 rounded-lg w-20" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="h-3 bg-slate-200 rounded-full w-24" />
          <div className="h-1 bg-slate-200 rounded-full w-full" />
        </div>
        <div className="space-y-1 text-right">
          <div className="h-7 bg-slate-200 rounded-lg w-16" />
          <div className="h-3 bg-slate-200 rounded-lg w-20" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-5 bg-slate-200 rounded-full w-16" />
        <div className="h-5 bg-slate-200 rounded-full w-20" />
        <div className="h-5 bg-slate-200 rounded-full w-14" />
        <div className="ml-auto h-10 bg-slate-200 rounded-xl w-32" />
      </div>
    </div>
  )
}
