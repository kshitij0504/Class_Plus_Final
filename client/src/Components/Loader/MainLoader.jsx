import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import book from "../../assets/books.png";
import chat from "../../assets/chat.png";
import pencil from "../../assets/pencil.png";
import group from "../../assets/166258.png";

const MainLoader = () => {
  const loaderRef = useRef(null);
  const bookRef = useRef(null);
  const chatRef = useRef(null);
  const pencilRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.to(bookRef.current, {
      rotation: 360,
      transformOrigin: "center",
      duration: 2,
      ease: "power2.inOut",
    })
      .to(
        chatRef.current,
        {
          rotation: 360,
          transformOrigin: "center",
          duration: 2,
          ease: "power2.inOut",
        },
        "-=2"
      )
      .to(
        pencilRef.current,
        {
          rotation: 360,
          transformOrigin: "center",
          duration: 2,
          ease: "power2.inOut",
        },
        "-=2"
      )
      .to(
        groupRef.current,
        {
          rotation: 360,
          transformOrigin: "center",
          duration: 2,
          ease: "power2.inOut",
        },
        "-=2"
      );

    gsap.to(loaderRef.current, {
      opacity: 0,
      duration: 1,
      delay: 3,
      ease: "power2.out",
      onComplete: () => {
        if (loaderRef.current) {
          loaderRef.current.style.display = "none";
        }
      },
    });

    return () => {
      gsap.killTweensOf([
        bookRef.current,
        chatRef.current,
        pencilRef.current,
        groupRef.current,
      ]);
      gsap.killTweensOf(loaderRef.current);
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="loader flex items-center justify-center h-screen bg-gray-900"
    >
      <div className="relative w-24 h-24">
        <div
          ref={bookRef}
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
        >
          <img src={book} alt="Book" className="w-8 h-8" />
        </div>
        <div
          ref={chatRef}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
        >
          <img src={chat} alt="Chat" className="w-8 h-8" />
        </div>
        <div
          ref={pencilRef}
          className="absolute left-0 top-1/2 transform -translate-y-1/2"
        >
          <img src={pencil} alt="Pencil" className="w-8 h-8" />
        </div>
        <div
          ref={groupRef}
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
        >
          <img src={group} alt="Group" className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default MainLoader;
