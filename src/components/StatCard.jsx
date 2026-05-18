export default function StatCard({ title, value, helper, accent = 'orange', icon }) {
  const accentClasses = 
    accent === 'orange' ? 'from-orange-500/20 to-amber-400/5 border-orange-500/20' : 
    accent === 'blue' ? 'from-blue-500/20 to-cyan-400/5 border-blue-500/20' : 
    accent === 'green' ? 'from-emerald-500/20 to-teal-400/5 border-emerald-500/20' :
    accent === 'purple' ? 'from-purple-500/20 to-fuchsia-400/5 border-purple-500/20' :
    'from-gray-500/20 to-gray-400/5 border-gray-500/20';

  const textAccent = 
    accent === 'orange' ? 'text-orange-400' : 
    accent === 'blue' ? 'text-blue-400' : 
    accent === 'green' ? 'text-emerald-400' :
    accent === 'purple' ? 'text-purple-400' :
    'text-gray-400';

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accentClasses} p-6 backdrop-blur-xl transition-all hover:scale-[1.02]`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {icon && <span className="text-2xl opacity-80">{icon}</span>}
        </div>
        <div className="mt-4">
          <p className={`text-4xl font-black ${textAccent}`}>{value}</p>
          {helper ? <p className="mt-2 text-xs text-gray-400">{helper}</p> : null}
        </div>
      </div>
      <div className="absolute -right-10 -top-10 z-0 h-32 w-32 rounded-full bg-white opacity-[0.03] blur-2xl"></div>
    </div>
  );
}