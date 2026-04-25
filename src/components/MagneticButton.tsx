import { useRef, MouseEvent, ReactNode } from 'react';
import gsap from 'gsap';

export function MagneticButton({ children, className = "", onClick }: { children: ReactNode, className?: string, onClick?: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current || !textRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const pullX = (x - centerX) * 0.4;
    const pullY = (y - centerY) * 0.4;

    gsap.to(btnRef.current, {
      x: pullX,
      y: pullY,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(textRef.current, {
      x: pullX * 0.5,
      y: pullY * 0.5,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    if (!btnRef.current || !textRef.current) return;

    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)"
    });

    gsap.to(textRef.current, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)"
    });
  };

  return (
    <div className="relative inline-block cursor-pointer px-4 py-4 -ml-4">
      <button
        ref={btnRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`relative flex items-center justify-center rounded-full border border-border-dark bg-transparent overflow-hidden group ${className}`}
      >
        <div className="absolute inset-x-0 bottom-0 top-[101%] bg-text-primary rounded-[50%] group-hover:top-0 group-hover:rounded-none transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] z-0"></div>
        <span ref={textRef} className="relative z-10 text-text-primary font-sans text-[10px] tracking-[1px] uppercase group-hover:text-bg-dark transition-colors duration-300">
          {children}
        </span>
      </button>
    </div>
  );
}
