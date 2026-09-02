// src/components/CustomCursor.tsx — Amber ring cursor with smooth trailing lag

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId: number;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
        dotRef.current.style.opacity = "1";
      }
    };

    const onMouseDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(0.8)`;
      }
    };
    const onMouseUp = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(1)`;
      }
    };

    const onMouseEnterInteractive = () => {
      isHovering = true;
      if (ringRef.current) ringRef.current.classList.add("cursor-ring--hover");
    };
    const onMouseLeaveInteractive = () => {
      isHovering = false;
      if (ringRef.current) ringRef.current.classList.remove("cursor-ring--hover");
    };

    // Attach hover detection to all interactive elements
    const addHoverListeners = () => {
      document
        .querySelectorAll("button, a, input, textarea, [role=button], label")
        .forEach((el) => {
          el.addEventListener("mouseenter", onMouseEnterInteractive);
          el.addEventListener("mouseleave", onMouseLeaveInteractive);
        });
    };
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      const ease = isHovering ? 0.2 : 0.12;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
