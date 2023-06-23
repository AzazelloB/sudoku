import {
  DialogTitle,
} from 'solid-headless';

const Title = (props) => {
  return (
    <DialogTitle
      as="h3"
      class="text-3xl font-medium mb-4 text-black dark:text-white"
    >
      {props.children}
    </DialogTitle>
  );
};

export default Title;
