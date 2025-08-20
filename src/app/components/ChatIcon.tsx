import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';


const ChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
        <button
          className="
    relative overflow-visible
    w-14 h-14 
    bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800
    text-white 
    rounded-full border-4 border-white
    flex items-center justify-center 
    shadow-lg hover:shadow-2xl 
    transform hover:scale-110 hover:-translate-y-1 hover:rotate-3 active:scale-95
    transition-all duration-500 ease-in-out
  "
          onClick={() => setIsOpen(!isOpen)}
          aria-label="チャットを開く"
        >
          {/* 波紋エフェクト */}
          <span className="absolute inline-block w-full h-full rounded-full border-4 border-blue-400 animate-ping"></span>
          {/* アイコン */}
          <ChatBubbleLeftEllipsisIcon className="w-7 h-7 relative z-10 animate-bounce" />
        </button>

      </div >
    </>
  );
};

export default ChatIcon;

