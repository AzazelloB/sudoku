import classNames from 'classnames';

const Button = (props) => {
  return (
    <button
      {...props}
      type="button"
      class={classNames(
        props.class,
        'px-4 py-2 rounded-md text-white  hover:bg-primary-dark transition-colors duration-200',
        {
          'bg-primary': !props.variant && !props.active,
          'bg-primary-dark': !props.variant && props.active,
          'bg-transparent': props.variant === 'tertiary' && !props.active,
        },
      )}
      />
  );
};

export default Button;
