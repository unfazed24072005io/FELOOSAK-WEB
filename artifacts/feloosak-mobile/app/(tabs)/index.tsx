import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { api, BookWithDetails } from "@/lib/api";

export default function BooksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [books, setBooks] = useState<BookWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "business" | "personal">("all");

  const loadBooks = useCallback(async () => {
    try {
      const data = await api.books.list();
      setBooks(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const filtered = filter === "all" ? books : books.filter((b) => b.type === filter);

  const getBookBalance = (book: BookWithDetails) => {
    let balance = 0;
    for (const tx of book.tx) {
      const amt = parseFloat(tx.amount) || 0;
      balance += tx.type === "in" ? amt : -amt;
    }
    return balance;
  };

  const totalBalance = books.reduce((sum, b) => sum + getBookBalance(b), 0);
  const totalIn = books.reduce(
    (sum, b) =>
      sum +
      b.tx
        .filter((t) => t.type === "in")
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0),
    0
  );
  const totalOut = books.reduce(
    (sum, b) =>
      sum +
      b.tx
        .filter((t) => t.type === "out")
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0),
    0
  );

  const currency = user?.region === "AE" ? "AED" : "EGP";

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to continue</Text>
          <Pressable style={styles.authBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.authBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderBook = ({ item }: { item: BookWithDetails }) => {
    const balance = getBookBalance(item);
    const txCount = item.tx.length;

    return (
      <Pressable
        style={({ pressed }) => [styles.bookCard, pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}
        onPress={() => router.push({ pathname: "/book/[id]", params: { id: item.id.toString() } })}
      >
        <View style={styles.bookHeader}>
          <View style={[styles.bookIcon, { backgroundColor: item.color + "20" }]}>
            <Text style={styles.bookEmoji}>{item.icon}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.bookMeta}>
              {item.type === "business" ? "Business" : "Personal"} · {txCount} transactions
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
        </View>
        <View style={styles.bookBalance}>
          <Text style={[styles.balanceAmount, { color: balance >= 0 ? Colors.ok : Colors.bad }]}>
            {balance >= 0 ? "+" : ""}{balance.toLocaleString()} {currency}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name.split(" ")[0]}</Text>
          <Text style={styles.greetingSub}>Your financial overview</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user.avatar || user.name.charAt(0)}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Balance</Text>
        <Text style={styles.summaryAmount}>
          {totalBalance.toLocaleString()} {currency}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Feather name="arrow-down-left" size={14} color={Colors.ok} />
            <Text style={[styles.summaryItemText, { color: Colors.ok }]}>
              {totalIn.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="arrow-up-right" size={14} color={Colors.bad} />
            <Text style={[styles.summaryItemText, { color: Colors.bad }]}>
              {totalOut.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(["all", "business", "personal"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/add-book")}
        >
          <Feather name="plus" size={20} color={Colors.accent} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBook}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
          scrollEnabled={filtered.length > 0}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="book-open" size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No cash books yet</Text>
              <Text style={styles.emptyText}>Create your first book to start tracking</Text>
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
  greeting: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  greetingSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.bgDark,
    fontFamily: "Inter_700Bold",
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.bgDark,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#9E9E90",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 24,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryItemText: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.inputBg,
  },
  filterBtnActive: {
    backgroundColor: Colors.accent,
  },
  filterBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  filterBtnTextActive: {
    color: Colors.textOnAccent,
    fontWeight: "600" as const,
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
  bookCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bookIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookEmoji: {
    fontSize: 20,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  bookMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  bookBalance: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
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
  authBtn: {
    marginTop: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textOnAccent,
    fontFamily: "Inter_600SemiBold",
  },
});
