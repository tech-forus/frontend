import React from 'react'
import {
  Truck,
  Globe,
  UserCheck,
  GraduationCap,
  MapPin,
  Network,
  CreditCard,
  DollarSign,
} from 'lucide-react'

export default function AboutUsPage() {
  return (
    <div className="bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            About FreightCompare
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            FreightCompare is India’s premier freight-rate aggregator, born from the product-driven
            expertise of Forus Electric. Under the leadership of CEO <strong>Uttam Goyal</strong>,
            an alumnus of IIT Roorkee, this platform leverages industry know-how to drive logistics
            costs down at every level—from major carriers to local providers.
          </p>
        </div>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Mission</h2>
            <p className="text-gray-600">
              To unify real-time freight rates across India—onboarding major carriers and local
              service providers alike—to deliver transparent, cost-effective shipping for all.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Vision</h2>
            <p className="text-gray-600">
              To be the logistics backbone for every Indian business—bridging supply chains,
              empowering small providers, and ensuring maximum savings through an expansive network.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Values</h2>
            <p className="text-gray-600 text-left">
              <strong>Integrity:</strong> No hidden fees—just carrier quotes you can trust.<br />
              <strong>Inclusivity:</strong> Onboarding both national and local logistic partners.<br />
              <strong>Innovation:</strong> Powered by Forus Electric’s engineering excellence.
            </p>
          </div>
        </div>

        {/* Founder & Forus Electric Story */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Roots</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            FreightCompare is a spin-off from <strong>Forus Electric</strong>, India’s leader in
            lighting solutions. Deep in-house logistics challenges—varying rates, delivery hurdles,
            and hidden costs—inspired CEO <strong>Uttam Goyal</strong> (IIT Roorkee ’10) to build a
            unified freight platform powered by engineers and logistics experts.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Drawing on Forus Electric’s product distribution network and warehouses in Delhi, Mumbai,
            and Bengaluru, FreightCompare integrates live rates for road, rail, air, and regional
            carriers—so businesses of every scale can optimize routes and maximize savings.
          </p>
        </div>

        {/* Warehouses Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Forus Electric Warehouses</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <MapPin className="mt-1 h-5 w-5 text-blue-600 mr-2" />
                Delhi NCR (Okhla Phase 1)
              </li>
              <li className="flex items-start">
                <MapPin className="mt-1 h-5 w-5 text-blue-600 mr-2" />
                Mumbai (Vikhroli)
              </li>
              <li className="flex items-start">
                <MapPin className="mt-1 h-5 w-5 text-blue-600 mr-2" />
                Bengaluru (Electronics City)
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why FreightCompare</h2>
            <p className="text-gray-600">
              As a manufacturer, Forus Electric experienced firsthand the cost and complexity of
              shipping products. FreightCompare distills those insights into one dashboard—onboarding
              large carriers and local services to ensure the end user gets maximum value for money.
            </p>
          </div>
        </div>

        {/* Root-level Network & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Expansive Network</h2>
            <p className="text-gray-600 mb-4">
              We go beyond major carriers—onboarding regional and local logistics providers at the root
              level to broaden our network. That way, you tap into every available rate and service,
              ensuring the best possible shipping options, even in remote locations.
            </p>
            <Network className="h-8 w-8 text-blue-600" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transparent Pricing</h2>
            <p className="text-gray-600 mb-4">
              Start with free credits to explore FreightCompare risk-free. After that, pay a small token
              per search—priced far below your shipping savings. Each token unlocks live rates, comparisons,
              and booking access across our entire network.
            </p>
            <div className="flex items-center space-x-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}