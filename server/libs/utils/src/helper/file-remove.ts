import { existsSync, unlinkSync } from 'node:fs';

export const removeFile = (...pathes: string[]) => {
  pathes.map((path) => {
    if (path && existsSync(path)) {
      unlinkSync(path);
    }
  });
};
