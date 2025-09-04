"use client";
/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import { ShoppingBag, Package, Truck } from "lucide-react";
import { useState, useEffect } from "react";

export default function InteractiveFeatureCards() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: ShoppingBag,
      title: "Seamless shopping",
      description: "Browse and buy with a clean, distraction-free UI.",
      delay: "delay-100",
    },
    {
      icon: Package,
      title: "Vendor tools",
      description: "List products, track orders and grow your brand.",
      delay: "delay-200",
    },
    {
      icon: Truck,
      title: "Smart delivery",
      description: "Reliable shipping with transparent tracking.",
      delay: "delay-300",
    },
  ];

  return (
    <div className='hidden lg:block'>
      <div className='relative h-[420px] overflow-hidden'>
        <div className='absolute inset-0 rounded-3xl bg-gradient-to-br from-muted via-primary/10 to-accent/10 border border-border transition-all duration-1000'>
          <div className='absolute top-4 right-4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse'></div>
          <div className='absolute bottom-8 left-8 w-24 h-24 bg-accent/20 rounded-full blur-lg animate-pulse delay-1000'></div>
        </div>

        {features.map((feature, index) => {
          const Icon = feature.icon;
          const positions = [
            "top-8 left-8 right-20",
            "top-40 left-24 right-8",
            "top-72 left-12 right-24",
          ];

          return (
            <div
              key={index}
              className={`absolute ${positions[index]} transition-all duration-700 ease-out transform ${
                isVisible
                  ? `translate-y-0 opacity-100 ${feature.delay}`
                  : "translate-y-8 opacity-0"
              } ${
                hoveredCard === index
                  ? "scale-105 -translate-y-2 "
                  : hoveredCard !== null
                    ? "scale-95 opacity-75"
                    : "hover:scale-102 hover:-translate-y-1"
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className=' backdrop-blur-sm border border-border/80 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-00 cursor-pointer group bg-card/60'>
                <div className='flex items-start gap-4'>
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-foreground/80 text-primary-foreground flex items-center justify-center transition-all duration-00 group-hover:scale-110 group-hover:rotate-12 ${
                      hoveredCard === index ? "shadow-lg" : ""
                    }`}
                  >
                    <Icon className='h-5 w-5 transition-transform duration-00 group-hover:scale-110' />
                  </div>
                  <div className='space-y-1 flex-1'>
                    <p className='text-sm font-semibold text-foreground transition-colors duration-00 '>
                      {feature.title}
                    </p>
                    <p className='text-sm text-muted-foreground transition-all duration-00 group-hover:text-foreground leading-relaxed'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
