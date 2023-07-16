interface Shortcut {
  code: KeyboardEvent['code'];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export const onShortcut = (e: KeyboardEvent, callback: CallableFunction, shortcut: Shortcut) => {
  if (shortcut.code !== e.code) {
    return;
  }

  const ctrl = e.ctrlKey || e.metaKey;
  if ((!!shortcut.ctrl) !== ctrl) {
    return;
  }

  if ((!!shortcut.alt) !== e.altKey) {
    return;
  }

  const shift = e.shiftKey && !(e.code === 'ShiftLeft' || e.code === 'ShiftRight');

  if ((!!shortcut.shift) !== shift) {
    return;
  }

  if (canRedefineControls(shortcut)) {
    e.preventDefault();

    callback();
  }
};

const aNoNoList = ['Tab', 'Enter', 'Space', 'Escape'];

export const canRedefineControls = (shortcut: Shortcut) => {
  if (document.activeElement?.tagName === 'INPUT') {
    return false;
  }

  if (!aNoNoList.includes(shortcut.code)) {
    return true;
  }

  return document.activeElement?.tagName !== 'BUTTON'
      && document.activeElement?.getAttribute('data-scope') !== 'menu';
};
