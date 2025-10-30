export default function SupervisorLoading() {
  return (
    <div className="p-8 space-y-8">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-default-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-default-200 rounded" />
          ))}
        </div>
        <div className="h-96 bg-default-200 rounded" />
      </div>
    </div>
  );
}
