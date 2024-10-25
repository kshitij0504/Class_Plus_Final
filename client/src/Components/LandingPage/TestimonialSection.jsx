import { ChevronDown } from "lucide-react";
import React from "react";

const testimonials = [
    {
      image: "https://img.freepik.com/premium-vector/market-researcher-vector-flat-style-illustration_1033579-70181.jpg?semt=ais_hybrid",
      name: "Alex Thompson",
      role: "Computer Science Student",
      text: "Class Plus transformed my study routine. The collaborative features and video sessions made remote learning feel personal and engaging. I've improved my grades significantly since joining!"
    },
    {
      image: "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-93124.jpg?semt=ais_hybrid",
      name: "Maria Garcia",
      role: "Medical Student",
      text: "Finding study partners for complex medical courses was always challenging. Class Plus made it easy to connect with other med students. The resource sharing features are invaluable for our study sessions."
    },
    {
      image: "https://img.freepik.com/free-psd/3d-illustration-with-online-avatar_23-2151303097.jpg?semt=ais_hybrid",
      name: "James Wilson",
      role: "MBA Student",
      text: "The scheduling tools and calendar integration make coordinating study sessions across time zones effortless. Great platform for business school study groups!"
    }
  ];

const TestimonialsSection = ({ isExpanded, setExpanded }) => {
    // const [isTestimonialExpanded, setTestimonialExpanded] = useState({});
    
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied students who have transformed their learning experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-purple-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {isExpanded[index] ? testimonial.text : `${testimonial.text.slice(0, 150)}...`}
                </p>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
                  className="text-purple-400 mt-4 flex items-center hover:text-purple-300"
                >
                  {isExpanded[index] ? 'Read less' : 'Read more'}
                  <ChevronDown className={`ml-1 transform ${isExpanded[index] ? 'rotate-180' : ''} transition-transform`} />
                  </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};  

export default  TestimonialsSection;