import {
  DialogTitle,
} from '@ark-ui/solid/dialog';
import { ParentComponent } from 'solid-js';

const Title: ParentComponent = (props) => {
  return (
    <DialogTitle
      asChild
      class="mb-4 text-3xl font-medium text-black dark:text-white"
    >
      <h3>
        {props.children}
      </h3>
    </DialogTitle>
  );
};

export default Title;
