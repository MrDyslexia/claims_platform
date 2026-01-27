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
    /* He aplicado la máscara aquí: [mask-image:...] 
       Esto crea un desvanecimiento real en los bordes sin importar el color de fondo.
    */
    <div className="relative overflow-hidden py-10 mb-8 w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      
      <div
        className="flex gap-12 hover:[animation-play-state:paused]"
        style={{
          width: "max-content",
          animation: "carousel-scroll 30s linear infinite",
        }}
      >
        {/* Duplicamos los logos para un scroll infinito fluido */}
        {[...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS].map(
          (logo, index) => (
            <div
              key={`logo-${index}`}
              className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
            >
              <Image
                alt={logo.alt}
                className="h-10 md:h-12 w-auto object-contain filter brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
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
              /* Usamos -33.33% porque tenemos 3 copias del array original */
              transform: translateX(-33.333%);
            }
          }
        `}
      </style>
    </div>
  );
}