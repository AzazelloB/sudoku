import { Navigate } from '@solidjs/router';
import { Component } from 'solid-js';
import { ROUTES } from '~/constants/routes';

const WhoamiPage: Component = () => {
  window.open('https://github.com/AzazelloB/sudoku', '_blank');

  return <Navigate href={ROUTES.HOME} />;
};

export default WhoamiPage;
