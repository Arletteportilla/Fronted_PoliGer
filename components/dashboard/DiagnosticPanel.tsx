import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface DiagnosticInfo {
  authStatus: string;
  userInfo: any;
  permissions: any;
  sessionInfo: any;
  errors: string[];
}

export const DiagnosticPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo>({
    authStatus: 'Checking...',
    userInfo: null,
    permissions: [],
    sessionInfo: null,
    errors: []
  });
  const [loading, setLoading] = useState(true);

  const runDiagnostics = async () => {
    setLoading(true);
    const errors: string[] = [];
    
    try {
      // Test 1: Authentication Status
      let authStatus = '❌ Not authenticated';
      let userInfo = null;
      let permissions: any = null;
      
      if (user) {
        authStatus = '✅ Authenticated';
        userInfo = {
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.profile?.rol || 'No role',
          isActive: user.is_active,
          dateJoined: user.date_joined
        };
        permissions = user.profile?.permisos || null;
      }

      // Test 2: Session Information
      let sessionInfo = null;
      try {
        // Check if we can access secure storage
        const { secureStore } = await import('@/services/secureStore');
        const token = await secureStore.getItem('authToken');
        const userData = await secureStore.getItem('user');
        
        sessionInfo = {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasUserData: !!userData,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        };
      } catch (error) {
        errors.push(`Session check error: ${(error as Error).message}`);
      }

      setDiagnosticInfo({
        authStatus,
        userInfo,
        permissions,
        sessionInfo,
        errors
      });

    } catch (error) {
      errors.push(`General diagnostic error: ${(error as Error).message}`);
      setDiagnosticInfo(prev => ({ ...prev, errors }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const testLogout = () => {
    Alert.alert(
      'Test Logout',
      'This will log you out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', 'Logged out successfully');
            } catch (error) {
              Alert.alert('Error', `Logout failed: ${(error as Error).message}`);
            }
          }
        }
      ]
    );
  };

  const clearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'This will clear all stored data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { secureStore } = await import('@/services/secureStore');
              await secureStore.removeItem('authToken');
              await secureStore.removeItem('user');
              Alert.alert('Success', 'Storage cleared');
              runDiagnostics();
            } catch (error) {
              Alert.alert('Error', `Clear failed: ${(error as Error).message}`);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={48} color="#e9ad14" />
        <Text style={styles.loadingText}>Running diagnostics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Diagnostic Panel</Text>
        <Text style={styles.subtitle}>System health and authentication diagnostics</Text>
      </View>

      {/* Authentication Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Authentication Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, diagnosticInfo.authStatus.includes('✅') ? styles.success : styles.error]}>
            {diagnosticInfo.authStatus}
          </Text>
        </View>
        
        {diagnosticInfo.userInfo && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>Username: {diagnosticInfo.userInfo.username}</Text>
            <Text style={styles.userInfoText}>Email: {diagnosticInfo.userInfo.email}</Text>
            <Text style={styles.userInfoText}>Name: {(diagnosticInfo.userInfo.firstName || '').trim()} {(diagnosticInfo.userInfo.lastName || '').trim()}</Text>
            <Text style={styles.userInfoText}>Role: {diagnosticInfo.userInfo.role}</Text>
            <Text style={styles.userInfoText}>Active: {diagnosticInfo.userInfo.isActive ? 'Yes' : 'No'}</Text>
            <Text style={styles.userInfoText}>Joined: {new Date(diagnosticInfo.userInfo.dateJoined).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      {/* Permissions */}
      {diagnosticInfo.permissions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Permissions</Text>
          {Object.entries(diagnosticInfo.permissions).map(([module, actions]: [string, any]) => (
            <View key={module} style={styles.permissionRow}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>
                {module}: {typeof actions === 'object' ? Object.entries(actions).filter(([, v]) => v).map(([k]) => k).join(', ') : String(actions)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Session Information */}
      {diagnosticInfo.sessionInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Session Information</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Has Token:</Text>
            <Text style={[styles.statusValue, diagnosticInfo.sessionInfo.hasToken ? styles.success : styles.error]}>
              {diagnosticInfo.sessionInfo.hasToken ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Token Length:</Text>
            <Text style={styles.statusValue}>{diagnosticInfo.sessionInfo.tokenLength}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Has User Data:</Text>
            <Text style={[styles.statusValue, diagnosticInfo.sessionInfo.hasUserData ? styles.success : styles.error]}>
              {diagnosticInfo.sessionInfo.hasUserData ? 'Yes' : 'No'}
            </Text>
          </View>
          <Text style={styles.tokenPreview}>Token Preview: {diagnosticInfo.sessionInfo.tokenPreview}</Text>
        </View>
      )}

      {/* Errors */}
      {diagnosticInfo.errors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ Errors</Text>
          {diagnosticInfo.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={runDiagnostics}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Refresh Diagnostics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={testLogout}>
          <Ionicons name="log-out" size={20} color="#e9ad14" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Test Logout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearStorage}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Clear Storage</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Diagnostic panel for troubleshooting authentication and system issues
        </Text>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#182d49',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  success: {
    color: '#28a745',
  },
  error: {
    color: '#dc3545',
  },
  userInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 12,
    color: '#182d49',
    marginLeft: 8,
  },
  tokenPreview: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ad14',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    minWidth: '30%',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ad14',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  secondaryButtonText: {
    color: '#e9ad14',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});

