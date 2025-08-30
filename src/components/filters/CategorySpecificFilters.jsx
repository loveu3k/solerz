import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Updated slider className for better visibility and usability
const sliderClassName = cn(
  "w-full",
  // Track styles
  "[&_.slider-track]:bg-gray-400 [&_.slider-track]:h-3 [&_.slider-track]:rounded-full",
  "[&_.slider-range]:bg-amber-500 [&_.slider-range]:rounded-full",
  // Thumb styles
  "[&_.slider-thumb]:bg-amber-600 [&_.slider-thumb]:w-6 [&_.slider-thumb]:h-6",
  "[&_.slider-thumb]:rounded-full [&_.slider-thumb]:border-4 [&_.slider-thumb]:border-white",
  "[&_.slider-thumb]:shadow-lg [&_.slider-thumb]:cursor-pointer",
  "[&_.slider-thumb:hover]:bg-amber-700 [&_.slider-thumb:hover]:scale-110 [&_.slider-thumb:hover]:transition-transform",
  "[&_.slider-thumb:focus]:ring-2 [&_.slider-thumb:focus]:ring-amber-500 [&_.slider-thumb:focus]:outline-none",
  // Dark mode styles
  "dark:[&_.slider-track]:bg-gray-500 dark:[&_.slider-range]:bg-amber-300",
  "dark:[&_.slider-thumb]:bg-amber-400 dark:[&_.slider-thumb]:border-gray-800",
  "dark:[&_.slider-thumb:hover]:bg-amber-500 dark:[&_.slider-thumb:focus]:ring-amber-300",
);

// -------------------- Panels (Solar Panel) --------------------
const PanelsFilters = ({
  activeFilters,
  toggleFilter,
  onNumberFilterChange,
  className,
}) => {
  const [wattage, setWattage] = useState(550);
  const [efficiency, setEfficiency] = useState(22);
  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
      {/* Panel Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Monocrystalline",
            "Polycrystalline",
            "Thin-Film",
            "a-Si",
            "CdTe",
            "CIGS",
            "Perovskite",
            "PERC",
            "TOPCon",
            "HJT",
            "IBC",
            "Bifacial",
            "Monofacial",
            "Standard Rigid",
            "Flexible",
            "BIPV",
            "n-type",
            "p-type",
            "Shingled",
            "Tandem",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={
                activeFilters.includes(`panel_type:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`panel_type:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "panel_type")}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Wattage Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Wattage (W)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {wattage}
          </div>
        </div>
      </div>

      {/* Efficiency Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Efficiency (%)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {efficiency.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Inverters --------------------
const InvertersFilters = ({
  activeFilters,
  toggleFilter,
  onNumberFilterChange,
  onFilterChange,
  className,
}) => {
  const [powerRating, setPowerRating] = useState(0);
  const [mppts, setMppts] = useState(2);
  const [inverterEfficiency, setInverterEfficiency] = useState(90);
  const [phase, setPhase] = useState("Three Phase");

  const handlePhaseChange = (selectedPhase) => {
    setPhase(selectedPhase);
    const newFilters = activeFilters.filter((f) => !f.startsWith("Phase:"));
    newFilters.push(`Phase:${selectedPhase}`);
    onFilterChange(newFilters);
  };

  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
      {/* Inverter Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "String",
            "Microinverter",
            "Hybrid",
            "Off-Grid",
            "Grid-Tied",
            "Central",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={
                activeFilters.includes(`inverter_type:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`inverter_type:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "inverter_type")}
            >
              {filter}
            </Badge>
          ))}
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
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => handlePhaseChange(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
      </div>

      {/* Power Rating Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Power Rating (kW)</h3>
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
            min={0}
            max={300}
            step={0.5}
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {powerRating.toFixed(1)}
          </div>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {mppts}
          </div>
        </div>
      </div>

      {/* Efficiency Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Efficiency (%)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {inverterEfficiency.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Batteries --------------------
const BatteriesFilters = ({
  activeFilters,
  toggleFilter,
  onNumberFilterChange,
  className,
}) => {
  const [capacity, setCapacity] = useState(5000);
  const [voltage, setVoltage] = useState(48);
  const [cycleLife, setCycleLife] = useState(4000);
  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
      {/* Battery Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <div className="flex flex-wrap gap-2">
          {["Lead-Acid", "AGM", "Gel", "Lithium-Ion", "LiFePO4", "Other"].map(
            (filter) => (
              <Badge
                key={filter}
                variant={
                  activeFilters.includes(`battery_type:${filter}`)
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "px-3 py-1 cursor-pointer",
                  activeFilters.includes(`battery_type:${filter}`)
                    ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                    : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
                )}
                onClick={() => toggleFilter(filter, "battery_type")}
              >
                {filter}
              </Badge>
            ),
          )}
        </div>
      </div>

      {/* Capacity Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Capacity (Ah)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {capacity}
          </div>
        </div>
      </div>

      {/* Voltage Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Voltage (V)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {voltage}
          </div>
        </div>
      </div>

      {/* Cycle Life Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Cycle Life (cycles)</h3>
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
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {cycleLife}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Mounting Structure --------------------
const MountingFilters = ({ activeFilters, toggleFilter, className }) => {
  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
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
            "Carport",
            "Floating",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={
                activeFilters.includes(`mounting_type:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`mounting_type:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "mounting_type")}
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
          {[
            "Aluminum",
            "Galvanized Steel",
            "Stainless Steel",
            "Anodized Aluminum",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={
                activeFilters.includes(`material:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`material:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "material")}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Resistance */}
      <div>
        <h3 className="text-sm font-medium mb-3">Resistance</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Wind Resistance",
            "Snow Load",
            "Corrosion Resistance",
            "Adjustable Tilt",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(filter)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
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
const CableFilters = ({
  activeFilters,
  toggleFilter,
  onNumberFilterChange,
  className,
}) => {
  const [voltageRating, setVoltageRating] = useState(1000);
  const [currentCapacity, setCurrentCapacity] = useState(20);
  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
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
              variant={
                activeFilters.includes(`cable_size:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`cable_size:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "cable_size")}
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
          {[
            "PV Wire",
            "USE-2",
            "THHN",
            "THWN",
            "THWN-2",
            "RHW",
            "RHW-2",
            "XHHW",
            "XHHW-2",
            "XLPE",
            "EPR",
            "MTW",
            "TFFN",
            "TFN",
            "ZW",
            "ZW-2",
          ].map((filter) => (
            <Badge
              key={filter}
              variant={
                activeFilters.includes(`insulation_type:${filter}`)
                  ? "default"
                  : "outline"
              }
              className={cn(
                "px-3 py-1 cursor-pointer",
                activeFilters.includes(`insulation_type:${filter}`)
                  ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                  : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
              )}
              onClick={() => toggleFilter(filter, "insulation_type")}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Voltage Rating Slider */}
      <div>
        <h3 className="text-sm font-medium mb-3">Voltage Rating</h3>
        <div className="flex items-center gap-2">
          <Slider
            value={[voltageRating]}
            onValueChange={(vals) => {
              setVoltageRating(vals[0]);
              onNumberFilterChange("Voltage Rating", vals[0]);
            }}
            min={100}
            max={1500}
            step={50}
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
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
            onValueChange={(vals) => {
              setCurrentCapacity(vals[0]);
              onNumberFilterChange("Current Capacity", vals[0]);
            }}
            min={10}
            max={400}
            step={10}
            className={sliderClassName}
          />
          <div className="text-xs w-12 text-right text-gray-600 dark:text-gray-300">
            {currentCapacity}A
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Others --------------------
const OthersFilters = ({ activeFilters, toggleFilter, className }) => {
  return (
    <div className={cn("space-y-6 p-4 rounded-lg shadow-sm", className)}>
      <h3 className="text-sm font-medium mb-3">Other Components</h3>
      <div className="flex flex-wrap gap-2">
        {[
          "Charge Controller",
          "DC Fuse",
          "DC MCB",
          "DC SPD",
          "DC DB",
          "AC Fuse",
          "AC MCB",
          "AC SPD",
          "AC DB",
          "MCCB",
          "Ground Fault Protection",
          "Arc Fault Protection",
          "Isolation Switch",
          "Combiner Box",
          "Busbar",
          "Current Transformer (CT)",
          "Voltage Transformer (VT)",
          "Metering Device",
          "Wiring & Connectors",
          "Junction Box",
          "Monitoring System",
        ].map((filter) => (
          <Badge
            key={filter}
            variant={
              activeFilters.includes(`component_type:${filter}`)
                ? "default"
                : "outline"
            }
            className={cn(
              "px-3 py-1 cursor-pointer",
              activeFilters.includes(`component_type:${filter}`)
                ? "bg-amber-400 text-amber-900 hover:bg-amber-500 border-transparent dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
                : "bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500",
            )}
            onClick={() => toggleFilter(filter, "component_type")}
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
  className,
}) => {
  const toggleFilter = (filter, filterKey) => {
    const formattedFilter = filterKey ? `${filterKey}:${filter}` : filter;
    const newFilters = activeFilters.includes(formattedFilter)
      ? activeFilters.filter((f) => f !== formattedFilter)
      : [...activeFilters, formattedFilter];
    onFilterChange(newFilters);
  };

  const onNumberFilterChange = (filter, value) => {
    const newFilters = activeFilters.filter((f) => !f.startsWith(`${filter}:`));
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
        className={className}
      />
    );
  } else if (category === "inverters") {
    return (
      <InvertersFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
        onFilterChange={onFilterChange}
        className={className}
      />
    );
  } else if (category === "batteries") {
    return (
      <BatteriesFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
        className={className}
      />
    );
  } else if (category === "mounting") {
    return (
      <MountingFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        className={className}
      />
    );
  } else if (category === "cable") {
    return (
      <CableFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        onNumberFilterChange={onNumberFilterChange}
        className={className}
      />
    );
  } else if (category === "others") {
    return (
      <OthersFilters
        activeFilters={stringFilters}
        toggleFilter={toggleFilter}
        className={className}
      />
    );
  }
  return null;
};

export default CategorySpecificFilters;
