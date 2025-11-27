import React from 'react';
import NotificationBadge from './NotificationBadge';

const ChatButton = ({ unreadCount, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center px-3 py-2 text-sm font-medium
        text-white bg-gradient-to-r from-orange-500 to-orange-600
        hover:from-orange-600 hover:to-orange-700
        rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        shadow-md hover:shadow-lg transform hover:scale-105
        ${className}
      `}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Chat
      <NotificationBadge count={unreadCount} />
    </button>
  );
};

export default ChatButton;
