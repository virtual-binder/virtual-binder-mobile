import { Image, StyleSheet, Text, View } from 'react-native';

import type { RecognizedCard } from '@/types/card';

function money(value: number | null, currency: 'EUR' | 'USD'): string | null {
  if (value === null) {
    return null;
  }
  return currency === 'EUR' ? `${value.toFixed(2)} €` : `$${value.toFixed(2)} USD`;
}

export function CardResult({ card, index }: { card: RecognizedCard; index: number }) {
  const crop = card.recorte_png_base64
    ? `data:image/png;base64,${card.recorte_png_base64}`
    : null;
  const remoteImage = card.carta?.imagen?.startsWith('http')
    ? card.carta.imagen
    : null;
  const image = crop ?? remoteImage;
  const marketTrend = money(card.precios?.cardmarket_eur?.tendencia ?? null, 'EUR');
  const tcgPrices = Object.entries(card.precios?.tcgplayer_usd?.por_acabado ?? {});

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Text style={styles.position}>CARTA {String(index + 1).padStart(2, '0')}</Text>
        {card.origen ? <Text style={styles.source}>{card.origen}</Text> : null}
      </View>

      <View style={styles.content}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.name}>{card.carta?.nombre || 'Carta no identificada'}</Text>
          <Text style={styles.set}>{card.carta?.expansion || 'Revisa el texto detectado'}</Text>
          {card.carta?.numero ? (
            <Text style={styles.meta}>N.º {card.carta.numero}</Text>
          ) : null}
          {card.carta?.rareza ? (
            <Text style={styles.meta}>{card.carta.rareza}</Text>
          ) : null}
          <Text style={styles.ocr}>
            OCR: {card.ocr.nombre || 'nombre no disponible'}
            {card.ocr.numero ? ` · ${card.ocr.numero}` : ''}
          </Text>
        </View>
      </View>

      {marketTrend || tcgPrices.length > 0 ? (
        <View style={styles.prices}>
          <Text style={styles.pricesTitle}>Precios de mercado</Text>
          {marketTrend ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cardmarket · tendencia</Text>
              <Text style={styles.priceValue}>{marketTrend}</Text>
            </View>
          ) : null}
          {tcgPrices.map(([finish, value]) => (
            <View style={styles.priceRow} key={finish}>
              <Text style={styles.priceLabel}>TCGplayer · {finish}</Text>
              <Text style={styles.priceValue}>{money(value, 'USD')}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {card.aviso ? <Text style={styles.warning}>{card.aviso}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F7FB',
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  position: {
    color: '#2A75BB',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  source: {
    color: '#637089',
    fontSize: 12,
  },
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  image: {
    width: 116,
    height: 162,
    borderRadius: 8,
    backgroundColor: '#E1E6EF',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#637089',
    fontSize: 12,
  },
  details: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: '#10213D',
    fontSize: 21,
    fontWeight: '800',
  },
  set: {
    color: '#44516A',
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: '#637089',
    fontSize: 13,
  },
  ocr: {
    color: '#637089',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  prices: {
    backgroundColor: '#E8EDF5',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  pricesTitle: {
    color: '#10213D',
    fontSize: 13,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceLabel: {
    color: '#44516A',
    fontSize: 12,
    flex: 1,
  },
  priceValue: {
    color: '#10213D',
    fontSize: 13,
    fontWeight: '700',
  },
  warning: {
    color: '#8A5A00',
    backgroundColor: '#FFF0C2',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    lineHeight: 18,
    overflow: 'hidden',
  },
});
