import {
  DialogTitle,
} from 'solid-headless';
import { ParentComponent } from 'solid-js';

const Title: ParentComponent = (props) => {
  return (
    <DialogTitle
      as="h3"
      class="mb-4 text-3xl font-medium text-black dark:text-white"
    >
      {props.children}
    </DialogTitle>
  );
};

export default Title;
