import Spinner from './common/Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'btn border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500'
  };
  
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={`${classes} inline-flex items-center justify-center gap-2`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" color="current" />}
      {children}
    </button>
  );
};

export default Button;
