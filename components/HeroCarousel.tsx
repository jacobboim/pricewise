"use client";

import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

const heroImages = [
  { imgUrl: "/assets/images/hero-1.svg", alt: "hero-1" },
  { imgUrl: "/assets/images/hero-2.svg", alt: "hero-2" },
  { imgUrl: "/assets/images/hero-3.svg", alt: "hero-3" },
  { imgUrl: "/assets/images/hero-4.svg", alt: "hero-4" },
  { imgUrl: "/assets/images/hero-5.svg", alt: "hero-5" },
];

const HeroCarousel = () => {
  return (
    <div className="hero-carousel" style={{ backgroundColor: "#cfd2d7" }}>
      <Carousel
        showThumbs={false}
        autoPlay={true}
        infiniteLoop={true}
        interval={2000}
        showArrows={false}
        showStatus={false}
      >
        {heroImages.map((image, index) => (
          <Image
            key={image.alt + index}
            src={image.imgUrl}
            alt={image.alt}
            width={484}
            height={484}
            className="object-contain"
          />
        ))}
      </Carousel>

      <Image
        src="/assets/icons/hand-drawn-arrow.svg"
        alt="arrow"
        width={175}
        height={175}
        className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
      />
    </div>
  );
};

export default HeroCarousel;
