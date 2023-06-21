import Button from '~/ui/ButtonGroup/Button';

const ButtonGroup = (props) => {
  return (
    <div class="flex">
      {props.children}
    </div>
  );
};

ButtonGroup.Button = Button;

export default ButtonGroup;
