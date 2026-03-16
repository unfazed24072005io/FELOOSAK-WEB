import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const CATEGORIES_IN = ["Sales", "Services", "Investment", "Loan", "Other"];
const CATEGORIES_OUT = ["Rent", "Salary", "Utilities", "Supplies", "Transport", "Food", "Marketing", "Other"];

const PAY_MODES_EG = ["cash", "instapay", "fawry", "vodafone_cash", "bank_transfer", "cib_smart", "meeza"];
const PAY_MODES_AE = ["cash", "apple_pay", "bank_transfer", "enbd_pay", "adcb_pay", "nol_pay"];

export default function AddTransactionScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [type, setType] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [payMode, setPayMode] = useState("cash");
  const [saving, setSaving] = useState(false);

  const categories = type === "in" ? CATEGORIES_IN : CATEGORIES_OUT;
  const payModes = user?.region === "AE" ? PAY_MODES_AE : PAY_MODES_EG;

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    setSaving(true);
    try {
      await api.transactions.create({
        bookId: parseInt(bookId),
        type,
        amount: parseFloat(amount),
        category,
        note,
        payMode,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const formatPayMode = (mode: string) =>
    mode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Transaction</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeBtn, type === "in" && styles.typeBtnActiveIn]}
            onPress={() => { setType("in"); setCategory(""); }}
          >
            <Feather name="arrow-down-left" size={18} color={type === "in" ? Colors.ok : Colors.textTertiary} />
            <Text style={[styles.typeBtnText, type === "in" && { color: Colors.ok }]}>Cash In</Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, type === "out" && styles.typeBtnActiveOut]}
            onPress={() => { setType("out"); setCategory(""); }}
          >
            <Feather name="arrow-up-right" size={18} color={type === "out" ? Colors.bad : Colors.textTertiary} />
            <Text style={[styles.typeBtnText, type === "out" && { color: Colors.bad }]}>Cash Out</Text>
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>AMOUNT</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PAYMENT MODE</Text>
          <View style={styles.chipRow}>
            {payModes.map((mode) => (
              <Pressable
                key={mode}
                style={[styles.chip, payMode === mode && styles.chipActive]}
                onPress={() => setPayMode(mode)}
              >
                <Text style={[styles.chipText, payMode === mode && styles.chipTextActive]}>
                  {formatPayMode(mode)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: type === "in" ? Colors.ok : Colors.bad },
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>
              Save {type === "in" ? "Income" : "Expense"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  typeBtnActiveIn: {
    borderColor: Colors.ok,
    backgroundColor: Colors.ok + "10",
  },
  typeBtnActiveOut: {
    borderColor: Colors.bad,
    backgroundColor: Colors.bad + "10",
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent + "20",
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  chipTextActive: {
    color: Colors.accentDark,
    fontWeight: "600" as const,
  },
  saveBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
});
