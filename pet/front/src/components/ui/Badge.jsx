import { cva } from "class-variance-authority"
import { cn } from '@/lib/utils';

const shadcnVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Adopted: 'bg-blue-50 text-blue-700 border-blue-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ApplicationReceived: 'bg-purple-50 text-purple-700 border-purple-200',
  UnderReview: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const variantStyles = {
  Urgent: 'bg-urgent text-white border-urgent animate-pulse-urgent',
  Nouveau: 'bg-nouveau text-white border-nouveau',
  SOS: 'bg-sos text-white border-sos',
};

function Badge({ status, variant, className = '', ...props }) {
  if (status) {
    const s = String(status).replace(/([A-Z])/g, ' $1').trim();
    const key = String(status).charAt(0).toUpperCase() + String(status).slice(1);
    return (
      <span className={cn('badge border', statusStyles[key] || 'bg-gray-50 text-gray-600 border-gray-200', className)}>
        {s}
      </span>
    );
  }
  if (variant && variantStyles[variant]) {
    const style = variantStyles[variant];
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', style, className)}>
        {variant}
      </span>
    );
  }
  return (
    <span className={cn(shadcnVariants({ variant }), className)} {...props} />
  );
}

export { Badge, shadcnVariants as badgeVariants };
export default Badge;
