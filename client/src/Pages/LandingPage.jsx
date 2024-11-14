import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Video,
  BookOpen,
  Bell,
  MessageSquare,
  ArrowRight,
  Star,
  Shield,
  Brain,
  Code,
  Sparkles,
} from "lucide-react";
import image from "../assets/boy.jpeg";
import Navigation from "@/Components/LandingPage/Navigation";
import HeroSection from "@/Components/LandingPage/HeroSection";
import FeatureGrid from "@/Components/LandingPage/FeaturesGrid";
import StatsSection from "@/Components/LandingPage/StatsSection";
import HowItWorksSection from "@/Components/LandingPage/HowItWorksSection";
import TestimonialsSection from "@/Components/LandingPage/TestimonialSection";
import { EnhancedCTA, PartnersSection, PricingSection } from "@/Components/LandingPage/MultipleSection";
import Footer from "@/Components/LandingPage/Footer";

const LandingPage = () => {
  const [isTestimonialExpanded, setTestimonialExpanded] = useState({});

  return (
    <div className="min-h-screen bg-gray-900 custom-scrollbar">
      <Navigation />
      <HeroSection />
      <FeatureGrid />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection
        isExpanded={isTestimonialExpanded}
        setExpanded={setTestimonialExpanded}
      />
      {/* <PricingSection />
      <PartnersSection /> */}
      <EnhancedCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
