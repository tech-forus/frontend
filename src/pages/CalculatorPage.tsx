import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Calculator as CalculatorIcon,
  Navigation,
  MapPin,
  MoveRight,
  Weight,
  Download,
  ArrowRight,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";


type VendorQuote = {
  transporterData: any;
  totalPrice: any;
  estimatedDelivery: any;
  companyName: string;
  price: any;
  transporterName: string;
  deliveryTime: string;
  chargeableWeight: number;
  totalCharges: number;
  logoUrl?: string;
  isBestValue?: boolean;
};


const CalculatorPage: React.FC = () => {
  const { user } = useAuth();
  const [isExpressShipment, setIsExpressShipment] = useState(false);
  const [isFragileShipment, setIsFragileShipment] = useState(false);

  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<VendorQuote[] | null>(null);


  const [modeOfTransport, setModeOfTransport] = useState<'Road'|'Rail'|'Air'|'Ship'>('Road');
  const [fromPincode, setfromPincode] = useState("");
  const [toPincode, settoPincode] = useState("");
  const [noofboxes, setnoofboxes] = useState(0);
  const [quantity, setquantity] = useState(0);
  const [length, setlength] = useState(0);
  const [width, setwidth] = useState(0);
  const [height, setheight] = useState(0);
  const [weightperbox, setweightperbox] = useState(0);
  const [hiddendata, sethiddendata] = useState<VendorQuote[] | null>(null);

  const token = Cookies.get('authToken');


  // Main quote calculation
  const calculateQuotes = async () => {
    setError(null);

    const pincodeRegex = /^\d{6}$/;
    if (
      !pincodeRegex.test(fromPincode) ||
      !pincodeRegex.test(toPincode)
    ) {
      setError("Please enter valid 6-digit Origin and Destination Pincodes.");
      return;
    }


    setIsCalculating(true);

    try {
      
      const response = await axios.post(
        "http://localhost:8000/api/transporter/calculate",
        {
          customerID: (user as any).customer._id,
          userogpincode: (user as any).customer.pincode,
          modeoftransport: modeOfTransport,
          fromPincode: fromPincode,
          toPincode: toPincode,
          noofboxes: noofboxes,
          quantity: quantity,
          length: length,
          width: width,
          height: height,
          weight: weightperbox,
        }, {
          headers: {
            Authorization : `Bearer ${token}`
          }
        }
      );

      if (response) {
        console.log(response.data);
        setData(response.data.tiedUpResult);
        sethiddendata(response.data.companyResult);
      }
    } catch (e) {
      setError("Failed to calculate quotes or send data. Please try again.");
      console.error(e);
    } finally {
      setIsCalculating(false);
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Sync totalBoxes & totalWeight into shipment for display
  useEffect(() => {
    
  });

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
              value={modeOfTransport}
              onChange={(e) => setModeOfTransport(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="Road">Road</option>
              <option value="Rail">Rail</option>
              <option value="Air">Air</option>
              <option value="Ship">Ship</option>
            </select>
          </div>
          <p className="mt-2 text-sm">
            Currently selected: <strong>{modeOfTransport}</strong>
          </p>
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
              value={fromPincode}
              onChange={(e) => setfromPincode(e.target.value)}
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
              value={toPincode}
              onChange={(e) => settoPincode(e.target.value)}
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
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Shipment Details
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Number of Boxes */}
        <div className="flex flex-col">
          <label htmlFor="numberOfBoxes" className="mb-1 text-gray-700 font-medium">
            Number of Boxes
          </label>
          <input
            id="numberOfBoxes"
            type="number"
            name="numberOfBoxes"
            value={noofboxes}
            onChange={(e) => setnoofboxes(Number(e.target.value))}
            min={1}
            placeholder="Enter number of boxes"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Quantity per Box */}
        <div className="flex flex-col">
          <label htmlFor="qtyPerBox" className="mb-1 text-gray-700 font-medium">
            Quantity per Box
          </label>
          <input
            id="qtyPerBox"
            type="number"
            name="qtyPerBox"
            value={quantity}
            onChange={(e) => setquantity(Number(e.target.value))}
            min={1}
            placeholder="Enter quantity per box"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Total Quantity */}
        <div className="flex flex-col">
          <label htmlFor="totalQty" className="mb-1 text-gray-700 font-medium">
            Total Quantity
          </label>
          <input
            id="totalQty"
            type="number"
            name="totalQty"
            value={quantity * noofboxes}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
          />
        </div>

        {/* Length (L) */}
        <div className="flex flex-col">
          <label htmlFor="length" className="mb-1 text-gray-700 font-medium">
            Length (L)
          </label>
          <input
            id="length"
            type="number"
            name="length"
            value={length}
            onChange={(e) => setlength(Number(e.target.value))}
            min={0}
            placeholder="L"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Width (W) */}
        <div className="flex flex-col">
          <label htmlFor="width" className="mb-1 text-gray-700 font-medium">
            Width (W)
          </label>
          <input
            id="width"
            type="number"
            name="width"
            value={width}
            onChange={(e) => setwidth(Number(e.target.value))}
            min={0}
            placeholder="W"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Height (H) */}
        <div className="flex flex-col">
          <label htmlFor="height" className="mb-1 text-gray-700 font-medium">
            Height (H)
          </label>
          <input
            id="height"
            type="number"
            name="height"
            value={height}
            onChange={(e) => setheight(Number(e.target.value))}
            min={0}
            placeholder="H"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Weight per Box */}
        <div className="flex flex-col">
          <label htmlFor="weightPerBox" className="mb-1 text-gray-700 font-medium">
            Weight per Box
          </label>
          <input
            id="weightPerBox"
            type="number"
            name="weightPerBox"
            value={weightperbox}
            onChange={(e) => setweightperbox(Number(e.target.value))}
            min={0}
            step="0.01"
            placeholder="Weight"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Total Weight */}
        <div className="flex flex-col">
          <label htmlFor="totalWeight" className="mb-1 text-gray-700 font-medium">
            Total Weight
          </label>
          <input
            id="totalWeight"
            type="number"
            name="totalWeight"
            value={weightperbox * noofboxes}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
          />
        </div>

        {/* UOM spans two columns */}
        <div className="flex flex-col md:col-span-1">
          <label htmlFor="uom" className="mb-1 text-gray-700 font-medium">
            Unit of Measure (UOM)
          </label>
          <select
            id="uom"
            name="uom"
            value={"uom"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="ltr">ltr</option>
            <option value="box">box</option>
          </select>
        </div>

        {/* Description spans two columns */}
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="description" className="mb-1 text-gray-700 font-medium">
            Description
          </label>
          <input
            id="description"
            type="text"
            name="description"
            value={"description"}
            placeholder="Item description"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </form>
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
                        <h3 className="font-bold text-lg">
                          {item?.transporterName}
                        </h3>
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
                        <p className="font-semibold">
                          {item.chargeableWeight} kg
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <DollarSign size={14} />
                          <span>Total Cost</span>
                        </div>
                        <p className="font-semibold text-blue-700">
                          ₹{item.totalCharges}
                        </p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {hiddendata &&
                hiddendata
                  .sort((a, b) => a.price - b.price)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-4 transition-all border-green-200 bg-green-50"
                    >
                      {/* Everything blurred except price */}
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="font-bold text-lg">{item.transporterName === undefined ? <div style={{filter: "blur(5px)", userSelect: "none" }}>XXXXXXXX</div> : <div>item.transporterName</div>}</h3>
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
                            <p className="font-semibold">{item.chargeableWeight === undefined ? <div style={{filter: "blur(5px)", userSelect: "none" }}>XXXXXXXX</div> : <div>item.transporterName</div>} kg</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <DollarSign size={14} />
                              <span>Total Cost</span>
                            </div>
                            <p className="font-semibold text-blue-700">₹{item.totalCharges}</p>
                          </div>
                        </div>


                        <div className="flex justify-between mt-4">
                          {item.chargeableWeight === undefined ? <>
                            <Link
                              to = "/pricing"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              Buy Now <ArrowRight size={16} />
                            </Link>
                          </> : <>
                            <button
                              type="button"
                              className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-800 transition-colors"
                            >
                              Show Bifurcation
                            </button>
                          </>}
                        </div>
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
