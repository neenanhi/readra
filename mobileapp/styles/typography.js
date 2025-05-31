import { COLORS } from './colors';

export const FONT_FAMILY = {
  serif: 'georgia',
  sansSerif: 'serif',
};

export const TEXT = {
  h1: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primaryText,
    fontFamily: FONT_FAMILY.serif,
  },
  bodyLarge: {
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  bodySmall: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  cardSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.mutedText,
    fontFamily: FONT_FAMILY.sansSerif,
  },
};