import {
  createContext as createContextSolid,
  useContext as useContextSolid,
} from 'solid-js';

class ContextOutOfProvider extends Error {
  constructor(fn) {
    const fName = fn.name.replace(/^use(\w)(\w+)state$/i, (_, firstLetter, rest) => firstLetter.toUpperCase() + rest);
    const message = `'use${fName}Context' must be used within '${fName}Provider'`;

    super(message);
  }
}

/** Naming convention for stateCreators is `use[StateName]state` */
export function createContext(stateCreator) {
  const Context = createContextSolid(undefined);

  const Provider = (props) => (
    <Context.Provider value={stateCreator(props)}>
      { props.children }
    </Context.Provider>
  );

  const useContext = () => {
    const context = useContextSolid(Context);

    if (context === undefined) {
      throw new ContextOutOfProvider(stateCreator);
    }

    return context;
  };

  return [Provider, useContext];
}
