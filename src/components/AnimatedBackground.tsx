"use client";

import React from "react";
import { motion } from "framer-motion";
import "../app/globals.css";

const AnimatedBackground: React.FC = () => {
  return (
    <motion.div
      className="animated-background"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{
        duration: 150,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1], // Custom bezier curve
      }}
    />
  );
};

export default AnimatedBackground;
