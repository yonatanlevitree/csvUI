import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Zap, ChevronDown, ChevronUp, Download, BarChart2 } from 'lucide-react';
import logo from './logo_full copy.png';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SequestrationCalculator = () => {
  // Input variables exactly as they appear in the CSV
  const [inputs, setInputs] = useState({
    // Sequestration Assumptions
    "Daily Hours of Operation": 8,
    "Total Days of Injection": 175,
    "Average Carbon Credit Sale Price/CORC": 400,
    "Wood Chip Moisture Content": 0.40,
    "CORC Verifier Emission Discount Rate": 0.37,
    "Delivered Wood Consumption Rate per Hour (metric tons)": 11,
    "Chipper Truckloads Daily per Hour (4 metric tonnes each)": 2.75,
    "CO2e Sequestration Rate (Metric Tonnes CO2e)": 42,
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
    "CO2e Sequestration Rate (Metric Tonnes CO2e)": 14,
    "CORC Production Rate": 9,
    "Puro Service Fee Rate": 5.78,
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
    "Land Owner Split": 0.5,
    
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
    
    // Other P&L Assumptions
    "Carbon Credit Commission year 1": 0.05,
    "Carbon Credit Commission year 2": 0.04,
    "Carbon Credit Commission year 3": 0.03,
    "Carbon Credit Commission year 4": 0.02,
    "Carbon Credit Commission year 5": 0.01,
    "Long Tonne (lbs/metric ton)": 2200,
    
    // Project Parameters
    "Elevation (ft)": 5,
    "Acres": 256,
    "CORCs/acft": 528,
    "CORC Sale Price": 200,
    "Truck Loads": 16,
    "Hours of Injecion": 10
  });

  const [outputs, setOutputs] = useState({});

  // Add state to track which fields have been modified
  const [modifiedFields, setModifiedFields] = useState({});

  // Collapsible state for each card
  const [openCards, setOpenCards] = useState({
    sequestration: true,
    assumptions: true,
    revenue: true,
    preconstruction: true,
    injection: true,
    verification: true,
    consultants: true,
    insurance: true,
    general: true,
    carboncredit: true,
    projectparams: true,
    production: true,
    annual: true,
    corcprod: true,
    revcosts: true,
    summary: true,
    plsummary: true,
    operations: true,
    overhead: true,
  });
  const toggleCard = (key) => setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));

  // Add expand/collapse all functionality
  const allInputsOpen = ["sequestration", "assumptions", "revenue", "preconstruction", "injection", "verification", "consultants", "insurance", "general", "carboncredit", "projectparams"].every(key => openCards[key]);
  const allOutputsOpen = ["production", "annual", "corcprod", "revcosts", "summary", "plsummary", "operations", "overhead"].every(key => openCards[key]);
  const handleExpandCollapseAll = (type) => {
    const keys = type === 'inputs' ? ["sequestration", "assumptions", "revenue", "preconstruction", "injection", "verification", "consultants", "insurance", "general", "carboncredit", "projectparams"] : ["production", "annual", "corcprod", "revcosts", "summary", "plsummary", "operations", "overhead"];
    const newState = { ...openCards };
    const newValue = type === 'inputs' ? !allInputsOpen : !allOutputsOpen;
    keys.forEach(key => { newState[key] = newValue; });
    setOpenCards(newState);
  };

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
    calc["CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour"] = (calc["Wood Chip Injection Rate (Dry)"] * inputs["Organic Carbon Content Wood Chips"] * (44/12)) + 
                                              (calc["Pulp Injection Rate (Dry)"] * inputs["Organic Carbon Content Pulp"] * (44/12));
    calc["CO2e Sequestration Rate (Metric Tonnes CO2e) Annual"] = calc["CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour"] * calc["Total Hours of Injection"];
    calc["CORC Production Rate"] = calc["CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour"] * (1 - inputs["CORC Verifier Emission Discount Rate"]);
    calc["Total CORCs Annual"] = calc["CORC Production Rate"] * calc["Total Hours of Injection"];
    
    // Revenue calculations
    calc["Carbon Credit Sales"] = calc["Total CORCs Annual"] * inputs["Average Carbon Credit Sale Price/CORC"];
    calc["Tip Fee - related to rent below"] = inputs["Tip Fee - related to rent below"] * calc["Wood Chip Injection Rate (Wet) Annual"];
    
    calc["Total Revenue"] = 5*(calc["Carbon Credit Sales"] + calc["Tip Fee - related to rent below"]);
    
    console.log("Total CORCs Annual:", calc["Total CORCs Annual"]);
    console.log("Average Carbon Credit Sale Price/CORC:", inputs["Average Carbon Credit Sale Price/CORC"]);
    console.log("Carbon Credit Sales:", calc["Carbon Credit Sales"]);
    console.log("Tip Fee - related to rent below:", calc["Tip Fee - related to rent below"]);
    console.log("Total Revenue:", calc["Total Revenue"]);
    // Calculate service fees based on percentages
    calc["Levitree Liscense Fee Amount"] = calc["Carbon Credit Sales"] * inputs["Levitree Liscense Fee"];
    calc["Carbon Direct Amount"] = calc["Carbon Credit Sales"] * inputs["Carbon Direct"];
    calc["Patch - Exchange Amount"] = calc["Carbon Credit Sales"] * inputs["Patch - Exchange"];
    calc["Puro Service Fee Amount"] = calc["Total CORCs Annual"] * inputs["Puro Service Fee Rate"] * (1 + inputs["TSB Methodology Premium Fee"]);
    
    // Slurry ingredients calculation
    calc["Other Slurry Ingredients Delivered Amount"] = inputs["Other Slurry Ingredients Delivered"] * 
                                                       (calc["Wood Chip Injection Rate (Wet) Annual"] * 0.096);
    
    // Fuel & Energy calculation
    calc["Fuel & Energy Amount"] = inputs["Fuel & Energy"] * calc["Total Hours of Injection"];
    
    // Jerry Gutierrez calculation
    calc["Jerry Gutierrez Labor Contract Amount"] = inputs["Jerry Gutierrez Labor Contract"] * calc["Total Hours of Injection"];
    
    // Developer Fee calculation
    calc["Developer Fee Amount"] = calc["Carbon Credit Sales"] * inputs["Developer Fee"];
    
    // Well Drilling calculation (from spreadsheet: Number of Wells * 25 * Well Drilling Cost/Foot)
    calc["Well Drilling"] = (inputs["Number of Wells"] || 0) * 25 * (inputs["Well Drilling Cost/Foot"] || 0);
    
    // Wood Biomass Processed/Delivered/Chipped calculation (from spreadsheet: (Wood Chip Injection Rate (Wet) Annual / 26) * 1000)
    calc["Wood Biomass Processed/Delivered/Chipped"] = (calc["Wood Chip Injection Rate (Wet) Annual"] || 0) / 26 * 1000;
    
    // Update the total variable cost calculation to include only the specified parameters
    let totalVariableCosts = 0;
    for (let year = 1; year <= 5; year++) {
      const isFirstYear = (year === 1);
      const yearVariableCosts =
        (isFirstYear ? (inputs["Engineering & Design"] || 0) : 0) +
        (isFirstYear ? (inputs["Permitting & Approvals"] || 0) : 0) +
        (isFirstYear ? (inputs["Legal"] || 0) : 0) +
        (isFirstYear ? (inputs["Site Work / Materials Yard - Pre-Construction"] || 0) : 0) +
        (isFirstYear ? (inputs["Setup Cost"] || 0) : 0) +
        (inputs["Land Lease Cost"] || 0) +
        (calc["Well Drilling"] || 0) +
        ((inputs["Equipment Lease Amount"] || 0) * (inputs["Total Days of Injection"] || 0))/5 +
        (inputs["Leased Commodity Equipment Rain 4 Rent"] || 0) +
        (inputs["Water Tank Rental"] || 0) +
        (inputs["Matts & Hoses"] || 0) +
        (calc["Wood Biomass Processed/Delivered/Chipped"] || 0) +
        (calc["Other Slurry Ingredients Delivered Amount"] || 0) +
        (calc["Fuel & Energy Amount"] || 0) +
        (inputs["Levitree Equipment Maintaince"] || 0) +
        (inputs["Equipment Transportaion/Setup"] || 0) +
        (calc["Levitree Liscense Fee Amount"] || 0) +
        (calc["Carbon Direct Amount"] || 0) +
        (calc["Patch - Exchange Amount"] || 0) +
        (inputs["Puro Annual Fee"] || 0) +
        (calc["Puro Service Fee Amount"] || 0);
      if (year === 1) {
        console.log("Engineering & Design:", inputs["Engineering & Design"]);
        console.log("Permitting & Approvals:", inputs["Permitting & Approvals"]);
        console.log("Legal:", inputs["Legal"]);
        console.log("Site Work / Materials Yard - Pre-Construction:", inputs["Site Work / Materials Yard - Pre-Construction"]);
        console.log("Setup Cost:", inputs["Setup Cost"]);
        console.log("Land Lease Cost:", inputs["Land Lease Cost"]);
        console.log("Well Drilling:", calc["Well Drilling"]);
        console.log("Equipment Lease Amount (annualized):", ((inputs["Equipment Lease Amount"] || 0) * (inputs["Total Days of Injection"] || 0))/5);
        console.log("Leased Commodity Equipment Rain 4 Rent:", inputs["Leased Commodity Equipment Rain 4 Rent"]);
        console.log("Water Tank Rental:", inputs["Water Tank Rental"]);
        console.log("Matts & Hoses:", inputs["Matts & Hoses"]);
        console.log("Wood Biomass Processed/Delivered/Chipped:", calc["Wood Biomass Processed/Delivered/Chipped"]);
        console.log("Other Slurry Ingredients Delivered Amount:", calc["Other Slurry Ingredients Delivered Amount"]);
        console.log("Fuel & Energy Amount:", calc["Fuel & Energy Amount"]);
        console.log("Levitree Equipment Maintaince:", inputs["Levitree Equipment Maintaince"]);
        console.log("Equipment Transportaion/Setup:", inputs["Equipment Transportaion/Setup"]);
        console.log("Levitree Liscense Fee Amount:", calc["Levitree Liscense Fee Amount"]);
        console.log("Carbon Direct Amount:", calc["Carbon Direct Amount"]);
        console.log("Patch - Exchange Amount:", calc["Patch - Exchange Amount"]);
        console.log("Puro Annual Fee:", inputs["Puro Annual Fee"]);
        console.log("Puro Service Fee Amount:", calc["Puro Service Fee Amount"]);
      }
      totalVariableCosts += yearVariableCosts;
    }
    calc["Total Variable Costs"] = totalVariableCosts;
    
    // Update the gross margin calculation to sum values for all 5 years
    let grossMargin = 0;
    for (let year = 1; year <= 5; year++) {
      const commissionRate = inputs[`Carbon Credit Commission year ${year}`] || 0;
      const annualCORCs = calc["CORC Production Rate"] * calc["Total Hours of Injection"];
      const margin = inputs["Carbon Credit Sales"] * annualCORCs;
      console.log(`Year ${year}:`, { margin });
      grossMargin += margin;
    }
    calc["Gross Margin"] = grossMargin - calc["Total Variable Costs"];
    
    // Total Overhead Costs
    calc["Total Overhead Costs"] = 5 * (calc["Developer Fee Amount"] + 
                                  inputs["Accounting & Tax - Baker Tilly"] + 
                                  calc["Jerry Gutierrez Labor Contract Amount"] + 
                                  inputs["Legal - Misc"] + 
                                  (inputs["General Liability"] + inputs["Property"] + inputs["Equipment"] + 
                                   inputs["E&O"] + inputs["Cyber"] + inputs["Auto"] + inputs["Tail Coverage"] + 
                                   inputs["Contractor Pollution"] + inputs["Site Pollution"] + inputs["Excess Policies"]) + 
                                  (inputs["Internet - Starlink"] + inputs["Portables / Toilet"] + inputs["Fencing"] + 
                                   inputs["Battery Generator"] + inputs["Telco"] + inputs["Tech & Tools"] + inputs["Trailor"]));
    
    // Net Profit calculations
    calc["Net Profit before Land Owner Split"] = calc["Gross Margin"] - calc["Total Overhead Costs"];
    calc["Land Owner Split Amount"] = calc["Net Profit before Land Owner Split"] * inputs["Land Owner Split"];
    calc["Total Profit Share Distribution"] = calc["Land Owner Split Amount"];
    calc["Net Profit to SPE / Taxable Income"] = calc["Net Profit before Land Owner Split"] - calc["Land Owner Split Amount"];
    
    // Project specific calculations
    calc["Total CORCs"] = inputs["Acres"] * inputs["Elevation (ft)"] * inputs["CORCs/acft"];
    calc["Total acft of Elevation"] = inputs["Acres"] * inputs["Elevation (ft)"];
    calc["Total Truckloads"] = inputs["Truck Loads"] * calc["Total acft of Elevation"];
    calc["Total Hours of Injection:"] = inputs["Hours of Injecion"] * calc["Total acft of Elevation"];
    calc["Total CORC Sale Price"] = inputs["CORC Sale Price"] * calc["Total CORCs"];
    calc["Total Cost"] = calc["Total CORC Sale Price"] * 0.75;
    calc["Net Profit"] = calc["Total CORC Sale Price"] - calc["Total Cost"]; 
    
    // In calculations, add Annual CO2e Sequestration
    calc["Annual CO2e Sequestration"] = calc["Total Hours of Injection"] * calc["CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour"];
    calc["GM%"] = calc["Gross Margin"] / calc["Total Revenue"];
    setOutputs(calc);
  }, [inputs]);

  // Update handleInputChange to track modifications
  const handleInputChange = (key, value) => {
    setInputs(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
    setModifiedFields(prev => ({
      ...prev,
      [key]: true
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

  const handleDownloadCSV = () => {
    // Define section groupings for inputs and outputs
    const sections = [
      {
        name: 'Sequestration Assumptions',
        inputs: [
          'Daily Hours of Operation', 'Total Days of Injection', 'Average Carbon Credit Sale Price/CORC', 'Wood Chip Moisture Content', 'CORC Verifier Emission Discount Rate', 'Delivered Wood Consumption Rate per Hour (metric tons)', 'Chipper Truckloads Daily per Hour (4 metric tonnes each)', 'CO2e Sequestration Rate (Metric Tonnes CO2e)', 'Number of Wells', 'Well Drilling Cost/Foot', 'Injection Rigs Per Project', 'Equipment Lease Amount', 'Model Start Date', 'Injection Start Date'
        ],
        outputs: [
          'Total Hours of Injection', 'Wood Chip Injection Rate (Wet)', 'Wood Chip Injection Rate (Dry)', 'Pulp Injection Rate (Dry)', 'Wood Chip Injection Rate (Wet) Annual', 'Wood Chip Injection Rate (Dry) Annual', 'Pulp Injection Rate (Dry) Annual', 'CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour', 'CO2e Sequestration Rate (Metric Tonnes CO2e) Annual', 'Total CORCs Annual', 'Annual CO2e Sequestration', 'Total Insurance Cost', 'Total Developer Fee', 'Total Accounting & Tax Cost'
        ]
      },
      {
        name: 'Assumptions',
        inputs: [
          'Number of Projects', 'Total Hours of Injection', 'Wood Chip Injection Rate (Wet)', 'Wood Chip Injection Rate (Dry)', 'Pulp Injection Rate (Dry)', 'Organic Carbon Content Wood Chips', 'Organic Carbon Content Pulp', 'TSB Methodology Premium Fee', 'CO2e Sequestration Rate (Metric Tonnes CO2e)', 'CORC Production Rate', 'Puro Service Fee Rate'
        ],
        outputs: [
          'Total Jerry Gutierrez Labor Contract Cost', 'Total Legal Cost', 'General Conditions', 'Total Overhead Costs', 'Carbon Credit Sales', 'Tip Fee Revenue', 'Total Revenue', 'Total Variable Costs', 'Gross Margin', 'Net Profit before Land Owner Split', 'Land Owner Split Amount'
        ]
      },
      {
        name: 'Revenue',
        inputs: ['Carbon Credit Sales', 'Tip Fee - related to rent below'],
        outputs: ['Net Profit to SPE', 'Total CORCs', 'Total acft of Elevation']
      },
      {
        name: 'Pre-Construction Costs',
        inputs: ['Land Lease Cost', 'Engineering & Design', 'Permitting & Approvals', 'Legal', 'Site Work / Materials Yard - Pre-Construction', 'Land Owner Split'],
        outputs: ['Total Truckloads', 'Total Hours of Injection', 'Total CORC Sale Price', 'Total Cost', 'Net Profit', 'Profit Margin', 'Wood Chip Injection (Wet) Tonnes']
      },
      {
        name: 'Injection Costs',
        inputs: ['Setup Cost', 'Water Tank Rental', 'Matts & Hoses', 'Other Slurry Ingredients Delivered', 'Fuel & Energy', 'Levitree Equipment Maintaince', 'Equipment Transportaion/Setup'],
        outputs: ['20 Tonne Truck Loads of Wood Chip (18.15 Tonnes of Cargo)']
      },
      {
        name: 'Verification/Sales Costs',
        inputs: ['Levitree Liscense Fee', 'Carbon Direct', 'Patch - Exchange', 'Puro Annual Fee'],
        outputs: []
      },
      {
        name: 'Consultants',
        inputs: ['Developer Fee', 'Accounting & Tax - Baker Tilly', 'Jerry Gutierrez Labor Contract', 'Legal - Misc'],
        outputs: []
      },
      {
        name: 'Insurance',
        inputs: ['General Liability', 'Property', 'Equipment', 'E&O', 'Cyber', 'Auto', 'Tail Coverage', 'Contractor Pollution', 'Site Pollution', 'Excess Policies'],
        outputs: []
      },
      {
        name: 'General Conditions',
        inputs: ['Internet - Starlink', 'Portables / Toilet', 'Fencing', 'Battery Generator', 'Telco', 'Tech & Tools', 'Trailor'],
        outputs: []
      },
      {
        name: 'Other P&L Assumptions',
        inputs: ['Carbon Credit Commission year 1', 'Carbon Credit Commission year 2', 'Carbon Credit Commission year 3', 'Carbon Credit Commission year 4', 'Carbon Credit Commission year 5', 'Long Tonne (lbs/metric ton)'],
        outputs: []
      },
      {
        name: 'Project Parameters',
        inputs: ['Elevation (ft)', 'Acres', 'CORCs/acft', 'CORC Sale Price', 'Truck Loads', 'Hours of Injecion'],
        outputs: []
      }
    ];

    // Build the CSV rows with formatting
    const csvRows = [];
    csvRows.push('Calculated Metrics Export');
    csvRows.push('');
    csvRows.push('Input Label,Input Value,,Output Label,Output Value');

    // For each section, add section header, then rows, then a blank row
    sections.forEach(section => {
      csvRows.push('');
      csvRows.push(section.name);
      const maxRows = Math.max(section.inputs.length, section.outputs.length);
      for (let i = 0; i < maxRows; i++) {
        const inputLabel = section.inputs[i] || '';
        const inputValue = inputLabel ? (inputs[inputLabel] !== undefined ? inputs[inputLabel] : '') : '';
        const outputLabel = section.outputs[i] || '';
        const outputValue = outputLabel ? (outputs[outputLabel] !== undefined ? outputs[outputLabel] : '') : '';
        csvRows.push(`"${inputLabel}","${inputValue}",,"${outputLabel}","${outputValue}"`);
      }
    });

    // Download the new CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'calculatedMetrics.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to get units for output values
  const getUnitForOutput = (key) => {
    const unitMap = {
      'Total Hours of Injection': 'hours',
      'Total Hours All Years': 'hours',
      'Wood Chip Injection Rate (Wet)': 'Tonnes/hr',
      'Wood Chip Injection Rate (Dry)': 'Tonnes/hr',
      'Pulp Injection Rate (Dry)': 'Tonnes/hr',
      'Wood Chip Injection Rate (Wet) Annual': 'Tonnes',
      'Wood Chip Injection Rate (Dry) Annual': 'Tonnes',
      'Pulp Injection Rate (Dry) Annual': 'Tonnes',
      'CO2e Sequestration Rate Per Hour': 'Tonnes CO2e/hr',
      'CO2e Sequestration Rate Annual': 'Tonnes CO2e',
      'CORC Production Rate': 'CORCs/hr',
      'Total CORCs Annual': 'CORCs',
      'Carbon Credit Sales': 'USD',
      'Tip Fee Revenue': 'USD',
      'Total Revenue': 'USD',
      'Levitree License Fee Amount': 'USD',
      'Carbon Direct Amount': 'USD',
      'Patch - Exchange Amount': 'USD',
      'Puro Service Fee Amount': 'USD',
      'Other Slurry Ingredients Amount': 'USD',
      'Fuel & Energy Amount': 'USD',
      'Jerry Gutierrez Labor Amount': 'USD',
      'Developer Fee Amount': 'USD',
      'Well Drilling Amount': 'USD',
      'Wood Biomass Processed Amount': 'USD',
      'Total Variable Costs': 'USD',
      'Gross Margin': 'USD',
      'GM%': '%',
      'Total Overhead Costs': 'USD',
      'Net Profit before Land Owner Split': 'USD',
      'Land Owner Split Amount': 'USD',
      'Total Profit Share Distribution': 'USD',
      'Net Profit to SPE': 'USD',
      'Total CORCs': 'CORCs',
      'Total acft of Elevation': 'acft',
      'Total Truckloads': 'loads',
      'Total Hours of Injection': 'hours',
      'Total CORC Sale Price': 'USD',
      'Total Cost': 'USD',
      'Net Profit': 'USD',
      'Profit Margin': '%',
      'Annual CO2e Sequestration': 'Tonnes'
    };
    return unitMap[key] || '';
  };

  // Helper function to get formulas for output values
  const getFormulaForOutput = (key) => {
    const formulaMap = {
      'Total Hours of Injection': '=C4*C5',
      'Total Hours All Years': '=N4*5',
      'Wood Chip Injection Rate (Wet)': '=N8/C5',
      'Wood Chip Injection Rate (Dry)': '=N7/(1+C6)',
      'Pulp Injection Rate (Dry)': '=N7*0.71*0.1',
      'Wood Chip Injection Rate (Wet) Annual': '=N7*N4',
      'Wood Chip Injection Rate (Dry) Annual': '=N8*N4',
      'Pulp Injection Rate (Dry) Annual': '=N9*N4',
      'CO2e Sequestration Rate Per Hour': '=(N8*C19*44/12)+(N9*C20*44/12)',
      'CO2e Sequestration Rate Annual': '=N10*N4',
      'CORC Production Rate': '=N10*(1-C7)',
      'Total CORCs Annual': '=N11*N4',
      'Carbon Credit Sales': '=N12*C3',
      'Tip Fee Revenue': '=C28*N8',
      'Total Revenue': '=5*(N13+N14)',
      'Levitree License Fee Amount': '=N13*C37',
      'Carbon Direct Amount': '=N13*C38',
      'Patch - Exchange Amount': '=N13*C39',
      'Puro Service Fee Amount': '=N12*C21*(1+C20)',
      'Other Slurry Ingredients Amount': '=C45*N8*0.096',
      'Fuel & Energy Amount': '=C46*N4',
      'Jerry Gutierrez Labor Amount': '=C52*N4',
      'Developer Fee Amount': '=N13*C51',
      'Well Drilling Amount': '=C9*25*C10',
      'Wood Biomass Processed Amount': '=(N8/26)*1000',
      'Total Variable Costs': '=SUM(N17:N26)',
      'Gross Margin': '=N15-N27',
      'GM%': '=N28/N15',
      'Total Overhead Costs': '=5*(N25+C52*5+N24+C53*5+SUM(C55:C64)+SUM(C66:C72))',
      'Net Profit before Land Owner Split': '=N28-N30',
      'Land Owner Split Amount': '=N31*C35',
      'Total Profit Share Distribution': '=N32',
      'Net Profit to SPE': '=N31-N32',
      'Total CORCs': '=C76*C75*C77',
      'Total acft of Elevation': '=C76*C75',
      'Total Truckloads': '=C79*N36',
      'Total Hours of Injection': '=C80*N36',
      'Total CORC Sale Price': '=C78*N35',
      'Total Cost': '=N38*0.75',
      'Net Profit': '=N38-N39',
      'Profit Margin': '=N40/N39',
      'Annual CO2e Sequestration': '=N37*N10'
    };

    // Helper function to get the cell reference for an input value
    const getInputCellRef = (inputKey) => {
      const inputRowMap = {
        'Daily Hours of Operation': 4,
        'Total Days of Injection': 5,
        'Average Carbon Credit Sale Price/CORC': 3,
        'Wood Chip Moisture Content': 6,
        'CORC Verifier Emission Discount Rate': 7,
        'Delivered Wood Consumption Rate per Hour': 19,
        'Chipper Truckloads Daily per Hour': 20,
        'CO2e Sequestration Rate': 21,
        'Number of Wells': 9,
        'Well Drilling Cost/Foot': 10,
        'Injection Rigs Per Project': 11,
        'Equipment Lease Amount': 12,
        'Model Start Date': 13,
        'Injection Start Date': 14,
        'Number of Projects': 15,
        'Total Hours of Injection': 4,
        'Wood Chip Injection Rate (Wet)': 7,
        'Wood Chip Injection Rate (Dry)': 8,
        'Pulp Injection Rate (Dry)': 9,
        'Organic Carbon Content Wood Chips': 19,
        'Organic Carbon Content Pulp': 20,
        'TSB Methodology Premium Fee': 21,
        'Puro Service Fee Rate': 21,
        'Puro Service Fee Discounted?': 22,
        'Carbon Credit Sales': 3,
        'Tip Fee': 28,
        'Land Lease Cost': 33,
        'Engineering & Design': 34,
        'Permitting & Approvals': 35,
        'Legal': 36,
        'Site Work / Materials Yard': 37,
        'Land Owner Split': 35,
        'Setup Cost': 41,
        'Water Tank Rental': 42,
        'Matts & Hoses': 43,
        'Other Slurry Ingredients Delivered': 45,
        'Fuel & Energy': 46,
        'Levitree Equipment Maintenance': 47,
        'Equipment Transportation/Setup': 48,
        'Levitree License Fee': 37,
        'Carbon Direct': 38,
        'Patch - Exchange': 39,
        'Puro Annual Fee': 40,
        'Developer Fee': 51,
        'Accounting & Tax - Baker Tilly': 52,
        'Jerry Gutierrez Labor Contract': 52,
        'Legal - Misc': 53,
        'General Liability': 55,
        'Property': 56,
        'Equipment': 57,
        'E&O': 58,
        'Cyber': 59,
        'Auto': 60,
        'Tail Coverage': 61,
        'Contractor Pollution': 62,
        'Site Pollution': 63,
        'Excess Policies': 64,
        'Internet - Starlink': 66,
        'Portables / Toilet': 67,
        'Fencing': 68,
        'Battery Generator': 69,
        'Telco': 70,
        'Tech & Tools': 71,
        'Trailor': 72,
        'Carbon Credit Commission year 1': 74,
        'Carbon Credit Commission year 2': 75,
        'Carbon Credit Commission year 3': 76,
        'Carbon Credit Commission year 4': 77,
        'Carbon Credit Commission year 5': 78,
        'Long Tonne (lbs/metric ton)': 79,
        'Elevation (ft)': 76,
        'Acres': 75,
        'CORCs/acft': 77,
        'CORC Sale Price': 35,
        'Truck Loads': 79,
        'Hours of Injection': 80
      };
      return `C${inputRowMap[inputKey]}`;
    };

    // Helper function to get the cell reference for an output value
    const getOutputCellRef = (outputKey) => {
      const outputRowMap = {
        'Total Hours of Injection': 4,
        'Total Hours All Years': 4,
        'Wood Chip Injection Rate (Wet)': 7,
        'Wood Chip Injection Rate (Dry)': 8,
        'Pulp Injection Rate (Dry)': 9,
        'Wood Chip Injection Rate (Wet) Annual': 7,
        'Wood Chip Injection Rate (Dry) Annual': 8,
        'Pulp Injection Rate (Dry) Annual': 9,
        'CO2e Sequestration Rate Per Hour': 10,
        'CO2e Sequestration Rate Annual': 10,
        'CORC Production Rate': 11,
        'Total CORCs Annual': 12,
        'Carbon Credit Sales': 13,
        'Tip Fee Revenue': 14,
        'Total Revenue': 15,
        'Levitree License Fee Amount': 17,
        'Carbon Direct Amount': 17,
        'Patch - Exchange Amount': 17,
        'Puro Service Fee Amount': 17,
        'Other Slurry Ingredients Amount': 17,
        'Fuel & Energy Amount': 17,
        'Jerry Gutierrez Labor Amount': 17,
        'Developer Fee Amount': 17,
        'Well Drilling Amount': 17,
        'Wood Biomass Processed Amount': 17,
        'Total Variable Costs': 27,
        'Gross Margin': 28,
        'GM%': 28,
        'Total Overhead Costs': 30,
        'Net Profit before Land Owner Split': 31,
        'Land Owner Split Amount': 32,
        'Total Profit Share Distribution': 32,
        'Net Profit to SPE': 33,
        'Total CORCs': 34,
        'Total acft of Elevation': 34,
        'Total Truckloads': 34,
        'Total Hours of Injection': 34,
        'Total CORC Sale Price': 38,
        'Total Cost': 39,
        'Net Profit': 40,
        'Profit Margin': 40,
        'Annual CO2e Sequestration': 41
      };
      return `N${outputRowMap[outputKey]}`;
    };

    // Replace input references in formulas with actual cell references
    let formula = formulaMap[key];
    if (formula) {
      // Replace C references with actual cell references
      formula = formula.replace(/C(\d+)/g, (match, row) => {
        const inputKey = Object.keys(inputs).find(k => getInputCellRef(k) === `C${row}`);
        return inputKey ? getInputCellRef(inputKey) : match;
      });

      // Replace N references with actual cell references
      formula = formula.replace(/N(\d+)/g, (match, row) => {
        const outputKey = Object.keys(outputs).find(k => getOutputCellRef(k) === `N${row}`);
        return outputKey ? getOutputCellRef(outputKey) : match;
      });
    }

    return formula || '';
  };

  // Helper to generate chart data for 5 years
  const getAccumulatedChartData = (label, value, color, unit) => {
    const years = [2025, 2026, 2027, 2028, 2029];
    const data = years.map((_, i) => (value || 0) * (i + 1));
    return {
      labels: years.map(y => `${y}`),
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: color + '33',
          tension: 0.1,
          fill: false,
          pointRadius: 2,
        },
      ],
      unit,
    };
  };
  const getChartOptions = (unit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
      },
    },
    layout: { 
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: false },
        grid: { 
          display: true,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: true,
        },
        ticks: { 
          display: true, 
          font: { size: 10 }, 
          maxRotation: 0, 
          minRotation: 0,
          color: '#666'
        },
      },
      y: {
        display: true,
        title: { 
          display: true, 
          text: unit, 
          font: { size: 11 },
          color: '#666'
        },
        grid: { 
          display: true,
          color: 'rgba(0,0,0,0.1)',
          drawBorder: true,
        },
        ticks: { 
          display: true, 
          font: { size: 10 },
          color: '#666'
        },
        beginAtZero: true,
      },
    },
    elements: { 
      line: { 
        borderWidth: 2,
        tension: 0.1
      }, 
      point: { 
        radius: 3,
        hoverRadius: 5
      } 
    },
  });

  // Add state for chart visibility
  const [showWetChart, setShowWetChart] = useState(true);
  const [showDryChart, setShowDryChart] = useState(true);
  const [showPulpChart, setShowPulpChart] = useState(true);
  const [showCO2eChart, setShowCO2eChart] = useState(true);
  // Add state for CORC Production charts
  const [showTotalCORCsChart, setShowTotalCORCsChart] = useState(true);
  const [showAnnualCO2eChart, setShowAnnualCO2eChart] = useState(true);

  return (
    <div className="max-w-[2000px] mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-bold text-gray-900">Sequestration PROFORMA</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export to CSV
              </button>
              <img src={logo} alt="Levitree Logo" className="h-20" />
            </div>
          </div>
          <p className="text-gray-600">Based on number of hours injection the site can facilitate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Input Parameters</h2>
          <button
            onClick={() => handleExpandCollapseAll('inputs')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium shadow"
          >
            {allInputsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {allInputsOpen ? 'Collapse All Inputs' : 'Expand All Inputs'}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Calculated Metrics</h2>
          <button
            onClick={() => handleExpandCollapseAll('outputs')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium shadow"
          >
            {allOutputsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {allOutputsOpen ? 'Collapse All Outputs' : 'Expand All Outputs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Sequestration Assumptions */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Sequestration Assumptions
            </h2>
              <button onClick={() => toggleCard('sequestration')} className="p-1 rounded hover:bg-gray-100">
                {openCards.sequestration ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.sequestration ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Daily Hours of Operation","Total Days of Injection","Wood Chip Moisture Content","Delivered Wood Consumption Rate per Hour (metric tons)","Chipper Truckloads Daily per Hour (4 metric tonnes each)","CO2e Sequestration Rate (Metric Tonnes CO2e)","Injection Rigs Per Project","Model Start Date","Injection Start Date"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                      <input
                        type="number"
                        value={inputs[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wood Chip Moisture Content
                    <span className="ml-2 text-blue-500 cursor-pointer" title="can be as low as 10%.">ℹ️</span>
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["Wood Chip Moisture Content"]}
                      onChange={(e) => handleInputChange("Wood Chip Moisture Content", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Wood Chip Moisture Content"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivered Wood Consumption Rate per Hour (metric tons)
                    <span className="ml-2 text-blue-500 cursor-pointer" title="Truck brings 20 yards">ℹ️</span>
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["Delivered Wood Consumption Rate per Hour (metric tons)"]}
                      onChange={(e) => handleInputChange("Delivered Wood Consumption Rate per Hour (metric tons)", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Delivered Wood Consumption Rate per Hour (metric tons)"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chipper Truckloads Daily per Hour (4 metric tonnes each)
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["Chipper Truckloads Daily per Hour (4 metric tonnes each)"]}
                      onChange={(e) => handleInputChange("Chipper Truckloads Daily per Hour (4 metric tonnes each)", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Chipper Truckloads Daily per Hour (4 metric tonnes each)"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black-700 mb-1">
                    Number of Wells
                    <span className="ml-2 text-black-500 cursor-pointer" title="1-2 people per well; 1 hr per well. 4 injection wells per acre foot per year; non -cased no permit needed; use levitree rig">ℹ️</span>
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["Number of Wells"]}
                      onChange={(e) => handleInputChange("Number of Wells", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Number of Wells"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black-700 mb-1">
                    CORC Verifier Emission Discount Rate
                    <span className="ml-2 text-blue-500 cursor-pointer" title="Avg 55%; can be in future 10% maybe">ℹ️</span>
                  </label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["CORC Verifier Emission Discount Rate"]}
                      onChange={(e) => handleInputChange("CORC Verifier Emission Discount Rate", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["CORC Verifier Emission Discount Rate"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assumptions</h2>
              <button onClick={() => toggleCard('assumptions')} className="p-1 rounded hover:bg-gray-100">
                {openCards.assumptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.assumptions ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Number of Projects","Total Hours of Injection","Wood Chip Injection Rate (Wet)","Wood Chip Injection Rate (Dry)","Pulp Injection Rate (Dry)","Organic Carbon Content Wood Chips","Organic Carbon Content Pulp","TSB Methodology Premium Fee","CO2e Sequestration Rate (Metric Tonnes CO2e)","CORC Production Rate","Puro Service Fee Rate"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
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
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Revenue</h2>
              <button onClick={() => toggleCard('revenue')} className="p-1 rounded hover:bg-gray-100">
                {openCards.revenue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.revenue ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Carbon Credit Sales","Tip Fee - related to rent below"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Pre-Construction Costs */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pre-Construction Costs</h2>
              <button onClick={() => toggleCard('preconstruction')} className="p-1 rounded hover:bg-gray-100">
                {openCards.preconstruction ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.preconstruction ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Land Lease Cost","Engineering & Design","Permitting & Approvals","Legal","Site Work / Materials Yard - Pre-Construction"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
                {/* Land Owner Split input */}
                <div key="Land Owner Split">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Owner Split</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={inputs["Land Owner Split"]}
                      onChange={e => handleInputChange("Land Owner Split", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Land Owner Split"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Injection Costs */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Injection Costs</h2>
              <button onClick={() => toggleCard('injection')} className="p-1 rounded hover:bg-gray-100">
                {openCards.injection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.injection ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Setup Cost","Matts & Hoses","Other Slurry Ingredients Delivered","Fuel & Energy","Levitree Equipment Maintaince","Equipment Transportaion/Setup"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Tank Rental
                  <span className="ml-2 text-blue-500 cursor-pointer" title="Water Tanks: $49/day - each tank 18k gallons; need 5 per 10k tons sequestered">ℹ️</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs["Water Tank Rental"]}
                    onChange={(e) => handleInputChange("Water Tank Rental", e.target.value)}
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {!modifiedFields["Water Tank Rental"] && (
                    <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Verification/Sales Costs */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Verification/Sales Costs</h2>
              <button onClick={() => toggleCard('verification')} className="p-1 rounded hover:bg-gray-100">
                {openCards.verification ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.verification ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Levitree Liscense Fee","Carbon Direct","Patch - Exchange","Puro Annual Fee"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Consultants */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Consultants</h2>
              <button onClick={() => toggleCard('consultants')} className="p-1 rounded hover:bg-gray-100">
                {openCards.consultants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.consultants ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Developer Fee","Accounting & Tax - Baker Tilly","Jerry Gutierrez Labor Contract","Legal - Misc"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Insurance</h2>
              <button onClick={() => toggleCard('insurance')} className="p-1 rounded hover:bg-gray-100">
                {openCards.insurance ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.insurance ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["General Liability","Property","Equipment","E&O","Cyber","Auto","Tail Coverage","Contractor Pollution","Site Pollution","Excess Policies"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* General Conditions */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">General Conditions</h2>
              <button onClick={() => toggleCard('general')} className="p-1 rounded hover:bg-gray-100">
                {openCards.general ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.general ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Internet - Starlink","Portables / Toilet","Fencing","Battery Generator","Telco","Tech & Tools","Trailor"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Other P&L Assumptions */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Other P&L Assumptions</h2>
              <button onClick={() => toggleCard('carboncredit')} className="p-1 rounded hover:bg-gray-100">
                {openCards.carboncredit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.carboncredit ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((year) => (
                <div key={year}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Credit Commission year {year}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[`Carbon Credit Commission year ${year}`]}
                    onChange={(e) => handleInputChange(`Carbon Credit Commission year ${year}`, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[`Carbon Credit Commission year ${year}`] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
                {/* Long Tonne (lbs/metric ton) input */}
                <div key="Long Tonne (lbs/metric ton)">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Tonne (lbs/metric ton)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      value={inputs["Long Tonne (lbs/metric ton)"]}
                      onChange={e => handleInputChange("Long Tonne (lbs/metric ton)", e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!modifiedFields["Long Tonne (lbs/metric ton)"] && (
                      <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Parameters */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Project Parameters</h2>
              <button onClick={() => toggleCard('projectparams')} className="p-1 rounded hover:bg-gray-100">
                {openCards.projectparams ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.projectparams ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
                {["Elevation (ft)","Acres","CORCs/acft","CORC Sale Price","Truck Loads","Hours of Injecion"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                    <div className="relative w-full">
                  <input
                    type="number"
                    value={inputs[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                      {!modifiedFields[field] && (
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none select-none">(Default)</span>
                      )}
                    </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Outputs */}
        <div className="space-y-6">
          {/* Production Metrics */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Production Metrics
            </h2>
              <button onClick={() => toggleCard('production')} className="p-1 rounded hover:bg-gray-100">
                {openCards.production ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.production ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
          </div>

          {/* Annual Production */}
          <div className="bg-white rounded-lg shadow p-8 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Annual Production</h2>
              <button onClick={() => toggleCard('annual')} className="p-1 rounded hover:bg-gray-100">
                {openCards.annual ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.annual ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-4">
    <div className="grid grid-cols-2 gap-12">
      <div className="bg-blue-50 p-8 rounded-lg relative">
        <button onClick={() => setShowWetChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
          <BarChart2 className={`w-5 h-5 ${showWetChart ? 'text-blue-600' : 'text-gray-400'}`} />
        </button>
        <div className="text-sm font-medium text-blue-600 w-full block text-left">Wood Chip Injection Rate (Wet) Annual</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] || 0)} T</div>
        {showWetChart && outputs["Wood Chip Injection Rate (Wet) Annual"] !== undefined && (
          <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
            <Line
              data={getAccumulatedChartData(
                'Wood Chip Injection Rate (Wet) Annual',
                outputs["Wood Chip Injection Rate (Wet) Annual"],
                '#2563eb',
                'Tonnes'
              )}
              options={getChartOptions('Tonnes')}
            />
                </div>
        )}
      </div>
      <div className="bg-green-50 p-8 rounded-lg relative">
        <button onClick={() => setShowDryChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
          <BarChart2 className={`w-5 h-5 ${showDryChart ? 'text-green-600' : 'text-gray-400'}`} />
        </button>
        <div className="text-sm font-medium text-green-600 w-full block text-left">Wood Chip Injection Rate (Dry) Annual</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Wood Chip Injection Rate (Dry) Annual"] || 0)} T</div>
        {showDryChart && outputs["Wood Chip Injection Rate (Dry) Annual"] !== undefined && (
          <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
            <Line
              data={getAccumulatedChartData(
                'Wood Chip Injection Rate (Dry) Annual',
                outputs["Wood Chip Injection Rate (Dry) Annual"],
                '#a855f7',
                'Tonnes'
              )}
              options={getChartOptions('Tonnes')}
            />
                </div>
        )}
      </div>
   
                  <div className="bg-purple-50 p-8 rounded-lg relative">
                    <button onClick={() => setShowPulpChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <BarChart2 className={`w-5 h-5 ${showPulpChart ? 'text-purple-600' : 'text-gray-400'}`} />
                    </button>
                    <div className="text-sm font-medium text-purple-600 w-full block text-left">Pulp Injection Rate (Dry) Annual</div>
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(outputs["Pulp Injection Rate (Dry) Annual"] || 0)} T</div>
                    {showPulpChart && outputs["Pulp Injection Rate (Dry) Annual"] !== undefined && (
                      <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
                        <Line
                          data={getAccumulatedChartData(
                            'Pulp Injection Rate (Dry) Annual',
                            outputs["Pulp Injection Rate (Dry) Annual"],
                            '#f59e42',
                            'Tonnes'
                          )}
                          options={getChartOptions('Tonnes')}
                        />
                </div>
                    )}
                  </div>
                  <div className="bg-orange-50 p-8 rounded-lg relative">
                    <button onClick={() => setShowCO2eChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <BarChart2 className={`w-5 h-5 ${showCO2eChart ? 'text-orange-600' : 'text-gray-400'}`} />
                    </button>
                    <div className="text-sm font-medium text-orange-600 w-full block text-left">CO2e Sequestration Rate (Metric Tonnes CO2e) Annual</div>
                  <div className="text-2xl font-bold text-orange-900">{formatNumber(outputs["CO2e Sequestration Rate (Metric Tonnes CO2e) Annual"] || 0)} T</div>
                    {showCO2eChart && outputs["CO2e Sequestration Rate (Metric Tonnes CO2e) Annual"] !== undefined && (
                      <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
                        <Line
                          data={getAccumulatedChartData(
                            'CO2e Sequestration Rate (Metric Tonnes CO2e) Annual',
                            outputs["CO2e Sequestration Rate (Metric Tonnes CO2e) Annual"],
                            '#10b981',
                            'Tonnes CO2e'
                          )}
                          options={getChartOptions('Tonnes CO2e')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CORC Production */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">CORC Production</h2>
              <button onClick={() => toggleCard('corcprod')} className="p-1 rounded hover:bg-gray-100">
                {openCards.corcprod ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.corcprod ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-12">
                  <div className="bg-blue-50 p-8 rounded-lg relative">
                    <button onClick={() => setShowTotalCORCsChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <BarChart2 className={`w-5 h-5 ${showTotalCORCsChart ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                    <div className="text-sm font-medium text-blue-600 w-full block text-left">Total CORCs Annual</div>
                    <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Total CORCs Annual"] || 0)} CORCs</div>
                    {showTotalCORCsChart && outputs["Total CORCs Annual"] !== undefined && (
                      <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
                        <Line
                          data={getAccumulatedChartData(
                            'Total CORCs Annual',
                            outputs["Total CORCs Annual"],
                            '#2563eb',
                            'CORCs'
                          )}
                          options={getChartOptions('CORCs')}
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-green-50 p-8 rounded-lg relative">
                    <button onClick={() => setShowAnnualCO2eChart(v => !v)} className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <BarChart2 className={`w-5 h-5 ${showAnnualCO2eChart ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                    <div className="text-sm font-medium text-green-600 w-full block text-left">Annual CO2e Sequestration</div>
                    <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Annual CO2e Sequestration"] || 0)} T</div>
                    {showAnnualCO2eChart && outputs["Annual CO2e Sequestration"] !== undefined && (
                      <div style={{ width: 200, height: 200, margin: '16px 0 0 0', position: 'relative' }}>
                        <Line
                          data={getAccumulatedChartData(
                            'Annual CO2e Sequestration',
                            outputs["Annual CO2e Sequestration"],
                            '#10b981',
                            'Tonnes CO2e'
                          )}
                          options={getChartOptions('Tonnes CO2e')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["CO2e Sequestration Rate (Metric Tonnes CO2e) Per Hour"] || 0)} T/hr</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">CORC Production Rate</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["CORC Production Rate"] || 0)} CORCs/hr</div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overhead Costs */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Overhead Costs</h2>
              <button onClick={() => toggleCard('overhead')} className="p-1 rounded hover:bg-gray-100">
                {openCards.overhead ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.overhead ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Insurance Cost</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(5 * (inputs["General Liability"] + inputs["Property"] + inputs["Equipment"] + inputs["E&O"] + inputs["Cyber"] + inputs["Auto"] + inputs["Tail Coverage"] + inputs["Contractor Pollution"] + inputs["Site Pollution"] + inputs["Excess Policies"]) || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Developer Fee</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(inputs["Developer Fee"] * outputs["Total Revenue"] || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Accounting & Tax Cost</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(inputs["Accounting & Tax - Baker Tilly"] * 5 || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Jerry Gutierrez Labor Contract Cost</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(inputs["Jerry Gutierrez Labor Contract"] * outputs["Total Hours of Injection"] * 5 || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Legal Cost</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(inputs["Legal - Misc"] * 5 || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">General Conditions</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(5 * (inputs["Internet - Starlink"] + inputs["Portables / Toilet"] + inputs["Fencing"] + inputs["Battery Generator"] + inputs["Telco"] + inputs["Tech & Tools"] + inputs["Trailor"]) || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-100 px-3 rounded font-bold">
                  <span className="text-lg">Total Overhead Costs</span>
                  <span className="text-xl text-gray-900">{formatCurrency(5 * (inputs["General Liability"] + inputs["Property"] + inputs["Equipment"] + inputs["E&O"] + inputs["Cyber"] + inputs["Auto"] + inputs["Tail Coverage"] + inputs["Contractor Pollution"] + inputs["Site Pollution"] + inputs["Excess Policies"]) + inputs["Developer Fee"] * outputs["Total Revenue"] + inputs["Accounting & Tax - Baker Tilly"] * 5 + inputs["Jerry Gutierrez Labor Contract"] * outputs["Total Hours of Injection"] * 5 + inputs["Legal - Misc"] * 5 + 5 * (inputs["Internet - Starlink"] + inputs["Portables / Toilet"] + inputs["Fencing"] + inputs["Battery Generator"] + inputs["Telco"] + inputs["Tech & Tools"] + inputs["Trailor"]) || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue & Costs */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue & Costs
            </h2>
              <button onClick={() => toggleCard('revcosts')} className="p-1 rounded hover:bg-gray-100">
                {openCards.revcosts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.revcosts ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
          </div>

          {/* Project Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Project Summary</h2>
              <button onClick={() => toggleCard('summary')} className="p-1 rounded hover:bg-gray-100">
                {openCards.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.summary ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Total CORCs</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(outputs["Total CORCs"] || 0)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Total acft of Elevation</div>
                    <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Total acft of Elevation"] || 0)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Total Truckloads</div>
                    <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Total Truckloads"] || 0)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Total Hours of Injection</div>
                    <div className="text-2xl font-bold text-green-900">{formatNumber(outputs["Total Hours of Injection"] || 0)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Total CORC Sale Price</div>
                    <div className="text-2xl font-bold text-green-900">{formatCurrency(outputs["Total CORC Sale Price"] || 0)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">Total Cost</div>
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(outputs["Total Cost"] || 0)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-orange-600">Net Profit</div>
                    <div className="text-2xl font-bold text-orange-900">{formatCurrency(outputs["Net Profit"] || 0)}</div>
                </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">Profit Margin</div>
                    <div className="text-2xl font-bold text-purple-900">{formatPercent(outputs["Net Profit"] / outputs["Total Cost"] || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">P&L Summary</h2>
              <button onClick={() => toggleCard('plsummary')} className="p-1 rounded hover:bg-gray-100">
                {openCards.plsummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.plsummary ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Metric</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Per 1 acft</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Canalways Project</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">Wood Chip Injection (Wet) Tonnes</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / 750 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 * 80 / 750 || 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">20 Tonne Truck Loads of Wood Chip (18.15 Tonnes of Cargo)</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / (750 * 18.5) || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / 18.5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 * 80 / (750 * 18.5) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">Total Hours of Injection</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 / 750 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 * 80 / 750 || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Operations Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Operations Summary</h2>
              <button onClick={() => toggleCard('operations')} className="p-1 rounded hover:bg-gray-100">
                {openCards.operations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${openCards.operations ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}> 
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Metric</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Per 1 acft</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Canalways Project</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">Wood Chip Injection (Wet) Tonnes</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / 750 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 * 80 / 750 || 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">20 Tonne Truck Loads of Wood Chip (18.15 Tonnes of Cargo)</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / (750 * 18.5) || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 / 18.5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Wood Chip Injection Rate (Wet) Annual"] * 5 * 80 / (750 * 18.5) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm font-bold text-gray-900">Total Hours of Injection</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 / 750 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 || 0)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatNumber(outputs["Total Hours of Injection"] * 5 * 80 / 750 || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequestrationCalculator; 