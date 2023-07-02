import { ParentComponent } from 'solid-js';

import Header from './Header';

const Layout: ParentComponent = (props) => {
  return (
    <>
      <Header />

      <main class="px-8 py-6">
        {props.children}
      </main>
    </>
  );
};

export default Layout;
