import { Router, Route, Routes } from '@solidjs/router';

import { ROUTES } from '~/constants/routes';
import Layout from '~/components/Layout';

import HomePage from '~/pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<Layout><HomePage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
