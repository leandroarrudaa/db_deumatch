
// IBGE API Integration for 100% accuracy

export interface State {
  id: number;
  sigla: string;
  nome: string;
}

export interface City {
  id: number;
  nome: string;
}

// Cache to prevent unnecessary requests
let statesCache: State[] | null = null;
const citiesCache: Record<string, string[]> = {};

export const fetchStates = async (): Promise<State[]> => {
  if (statesCache) return statesCache;

  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    const data = await response.json();
    statesCache = data.map((uf: any) => ({
      id: uf.id,
      sigla: uf.sigla,
      nome: uf.nome
    }));
    return statesCache || [];
  } catch (error) {
    console.error("Erro ao buscar estados:", error);
    return [];
  }
};

export const fetchCities = async (ufSigla: string): Promise<string[]> => {
  if (!ufSigla) return [];
  if (citiesCache[ufSigla]) return citiesCache[ufSigla];

  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios`);
    const data = await response.json();
    const cityNames = data.map((city: any) => city.nome);
    citiesCache[ufSigla] = cityNames;
    return cityNames;
  } catch (error) {
    console.error(`Erro ao buscar cidades para ${ufSigla}:`, error);
    return [];
  }
};

// Fallback constant for initial renders if needed, though API is preferred
export const BRAZIL_STATES_FALLBACK = [
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  // ... others
];
