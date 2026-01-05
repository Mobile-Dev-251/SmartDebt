import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  PencilSimple,
  CaretDown,
} from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { scale } from "@/utils/stylings";

const ProfileInfoScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("Hoàng Phương Bình");
  const [phone, setPhone] = React.useState("0123456789");
  const [gender, setGender] = React.useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [showGender, setShowGender] = React.useState(false);
  const [birth, setBirth] = React.useState("01/01/2004");
  const [showBirth, setShowBirth] = React.useState(false);

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const parseDate = (value: string) => {
    const [dd, mm, yyyy] = value.split("/").map((p) => parseInt(p, 10));
    return new Date(yyyy, mm - 1, dd);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={scale(22)} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <View style={{ width: scale(22) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrap}>
          <Image
            source={require("@/assets/images/1.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.name}>{fullName}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ tên"
            placeholderTextColor={colors.Neutral100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={colors.Neutral100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Giới tính</Text>
          <TouchableOpacity
            style={styles.inputRow}
            activeOpacity={0.85}
            onPress={() => setShowGender((v) => !v)}
          >
            <Text style={styles.inputValue}>{gender}</Text>
            <CaretDown size={scale(14)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          {showGender && (
            <View style={styles.dropdown}>
              {(["Nam", "Nữ", "Khác"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGender(g);
                    setShowGender(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Sinh nhật</Text>
          <TouchableOpacity
            style={styles.inputRow}
            activeOpacity={0.85}
            onPress={() => setShowBirth(true)}
          >
            <Text style={styles.inputValue}>{birth}</Text>
            <CaretDown size={scale(14)} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          {showBirth && (
            <View style={styles.datePickerWrapper}>
              <DateTimePicker
                value={parseDate(birth)}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_e: any, selected?: Date) => {
                  if (selected) {
                    setBirth(formatDate(selected));
                  }
                  setShowBirth(false);
                }}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.editBtn} activeOpacity={0.9}>
          <PencilSimple size={scale(16)} color="#FFFFFF" weight="bold" />
          <Text style={styles.editText}>Cập nhật</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(18),
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
    gap: spacingY._15,
  },
  avatarWrap: {
    alignItems: "center",
    gap: spacingY._10,
    marginTop: spacingY._10,
  },
  avatar: {
    width: scale(90),
    height: scale(90),
    borderRadius: radius._30,
    backgroundColor: colors.Neutral300,
  },
  name: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(16),
  },
  field: {
    gap: spacingY._5,
  },
  label: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(13),
  },
  input: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    height: spacingY._50,
    paddingHorizontal: spacingX._15,
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  inputRow: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    height: spacingY._50,
    paddingHorizontal: spacingX._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputValue: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  dropdown: {
    backgroundColor: colors.Neutral300,
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: colors.Neutral400,
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontFamily: "RobotoRegular",
    fontSize: scale(14),
  },
  datePickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius._12,
    marginTop: spacingY._5,
    overflow: "hidden",
  },
  editBtn: {
    height: spacingY._50,
    borderRadius: radius._12,
    backgroundColor: colors.primary300,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._7,
    marginTop: spacingY._10,
  },
  editText: {
    color: "#FFFFFF",
    fontFamily: "RobotoBold",
    fontSize: scale(14),
  },
});

export default ProfileInfoScreen;






