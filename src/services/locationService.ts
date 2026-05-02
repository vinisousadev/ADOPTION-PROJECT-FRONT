import axios from 'axios'
import type { BrazilianCity, BrazilianState } from '../types'

type IbgeStateResponse = {
  id: number
  nome: string
  sigla: string
}

type IbgeCityResponse = {
  id: number
  nome: string
}

const ibgeApi = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',
})

export async function getBrazilianStates(): Promise<BrazilianState[]> {
  const response = await ibgeApi.get<IbgeStateResponse[]>('/estados', {
    params: {
      orderBy: 'nome',
    },
  })

  return response.data.map((state) => ({
    id: state.id,
    name: state.nome,
    abbreviation: state.sigla,
  }))
}

export async function getCitiesByState(
  stateAbbreviation: string,
): Promise<BrazilianCity[]> {
  const response = await ibgeApi.get<IbgeCityResponse[]>(
    `/estados/${stateAbbreviation}/municipios`,
    {
      params: {
        orderBy: 'nome',
      },
    },
  )

  return response.data.map((city) => ({
    id: city.id,
    name: city.nome,
  }))
}
