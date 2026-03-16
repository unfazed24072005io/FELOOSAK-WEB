import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const [showPay, setShowPay] = useState(false);
  const [bName, setBName] = useState(user?.bankName || "");
  const [bAcct, setBAcct] = useState(user?.bankAccount || "");
  const [bIban, setBIban] = useState(user?.bankIban || "");
  const [bSwift, setBSwift] = useState(user?.bankSwift || "");
  const [pLink, setPLink] = useState(user?.paymentLink || "");
  const [bizName, setBizName] = useState(user?.businessName || "");
  const [bizPhone, setBizPhone] = useState(user?.businessPhone || "");
  const [paySaving, setPaySaving] = useState(false);
  const [paySaved, setPaySaved] = useState(false);

  const savePaymentDetails = async () => {
    setPaySaving(true);
    try {
      await updateProfile({ bankName: bName, bankAccount: bAcct, bankIban: bIban, bankSwift: bSwift, paymentLink: pLink, businessName: bizName, businessPhone: bizPhone });
      setPaySaved(true);
      setTimeout(() => setPaySaved(false), 2000);
    } catch {}
    setPaySaving(false);
  };

  const hasBankSetup = user?.bankName || user?.bankAccount || user?.bankIban || user?.paymentLink;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleRegionSwitch = () => {
    const newRegion = user?.region === "EG" ? "AE" : "EG";
    Alert.alert(
      "Switch Region",
      `Switch to ${newRegion === "EG" ? "Egypt (EGP)" : "UAE (AED)"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            try {
              await updateProfile({ region: newRegion });
            } catch {}
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to view settings</Text>
          <Pressable style={styles.authBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.authBtnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <Text style={styles.screenTitle}>Settings</Text>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.avatar || user.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.regionBadge}>
            <Feather name="globe" size={14} color={Colors.accent} />
            <Text style={styles.regionText}>
              {user.region === "AE" ? "UAE (AED)" : "Egypt (EGP)"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.section}>
          <Pressable style={styles.menuItem} onPress={handleRegionSwitch}>
            <View style={styles.menuItemLeft}>
              <Feather name="globe" size={20} color={Colors.text} />
              <View>
                <Text style={styles.menuItemText}>Region</Text>
                <Text style={styles.menuItemSub}>
                  {user.region === "AE" ? "UAE" : "Egypt"}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="shield" size={20} color={Colors.text} />
              <View>
                <Text style={styles.menuItemText}>Tax Compliance</Text>
                <Text style={styles.menuItemSub}>
                  {user.region === "AE" ? "FTA Ready" : "ETA Compliant"}
                </Text>
              </View>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: Colors.ok + "20" }]}>
              <Text style={[styles.activeBadgeText, { color: Colors.ok }]}>Active</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="type" size={20} color={Colors.text} />
              <View>
                <Text style={styles.menuItemText}>Language</Text>
                <Text style={styles.menuItemSub}>English / Arabic</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
        <View style={styles.section}>
          <Pressable style={styles.menuItem} onPress={() => setShowPay(!showPay)}>
            <View style={styles.menuItemLeft}>
              <Feather name="credit-card" size={20} color={Colors.text} />
              <View>
                <Text style={styles.menuItemText}>Bank & Payment Link</Text>
                <Text style={styles.menuItemSub}>
                  {hasBankSetup ? "Configured — shown on reminders" : "Not configured"}
                </Text>
              </View>
            </View>
            <Feather name={showPay ? "chevron-up" : "chevron-down"} size={18} color={Colors.textTertiary} />
          </Pressable>

          {showPay && (
            <View style={styles.paymentForm}>
              <Text style={styles.payFormLabel}>Business Info</Text>
              <TextInput style={styles.payInput} value={bizName} onChangeText={setBizName} placeholder="Business Name" placeholderTextColor={Colors.textTertiary} />
              <TextInput style={styles.payInput} value={bizPhone} onChangeText={setBizPhone} placeholder="Business Phone" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />

              <Text style={[styles.payFormLabel, { marginTop: 12 }]}>Bank Account</Text>
              <TextInput style={styles.payInput} value={bName} onChangeText={setBName} placeholder={user?.region === "EG" ? "e.g. CIB, NBE, Banque Misr" : "e.g. Emirates NBD, ADCB"} placeholderTextColor={Colors.textTertiary} />
              <TextInput style={styles.payInput} value={bAcct} onChangeText={setBAcct} placeholder="Account Number" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" />
              <TextInput style={styles.payInput} value={bIban} onChangeText={setBIban} placeholder={user?.region === "EG" ? "EG38 0019..." : "AE07 0331..."} placeholderTextColor={Colors.textTertiary} autoCapitalize="characters" />
              <TextInput style={styles.payInput} value={bSwift} onChangeText={setBSwift} placeholder="SWIFT/BIC Code" placeholderTextColor={Colors.textTertiary} autoCapitalize="characters" />

              <Text style={[styles.payFormLabel, { marginTop: 12 }]}>Payment Link</Text>
              <TextInput style={styles.payInput} value={pLink} onChangeText={setPLink} placeholder="https://pay.fawry.io/..." placeholderTextColor={Colors.textTertiary} keyboardType="url" autoCapitalize="none" />
              <Text style={styles.payHint}>Fawry, InstaPay, PayPal, Stripe, or any payment URL</Text>

              <Pressable
                style={[styles.savePayBtn, paySaved && { backgroundColor: Colors.ok }]}
                onPress={savePaymentDetails}
                disabled={paySaving}
              >
                <Text style={styles.savePayText}>
                  {paySaving ? "Saving..." : paySaved ? "Saved!" : "Save Payment Details"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="info" size={20} color={Colors.text} />
              <View>
                <Text style={styles.menuItemText}>Version</Text>
                <Text style={styles.menuItemSub}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={Colors.bad} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.footerText}>feloosk 2026 · www.feloosk.com</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.bgDark,
    fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  regionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.accent + "15",
  },
  regionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
    fontFamily: "Inter_500Medium",
  },
  menuItemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.bad + "30",
    backgroundColor: Colors.bad + "08",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.bad,
    fontFamily: "Inter_600SemiBold",
  },
  paymentForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  payFormLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  payInput: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  payHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  savePayBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  savePayText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.bgDark,
    fontFamily: "Inter_600SemiBold",
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
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
