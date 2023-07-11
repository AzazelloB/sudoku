import {
  Component,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';

import { useGlobalContext } from '~/context/GlobalContext';
import { onShortcut } from '~/utils/controls';

import Modal from '~/ui/Modal';
import Input from '~/ui/Input';

import { state } from '~/components/Board/state';

const SpellCaster: Component = () => {
  const { setTheme } = useGlobalContext();

  const [open, setOpen] = createSignal(false);
  const [spell, setSpell] = createSignal('');

  const handleKeyboardDown = (e: KeyboardEvent) => {
    onShortcut(e, () => {
      if (!state.showControls) {
        setOpen(true);
      }
    }, {
      code: 'Slash',
    });
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyboardDown);

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyboardDown);
    });
  });

  const handleInput = (e: Event) => {
    setSpell((e.target as HTMLInputElement).value);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    // TODO add avada kedavra
    switch (spell()) {
      case 'lumos':
        setTheme('light');
        break;

      case 'nox':
        setTheme('dark');
        break;

      case 'revelio':
        state.revealed = !state.revealed;
        break;

      default:
        break;
    }

    setOpen(false);
    setSpell('');
  };

  return (
    <Modal
      id="spell-caster"
      open={open}
      setOpen={setOpen}
    >
      <Modal.Content>
        {() => (
          <form
            class="flex flex-col"
            onSubmit={handleSubmit}
          >
            <label
              for="spellInput"
              class="mb-2"
            >
              Cast a spell:
            </label>

            <Input
              id="spellInput"
              value={spell()}
              onInput={handleInput}
              placeholder="You are a wizard, Harry!"
              autocomplete="off"
              spellcheck={false}
            />
          </form>
        )}
      </Modal.Content>
    </Modal>
  );
};

export default SpellCaster;
