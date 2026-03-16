import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
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

const fmt = (n: number) => n.toLocaleString();

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [remInv, setRemInv] = useState<Invoice | null>(null);

  const currency = user?.region === "AE" ? "AED" : "EGP";
  const hasBankInfo = user?.bankName || user?.bankAccount || user?.bankIban;
  const hasPayLink = !!user?.paymentLink;
  const bizName = user?.businessName || user?.name || "";

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

  const buildReminderText = (inv: Invoice, includeBank: boolean, includePayLink: boolean) => {
    const termsLabel: Record<string, string> = { net30: "Net 30 Days", net60: "Net 60 Days", due: "Due on Receipt" };
    const total = parseFloat(inv.total) || 0;
    let msg = `Payment Reminder\n\nDear Customer,\n\nThis is a friendly reminder regarding the following invoice:\n\nInvoice: ${inv.invoiceNo}\nAmount Due: ${currency} ${fmt(total)}\nDate: ${inv.invoiceDate}\nTerms: ${termsLabel[inv.terms || "net30"] || inv.terms}\n`;
    if (includePayLink && user?.paymentLink) {
      msg += `\nPay Online:\n${user.paymentLink}\n`;
    }
    if (includeBank && hasBankInfo) {
      msg += `\nBank Transfer Details:\n`;
      if (user?.bankName) msg += `Bank: ${user.bankName}\n`;
      if (user?.businessName) msg += `Account Name: ${user.businessName}\n`;
      if (user?.bankAccount) msg += `Account No: ${user.bankAccount}\n`;
      if (user?.bankIban) msg += `IBAN: ${user.bankIban}\n`;
      if (user?.bankSwift) msg += `SWIFT: ${user.bankSwift}\n`;
    }
    msg += `\nPlease make the payment at your earliest convenience.\n\nThank you,\n${bizName}`;
    if (user?.businessPhone) msg += `\nPhone: ${user.businessPhone}`;
    return msg;
  };

  const shareReminder = async (inv: Invoice) => {
    const text = buildReminderText(inv, !!hasBankInfo, hasPayLink);
    try {
      await Share.share({ message: text, title: `Payment Reminder: ${inv.invoiceNo}` });
    } catch {}
  };

  const shareWhatsApp = (inv: Invoice) => {
    const text = buildReminderText(inv, !!hasBankInfo, hasPayLink);
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareEmail = (inv: Invoice) => {
    const total = parseFloat(inv.total) || 0;
    const text = buildReminderText(inv, !!hasBankInfo, hasPayLink);
    const subject = encodeURIComponent(`Payment Reminder: ${inv.invoiceNo} - ${currency} ${fmt(total)}`);
    Linking.openURL(`mailto:?subject=${subject}&body=${encodeURIComponent(text)}`);
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
    const isUnpaid = item.status !== "paid";

    return (
      <View style={styles.invoiceCard}>
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.95 }]}
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
        </Pressable>

        {isUnpaid && (
          <View style={styles.reminderBar}>
            <Pressable style={styles.reminderBtn} onPress={() => setRemInv(item)}>
              <Feather name="bell" size={13} color={Colors.accent} />
              <Text style={styles.reminderBtnText}>Remind</Text>
            </Pressable>
            <Pressable style={styles.whatsappBtn} onPress={() => shareWhatsApp(item)}>
              <Feather name="message-circle" size={13} color="#25D366" />
              <Text style={[styles.reminderBtnText, { color: "#25D366" }]}>WhatsApp</Text>
            </Pressable>
            <Pressable style={styles.emailBtn} onPress={() => shareEmail(item)}>
              <Feather name="mail" size={13} color={Colors.info} />
              <Text style={[styles.reminderBtnText, { color: Colors.info }]}>Email</Text>
            </Pressable>
          </View>
        )}
      </View>
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

      <Modal visible={!!remInv} transparent animationType="slide" onRequestClose={() => setRemInv(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Reminder</Text>
              <Pressable onPress={() => setRemInv(null)}>
                <Feather name="x" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {remInv && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.invSummary}>
                  <View style={styles.invSummaryRow}>
                    <Text style={styles.invSummaryNo}>{remInv.invoiceNo}</Text>
                    <Text style={styles.invSummaryAmt}>{currency} {fmt(parseFloat(remInv.total) || 0)}</Text>
                  </View>
                  <Text style={styles.invSummarySub}>Status: {remInv.status} · {remInv.invoiceDate}</Text>
                </View>

                {!hasBankInfo && !hasPayLink && (
                  <View style={styles.warnBox}>
                    <Feather name="alert-triangle" size={14} color={Colors.warn} />
                    <Text style={styles.warnText}>No payment details configured. Go to Settings to add bank details or payment link.</Text>
                  </View>
                )}

                {hasBankInfo && (
                  <View style={styles.bankBox}>
                    <Text style={styles.sectionLabel}>Bank Transfer Details</Text>
                    {user?.bankName && <Text style={styles.bankLine}>Bank: <Text style={styles.bankVal}>{user.bankName}</Text></Text>}
                    {user?.businessName && <Text style={styles.bankLine}>Name: <Text style={styles.bankVal}>{user.businessName}</Text></Text>}
                    {user?.bankAccount && <Text style={styles.bankLine}>Account: <Text style={styles.bankVal}>{user.bankAccount}</Text></Text>}
                    {user?.bankIban && <Text style={styles.bankLine}>IBAN: <Text style={styles.bankVal}>{user.bankIban}</Text></Text>}
                    {user?.bankSwift && <Text style={styles.bankLine}>SWIFT: <Text style={styles.bankVal}>{user.bankSwift}</Text></Text>}
                  </View>
                )}

                {hasPayLink && (
                  <Pressable style={styles.payLinkBox} onPress={() => Linking.openURL(user!.paymentLink!)}>
                    <Feather name="link" size={14} color={Colors.ok} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payLinkLabel}>Payment Link</Text>
                      <Text style={styles.payLinkUrl} numberOfLines={1}>{user?.paymentLink}</Text>
                    </View>
                    <Feather name="external-link" size={14} color={Colors.ok} />
                  </Pressable>
                )}

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Share Via</Text>
                <View style={styles.shareGrid}>
                  <Pressable style={styles.shareBtn} onPress={() => remInv && shareWhatsApp(remInv)}>
                    <Feather name="message-circle" size={20} color="#25D366" />
                    <Text style={[styles.shareBtnText, { color: "#25D366" }]}>WhatsApp</Text>
                  </Pressable>
                  <Pressable style={styles.shareBtn} onPress={() => remInv && shareEmail(remInv)}>
                    <Feather name="mail" size={20} color={Colors.info} />
                    <Text style={[styles.shareBtnText, { color: Colors.info }]}>Email</Text>
                  </Pressable>
                  <Pressable style={styles.shareBtn} onPress={() => remInv && shareReminder(remInv)}>
                    <Feather name="share-2" size={20} color={Colors.accent} />
                    <Text style={[styles.shareBtnText, { color: Colors.accent }]}>Share</Text>
                  </Pressable>
                </View>

                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Message Preview</Text>
                  <Text style={styles.previewText}>
                    {buildReminderText(remInv, !!hasBankInfo, hasPayLink)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  reminderBar: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + "60",
  },
  reminderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.accent + "12",
    borderWidth: 1,
    borderColor: Colors.accent + "20",
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#25D366" + "12",
    borderWidth: 1,
    borderColor: "#25D366" + "20",
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.info + "12",
    borderWidth: 1,
    borderColor: Colors.info + "20",
  },
  reminderBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 8,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary + "40",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  modalBody: {
    padding: 20,
  },
  invSummary: {
    backgroundColor: Colors.accent + "12",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  invSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invSummaryNo: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  invSummaryAmt: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: Colors.accent,
    fontFamily: "Inter_700Bold",
  },
  invSummarySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  warnBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.warn + "12",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.warn + "20",
    alignItems: "flex-start",
  },
  warnText: {
    flex: 1,
    fontSize: 12,
    color: Colors.warn,
    fontFamily: "Inter_500Medium",
  },
  bankBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bankLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
  },
  bankVal: {
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  payLinkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.ok + "10",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ok + "20",
  },
  payLinkLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.ok,
    fontFamily: "Inter_700Bold",
  },
  payLinkUrl: {
    fontSize: 12,
    color: Colors.ok,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  shareGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  previewBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
