// Importa el tipo Vector3 para la conversión
import type { Vector3 } from './Vector3';

// Interfaz que define una carga puntual: id único, etiqueta, valor en coulombs y posición (x,y,z) en metros
export interface Charge {
  id: number;
  label: string;
  q: number;
  x: number;
  y: number;
  z: number;
}

// Convierte la posición de una carga a un Vector3 para operaciones vectoriales
export function chargeToVector3(c: Charge): Vector3 {
  return { x: c.x, y: c.y, z: c.z };
}

// Retorna +1 si la carga es positiva, -1 si es negativa (útil para determinar atracción/repulsión)
export function chargeSign(c: Charge): 1 | -1 {
  return c.q >= 0 ? 1 : -1;
}
