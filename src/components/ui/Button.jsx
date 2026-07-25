import Spinner from '../common/Spinner';

/**
 * Composant Button du Design System
 * Variantes: primary, secondary, danger, ghost
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-sm rounded-xl gap-2'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" color="current" />}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
