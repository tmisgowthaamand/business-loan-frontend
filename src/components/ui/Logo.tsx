import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero' | 'ultra' | 'mega';
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  alt = 'Company Logo' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'h-12 w-12'; // 48px
      case 'medium':
        return 'h-16 w-16'; // 64px
      case 'large':
        return 'h-20 w-20'; // 80px
      case 'hero':
        return 'h-24 w-24'; // 96px
      case 'ultra':
        return 'h-32 w-32'; // 128px
      case 'mega':
        return 'h-40 w-40'; // 160px
      default:
        return 'h-16 w-16';
    }
  };

  return (
    <img 
      src="/generated-image 1.png" 
      alt={alt}
      className={`${getSizeClass()} object-contain ${className}`}
      style={{ 
        filter: 'brightness(1.1) contrast(1.2) saturate(1.05)',
        imageRendering: 'crisp-edges',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    />
  );
};

export default Logo;
