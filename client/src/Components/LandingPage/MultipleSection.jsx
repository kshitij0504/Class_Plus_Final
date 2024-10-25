import React from 'react';
import { Check, ArrowRight } from 'lucide-react'; // Assuming you use Heroicons (adjust as needed)
import { Link } from 'react-router-dom'; // Assuming you use react-router
import image from '../../assets/166258.png'
const pricingPlans = [
  {
    name: "Basic",
    description: "Perfect for individual students",
    price: "0",
    features: [
      "Join up to 3 study groups",
      "Basic video calls",
      "File sharing up to 100MB",
      "Community support"
    ]
  },
  {
    name: "Pro",
    description: "Most popular for serious students",
    price: "19",
    popular: true,
    features: [
      "Unlimited study groups",
      "HD video calls",
      "File sharing up to 1GB",
      "Priority support",
      "Advanced scheduling tools"
    ]
  },
  {
    name: "Team",
    description: "Ideal for study organizations",
    price: "49",
    features: [
      "Everything in Pro",
      "Custom branding",
      "Analytics dashboard",
      "Admin controls",
      "API access"
    ]
  }
];

const partners = [
  "University of Excellence",
  "Global Learning Institute",
  "Tech Academy",
  "Education First"
];

const PricingSection = () => {
  return (
    <div className="py-20 bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`bg-gray-800 rounded-2xl p-8 border ${
              plan.popular ? 'border-purple-500' : 'border-purple-500/30'
            } relative`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-300">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PartnersSection = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by Leading Institutions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-800 rounded-xl flex items-center justify-center p-6">
                <img
                  src={image}
                  alt={partner}
                  className="max-w-full h-auto opacity-50 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EnhancedCTA = () => {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Learning Experience?
        </h2>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Join Class Plus today and experience the future of collaborative learning.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-100 transition-colors inline-flex items-center justify-center group">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#demo" className="bg-transparent text-white border border-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center">
            Watch Demo
          </a>
        </div>
      </div>
    </div>
  );
};

export { PricingSection, PartnersSection, EnhancedCTA };
