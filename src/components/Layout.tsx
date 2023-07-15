import {
  ParentComponent, Show,
} from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';

import Header from '~/components/Header';
import ReloadPrompt from '~/components/ReloadPrompt';
import SpellCaster from '~/components/SpellCaster';

const Layout: ParentComponent = (props) => {
  const { isFS } = useGlobalContext();

  return (
    <>
      <ReloadPrompt />

      <SpellCaster />

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
