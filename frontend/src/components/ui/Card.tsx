
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-card border border-border rounded-lg shadow-md p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";


export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => (
    <div className={`mb-4 ${className}`} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
    <h3 className={`text-lg font-semibold text-text-primary ${className}`} {...props}>{children}</h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
    <p className={`text-sm text-text-secondary ${className}`} {...props}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => (
    <div className={className} {...props}>{children}</div>
);


export default Card;
