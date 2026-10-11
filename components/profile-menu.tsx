'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { people, type Person } from '@/lib/store';

export function ProfileMenu({ person, disabled, locked, onChange }: { person: Person; disabled: boolean; locked: boolean; onChange: (person: Person) => void }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<Person>(person);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>(`[data-name="${highlight}"]`)?.focus();
  }, [open, highlight]);

  function choose(name: Person) {
    onChange(name);
    setOpen(false);
    trigger.current?.focus();
  }

  function onListKey(event: React.KeyboardEvent) {
    const index = people.indexOf(highlight);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : people.length - 1;
      setHighlight(people[(index + step) % people.length]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setHighlight(people[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      setHighlight(people[people.length - 1]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(highlight);
    }
  }

  return (
    <div className={open ? 'person-select open' : 'person-select'} ref={root}>
      <button
        ref={trigger}
        type="button"
        className="person-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={locked ? `${person}, signed-in profile` : 'Select profile'}
        data-tour="profile"
        disabled={disabled}
        onClick={() => { setHighlight(person); setOpen((value) => !value); }}
      >
        <span className="avatar small" aria-hidden="true">{person[0]}</span>
        <span>{person}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} className="person-menu" role="listbox" aria-label="Profiles" tabIndex={-1} onKeyDown={onListKey}>
          {people.map((name) => (
            <li key={name}>
              <button type="button" role="option" data-name={name} aria-selected={name === highlight} className={name === person ? 'current' : undefined} onClick={() => choose(name)}>
                <span className="avatar small" aria-hidden="true">{name[0]}</span>
                {name}
                {name === person && <Check size={14} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
