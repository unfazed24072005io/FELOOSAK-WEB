import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
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
import { api, BookWithDetails, Transaction } from "@/lib/api";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [book, setBook] = useState<BookWithDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = user?.region === "AE" ? "AED" : "EGP";

  const loadData = useCallback(async () => {
    try {
      const books = await api.books.list();
      const found = books.find((b) => b.id === parseInt(id));
      if (found) {
        setBook(found);
        setTransactions(found.tx || []);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeleteTx = (txId: number) => {
    Alert.alert("Delete Transaction", "Remove this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.transactions.delete(txId);
            loadData();
          } catch {}
        },
      },
    ]);
  };

  const balance = transactions.reduce((sum, tx) => {
    const amt = parseFloat(tx.amount) || 0;
    return sum + (tx.type === "in" ? amt : -amt);
  }, 0);

  const totalIn = transactions
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalOut = transactions
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const getCategoryIcon = (cat: string): keyof typeof Feather.glyphMap => {
    const map: Record<string, keyof typeof Feather.glyphMap> = {
      Sales: "trending-up",
      Services: "briefcase",
      Investment: "bar-chart-2",
      Loan: "repeat",
      Other: "more-horizontal",
      Rent: "home",
      Salary: "users",
      Utilities: "zap",
      Supplies: "package",
      Transport: "truck",
      Food: "coffee",
      Marketing: "target",
    };
    return map[cat] || "circle";
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </View>
    );
  }

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const amount = parseFloat(item.amount) || 0;
    const isIn = item.type === "in";

    return (
      <Pressable
        style={({ pressed }) => [styles.txCard, pressed && { opacity: 0.95 }]}
        onLongPress={() => handleDeleteTx(item.id)}
      >
        <View style={[styles.txIcon, { backgroundColor: isIn ? Colors.ok + "15" : Colors.bad + "15" }]}>
          <Feather
            name={getCategoryIcon(item.category)}
            size={18}
            color={isIn ? Colors.ok : Colors.bad}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txCategory}>{item.category}</Text>
          <Text style={styles.txNote} numberOfLines={1}>
            {item.note || item.date}
          </Text>
          {item.payMode !== "cash" && (
            <Text style={styles.txPayMode}>{item.payMode}</Text>
          )}
        </View>
        <View style={styles.txAmountWrap}>
          <Text style={[styles.txAmount, { color: isIn ? Colors.ok : Colors.bad }]}>
            {isIn ? "+" : "-"}{amount.toLocaleString()}
          </Text>
          <Text style={styles.txDate}>{item.date}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {book?.icon} {book?.name}
          </Text>
          <Text style={styles.headerSub}>
            {book?.type === "business" ? "Business" : "Personal"}
          </Text>
        </View>
        <Pressable
          style={styles.addTxBtn}
          onPress={() =>
            router.push({
              pathname: "/add-transaction",
              params: { bookId: id },
            })
          }
        >
          <Feather name="plus" size={20} color={Colors.accent} />
        </Pressable>
      </View>

      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <Feather name="arrow-down-left" size={16} color={Colors.ok} />
          <View>
            <Text style={styles.balanceLabel}>Cash In</Text>
            <Text style={[styles.balanceValue, { color: Colors.ok }]}>
              {totalIn.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.balanceCard}>
          <Feather name="arrow-up-right" size={16} color={Colors.bad} />
          <View>
            <Text style={styles.balanceLabel}>Cash Out</Text>
            <Text style={[styles.balanceValue, { color: Colors.bad }]}>
              {totalOut.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={[styles.balanceCard, styles.netCard]}>
          <Text style={styles.balanceLabel}>Net</Text>
          <Text style={[styles.netValue, { color: balance >= 0 ? Colors.ok : Colors.bad }]}>
            {balance.toLocaleString()} {currency}
          </Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        scrollEnabled={transactions.length > 0}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptyText}>Tap + to add your first entry</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  addTxBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  balanceCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  netCard: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  balanceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  netValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  txNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  txPayMode: {
    fontSize: 10,
    color: Colors.info,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  txAmountWrap: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  txDate: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
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
