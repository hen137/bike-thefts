interface DashboardVisualizationModeProps {
  className?: string;
}

export function DashboardVisualizationMode({
  className
}: DashboardVisualizationModeProps) {
  return (
    <div className={`${className} flex flex-col p-2`}>
      <h1 className="border-b px-2">Visualization Mode:</h1>
      <div className="flex flex-col justify-around grow px-8 py-5"></div>
    </div>
  );
}
