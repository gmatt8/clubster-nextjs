// apps/web-manager/components/events/EventStepper.js
export default function EventStepper({ currentStep }) {
    const steps = ["Description", "Data", "Tickets"];
  
    return (
      <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto mb-10 px-4">
        {/* Linea intera sotto tutti gli step */}
        <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 z-0" />
  
        {/* Linea verde dinamica */}
        <div
          className="absolute top-4 left-0 h-1 bg-green-500 z-10 transition-all duration-300"
          style={{
            width: `${(currentStep - 1) / (steps.length - 1) * 100}%`
          }}
        />
  
        {steps.map((label, index) => {
          const isCompleted = index < currentStep - 1;
          const isActive = index === currentStep - 1;
          const isUpcoming = index > currentStep - 1;
  
          return (
            <div key={label} className="flex flex-col items-center relative z-20 w-1/3">
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full border-2
                  ${isCompleted ? "bg-green-500 border-green-500 text-white" : ""}
                  ${isActive ? "border-green-500 bg-white" : ""}
                  ${isUpcoming ? "border-gray-300 bg-gray-100" : ""}
                `}
              >
                {isCompleted ? "✓" : isActive ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : ""}
              </div>
              <span
                className={`mt-2 text-sm text-center ${
                  isCompleted || isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  