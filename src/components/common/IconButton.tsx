import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  active = false,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizeClass = size === 'small' ? 'icon-btn-sm' : size === 'large' ? 'icon-btn-lg' : '';
  const activeClass = active ? 'active' : '';

  return (
    <button
      type="button"
      className={`icon-button ${sizeClass} ${activeClass} ${className}`}
      data-tooltip={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};
