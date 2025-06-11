import React, { useState, useEffect } from "react";
import { BoxDetails as BoxDetailsType, ShipmentOverviewType } from "../types";
import BoxDetailsRow from "../components/BoxDetailsRow";
import { calculateTotals, generateNewBox } from "../utils/calculations";
import { calculateVendorQuotes } from "../data/vendors";
import {
  Calculator as CalculatorIcon,
  Navigation,
  MapPin,
  MoveRight,
  Weight,
  Plus,
  Download,
  ArrowRight,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

type VendorQuote = {
  transporterData: any;
  totalPrice: any;
  estimatedDelivery: any;
  companyName: string;
  price: any;
  vendorName: string;
  deliveryTime: string;
  chargeableWeight: number;
  totalCost: number;
  logoUrl?: string;
  isBestValue?: boolean;
};

// Type helper
type DisplayVendorQuote = ReturnType<typeof calculateVendorQuotes>[number];

const CalculatorPage: React.FC = () => {
  // Shipment Overview State
  const today = new Date().toISOString().split("T")[0];
  const [shipment, setShipment] = useState<ShipmentOverviewType>({
    date: today,
    shipperLocation: "",
    destination: "",
    modeOfTransport: "Road",
    totalBoxes: 0,
    totalWeight: 0,
    actualWeight: undefined,
  });

  const { isAuthenticated, user } = useAuth();

  // Box details
  const [boxes, setBoxes] = useState<BoxDetailsType[]>([]);
  // Shipment options
  const [isExpressShipment, setIsExpressShipment] = useState(false);
  const [isFragileShipment, setIsFragileShipment] = useState(false);

  // Quotes
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [data, setData] = useState<VendorQuote[] | null>(null);

  // Totals
  const totals = calculateTotals(boxes);


  // Input change handler
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setShipment((prev) => ({
      ...prev,
      [name]:
        type === "number" ? Number(value) : value === "" ? undefined : value,
    }));
  }

  // Add/Update/Remove box logic
  const addNewBox = () => setBoxes((prev) => [...prev, generateNewBox(prev)]);
  const updateBox = (id: string, updates: Partial<BoxDetailsType>) => {
    setBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, ...updates } : box))
    );
  };
  const removeBox = (id: string) => {
    setBoxes((prev) => prev.filter((box) => box.id !== id));
  };


  // Main quote calculation
  const calculateQuotes = async () => {
    setError(null);

    const pincodeRegex = /^\d{6}$/;
    if (
      !pincodeRegex.test(shipment.shipperLocation) ||
      !pincodeRegex.test(shipment.destination)
    ) {
      setError("Please enter valid 6-digit Origin and Destination Pincodes.");
      return;
    }
    if (boxes.length === 0) {
      setError("Please add at least one box to calculate shipping costs.");
      return;
    }

    setIsCalculating(true);

    try {

      const actualWeight =
        shipment.actualWeight ?? totals.chargeableWeight ?? totals.totalWeight;
      const volumetricWeight = totals.totalVolumetricWeight;

      // Call your local quote calculator
      // Send data to backend
      const calcWeigth = Math.max(actualWeight, volumetricWeight);
      const response = await axios.post(
        "http://localhost:8000/api/transporter/calculate",
        { customerId: (user as any).customer.id, pincode: shipment.destination, weight: calcWeigth }
      );


      if (response.data.success) {
        console.log(response.data);
        setData(response.data.result);
      }
    } catch (e) {
      setError("Failed to calculate quotes or send data. Please try again.");
      console.error(e);
    } finally {
      setIsCalculating(false);
      setShowResults(true);
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Sync totalBoxes & totalWeight into shipment for display
  useEffect(() => {
    setShipment((prev) => ({
      ...prev,
      totalBoxes: totals.totalBoxes,
      totalWeight: totals.totalWeight,
    }));
  }, [totals.totalBoxes, totals.totalWeight]);

  return (
    <div className="container mx-auto p-4">
      {/* --- Shipment Overview Form --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="modeOfTransport"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mode of Transport
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Navigation className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="modeOfTransport"
              id="modeOfTransport"
              value={shipment.modeOfTransport}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="Road">Road</option>
              <option value="Rail">Rail</option>
              <option value="Air">Air</option>
              <option value="Ship">Ship</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="shipperLocation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Origin Pincode (6 digits)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="shipperLocation"
              id="shipperLocation"
              value={(user as any)?.customer?.pincode || shipment.shipperLocation}
              onChange={handleChange}
              placeholder="e.g., 400001"
              maxLength={6}
              pattern="\d{6}"
              title="Please enter a 6-digit pincode"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Destination Pincode (6 digits)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MoveRight className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="destination"
              id="destination"
              value={shipment.destination}
              onChange={handleChange}
              placeholder="e.g., 110001"
              maxLength={6}
              pattern="\d{6}"
              title="Please enter a 6-digit pincode"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* --- Box Details Entry --- */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Box-wise Shipment Details
          </h2>
          <button
            type="button"
            onClick={addNewBox}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            <Plus size={16} /> Add Box
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 mb-2 bg-gray-50 p-2 rounded-md text-sm font-medium text-gray-700">
              <div className="col-span-1">S.No</div>
              <div className="col-span-1">Boxes</div>
              <div className="col-span-1">Qty/Box</div>
              <div className="col-span-1">Total Qty</div>
              <div className="col-span-1">Length</div>
              <div className="col-span-1">Width</div>
              <div className="col-span-1">Height</div>
              <div className="col-span-1">Weight/Box</div>
              <div className="col-span-1">Total Weight</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1">UOM</div>
            </div>
            {/* Box rows */}
            {boxes.map((box) => (
              <BoxDetailsRow
                key={box.id}
                box={box}
                updateBox={updateBox}
                removeBox={removeBox}
                mode={shipment.modeOfTransport}
              />
            ))}
            {boxes.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No boxes added yet. Click "Add Box" to start.
              </div>
            )}
          </div>
        </div>
        {/* Totals summary */}
        {boxes.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Total Volumetric Weight
              </h3>
              <p className="text-lg font-semibold text-blue-600">
                {boxes
                  .reduce((sum, box) => sum + (box.volumetricWeight || 0), 0)
                  .toFixed(2)}{" "}
                kg
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Total Actual Weight
              </h3>
              <p className="text-lg font-semibold text-blue-600">
                {boxes
                  .reduce((sum, box) => sum + (box.totalWeight || 0), 0)
                  .toFixed(2)}{" "}
                kg
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Chargeable Weight
              </h3>
              <p className="text-lg font-semibold text-blue-600">
                {Math.max(
                  boxes.reduce((sum, box) => sum + (box.totalWeight || 0), 0),
                  boxes.reduce(
                    (sum, box) => sum + (box.volumetricWeight || 0),
                    0
                  )
                ).toFixed(2)}{" "}
                kg
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- Express / Fragile Toggles --- */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Freight Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <input
                id="expressShipment"
                type="checkbox"
                checked={isExpressShipment}
                onChange={(e) => setIsExpressShipment(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="expressShipment"
                className="ml-2 block text-sm text-gray-700"
              >
                Express Shipment (20% surcharge)
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Prioritized handling and faster delivery
            </p>
          </div>
          <div>
            <div className="flex items-center">
              <input
                id="fragileShipment"
                type="checkbox"
                checked={isFragileShipment}
                onChange={(e) => setIsFragileShipment(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="fragileShipment"
                className="ml-2 block text-sm text-gray-700"
              >
                Fragile Shipment (₹10/kg surcharge)
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Special handling for delicate items
            </p>
          </div>
        </div>
      </div>

      {/* --- Validation error --- */}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* --- Calculate button --- */}
      <button
        onClick={calculateQuotes}
        disabled={isCalculating}
        className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        <CalculatorIcon className="mr-2" size={20} />
        {isCalculating ? "Calculating..." : "Calculate Freight Costs"}
      </button>

      {/* --- Results --- */}
      {data && (
  <div id="results" className="mt-8">
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">
      Vendor Comparison
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {data
        .sort((a, b) => a.price - b.price) // Sort by price
        .map((item, index) => (
          <div
            key={index}
            className="rounded-lg border p-4 transition-all border-green-200 bg-green-50"
          >
            <div className="flex items-center gap-4 mb-3">
              <div>
                <h3 className="font-bold text-lg">{item.transporterData.companyName}</h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <CalendarClock size={14} />
                  <span>Delivery Time</span>
                </div>
                <p className="font-semibold">7 Days</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Weight size={14} />
                  <span>Chargeable</span>
                </div>
                <p className="font-semibold">{item.chargeableWeight} kg</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <DollarSign size={14} />
                  <span>Total Cost</span>
                </div>
                <p className="font-semibold text-blue-700">₹{item.totalPrice}</p>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-800 transition-colors"
              >
                <Download size={16} /> Download Quote
              </button>

              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1 transition-colors"
              >
                Book Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>

)}

    </div>
  );
};

export default CalculatorPage;
