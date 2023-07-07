import {
  ParentComponent, Show, createSignal, onCleanup,
} from 'solid-js';

import Header from '~/components/Header';
import ReloadPrompt from '~/components/ReloadPrompt';

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
      <ReloadPrompt />

      <Show when={!isFS()}>
        <Header />
      </Show>

      <main class="px-8 py-2 lg:py-6">
        {props.children}
      </main>
    </>
  );
};

export default Layout;
