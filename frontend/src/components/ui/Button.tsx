import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm';
  isLoading?: boolean;
  as?: 'button' | 'label';
  htmlFor?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  isLoading = false, 
  as = 'button',
  className, 
  htmlFor,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-card text-text-primary border border-border hover:bg-border",
    ghost: "hover:bg-border/50 text-text-primary"
  };

  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-xs"
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`.trim();

  const content = (
    <>
      {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
      )}
      {children}
    </>
  );

  if (as === 'label') {
    const labelProps = props as any;
    return (
      <label htmlFor={htmlFor} className={finalClassName} {...labelProps}>
        {content}
      </label>
    );
  }

  return (
    <button
      className={finalClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;