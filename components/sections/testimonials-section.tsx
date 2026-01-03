"use client"

import { motion } from "motion/react"
import { TestimonialsColumn } from "@/components/ui/testimonials-column"

const testimonials = [
  {
    text: "This platform completely transformed how we build products. We shipped our MVP in 2 weeks instead of 2 months.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "CTO at TechFlow",
  },
  {
    text: "The best investment we've made for our engineering team. The ROI was immediate and substantial.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Marcus Johnson",
    role: "VP Engineering at Scale",
  },
  {
    text: "Finally, a tool that actually delivers on its promises. Our deployment time went from hours to minutes.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Emily Rodriguez",
    role: "Lead Developer at Nexus",
  },
  {
    text: "Implementing this was smooth and quick. The customizable interface made team onboarding effortless.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Park",
    role: "IT Manager",
  },
  {
    text: "The support team is exceptional, guiding us through setup and providing ongoing assistance.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Aisha Patel",
    role: "Customer Success Lead",
  },
  {
    text: "Seamless integration enhanced our business operations and efficiency. Highly recommend.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "James Wilson",
    role: "CEO at Quantum",
  },
  {
    text: "Its robust features and quick support have transformed our workflow significantly.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    name: "Lisa Thompson",
    role: "Project Manager",
  },
  {
    text: "The smooth implementation exceeded expectations. It streamlined our entire business process.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    name: "Michael Brown",
    role: "Business Analyst",
  },
  {
    text: "Our team productivity improved dramatically with the user-friendly design and powerful features.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Rachel Kim",
    role: "Marketing Director",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const logos = ["TechCorp", "Innovate", "NextGen", "Quantum", "Velocity", "Apex"]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-6 py-32 bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
        </div>
      </div>
    </section>
  )
}
