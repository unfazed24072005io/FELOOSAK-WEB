import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { api, Customer } from "@/lib/api";

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = user?.region === "AE" ? "AED" : "EGP";

  const loadCustomers = useCallback(async () => {
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) loadCustomers();
    }, [user, loadCustomers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete Customer", `Remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.customers.delete(id);
            loadCustomers();
          } catch {}
        },
      },
    ]);
  };

  const getTrustColor = (trust: number) => {
    if (trust >= 70) return Colors.ok;
    if (trust >= 40) return Colors.warn;
    return Colors.bad;
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to view customers</Text>
        </View>
      </View>
    );
  }

  const renderCustomer = ({ item }: { item: Customer }) => {
    const owed = parseFloat(item.owed) || 0;
    const paid = parseFloat(item.paid) || 0;
    const net = owed - paid;

    return (
      <Pressable
        style={({ pressed }) => [styles.customerCard, pressed && { opacity: 0.95 }]}
        onLongPress={() => handleDelete(item.id, item.name)}
      >
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>
            {item.phone ? (
              <Text style={styles.customerPhone}>{item.phone}</Text>
            ) : null}
          </View>
          <View style={styles.trustBadge}>
            <View style={[styles.trustDot, { backgroundColor: getTrustColor(item.trust) }]} />
            <Text style={[styles.trustText, { color: getTrustColor(item.trust) }]}>
              {item.trust}%
            </Text>
          </View>
        </View>
        <View style={styles.customerFooter}>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>Owed</Text>
            <Text style={[styles.amountValue, { color: Colors.warn }]}>
              {owed.toLocaleString()} {currency}
            </Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: Colors.ok }]}>
              {paid.toLocaleString()} {currency}
            </Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>Net</Text>
            <Text style={[styles.amountValue, { color: net > 0 ? Colors.bad : Colors.ok }]}>
              {net > 0 ? "-" : "+"}{Math.abs(net).toLocaleString()} {currency}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Customers</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push("/add-customer")}>
          <Feather name="plus" size={20} color={Colors.accent} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
          scrollEnabled={customers.length > 0}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No customers yet</Text>
              <Text style={styles.emptyText}>Add customers to track balances</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
  },
  customerCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  customerAvatarText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.accent,
    fontFamily: "Inter_700Bold",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  customerPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trustText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  customerFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  amountCol: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
});
