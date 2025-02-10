import React from 'react';
import { localization } from '../../localization';

export const buttonClassName =
  'bg-white hover:bg-gray-200 p-4 rounded-sm text-black';

export function MenuLayout({
  title,
  children,
  onSetMode: handleSetMode,
}: {
  title: string;
  children?: React.ReactNode;
  onSetMode: (mode: Mode) => void;
}): React.ReactNode {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center text-3xl">
      <div className="flex flex-col gap-4">
        <h1 className="pb-4 text-6xl">{title}</h1>
        {children}
        <div className="flex flex-col gap-4">
          <button
            className={buttonClassName}
            type="button"
            onClick={(): void => handleSetMode('competitive')}
          >
            {localization.playCompetitive}
          </button>
          <button
            className={buttonClassName}
            type="button"
            onClick={(): void => handleSetMode('vampire')}
          >
            {localization.playVampire}
          </button>
          <button
            className={buttonClassName}
            type="button"
            onClick={(): void => handleSetMode('peaceful')}
          >
            {localization.playPeaceful}
          </button>
        </div>
      </div>
    </div>
  );
}
export type Mode = 'competitive' | 'none' | 'peaceful' | 'vampire';
