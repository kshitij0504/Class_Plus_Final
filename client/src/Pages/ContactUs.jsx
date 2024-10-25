import Navigation from "../Components/LandingPage/Navigation";
import Footer from "../Components/LandingPage/Footer";
import { EnhancedCTA } from "../Components/LandingPage/MultipleSection";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

const contactInfo = [
  {
    icon: <Phone className="w-6 h-6 text-purple-400" />,
    title: "Phone",
    content: "+1 (555) 123-4567",
  },
  {
    icon: <Mail className="w-6 h-6 text-purple-400" />,
    title: "Email",
    content: "support@classplus.edu",
  },
  {
    icon: <MapPin className="w-6 h-6 text-purple-400" />,
    title: "Location",
    content: "123 Learning Street, Education City, CA 94105",
  },
  {
    icon: <Clock className="w-6 h-6 text-purple-400" />,
    title: "Business Hours",
    content: "Monday - Friday: 9:00 AM - 6:00 PM PST",
  },
];

const faqs = [
  {
    question: "How do I get started with Class Plus?",
    answer:
      "Sign up for a free account, create your profile, and join or create your first study group. Our onboarding process will guide you through each step.",
  },
  {
    question: "What technology do I need?",
    answer:
      "A computer or mobile device with internet access, webcam, and microphone for video sessions. We support all major browsers.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial with full access to all features. No credit card required.",
  },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Contact Hero Section */}
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Get in
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Touch{" "}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to our team and
              we'll get back to you shortly.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-32"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {info.title}
                      </h3>
                      <p className="text-gray-300">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-lg p-6 border border-purple-500/30"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnhancedCTA />
      <Footer />
    </div>
  );
};

export default ContactPage;
