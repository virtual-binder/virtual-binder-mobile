export type CardPrices = {
  cardmarket_eur: {
    tendencia: number | null;
    media: number | null;
    tendencia_holo: number | null;
    actualizado: string | null;
  } | null;
  tcgplayer_usd: {
    por_acabado: Record<string, number>;
    actualizado: string | null;
  } | null;
};

export type RecognizedCard = {
  ocr: {
    nombre: string;
    numero: string | null;
    total_set: string | null;
  };
  origen?: 'tcgdex' | 'pokemontcg';
  carta: {
    id: string;
    nombre: string;
    expansion: string;
    numero: string | null;
    rareza: string | null;
    imagen: string | null;
  } | null;
  precios: CardPrices | null;
  aviso: string | null;
  recorte_png_base64?: string | null;
};

export type RecognitionResponse = {
  cartas: RecognizedCard[];
  total: number;
  aviso?: string;
};
