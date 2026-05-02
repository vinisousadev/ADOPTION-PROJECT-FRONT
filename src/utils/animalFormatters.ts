import type { AgeUnit, AnimalResponse, AnimalSex, AnimalStatus, YesNo } from '../types'

const animalSizeLabels: Record<string, string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Medio',
  LARGE: 'Grande',
}

const animalSexLabels: Record<AnimalSex, string> = {
  F: 'Fêmea',
  M: 'Macho',
}

const animalStatusLabels: Record<AnimalStatus, string> = {
  AVAILABLE: 'Disponivel',
  ADOPTED: 'Adotado',
  REMOVED: 'Removido',
}

const yesNoLabels: Record<YesNo, string> = {
  Y: 'Sim',
  N: 'Nao',
}

export function formatAnimalAge(
  ageValue: number | undefined,
  ageUnit: AgeUnit | undefined,
) {
  if (ageValue === undefined || !ageUnit) {
    return 'Nao informada'
  }

  if (ageUnit === 'MONTHS') {
    return `${ageValue} ${ageValue === 1 ? 'mes' : 'meses'}`
  }

  return `${ageValue} ${ageValue === 1 ? 'ano' : 'anos'}`
}

export function formatAnimalSize(size: AnimalResponse['animalSize']) {
  if (!size) {
    return 'Nao informado'
  }

  return animalSizeLabels[size] ?? size
}

export function formatAnimalSex(sex: AnimalSex | undefined) {
  if (!sex) {
    return 'Nao informado'
  }

  return animalSexLabels[sex]
}

export function formatAnimalStatus(status: AnimalStatus) {
  return animalStatusLabels[status] ?? status
}

export function formatYesNo(value: YesNo) {
  return yesNoLabels[value]
}

export function formatAnimalWeight(weightKg: number | undefined) {
  if (weightKg === undefined) {
    return 'Nao informado'
  }

  return `${weightKg.toLocaleString('pt-BR')} kg`
}
