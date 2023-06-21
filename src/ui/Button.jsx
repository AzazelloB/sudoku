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
          'bg-primary-dark': props.active,
          'bg-primary': !props.active,
        },
      )}
    >
      {props.children}
    </button>
  );
};

export default Button;
