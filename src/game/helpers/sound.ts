function changeFrequencyBySemitones(frequency: number, semitones: number): number {
  const semitoneRatio = Math.pow(2, semitones / 12);
  return frequency * semitoneRatio;
}

export function getNoteDownScaleIonian(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;
  const semitoneSteps = [0, 2, 4, 5, 7, 9, 11];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * 12;
  return changeFrequencyBySemitones(1, semitone + noteOffset);
}

export function getNoteDownScalePhrygian(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;
  const semitoneSteps = [0, -2, -4, -5, -7, -9, -11];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * 12;
  return changeFrequencyBySemitones(1, semitone + noteOffset);
}

export function getNoteUpScalePentatonic(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;
  const semitoneSteps = [0, 2, 4, 7, 9];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * 12;
  return changeFrequencyBySemitones(0.5, semitone + noteOffset);
}

export function getNoteDownScalePentatonic(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;
  const semitoneSteps = [0, -3, -5, -7, -10];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * -12;
  return changeFrequencyBySemitones(4, semitone + noteOffset);
}

export function getNoteUpScaleSakura(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;
  const semitoneSteps = [0, 2, 3, 7, 8];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * 12;
  return changeFrequencyBySemitones(1, semitone + noteOffset);
}

export function getNoteDownScaleSakura(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  const semitoneSteps = [0, -4, -5, -9, -10];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * -12;

  return changeFrequencyBySemitones(4, semitone + noteOffset);
}
export function getNoteDownScaleTankTheme(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  const semitoneSteps = [0, -4, -5, -7, -9];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * -12;

  return changeFrequencyBySemitones(4, semitone + noteOffset);
}


export function getNoteDownScaleCrystal4(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  const semitoneSteps = [0, -3, -6, -8];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * -12;

  return changeFrequencyBySemitones(4, semitone + noteOffset);
}
export function getNoteDownScaleCrystal5(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  const semitoneSteps = [0, -1, -3, -6, -8];
  const semitone = semitoneSteps[noteIndex % semitoneSteps.length] + Math.floor(noteIndex / semitoneSteps.length) * -12;

  return changeFrequencyBySemitones(4, semitone + noteOffset);
}

export function getNoteHarmonicSeriesDown(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  if (noteIndex < 0) {
    throw new Error('Index must be greater than 0');
  }

  return 8 / (noteIndex + 1);
}

export function getNoteHarmonicSeriesUp(params: { noteIndex: number; noteoffset: number }): number {
  const { noteIndex, noteoffset } = params;

  if (noteIndex < 0) {
    throw new Error('Index must be greater than 0');
  }

  return (noteIndex + 1) / 8;
}

export function getNoteHarmonicSeriesCustom(params: { noteIndex: number; noteOffset: number }): number {
  const { noteIndex, noteOffset } = params;

  const startPoint = 11;

  return getNoteHarmonicSeriesUp({
    noteIndex: startPoint - noteIndex,
    noteoffset: noteOffset,
  });
}

export function getVolumeFromMultiplier(multiplier: number): number {
  const volume = 3 * (0.013 * Math.pow(multiplier, 1.5) + 0.3);

  return volume;
}

export function getDistanceVolumeMultiplier(distance: number): number {
  return 1 / (distance / 200 + 1);
}
