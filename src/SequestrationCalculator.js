import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Zap } from 'lucide-react';

const SequestrationCalculator = () => {
  // Input variables exactly as they appear in the CSV
  const [inputs, setInputs] = useState({
    // Sequestration Assumptions
    "Daily Hours of Operation": 8,
    "Total Days of Injection": 175,
    "Average Carbon Credit Sale Price": 200,
    "Wood Chip Moisture Content": 0.40,
    "CORC Verifier Emission Discount Rate": 0.37,
    "Delivered Wood Consumption Rate per Hour": 11,
    "Chipper Truckloads Daily per Hour": 2.75,
    "CO2e Sequestration Rate": 42,
    "Number of Wells": 125,
    "Well Drilling Cost/Foot": 10,
    "Injection Rigs Per Project": 1,
    "Equipment Lease Amount": 150,
    "Model Start Date": 45658,
    "Injection Start Date": 45870,
    
    // Assumptions
    "Number of Projects": 1,
    "Total Hours of Injection": 1400,
    "Wood Chip Injection Rate (Wet)": 10,
    "Wood Chip Injection Rate (Dry)": 6,
    "Pulp Injection Rate (Dry)": 0.6,
    "Organic Carbon Content Wood Chips": 0.48,
    "Organic Carbon Content Pulp": 0.45,
    "CO2e Sequestration Rate": 14,
    "CORC Production Rate": 9,
    "Puro Service Fee Rate": 0.10,
    "TSB Methodology Premium Fee": 0.12,
    "Puro Service Fee Discounted?": false,
    
    // Revenue
    "Carbon Credit Sales": 400,
    "Tip Fee - related to rent below": 0,
    
    // Pre-Construction Costs
    "Land Lease Cost": 1,
    "Engineering & Design": 50000,
    "Permitting & Approvals": 50000,
    "Legal": 50000,
    "Site Work / Materials Yard - Pre-Construction": 75000,
    
    // Injection Costs
    "Setup Cost": 40000,
    "Water Tank Rental": 89425,
    "Matts & Hoses": 5000,
    "Other Slurry Ingredients Delivered": 125,
    "Fuel & Energy": 20,
    "Levitree Equipment Maintaince": 10000,
    "Equipment Transportaion/Setup": 10000,
    
    // Verification/Sales Costs
    "Levitree Liscense Fee": 0.15,
    "Carbon Direct": 0.15,
    "Patch - Exchange": 0.02,
    "Puro Annual Fee": 1470,
    
    // Consultants
    "Developer Fee": 0.05,
    "Accounting & Tax - Baker Tilly": 60000,
    "Jerry Gutierrez Labor Contract": 100,
    "Legal - Misc": 10000,
    
    // Insurance
    "General Liability": 10000,
    "Property": 1500,
    "Equipment": 1500,
    "E&O": 15000,
    "Cyber": 1000,
    "Auto": 3500,
    "Tail Coverage": 20000,
    "Contractor Pollution": 2500,
    "Site Pollution": 5000,
    "Excess Policies": 5000,
    
    // General Conditions
    "Internet - Starlink": 2400,
    "Portables / Toilet": 3000,
    "Fencing": 10000,
    "Battery Generator": 5000,
    "Telco": 1800,
    "Tech & Tools": 18000,
    "Trailor": 9000,
    
    // Carbon Credit Commission
    "Carbon Credit Commission year 1": 0.05,
    "Carbon Credit Commission year 2": 0.04,
    "Carbon Credit Commission year 3": 0.03,
    "Carbon Credit Commission year 4": 0.02,
    "Carbon Credit Commission year 5": 0.01,
    
    // Project Parameters
    "Elevation (ft)": 5,
    "Acres": 256,
    "CORCs/acft": 528,
    "CORC Sale Price": 200,
    "Truck Loads": 16,
    "Hours of Injecion": 10
  });

  const [outputs, setOutputs] = useState({});

  // Calculate all derived values exactly as in CSV
  useEffect(() => {
    const calc = {};
    
    // Basic time calculations
    calc["Total Hours of Injection"] = inputs["Daily Hours of Operation"] * inputs["Total Days of Injection"];
    calc["Total Hours All Years"] = calc["Total Hours of Injection"] * 5; // 5 year model
    
    // Wood chip calculations (from CSV structure)
    calc["Wood Chip Injection Rate (Wet)"] = inputs["Wood Chip Injection Rate (Wet)"];
    calc["Wood Chip Injection Rate (Dry)"] = inputs["Wood Chip Injection Rate (Wet)"] / (1 + inputs["Wood Chip Moisture Content"]);
    calc["Pulp Injection Rate (Dry)"] = inputs["Wood Chip Injection Rate (Wet)"] * 0.71 * 0.1;
    
    // Annual wood chip totals
    calc["Wood Chip Injection Rate (Wet) Annual"] = calc["Wood Chip Injection Rate (Wet)"] * calc["Total Hours of Injection"];
    calc["Wood Chip Injection Rate (Dry) Annual"] = calc["Wood Chip Injection Rate (Dry)"] * calc["Total Hours of Injection"];
    calc["Pulp Injection Rate (Dry) Annual"] = calc["Pulp Injection Rate (Dry)"] * calc["Total Hours of Injection"];
    
    // CO2 and CORC calculations
    calc["CO2e Sequestration Rate Per Hour"] = (calc["Wood Chip Injection Rate (Dry)"] * inputs["Organic Carbon Content Wood Chips"] * (44/12)) + 
                                              (calc["Pulp Injection Rate (Dry)"] * inputs["Organic Carbon Content Pulp"] * (44/12));
    calc["CO2e Sequestration Rate Annual"] = calc["CO2e Sequestration Rate Per Hour"] * calc["Total Hours of Injection"];
    calc["CORC Production Rate"] = calc["CO2e Sequestration Rate Per Hour"] * (1 - inputs["CORC Verifier Emission Discount Rate"]);
    calc["Total CORCs Annual"] = calc["CORC Production Rate"] * calc["Total Hours of Injection"];
    
    // Revenue calculations
    calc["Carbon Credit Sales"] = calc["Total CORCs Annual"] * inputs["Average Carbon Credit Sale Price"] * 10;
    calc["Tip Fee - related to rent below"] = inputs["Tip Fee - related to rent below"] * calc["Wood Chip Injection Rate (Wet) Annual"];
    calc["Total Revenue"] = calc["Carbon Credit Sales"] + calc["Tip Fee - related to rent below"];
    
    // Calculate service fees based on percentages
    calc["Levitree Liscense Fee Amount"] = calc["Carbon Credit Sales"] * inputs["Levitree Liscense Fee"];
    calc["Carbon Direct Amount"] = calc["Carbon Credit Sales"] * inputs["Carbon Direct"];
    calc["Patch - Exchange Amount"] = calc["Carbon Credit Sales"] * inputs["Patch - Exchange"];
    calc["Puro Service Fee Amount"] = calc["Total CORCs Annual"] * inputs["Puro Service Fee"];
    
    // Slurry ingredients calculation
    calc["Other Slurry Ingredients Delivered Amount"] = inputs["Other Slurry Ingredients Delivered"] * 
                                                       (calc["Wood Chip Injection Rate (Dry) Annual"] / 1000 * 6720);
    
    // Fuel & Energy calculation
    calc["Fuel & Energy Amount"] = inputs["Fuel & Energy"] * calc["Total Hours of Injection"];
    
    // Jerry Gutierrez calculation
    calc["Jerry Gutierrez Labor Contract Amount"] = inputs["Jerry Gutierrez Labor Contract"] * calc["Total Hours of Injection"];
    
    // Developer Fee calculation
    calc["Developer Fee Amount"] = calc["Carbon Credit Sales"] * inputs["Developer Fee"];
    
    // Total Variable Costs
    calc["Total Variable Costs"] = inputs["Well Drilling"] + 
                                  (inputs["Equipment Lease Amount"] * inputs["Total Days of Injection"]) + 
                                  inputs["Water Tank Rental"] + 
                                  inputs["Matts & Hoses"] + 
                                  inputs["Wood Biomass Processed/Delivered/Chipped"] + 
                                  calc["Other Slurry Ingredients Delivered Amount"] + 
                                  calc["Fuel & Energy Amount"] + 
                                  inputs["Levitree Equipment Maintaince"] + 
                                  inputs["Equipment Transportaion/Setup"] + 
                                  calc["Levitree Liscense Fee Amount"] + 
                                  calc["Carbon Direct Amount"] + 
                                  calc["Patch - Exchange Amount"] + 
                                  inputs["Puro Annual Fee"] + 
                                  calc["Puro Service Fee Amount"];
    
    // Calculate yearly gross margins using year-specific carbon credit commission rates
    let grossMargin = 0;
    for (let year = 1; year <= 5; year++) {
      const commissionRate = inputs[`Carbon Credit Commission year ${year}`] || 0;
      const annualCORCs = calc["CORC Production Rate"] * calc["Total Hours of Injection"];
      let margin = 0;
      if (year === 1) {
        // Gross margin for year 1: (Carbon Credit Sales) * (CORC Production Rate * Total Hours of Injection)
        margin = inputs["Carbon Credit Sales"] * annualCORCs;
      } else {
        // Keep previous logic for other years (or set to 0 if only year 1 matters)
        margin = 0;
      }
      console.log(`Year ${year}:`, { margin });
      grossMargin += margin;
    }
    calc["Gross Margin"] = grossMargin;
    
    // Total Overhead Costs
    calc["Total Overhead Costs"] = calc["Developer Fee Amount"] + 
                                  inputs["Accounting & Tax - Baker Tilly"] + 
                                  calc["Jerry Gutierrez Labor Contract Amount"] + 
                                  inputs["Legal - Misc"] + 
                                  (inputs["General Liability"] + inputs["Property"] + inputs["Equipment"] + 
                                   inputs["E&O"] + inputs["Cyber"] + inputs["Auto"] + inputs["Tail Coverage"] + 
                                   inputs["Contractor Pollution"] + inputs["Site Pollution"] + inputs["Excess Policies"]) + 
                                  (inputs["Internet - Starlink"] + inputs["Portables / Toilet"] + inputs["Fencing"] + 
                                   inputs["Battery Generator"] + inputs["Telco"] + inputs["Tech & Tools"] + inputs["Trailor"]);
    
    // Net Profit calculations
    calc["Net Profit before Land Owner Split"] = calc["Gross Margin"] - calc["Total Overhead Costs"];
    calc["Land Owner Split Amount"] = calc["Net Profit before Land Owner Split"] * inputs["Land Owner Split"];
    calc["Total Profit Share Distribution"] = calc["Land Owner Split Amount"];
    calc["Net Profit to SPE / Taxable Income"] = calc["Net Profit before Land Owner Split"] - calc["Land Owner Split Amount"];
    
    // Project specific calculations
    calc["Total CORCs"] = inputs["Acres"] * inputs["Elevation (ft)"] * inputs["CORCs/acft"];
    calc["Total Cost"] = (calc["Total CORCs"] && calc["Net Profit"]) ? (calc["Net Profit"] / calc["Total CORCs"]) : 0;
    calc["Net Profit"] = calc["Total Cost"] - (calc["Total Cost"] * 0.75); // 75% cost assumption
    
    // In calculations, add Annual CO2e Sequestration
    calc["Annual CO2e Sequestration"] = calc["Total Hours of Injection"] * calc["CO2e Sequestration Rate Per Hour"];
    
    setOutputs(calc);
  }, [inputs]);

  const handleInputChange = (key, value) => {
    setInputs(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return (value * 100).toFixed(1) + '%';
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  return (
    <div className="max-w-[2000px] mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sequestration PROFORMA</h1>
          </div>
          <p className="text-gray-600">Based on number of hours injection the site can facilitate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Sequestration Assumptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Sequestration Assumptions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Daily Hours of Operation",
                "Total Days of Injection",
                "Average Carbon Credit Sale Price",
                "Wood Chip Moisture Content",
                "CORC Verifier Emission Discount Rate",
                "Delivered Wood Consumption Rate per Hour",
                "Chipper Truckloads Daily per Hour",
                "CO2e Sequestration Rate",
                "Number of Wells",
                "Well Drilling Cost/Foot",
                "Injection Rigs Per Project",
                "Equipment Lease Amount",
                "Model Start Date",
                "Injection Start Date"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Assumptions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Number of Projects",
                "Total Hours of Injection",
                "Wood Chip Injection Rate (Wet)",
                "Wood Chip Injection Rate (Dry)",
                "Pulp Injection Rate (Dry)",
                "Organic Carbon Content Wood Chips",
                "Organic Carbon Content Pulp",
                "TSB Methodology Premium Fee",
                "CO2e Sequestration Rate",
                "CORC Production Rate",
                "Puro Service Fee Rate"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puro Service Fee Discounted?</label>
                <input
                  type="checkbox"
                  checked={inputs["Puro Service Fee Discounted?"]}
                  onChange={(e) => setInputs(prev => ({ ...prev, "Puro Service Fee Discounted?": e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Carbon Credit Sales",
                "Tip Fee - related to rent below"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Construction Costs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pre-Construction Costs</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Land Lease Cost",
                "Engineering & Design",
                "Permitting & Approvals",
                "Legal",
                "Site Work / Materials Yard - Pre-Construction"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Injection Costs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Injection Costs</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Setup Cost",
                "Water Tank Rental",
                "Matts & Hoses",
                "Other Slurry Ingredients Delivered",
                "Fuel & Energy",
                "Levitree Equipment Maintaince",
                "Equipment Transportaion/Setup"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Verification/Sales Costs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Verification/Sales Costs</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Levitree Liscense Fee",
                "Carbon Direct",
                "Patch - Exchange",
                "Puro Annual Fee"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Consultants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Consultants</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Developer Fee",
                "Accounting & Tax - Baker Tilly",
                "Jerry Gutierrez Labor Contract",
                "Legal - Misc"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Insurance</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "General Liability",
                "Property",
                "Equipment",
                "E&O",
                "Cyber",
                "Auto",
                "Tail Coverage",
                "Contractor Pollution",
                "Site Pollution",
                "Excess Policies"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* General Conditions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">General Conditions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Internet - Starlink",
                "Portables / Toilet",
                "Fencing",
                "Battery Generator",
                "Telco",
                "Tech & Tools",
                "Trailor"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carbon Credit Commission */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Carbon Credit Commission</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((year) => (
                <div key={year}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year {year}</label>
                  <input
                    type="number"
                    value={inputs[`Carbon Credit Commission year ${year}`]}
                    onChange={(e) => handleInputChange(`Carbon Credit Commission year ${year}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Project Parameters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Project Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Elevation (ft)",
                "Acres",
                "CORCs/acft",
                "CORC Sale Price",
                "Truck Loads",
                "Hours of Injecion"
              ].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Outputs */}
        <div className="space-y-6">
          {/* Production Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Production Metrics
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Total Hours of Injection</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Total Hours of Injection"] || 0)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Wood Chip Injection Rate (Wet)</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet)"] || 0)} T/hr</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">Wood Chip Injection Rate (Dry)</div>
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(outputs["Wood Chip Injection Rate (Dry)"] || 0)} T/hr</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-600">Pulp Injection Rate (Dry)</div>
                  <div className="text-2xl font-bold text-orange-900">{formatNumber(outputs["Pulp Injection Rate (Dry)"] || 0)} T/hr</div>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Production */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Annual Production</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Wood Chip Injection Rate (Wet) Annual</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] || 0)} T</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Wood Chip Injection Rate (Dry) Annual</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Wood Chip Injection Rate (Dry) Annual"] || 0)} T</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">Pulp Injection Rate (Dry) Annual</div>
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(outputs["Pulp Injection Rate (Dry) Annual"] || 0)} T</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-600">CO2e Sequestration Rate Annual</div>
                  <div className="text-2xl font-bold text-orange-900">{formatNumber(outputs["CO2e Sequestration Rate Annual"] || 0)} T</div>
                </div>
              </div>
            </div>
          </div>

          {/* CORC Production */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">CORC Production</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">CO2e Sequestration Rate Per Hour</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["CO2e Sequestration Rate Per Hour"] || 0)} T/hr</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">CORC Production Rate</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["CORC Production Rate"] || 0)} CORCs/hr</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">Total CORCs Annual</div>
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(outputs["Total CORCs Annual"] || 0)} CORCs</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-600">Annual CO2e Sequestration</div>
                  <div className="text-2xl font-bold text-orange-900">{formatNumber(outputs["Annual CO2e Sequestration"] || 0)} T</div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue & Costs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue & Costs
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Carbon Credit Sales</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(outputs["Carbon Credit Sales"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Tip Fee Revenue</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(outputs["Tip Fee - related to rent below"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(outputs["Total Revenue"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Total Variable Costs</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(outputs["Total Variable Costs"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b bg-blue-50 px-3 rounded">
                <span className="font-medium">Gross Margin</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(outputs["Gross Margin"] || 0)}</div>
                  <div className="text-sm text-blue-500">GM%: {formatPercent(outputs["GM%"] || 0)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Total Overhead Costs</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(outputs["Total Overhead Costs"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b bg-green-50 px-3 rounded">
                <span className="font-medium">Net Profit before Land Owner Split</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(outputs["Net Profit before Land Owner Split"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Land Owner Split Amount</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(outputs["Land Owner Split Amount"] || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gray-100 px-3 rounded font-bold">
                <span className="text-lg">Net Profit to SPE / Taxable Income</span>
                <span className="text-xl text-gray-900">{formatCurrency(outputs["Net Profit to SPE / Taxable Income"] || 0)}</span>
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Project Summary</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Total CORCs</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Total CORCs"] || 0)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Total Cost</div>
                  <div className="text-2xl font-bold text-green-900">{formatCurrency(outputs["Total Cost"] || 0)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">Net Profit</div>
                  <div className="text-2xl font-bold text-purple-900">{formatCurrency(outputs["Net Profit"] || 0)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-600">Profit Margin</div>
                  <div className="text-2xl font-bold text-orange-900">{formatPercent(outputs["Net Profit"] / outputs["Total Cost"] || 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequestrationCalculator; 