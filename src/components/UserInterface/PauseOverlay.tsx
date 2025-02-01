import React from 'react';

import { localization } from '../../localization';

export const pauseOverlay = (
  <div className="absolute inset-0 flex h-screen w-screen items-center justify-center bg-black/70 text-center text-4xl">
    <div className="flex flex-col gap-8">
      {localization.paused}
      <span>
        {localization.pressKeyToResume(
          <span className="rounded-xl bg-white p-px text-black">
            {localization.esc}
          </span>,
        )}
      </span>
    </div>
  </div>
);
