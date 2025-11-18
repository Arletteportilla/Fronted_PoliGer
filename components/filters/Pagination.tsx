import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
}: PaginationProps) {
  const pageNumbers = [];
  const maxPageButtons = 5; // Número máximo de botones de página a mostrar

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
      <TouchableOpacity
        onPress={prevPage}
        disabled={currentPage === 1}
        style={styles.button}
      >
        <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#000'} />
      </TouchableOpacity>

      {startPage > 1 && (
        <>
          <TouchableOpacity onPress={() => goToPage(1)} style={styles.button}>
            <Text style={styles.buttonText}>1</Text>
          </TouchableOpacity>
          {startPage > 2 && <Text style={styles.ellipsis}>...</Text>}
        </>
      )}

      {pageNumbers.map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => goToPage(page)}
          style={[styles.button, currentPage === page && styles.activeButton]}
        >
          <Text style={[styles.buttonText, currentPage === page && styles.activeButtonText]}>
            {page}
          </Text>
        </TouchableOpacity>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <Text style={styles.ellipsis}>...</Text>}
          <TouchableOpacity onPress={() => goToPage(totalPages)} style={styles.button}>
            <Text style={styles.buttonText}>{totalPages}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={nextPage}
        disabled={currentPage === totalPages}
        style={styles.button}
      >
        <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#000'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  activeButtonText: {
    color: '#fff',
  },
  ellipsis: {
    fontSize: 16,
    marginHorizontal: 4,
  },
});
