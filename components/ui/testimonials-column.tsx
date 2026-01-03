"use client"

import React from "react"
import { motion } from "motion/react"

interface Testimonial {
  text: string
  image: string
  name: string
  role: string
}

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: Testimonial[]
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div
                  className="p-10 rounded-[32px] border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300 max-w-xs w-full group relative"
                  key={i}
                >
                  <p className="text-zinc-400 leading-relaxed font-medium italic">"{text}"</p>
                  <div className="flex items-center gap-4 mt-8">
                    <img
                      width={48}
                      height={48}
                      src={image || "/placeholder.svg"}
                      alt={name}
                      className="h-12 w-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-white tracking-tight">{name}</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}
