import {
  ParentComponent, Show, createSignal, onCleanup,
} from 'solid-js';

import Header from '~/components/Header';

const Layout: ParentComponent = (props) => {
  const [isFS, setFS] = createSignal(!!document.fullscreenElement);

  const onFSChange = () => {
    setFS(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', onFSChange);

  onCleanup(() => {
    document.removeEventListener('fullscreenchange', onFSChange);
  });

  return (
    <>
      <Show when={!isFS()}>
        <Header />
      </Show>

      <main class="px-8 py-4 lg:py-6">
        {props.children}
      </main>
    </>
  );
};

export default Layout;
