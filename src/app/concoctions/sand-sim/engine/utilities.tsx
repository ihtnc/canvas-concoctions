import { type ParticleValue } from "./types";
import ENGINE_DATA from './data';

export const isValueUndefinedOrNotEmpty = (particle?: ParticleValue): boolean => {
  return particle === undefined || !isValueEmpty(particle);
}

export const isValueEmpty = (particle: ParticleValue): boolean => {
  return particle.color === undefined || particle.value === ENGINE_DATA.EmptyParticle.value;
}
