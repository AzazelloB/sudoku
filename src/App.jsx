import { Router, Route, Routes } from "@solidjs/router";

import { ROUTES } from '~/constants/routes';

import HomePage from '~/pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} component={HomePage} />
      </Routes>
    </Router>
  );
}

export default App;
