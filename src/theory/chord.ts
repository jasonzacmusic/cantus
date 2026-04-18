import * as Tone from 'tone';
import type { ScaleId } from './types';
import { NOTES_SHARP, NOTES_FLAT, SCALES } from './scales';
import { INTERVAL_NAMES } from './moves';

export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

export function pitchName(rootIdx: number, useFlats: boolean): string {
  return (useFlats ? NOTES_FLAT : NOTES_SHARP)[mod12(rootIdx)];
}

export function asciiName(rootIdx: number, useFlats: boolean): string {
  return pitchName(rootIdx, useFlats).replace('♯', '#').replace('♭', 'b');
}

export function preferFlats(rootIdx: number, scaleId: ScaleId): boolean {
  const majorFlats = [5, 10, 3, 8, 1, 6];
  const minorFlats = [2, 7, 0, 5, 10, 3];
  const scale = SCALES[scaleId];
  if (!scale) return false;
  const isMajorFam = scale.steps[2] === 4;
  return (isMajorFam ? majorFlats : minorFlats).includes(mod12(rootIdx));
}

export function isMajorFamily(scaleId: ScaleId): boolean {
  const s = SCALES[scaleId];
  return !!s && s.steps[2] === 4;
}

export function voicingMidi(
  rootMidi: number,
  scaleId: ScaleId,
  stepSize: number,
  startDegree = 0,
): number[] {
  const steps = SCALES[scaleId].steps;
  const len = steps.length;
  return [0, stepSize, stepSize * 2].map(step => {
    const scaleStep = step + startDegree;
    const i = scaleStep % len;
    const oct = Math.floor(scaleStep / len) * 12;
    return rootMidi + steps[i] + oct;
  });
}

export function voicingIntervals(
  scaleId: ScaleId,
  stepSize: number,
  startDegree = 0,
): string[] {
  const labs = SCALES[scaleId].labels;
  const len = labs.length;
  return [0, stepSize, stepSize * 2].map(step => labs[(step + startDegree) % len]);
}

export function chordNameFor(
  rootIdx: number,
  scaleId: ScaleId,
  useFlats: boolean,
): string {
  const s = SCALES[scaleId];
  return pitchName(rootIdx, useFlats) + (s ? s.suffix : '');
}

export function intervalBetween(m1: number, m2: number): string {
  let diff = m2 - m1;
  while (diff >  6) diff -= 12;
  while (diff < -6) diff += 12;
  const abs = Math.abs(diff);
  const name = INTERVAL_NAMES[abs] || '·';
  const arrow = diff === 0 ? '=' : diff > 0 ? '↑' : '↓';
  return `${arrow}${name}`;
}

export function notesToToneNames(midiArr: number[]): string[] {
  return midiArr.map(m => Tone.Frequency(m, 'midi').toNote());
}

export function displayMidi(m: number): number {
  let d = m;
  while (d < 60) d += 12;
  while (d > 84) d -= 12;
  return d;
}
