import {
  Route,
  Routes,
} from '@solidjs/router';

import { ROUTES } from '~/constants/routes';
import Layout from '~/components/Layout';

import HomePage from '~/pages';
import WhoamiPage from '~/pages/whoami';
import PlaygroundPage from '~/pages/playground';

function App() {
  return (
    <Routes base={import.meta.env.BASE_URL}>
      <Route path={ROUTES.HOME} element={<Layout><HomePage /></Layout>} />
      <Route path={ROUTES.WHOAMI} element={<WhoamiPage />} />
      <Route path={ROUTES.PLAYGROUND} element={<Layout><PlaygroundPage /></Layout>} />
    </Routes>
  );
}

export default App;
