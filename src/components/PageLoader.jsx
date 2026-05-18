export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="glass-card flex items-center gap-3 px-5 py-4 text-sm text-gray-300">
        <div className="h-3 w-3 animate-pulse rounded-full bg-orange-400" />
        Loading FoodHub...
      </div>
    </div>
  );
}