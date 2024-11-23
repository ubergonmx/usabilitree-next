"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "@/components/icons";
import { DotPatternBackground } from "../_components/dot-pattern-background";
import Link from "next/link";
import { Paths } from "@/lib/constants";
import { User } from "@/db/schema";

const ease = [0.16, 1, 0.3, 1];

function HeroTitles() {
  const partialTitle = "Optimize UX with";

  return (
    <div className="max-w-3xl space-y-4">
      <motion.h1
        className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
        initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease,
          staggerChildren: 0.2,
        }}
      >
        {partialTitle.split(" ").map((text, index) => (
          <motion.span
            key={index}
            className="inline-block px-1 md:px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.2,
              duration: 0.8,
              ease,
            }}
          >
            {text}
          </motion.span>
        ))}
        <br />
        <motion.span
          className="inline-block px-1 md:px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: partialTitle.split(" ").length * 0.2,
            duration: 0.8,
            ease,
          }}
        >
          <span className="bg-gradient-to-r from-[#72FFA4] to-[#00D9C2] bg-clip-text text-transparent">
            Tree Testing
          </span>
        </motion.span>
      </motion.h1>
      <motion.p
        className="text-balance text-xl text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: partialTitle.split(" ").length * 0.2 + 0.2,
          duration: 0.8,
          ease,
        }}
      >
        Create, conduct, and analyze tree tests for free. Optimize your information architecture
        with valuable insights.
      </motion.p>
    </div>
  );
}

function HeroCTA({ hasUser }: { hasUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8, ease }}
    >
      <Link href={hasUser ? Paths.Dashboard : Paths.Login}>
        <Button variant="expandIcon" Icon={ArrowRight} iconPlacement="right" className="pl-6">
          Get Started
        </Button>
      </Link>
    </motion.div>
  );
}

export function HeroSection({ user }: { user: User | undefined }) {
  return (
    <section id="hero">
      <div className="relative flex w-full flex-col items-center justify-start px-4 pt-16 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
        <DotPatternBackground />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 pb-20 text-center">
            <HeroTitles />
            <HeroCTA hasUser={!!user} />
          </div>
        </div>
      </div>
    </section>
  );
}
