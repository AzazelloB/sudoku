import { ParentComponent } from 'solid-js';
import Button from '~/ui/ButtonGroup/Button';

interface GroupComponent {
  Button: typeof Button;
}

const ButtonGroup: ParentComponent & GroupComponent = (props) => {
  return (
    <div class="flex">
      {props.children}
    </div>
  );
};

ButtonGroup.Button = Button;

export default ButtonGroup;
