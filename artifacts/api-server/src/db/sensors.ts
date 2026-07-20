export interface SalaData {
  ruido: number | null;
  presenca: boolean | null;
  ultimaAtualizacao: string | null;
}

export interface Database {
  [sala: string]: SalaData;
}

export const db: Database = {
  sala1: {
    ruido: null,
    presenca: null,
    ultimaAtualizacao: null,
  },
  sala2: {
    ruido: null,
    presenca: null,
    ultimaAtualizacao: null,
  },
};
