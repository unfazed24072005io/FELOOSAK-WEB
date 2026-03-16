import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
import { api, Invoice } from "@/lib/api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: Colors.textTertiary + "20", text: Colors.textSecondary },
  sent: { bg: Colors.info + "20", text: Colors.info },
  paid: { bg: Colors.ok + "20", text: Colors.ok },
  overdue: { bg: Colors.bad + "20", text: Colors.bad },
};

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = user?.region === "AE" ? "AED" : "EGP";

  const loadInvoices = useCallback(async () => {
    try {
      const data = await api.invoices.list();
      setInvoices(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) loadInvoices();
    }, [user, loadInvoices])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleDelete = (id: number, no: string) => {
    Alert.alert("Delete Invoice", `Remove ${no}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.invoices.delete(id);
            loadInvoices();
          } catch {}
        },
      },
    ]);
  };

  const handleStatusChange = async (invoice: Invoice) => {
    const statusFlow = ["draft", "sent", "paid"];
    const currentIdx = statusFlow.indexOf(invoice.status);
    if (currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      try {
        await api.invoices.update(invoice.id, { status: nextStatus });
        loadInvoices();
      } catch {}
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to view invoices</Text>
        </View>
      </View>
    );
  }

  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

  const renderInvoice = ({ item }: { item: Invoice }) => {
    const total = parseFloat(item.total) || 0;
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.draft;

    return (
      <Pressable
        style={({ pressed }) => [styles.invoiceCard, pressed && { opacity: 0.95 }]}
        onPress={() => handleStatusChange(item)}
        onLongPress={() => handleDelete(item.id, item.invoiceNo)}
      >
        <View style={styles.invoiceHeader}>
          <View>
            <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
            <Text style={styles.invoiceDate}>{item.invoiceDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.invoiceFooter}>
          <View style={styles.invoiceAmounts}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>{parseFloat(item.subtotal || "0").toLocaleString()}</Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>VAT</Text>
              <Text style={styles.amountValue}>{parseFloat(item.vatAmount || "0").toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.invoiceTotal}>
            {total.toLocaleString()} {currency}
          </Text>
        </View>
        {item.status !== "paid" && (
          <Text style={styles.tapHint}>Tap to advance status</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>Invoices</Text>
          <Text style={styles.screenSub}>
            {invoices.length} total · {totalOutstanding.toLocaleString()} {currency} outstanding
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
          scrollEnabled={invoices.length > 0}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="file-text" size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No invoices yet</Text>
              <Text style={styles.emptyText}>Invoices created on web will appear here</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  screenSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
  },
  invoiceCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  invoiceNo: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  invoiceDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  invoiceAmounts: {
    gap: 4,
  },
  amountItem: {
    flexDirection: "row",
    gap: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    width: 55,
  },
  amountValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  invoiceTotal: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  tapHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
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
