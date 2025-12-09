import { Image } from "@heroui/react";

const PARTNER_LOGOS = [
  { src: "/sub/Logo_BelatorCKM_2.svg", alt: "Belator CKM" },
  { src: "/sub/Logo_BelatorFundacion_2.svg", alt: "Belator Fundación" },
  { src: "/sub/Logo_BelatorOtec_2.svg", alt: "Belator Otec" },
  { src: "/sub/Logo_BelatorSIE_2.svg", alt: "Belator SIE" },
  { src: "/sub/Logo_BelatorSecurity_2.svg", alt: "Belator Security" },
];

export default function LogoCarousel() {
  return (
    <div className="relative overflow-hidden py-6 mb-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#202e5e] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#202e5e] to-transparent z-10 pointer-events-none" />
      <div
        className="flex gap-12 hover:[animation-play-state:paused]"
        style={{
          width: "max-content",
          animation: "carousel-scroll 25s linear infinite",
        }}
      >
        {[...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS].map(
          (logo, index) => (
            <div
              key={`logo-${index}`}
              className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <Image
                alt={logo.alt}
                className="h-12 w-auto object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                src={logo.src || "/placeholder.svg"}
              />
            </div>
          ),
        )}
      </div>
      <style>
        {`
          @keyframes carousel-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
        `}
      </style>
    </div>
  );
}
