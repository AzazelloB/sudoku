import {
  ParentProps,
  createContext as createContextSolid,
  useContext as useContextSolid,
} from 'solid-js';

type StateHook<P, T extends object> = (props: P) => T;

class ContextOutOfProvider<P, T extends object> extends Error {
  constructor(fn: StateHook<P, T>) {
    const fName = fn.name.replace(/^use(\w)(\w+)state$/i, (_, firstLetter, rest) => firstLetter.toUpperCase() + rest);
    const message = `'use${fName}Context' must be used within '${fName}Provider'`;

    super(message);
  }
}

/** Naming convention for stateCreators is `use[StateName]state` */
export function createContext<P, T extends object>(stateCreator: StateHook<P, T>) {
  const Context = createContextSolid<ReturnType<StateHook<P, T>> | undefined>(undefined);

  const Provider = (props: ParentProps<P>) => (
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

  return [Provider, useContext] as const;
}
