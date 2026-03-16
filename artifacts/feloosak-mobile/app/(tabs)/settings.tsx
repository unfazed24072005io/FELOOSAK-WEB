import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();

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

        <Text style={styles.footerText}>Aura Tech Labs 2026</Text>
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
