import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  PencilSimpleLine,
  BookmarkSimple,
  CurrencyDollarSimple,
  CalendarBlank,
  CheckCircle,
} from "phosphor-react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const TransactionDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const typeLabel = (params.type as string) || "Mượn nợ";
  const typeValue = (params.typeValue as string) || "borrow";
  const name = (params.name as string) || "—";
  const note = (params.note as string) || "—";
  const amount = (params.amount as string) || "0đ";
  const group = (params.group as string) || "";
  const borrowDate = (params.borrowDate as string) || "—";
  const dueDate = (params.dueDate as string) || "—";
  const remind = (params.remind as string) || "—";
  const initialPaidStatus =
    (params.paidStatus as string) || ((params.paid as string) === "true" ? "paid" : "unpaid");
  const initialPaidCount = Number(params.paidCount ?? 0);
  const initialTotalCount = Number(params.totalCount ?? 0);

  const [paidStatus, setPaidStatus] = React.useState<"unpaid" | "pending" | "paid">(initialPaidStatus as any);
  const [paidCount, setPaidCount] = React.useState(initialPaidCount);
  const [totalCount, setTotalCount] = React.useState(initialTotalCount);

  const displayName = typeValue === "group" && group ? group : name;

  const footerLabel =
    typeValue === "lend"
      ? paidStatus === "pending"
        ? "Đang chờ xác nhận"
        : "Xác nhận đã trả"
      : "Xác nhận trả tiền";

  const handleConfirm = () => {
    if (paidStatus === "pending") return;

    if (typeValue === "group") {
      const nextPaid = Math.min(paidCount + 1, totalCount || paidCount + 1);
      setPaidCount(nextPaid);
      setPaidStatus(nextPaid >= (totalCount || nextPaid) ? "paid" : "pending");
      alert("Đã gửi xác nhận trả tiền cho nhóm");
      return;
    }

    // lend / borrow
    setPaidStatus("pending");
    if (typeValue === "lend") {
      alert("Đã gửi thông báo cho người cho mượn để xác nhận đã trả");
    } else {
      alert("Đã gửi xác nhận trả tiền");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>{`<`}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết giao dịch</Text>
        <View style={{ width: scale(16) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailRow
          icon={<PencilSimpleLine size={18} color="#FFFFFF" weight="bold" />}
          label={typeValue === "group" ? "Tên nhóm" : "Họ và tên"}
          value={displayName}
        />
        <DetailRow
          icon={<BookmarkSimple size={18} color="#FFFFFF" weight="bold" />}
          label="Loại"
          value={typeLabel + (group ? ` - ${group}` : "")}
        />
        <DetailRow
          icon={<PencilSimpleLine size={18} color="#FFFFFF" weight="bold" />}
          label="Ghi chú"
          value={note}
        />
        <DetailRow
          icon={<CurrencyDollarSimple size={18} color="#FFFFFF" weight="bold" />}
          label="Số tiền"
          value={amount}
        />
        <DetailRow
          icon={<CurrencyDollarSimple size={18} color="#FFFFFF" weight="bold" />}
          label="Số tiền cần trả"
          value={amount}
        />
        <DetailRow
          icon={<CalendarBlank size={18} color="#FFFFFF" weight="bold" />}
          label="Ngày mượn"
          value={borrowDate}
        />
        <DetailRow
          icon={<CalendarBlank size={18} color="#FFFFFF" weight="bold" />}
          label="Ngày trả"
          value={dueDate}
        />
        <DetailRow
          icon={<CalendarBlank size={18} color="#FFFFFF" weight="bold" />}
          label="Hẹn nhắc"
          value={remind}
        />
        <DetailRow
          icon={<CheckCircle size={18} color="#FFFFFF" weight="bold" />}
          label="Đã trả"
          value={
            typeValue === "group"
              ? `${paidCount}/${totalCount || paidCount || 1} ( ${paidStatus === "pending" ? "Đang chờ" : paidStatus === "paid" ? "Hoàn thành" : "Chưa"} )`
              : paidStatus === "paid"
              ? "Hoàn thành"
              : paidStatus === "pending"
              ? "Đang chờ"
              : "Chưa"
          }
        />
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.footerBtn,
          paidStatus === "pending" && { opacity: 0.6 },
        ]}
        activeOpacity={0.9}
        disabled={paidStatus === "pending"}
        onPress={handleConfirm}
      >
        <Text style={styles.footerText}>{footerLabel}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Neutral200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    gap: spacingX._12,
  },
  back: {
    color: "#FFFFFF",
    fontSize: scale(18),
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(20),
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
    gap: spacingY._12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  iconWrapper: {
    width: scale(26),
    alignItems: "flex-start",
  },
  label: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
  value: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
    marginTop: spacingY._3,
  },
  footerBtn: {
    height: spacingY._60,
    margin: spacingX._20,
    borderRadius: radius._12,
    backgroundColor: colors.primary300,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
});

export default TransactionDetail;








