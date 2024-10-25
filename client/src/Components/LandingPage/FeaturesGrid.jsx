import React from "react";

const FeatureSection = ({ imageSrc, title, description, isReversed = false }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const ImageComponent = () => (
    <div className="w-full relative">
      <div 
        className="group aspect-square max-w-lg mx-auto relative cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main image container with hover effects */}
        <div className="relative w-full h-full transition-transform duration-500 ease-out transform group-hover:scale-105">
          {/* Decorative elements */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Image frame with border effect */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 border-2 border-white/10 rounded-2xl transform -rotate-3 transition-transform duration-500 group-hover:rotate-0" />
            <div className="absolute inset-0 border-2 border-white/10 rounded-2xl transform rotate-3 transition-transform duration-500 group-hover:rotate-0" />
          </div>

          {/* Main image */}
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay with animation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Animated title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="text-white text-xl font-semibold mb-2">{title}</h4>
              <div className="h-1 w-12 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Floating dots decoration */}
        <div className="absolute -top-4 -right-4 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: '0.2s', left: '12px' }} />
          <div className="absolute w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s', left: '24px' }} />
        </div>
      </div>
    </div>
  );

  const TextContent = () => (
    <div className="flex flex-col justify-center h-full">
      <div className="relative">
        {/* Animated line above title */}
        <div className={`h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 transform transition-all duration-500 ease-out ${isHovered ? 'w-24' : 'w-12'}`} />
        
        {/* Title with gradient effect */}
        <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{title}</h3>
        
        {/* Description with custom styling */}
        <p className="text-xl text-gray-300/90 leading-relaxed font-light">{description}</p>
        
        {/* Animated line below description */}
        <div className={`h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-6 opacity-0 transform transition-all duration-500 ease-out ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {isReversed ? (
            <>
              <ImageComponent />
              <TextContent />
            </>
          ) : (
            <>
              <TextContent />
              <ImageComponent />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Features array remains the same
const features = [
  {
    imageSrc: "/src/assets/Temp/1.png",
    title: "Interactive Study Groups",
    description: "Create or join study groups based on your interests and academic goals. Connect with like-minded peers worldwide and enhance your learning through collaborative study sessions. Our platform makes it easy to find the perfect study partners who share your academic interests and learning style.",
  },
  {
    imageSrc: "/src/assets/Temp/videosession.jpg",
    title: "Live Video Sessions",
    description: "Experience seamless face-to-face learning with our HD video calls. Share your screen, collaborate on documents in real-time, and engage in interactive discussions. Our video platform is optimized for educational content, ensuring crystal-clear communication during every study session.",
  },
  {
    imageSrc: "/src/assets/Temp/ResourceSharing.jpg",
    title: "Resource Sharing",
    description: "Share and access study materials effortlessly with our comprehensive resource sharing system. Upload notes, documents, and study guides to create a collaborative learning environment. Keep everything organized and easily accessible for your entire study group.",
  },
  {
    imageSrc: "/src/assets/Temp/SmartScheduling.png",
    title: "Smart Scheduling",
    description: "Coordinate study sessions effortlessly with our intelligent scheduling system. Find the perfect time that works for everyone, regardless of time zones. Set recurring sessions, get reminders, and maintain a consistent study routine with your group.",
  },
  {
    imageSrc: "/src/assets/Temp/StudyRemainders.png",
    title: "Study Reminders",
    description: "Stay on track with smart notifications and timely reminders. Customize your alert preferences to ensure you never miss an important study session. Get updates about shared resources, upcoming sessions, and group activities.",
  },
  {
    imageSrc: "/src/assets/Temp/GroupChat.jpg",
    title: "Group Chat",
    description: "Keep the conversation flowing with our integrated group chat system. Share quick updates, ask questions, and collaborate seamlessly between study sessions. Create topic-specific channels and maintain organized discussions for effective communication.",
  },
];

const FeatureShowcase = () => {
  return (
    <div className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to make your study sessions more
            productive and engaging.
          </p>
        </div>
        
        <div className="space-y-20">
          {features.map((feature, index) => (
            <FeatureSection 
              key={index} 
              {...feature} 
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;