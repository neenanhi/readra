// src/styles/BookshelfStyles.js
import { StyleSheet } from 'react-native';

import { COLORS } from './colors';
import { SPACING } from './spacing';
import { TEXT, FONT_FAMILY } from './typography';

export const BookshelfStyles = StyleSheet.create({
  // ── Container ──────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    paddingTop: SPACING.xxl,          // used to be 60
    paddingHorizontal: SPACING.md,     // used to be 20 (≈16+4)
    backgroundColor: COLORS.white,     // was "#fff"
  },

  // ── Search Bar + Profile Row ──────────────────────────────────────────────
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.mid,         // was 15
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderGray,    // was "#ccc"
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,     // was 10
    fontSize: 16,
    color: COLORS.textDark,            // was "#333"
    fontFamily: FONT_FAMILY.sansSerif,
  },

  iconButton: {
    marginLeft: SPACING.sm,            // was 8
    padding: SPACING.sm,               // was 8
    borderRadius: 8,
    backgroundColor: COLORS.backgroundGray, // was "#f0f0f0"
  },

  profileButton: {
    marginLeft: SPACING.sm,            // was 10
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.profileBg, // was "#7d819f"
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: COLORS.white,               // was "#fff"
    fontSize: 16,
    fontFamily: FONT_FAMILY.sansSerif,
  },

  // ── Headings ───────────────────────────────────────────────────────────────
  heading: {
    fontSize: 20,                      // kept as 20 for exact match
    fontWeight: 'bold',
    color: COLORS.primaryText,         // was default text "#333"
    marginVertical: SPACING.sm,        // was 10
    paddingHorizontal: SPACING.sm,     // was 10
    fontFamily: FONT_FAMILY.sansSerif,
  },

  // ── Book Card Styles ───────────────────────────────────────────────────────
  card: {
    width: '30%',
    margin: '1.5%',                    // leave as-is for percentage-based layout
    backgroundColor: COLORS.white,     // was '#fff'
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,        // was '#000'
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 150,
  },
  coverImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: SPACING.sm,               // was 8
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,            // was "#333"
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: FONT_FAMILY.sansSerif,
  },

  // ── FAB (Log a book) ───────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    right: SPACING.lg,                 // was 30
    bottom: SPACING.lg,                // was 40
    backgroundColor: COLORS.profileBg, // was "#7d819f"
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: COLORS.white,               // was "#fff"
    fontSize: 30,
    marginTop: -6,
    fontFamily: FONT_FAMILY.sansSerif,
  },

  // ── Modal (Log a book) ─────────────────────────────────────────────────────
  modalView: {
    marginTop: '60%',                  // keeps the same percentage
    marginHorizontal: SPACING.md,      // was 20
    backgroundColor: COLORS.white,     // was "#fff"
    padding: SPACING.md,               // was 20
    borderRadius: 15,
    shadowColor: COLORS.shadow,        // was "#000"
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,          // was 10
    color: COLORS.primaryText,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,             // slight gap above buttons
  },
  button: {
    backgroundColor: COLORS.profileBg, // was "#7d819f"
    paddingVertical: SPACING.sm,       // was 10
    paddingHorizontal: SPACING.lg,     // was 20
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.white,               // was "#fff"
    fontSize: 16,
    fontFamily: FONT_FAMILY.sansSerif,
  },

  // (There was a `cancel` style in your original, but it wasn’t used directly;
  // if you need a separate gray “cancel” background, add it here similarly:
  // cancel: { backgroundColor: COLORS.borderGray },
  // )

  // ── Camera Overlay (Scanner) ──────────────────────────────────────────────
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',  // dark overlay behind scanner
  },
  closeScanner: {
    position: 'absolute',
    top: SPACING.lg,                   // was 40
    left: SPACING.sm,                  // was 20
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: SPACING.sm,               // was 10
    borderRadius: 6,
  },
  closeText: {
    color: COLORS.white,               // was "#fff"
    fontSize: 16,
    fontFamily: FONT_FAMILY.sansSerif,
  },
  scannerHelper: {
    transform: [
      { scaleX: 1.5 },
      { scaleY: 1.2 },
    ],
  },

  // ── Dropdown (Log a book modal) ────────────────────────────────────────────
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.borderGray,    // was '#ccc'
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,     // was 10
    marginBottom: SPACING.lg,          // was 15
  },
  placeholderStyle: {
    fontSize: 16,
    color: COLORS.textLight,           // was '#999'
    fontFamily: FONT_FAMILY.sansSerif,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: COLORS.textDark,            // was '#333'
    fontFamily: FONT_FAMILY.sansSerif,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    fontFamily: FONT_FAMILY.sansSerif,
  },
});