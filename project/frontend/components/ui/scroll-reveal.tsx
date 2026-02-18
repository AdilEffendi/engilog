"use client"

import { motion } from "framer-motion"

interface ScrollRevealProps {
    children: React.ReactNode
    direction?: "up" | "down" | "left" | "right" | "none"
    delay?: number
    className?: string
    duration?: number
}

export default function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    className = "",
    duration = 0.5
}: ScrollRevealProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
            x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: duration,
                delay: delay * 0.001, // Convert ms to seconds
                ease: "easeOut"
            }
        }
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }} // Changed to once: true for stability
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    )
}
