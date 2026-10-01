import { StyleSheet, View, StatusBar, FlatList, ActivityIndicator } from "react-native";
import { Inter_900Black, useFonts } from "@expo-google-fonts/inter";
import DayListItem from "./src/component/core/DayListItem";

export default function App() {
  const [fontLoaded, fontError] = useFonts({
    Inter: Inter_900Black,
  });

  // Show a spinner until the font is ready (or has failed)
  if (!fontLoaded && !fontError) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#9b4521" />
      </View>
    );
  }

  const days = [...Array(24).keys()].map((day) => day + 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={days}
        renderItem={({ item }) => <DayListItem item={item} />}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.column}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  content: { gap: 10, padding: 10 },
  column: { gap: 10 },
});