import React from 'react';

const NotificationBadge = ({ count, size = 'default' }) => {
  if (!count || count === 0) return null;

  const sizeClasses = {
    small: 'w-4 h-4 text-xs',
    default: 'w-5 h-5 text-xs',
    large: 'w-6 h-6 text-sm'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-red-500 text-white rounded-full flex items-center justify-center
        font-semibold animate-pulse
        absolute -top-1 -right-1
        min-w-[1rem] min-h-[1rem]
      `}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;
