import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount = 0,
  pageSize = 20,
  goToPage,
  nextPage,
  prevPage,
}: PaginationProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const pageNumbers = [];
  const maxPageButtons = 3; // Mostrar solo 3 botones de página

  // Calcular el rango de resultados mostrados
  const startResult = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <View style={styles.container}>
      {/* Texto de resultados */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Mostrando <Text style={styles.resultsTextBold}>{startResult}</Text> a{' '}
          <Text style={styles.resultsTextBold}>{endResult}</Text> de{' '}
          <Text style={styles.resultsTextBold}>{totalCount}</Text> resultados
        </Text>
      </View>

      {/* Botones de paginación */}
      <View style={styles.paginationButtons}>
        <TouchableOpacity
          onPress={prevPage}
          disabled={currentPage === 1}
          style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={currentPage === 1 ? colors.text.disabled : colors.text.secondary}
          />
        </TouchableOpacity>

        {pageNumbers.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => goToPage(page)}
            style={[styles.pageButton, currentPage === page && styles.pageButtonActive]}
          >
            <Text style={[styles.pageButtonText, currentPage === page && styles.pageButtonTextActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={nextPage}
          disabled={currentPage === totalPages}
          style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={currentPage === totalPages ? colors.text.disabled : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: colors.background.secondary, // Dynamic background
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  resultsTextBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  navButtonDisabled: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.light,
    opacity: 0.5,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  pageButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  pageButtonTextActive: {
    color: colors.background.primary,
    fontWeight: '700',
  },
});
