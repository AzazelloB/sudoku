import classNames from 'classnames';

const Button = (props) => {
  return (
    <button
      {...props}
      type="button"
      class={classNames(
        props.class,
        'px-4 py-2 rounded-md hover:bg-primary-dark hover:text-white transition-colors duration-200',
        {
          'bg-primary': !props.variant && !props.active,
          'bg-primary-dark': !props.variant && props.active,
          'bg-transparent': props.variant === 'tertiary' && !props.active,
          'text-white': !props.variant,
          'text-black dark:text-white': props.variant === 'tertiary',
        },
      )}
      />
  );
};

export default Button;
