import classNames from 'classnames';

const Button = (props) => {
  return (
    <button
      {...props}
      type="button"
      class={classNames(
        props.class,
        'px-4 py-2 rounded-md hover:bg-primary-dark hover:text-white transition-colors duration-200',
        // TODO use tailwind merge
        {
          'bg-primary': !props.variant && !props.active && !props.disabled,
          'bg-primary-dark': !props.variant && props.active && !props.disabled,
          'bg-transparent': props.variant === 'tertiary' && !props.active && !props.disabled,
          'text-white': !props.variant,
          'text-black dark:text-white': props.variant === 'tertiary',
          'bg-gray-600 hover:bg-gray-600': props.disabled,
        },
      )}
      />
  );
};

export default Button;
