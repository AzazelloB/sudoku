import { ParentComponent } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  MenuPositioner,
  MenuContent,
} from '@ark-ui/solid/menu';

const Content: ParentComponent = (props) => {
  return (
    <Portal>
      <MenuPositioner>
        <MenuContent
          class="overflow-hidden rounded-md bg-bgfg-200 shadow-lg dark:bg-bgfg-800"
        >
          {props.children}
        </MenuContent>
      </MenuPositioner>
    </Portal>
  );
};

export default Content;
