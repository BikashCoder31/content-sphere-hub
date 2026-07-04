interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64,
};

/**
 * Content Sphere Hub Logo - Globe with Document
 */
export function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
  const pixelSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Globe background */}
        <circle cx="32" cy="32" r="28" fill="#7BC4E8" />
        
        {/* Globe outline */}
        <circle cx="32" cy="32" r="28" stroke="#2B5F8A" strokeWidth="3" fill="none" />
        
        {/* Latitude lines */}
        <ellipse cx="32" cy="20" rx="24" ry="6" stroke="#2B5F8A" strokeWidth="2" fill="none" />
        <ellipse cx="32" cy="32" rx="28" ry="8" stroke="#2B5F8A" strokeWidth="2" fill="none" />
        <ellipse cx="32" cy="44" rx="24" ry="6" stroke="#2B5F8A" strokeWidth="2" fill="none" />
        
        {/* Longitude lines */}
        <ellipse cx="32" cy="32" rx="10" ry="28" stroke="#2B5F8A" strokeWidth="2" fill="none" />
        <line x1="32" y1="4" x2="32" y2="60" stroke="#2B5F8A" strokeWidth="2" />
        
        {/* Document */}
        <rect x="20" y="22" width="24" height="28" rx="2" fill="white" stroke="#2B5F8A" strokeWidth="2" />
        
        {/* Document fold */}
        <path d="M38 22 L44 28 L38 28 Z" fill="#E8F4FC" stroke="#2B5F8A" strokeWidth="1.5" />
        
        {/* Document lines */}
        <line x1="25" y1="34" x2="39" y2="34" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="40" x2="37" y2="40" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="46" x2="35" y2="46" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
      </svg>
      
      {showText && (
        <span className="font-bold text-secondary-900 dark:text-white whitespace-nowrap">
          Content Sphere Hub
        </span>
      )}
    </div>
  );
}

/**
 * Simple icon version for favicon and small spaces
 */
export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  const pixelSize = sizeMap[size];

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Globe background */}
      <circle cx="32" cy="32" r="28" fill="#7BC4E8" />
      
      {/* Globe outline */}
      <circle cx="32" cy="32" r="28" stroke="#2B5F8A" strokeWidth="3" fill="none" />
      
      {/* Latitude lines */}
      <ellipse cx="32" cy="20" rx="24" ry="6" stroke="#2B5F8A" strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="32" rx="28" ry="8" stroke="#2B5F8A" strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="44" rx="24" ry="6" stroke="#2B5F8A" strokeWidth="2" fill="none" />
      
      {/* Longitude lines */}
      <ellipse cx="32" cy="32" rx="10" ry="28" stroke="#2B5F8A" strokeWidth="2" fill="none" />
      <line x1="32" y1="4" x2="32" y2="60" stroke="#2B5F8A" strokeWidth="2" />
      
      {/* Document */}
      <rect x="20" y="22" width="24" height="28" rx="2" fill="white" stroke="#2B5F8A" strokeWidth="2" />
      
      {/* Document fold */}
      <path d="M38 22 L44 28 L38 28 Z" fill="#E8F4FC" stroke="#2B5F8A" strokeWidth="1.5" />
      
      {/* Document lines */}
      <line x1="25" y1="34" x2="39" y2="34" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="40" x2="37" y2="40" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="46" x2="35" y2="46" stroke="#2B5F8A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default Logo;
