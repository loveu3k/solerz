import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CategorySpecificFiltersProps {
  category: string;
  activeFilters: (string | number)[];
  onFilterChange: (filters: (string | number)[]) => void;
}

// -------------------- Panels (Solar Panel) --------------------
const PanelsFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
  onNumberFilterChange: (filter: string, value: number) => void;
}> = ({ activeFilters, toggleFilter, onNumberFilterChange }) => {
  const [wattage, setWattage] = useState(250);
  const [efficiency, setEfficiency] = useState(15);
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Panel Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {["Monocrystalline", "Polycrystalline", "Thin Film", "Bifacial"].map(
            (filter) => (
              <Badge
                key={filter}
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                className={cn(
                  "px-3 py-1 cursor-pointer",
                  activeFilters.includes(filter)
                    ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                    : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
                )}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Badge>
            ),
          )}
        </div>
      </div>

      {/* Wattage Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Wattage</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[wattage]}
            onValueChange={(vals) => {
              setWattage(vals[0]);
              onNumberFilterChange("Wattage", vals[0]);
            }}
            min={0}
            max={900}
            step={5}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {wattage}W
          </div>
        </div>
      </div>

      {/* Efficiency Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Efficiency</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[efficiency]}
            onValueChange={(vals) => {
              setEfficiency(parseFloat(vals[0].toFixed(1)));
              onNumberFilterChange(
                "Efficiency",
                parseFloat(vals[0].toFixed(1)),
              );
            }}
            min={5}
            max={30}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {efficiency.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Inverters --------------------
const InvertersFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
  onNumberFilterChange: (filter: string, value: number) => void;
  onFilterChange: (filters: (string | number)[]) => void;
}> = ({
  activeFilters,
  toggleFilter,
  onNumberFilterChange,
  onFilterChange,
}) => {
  const [powerRating, setPowerRating] = useState(0.1);
  const [mppts, setMppts] = useState(2);
  const [inverterEfficiency, setInverterEfficiency] = useState(90);
  const [phase, setPhase] = useState<string | null>(null);

  const handlePhaseChange = (selectedPhase: string) => {
    setPhase(selectedPhase);
    const newFilters = activeFilters.filter((f) => !f.startsWith("Phase:"));
    newFilters.push(`Phase:${selectedPhase}`);
    onFilterChange(newFilters);
  };

  const handleInverterTypeChange = (selectedType: string) => {
    toggleFilter(selectedType);
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Inverter Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {["String", "Microinverter", "Hybrid", "Off-Grid", "Grid-Tied"].map(
            (filter) => (
              <Badge
                key={filter}
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                className={cn(
                  "px-3 py-1 cursor-pointer",
                  activeFilters.includes(filter)
                    ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                    : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
                )}
                onClick={() => handleInverterTypeChange(filter)}
              >
                {filter}
              </Badge>
            ),
          )}
        </div>
      </div>

      {/* Power Rating Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Power Rating</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[powerRating]}
            onValueChange={(vals) => {
              setPowerRating(parseFloat(vals[0].toFixed(1)));
              onNumberFilterChange(
                "Power Rating",
                parseFloat(vals[0].toFixed(1)),
              );
            }}
            min={0.1}
            max={600}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {powerRating.toFixed(1)} kW
          </div>
        </div>
      </div>

      {/* Phases */}
      <div>
        <h3 className="text-sm font-medium mb-3">Phases</h3>
        <div className="flex flex-wrap gap-2">
          {["Single Phase", "Three Phase"].map((option) => (
            <Badge
              key={option}
              variant={phase === option ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                phase === option
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => handlePhaseChange(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
      </div>

      {/* MPPTs Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">MPPTs</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[mppts]}
            onValueChange={(vals) => {
              setMppts(vals[0]);
              onNumberFilterChange("MPPTs", vals[0]);
            }}
            min={2}
            max={12}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {mppts} MPPTs
          </div>
        </div>
      </div>

      {/* Efficiency Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Efficiency</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[inverterEfficiency]}
            onValueChange={(vals) => {
              setInverterEfficiency(parseFloat(vals[0].toFixed(1)));
              onNumberFilterChange(
                "Efficiency",
                parseFloat(vals[0].toFixed(1)),
              );
            }}
            min={90}
            max={99}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {inverterEfficiency.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Batteries --------------------
const BatteriesFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
  onNumberFilterChange: (filter: string, value: number) => void;
}> = ({ activeFilters, toggleFilter, onNumberFilterChange }) => {
  const [capacity, setCapacity] = useState(50);
  const [voltage, setVoltage] = useState(12);
  const [cycleLife, setCycleLife] = useState(500);
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Battery Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {["Lead-Acid", "Lithium-Ion", "AGM", "Other"].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Capacity Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Capacity</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[capacity]}
            onValueChange={(vals) => {
              setCapacity(vals[0]);
              onNumberFilterChange("Capacity", vals[0]);
            }}
            min={50}
            max={20000}
            step={50}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {capacity}Ah
          </div>
        </div>
      </div>

      {/* Voltage Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Voltage</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[voltage]}
            onValueChange={(vals) => {
              setVoltage(vals[0]);
              onNumberFilterChange("Voltage", vals[0]);
            }}
            min={12}
            max={1500}
            step={2}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {voltage}V
          </div>
        </div>
      </div>

      {/* Cycle Life Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Cycle Life</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[cycleLife]}
            onValueChange={(vals) => {
              setCycleLife(vals[0]);
              onNumberFilterChange("Cycle Life", vals[0]);
            }}
            min={500}
            max={7000}
            step={500}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {cycleLife} cycles
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Mounting Structure --------------------
const MountingFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
}> = ({ activeFilters, toggleFilter }) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Mounting Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Roof-Mounted",
            "Ground-Mounted",
            "Pole-Mounted",
            "Portable",
            "Tracker",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="text-sm font-medium mb-3">Material</h3>
        <div className="flex flex-wrap gap-2">
          {["Aluminum", "Steel (Galvanized)", "Stainless Steel", "Plastic"].map(
            (filter) => (
              <Badge
                key={filter}
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                className={cn(
                  "px-3 py-1 cursor-pointer",
                  activeFilters.includes(filter)
                    ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                    : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
                )}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Badge>
            ),
          )}
        </div>
      </div>

      {/* Resistance */}
      <div>
        <h3 className="text-sm font-medium mb-3">Resistance</h3>
        <div className="flex flex-wrap gap-2">
          {["Wind", "Snow", "Salt"].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------- Cable --------------------
const CableFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
}> = ({ activeFilters, toggleFilter }) => {
  const [voltageRating, setVoltageRating] = useState(100);
  const [currentCapacity, setCurrentCapacity] = useState(10);
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Voltage Rating Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Voltage Rating</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[voltageRating]}
            onValueChange={(vals) => setVoltageRating(vals[0])}
            min={100}
            max={1500}
            step={100}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {voltageRating}V
          </div>
        </div>
      </div>

      {/* Current Capacity Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Current Capacity</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[currentCapacity]}
            onValueChange={(vals) => setCurrentCapacity(vals[0])}
            min={10}
            max={400}
            step={10}
            className="w-full"
          />
          <div className="text-xs text-gray-500 w-12 text-right">
            {currentCapacity}A
          </div>
        </div>
      </div>

      {/* Wire Gauge Options */}
      <div>
        <h3 className="text-sm font-medium mb-3">Cable Size</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "2.5mm²",
            "4mm²",
            "6mm²",
            "10mm²",
            "16mm²",
            "25mm²",
            "35mm²",
            "50mm²",
            "70mm²",
            "95mm²",
            "120mm²",
            "150mm²",
            "185mm²",
            "240mm²",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Insulation Type Options */}
      <div>
        <h3 className="text-sm font-medium mb-3">Insulation Type</h3>
        <div className="flex flex-wrap gap-2">
          {["PV Wire", "THHN/THWN", "XLPE"].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                  : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
              )}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------- Others --------------------
const OthersFilters: React.FC<{
  activeFilters: string[];
  toggleFilter: (f: string) => void;
}> = ({ activeFilters, toggleFilter }) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-sm font-medium mb-3">Other Components</h3>
      <div className="flex flex-wrap gap-2">
        {[
          "DC Fuse",
          "DC MCB",
          "DC SPD",
          "DC DB",
          "AC Fuse",
          "AC MCB",
          "AC SPD",
          "AC DB",
          "MCCB",
          "Ground Fault",
          "Switch",
          "Arc Fault",
        ].map((filter) => (
          <Badge
            key={filter}
            variant={activeFilters.includes(filter) ? "default" : "outline"}
            className={cn(
              "px-3 py-1 cursor-pointer",
              activeFilters.includes(filter)
                ? "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"
                : "bg-transparent text-gray-700 hover:bg-amber-50 border-gray-200",
            )}
            onClick={() => toggleFilter(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// -------------------- Main Component --------------------
const CategorySpecificFilters = ({
  category,
  activeFilters,
  onFilterChange,
}: CategorySpecificFiltersProps) => {
  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];
    onFilterChange(newFilters);
  };

  const onNumberFilterChange = (filter: string, value: number) => {
    const newFilters = activeFilters.filter(
      (f) => !f.toString().startsWith(`${filter}:`),
    );
    newFilters.push(`${filter}:${value}`);
    onFilterChange(newFilters);
  };

  const stringFilters = activeFilters.map((f) => f.toString());

  if (category === "panels") {
    return (
      <PanelsFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
      />
    );
  } else if (category === "inverters") {
    return (
      <InvertersFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
        onFilterChange={onFilterChange}
      />
    );
  } else if (category === "batteries") {
    return (
      <BatteriesFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
      />
    );
  } else if (category === "mounting") {
    return (
      <MountingFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
      />
    );
  } else if (category === "cable") {
    return (
      <CableFilters activeFilters={stringFilters} toggleFilter={toggleFilter} />
    );
  } else if (category === "others") {
    return (
      <OthersFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
      />
    );
  }
  return null;
};

export default CategorySpecificFilters;
