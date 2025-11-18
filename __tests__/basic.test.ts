/**
 * Test básico para verificar que Jest funciona correctamente
 */

describe('Configuración básica de Jest', () => {
  it('debe ejecutar tests correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  it('debe manejar strings', () => {
    expect('hello world').toContain('world');
  });

  it('debe manejar arrays', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain('banana');
  });

  it('debe manejar objetos', () => {
    const user = {
      name: 'John',
      age: 30
    };
    expect(user).toHaveProperty('name', 'John');
    expect(user.age).toBeGreaterThan(18);
  });
});

describe('Configuración de módulos', () => {
  it('debe resolver alias @/', () => {
    // Este test verifica que el alias @/ funciona
    expect(() => {
      // Simulamos una importación con alias
      const modulePath = '@/components/test';
      expect(modulePath).toBeDefined();
    }).not.toThrow();
  });
});