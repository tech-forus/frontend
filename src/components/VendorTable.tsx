import React, { useState } from "react";
import { ArrowRight, CalendarClock, DollarSign, Download, Weight } from "lucide-react";
import { Link } from "react-router-dom";

type VendorItem = {
  transporterName?: string;
  estimatedTime?: number | string;
  chargeableWeight?: number;
  totalCharges: number;
  price: number;

  // Add all properties used in the bifurcation row
  actualWeight?: number;
  volumetricWeight?: number;
  baseFreight?: number;
  appointmentCharges?: number;
  docketCharges?: number;
  codCharges?: number;
  daccCharges?: number;
  insuranceCharges?: number;
  handlingCharges?: number;
  miscCharges?: number;
  greenTax?: number;
  fuelSurcharge?: number;
  fmCharges?: number;
  rovCharges?: number;
  odaCharges?: number;
  prepaidCharges?: number;
  topayCharges?: number;
  minCharges?: number;
  unitPrice?: number;
  distance?: string | number;
  modeoftransport?: string;
  originZone?: string;
  originPincode?: string | number;
  destinationZone?: string;
  destinationPincode?: string | number;
};

interface VendorTableProps {
  data?: VendorItem[];
  hiddendata?: VendorItem[];
}

const VendorTable = ({ data, hiddendata }: VendorTableProps) => {
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Vendor Comparison</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-700">
            <th className="p-3">Transporter</th>
            <th className="p-3">Delivery Time</th>
            <th className="p-3">Chargeable Weight</th>
            <th className="p-3">Total Cost</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {[...(data || []), ...(hiddendata || [])].sort((a, b) => a.price - b.price).map((item, index) => {
            const isHidden = item.transporterName === undefined;
            const expanded = expandedRows[index];

            return (
              <React.Fragment key={index}>
                <tr className="border-t">
                  <td className="p-3 font-medium">
                    {isHidden ? (
                      <div style={{ filter: "blur(5px)", userSelect: "none" }}>XXXXXXXX</div>
                    ) : (
                      item.transporterName
                    )}
                  </td>

                  <td className="p-3">
                    {isHidden ? (
                      <div style={{ filter: "blur(5px)", userSelect: "none" }}>XX Days</div>
                    ) : (
                      `${Math.floor(Number(item.estimatedTime)) + 2} Days`
                    )}
                  </td>

                  <td className="p-3">
                    {item.chargeableWeight === undefined ? (
                      <div style={{ filter: "blur(5px)", userSelect: "none" }}>XX</div>
                    ) : (
                      `${item.chargeableWeight} kg`
                    )}
                  </td>

                  <td className="p-3 text-blue-700 font-semibold">₹{item.totalCharges}</td>

                  <td className="p-3 text-center">
                    {isHidden ? (
                      <Link
                        to="/pricing"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                      >
                        Buy Now
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleRow(index)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {expanded ? "Hide Bifurcation" : "Show Bifurcation"}
                      </button>
                    )}
                  </td>
                </tr>

                {expanded && !isHidden && (
                    <tr className="bg-gray-50 border-t">
                        <td colSpan={5} className="p-4">
                        <div className="text-sm text-gray-800 space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><strong>Actual Weight:</strong> {item.actualWeight} kg</div>
                            <div><strong>Volumetric Weight:</strong> {item.volumetricWeight} kg</div>
                            <div><strong>Chargeable Weight:</strong> {item.chargeableWeight} kg</div>

                            <div><strong>Base Freight:</strong> ₹{item.baseFreight}</div>
                            <div><strong>Appointment Charges:</strong> ₹{item.appointmentCharges}</div>
                            <div><strong>Docket Charges:</strong> ₹{item.docketCharges}</div>

                            <div><strong>COD Charges:</strong> ₹{item.codCharges}</div>
                            <div><strong>DAC Charges:</strong> ₹{item.daccCharges}</div>
                            <div><strong>Insurance Charges:</strong> ₹{item.insuranceCharges}</div>

                            <div><strong>Handling Charges:</strong> ₹{item.handlingCharges}</div>
                            <div><strong>Misc Charges:</strong> ₹{item.miscCharges}</div>
                            <div><strong>Green Tax:</strong> ₹{item.greenTax}</div>

                            <div><strong>Fuel Surcharge:</strong> ₹{item.fuelSurcharge}</div>
                            <div><strong>FM Charges:</strong> ₹{item.fmCharges}</div>
                            <div><strong>ROV Charges:</strong> ₹{item.rovCharges}</div>

                            <div><strong>ODA Charges:</strong> ₹{item.odaCharges}</div>
                            <div><strong>Prepaid Charges:</strong> ₹{item.prepaidCharges}</div>
                            <div><strong>Topay Charges:</strong> ₹{item.topayCharges}</div>

                            <div><strong>Min Charges:</strong> ₹{item.minCharges}</div>
                            <div><strong>Unit Price:</strong> ₹{item.unitPrice}</div>
                            <div><strong>Total Charges:</strong> ₹{item.totalCharges}</div>

                            <div><strong>Distance:</strong> {item.distance}</div>
                            <div><strong>Estimated Time:</strong> {Math.floor(Number(item.estimatedTime)) + 2} Days</div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t mt-4">
                            <div><strong>Mode of Transport:</strong> {item.modeoftransport}</div>
                            <div><strong>Origin:</strong> {item.originZone} ({item.originPincode})</div>
                            <div><strong>Destination:</strong> {item.destinationZone} ({item.destinationPincode})</div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1">
                                Book Now <ArrowRight size={16} />
                            </button>
                            </div>
                        </div>
                        </td>
                    </tr>
                )}

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VendorTable;
