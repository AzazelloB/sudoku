import { ParentComponent } from 'solid-js';

type ChildProps = any;

const Child: ParentComponent<ChildProps> = (props) => {
  return (
    <div>
      {props.children}
    </div>
  );
};

export default Child;
