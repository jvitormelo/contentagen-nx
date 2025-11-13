"use client";
import {
   type MotionValue,
   motion,
   useScroll,
   useSpring,
   useTransform,
} from "motion/react";

import React from "react";

export const HeroParallax = ({
   products,
}: {
   products: {
      title: string;
      link: string;
      thumbnail: string;
   }[];
}) => {
   const firstRow = products.slice(0, 5);
   const secondRow = products.slice(5, 10);
   const thirdRow = products.slice(10, 15);
   const ref = React.useRef(null);
   const { scrollYProgress } = useScroll({
      offset: ["start start", "end start"],
      target: ref,
   });

   const springConfig = { bounce: 100, damping: 30, stiffness: 300 };

   const translateX = useSpring(
      useTransform(scrollYProgress, [0, 1], [0, 1000]),
      springConfig,
   );
   const translateXReverse = useSpring(
      useTransform(scrollYProgress, [0, 1], [0, -1000]),
      springConfig,
   );
   const rotateX = useSpring(
      useTransform(scrollYProgress, [0, 0.2], [15, 0]),
      springConfig,
   );
   const opacity = useSpring(
      useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
      springConfig,
   );
   const rotateZ = useSpring(
      useTransform(scrollYProgress, [0, 0.2], [20, 0]),
      springConfig,
   );
   const translateY = useSpring(
      useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
      springConfig,
   );
   return (
      <div
         className="h-[300vh] py-30 overflow-hidden bg-background  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
         ref={ref}
      >
         <Header />
         <motion.div
            className=""
            style={{
               opacity,
               rotateX,
               rotateZ,
               translateY,
            }}
         >
            <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
               {firstRow.map((product) => (
                  <ProductCard
                     key={product.title}
                     product={product}
                     translate={translateX}
                  />
               ))}
            </motion.div>
            <motion.div className="flex flex-row  mb-20 space-x-20 ">
               {secondRow.map((product) => (
                  <ProductCard
                     key={product.title}
                     product={product}
                     translate={translateXReverse}
                  />
               ))}
            </motion.div>
            <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
               {thirdRow.map((product) => (
                  <ProductCard
                     key={product.title}
                     product={product}
                     translate={translateX}
                  />
               ))}
            </motion.div>
         </motion.div>
      </div>
   );
};

export const Header = () => {
   return (
      <div className="max-w-5xl relative mx-auto py-20 md:py-40 px-4 w-full  left-0 top-0">
         <h1 className="text-2xl md:text-7xl font-bold text-foreground">
            The Ultimate <br /> development studio
         </h1>
         <p className="max-w-2xl text-base md:text-xl mt-8 text-muted-foreground">
            We build beautiful products with the latest technologies and
            frameworks. We are a team of passionate developers and designers
            that love to build amazing products.
         </p>
      </div>
   );
};

export const ProductCard = ({
   product,
   translate,
}: {
   product: {
      title: string;
      link: string;
      thumbnail: string;
   };
   translate: MotionValue<number>;
}) => {
   return (
      <motion.div
         className="group/product h-96 w-[30rem] relative flex-shrink-0"
         key={product.title}
         style={{
            x: translate,
         }}
         whileHover={{
            y: -20,
         }}
      >
         <a
            className="block group-hover/product:shadow-2xl "
            href={product.link}
         >
            <img
               alt={product.title}
               className="object-cover object-left-top absolute h-full w-full inset-0"
               src={product.thumbnail}
            />
         </a>
         <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
         <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
            {product.title}
         </h2>
      </motion.div>
   );
};
