import { Text, StyleSheet, View, StatusBar, FlatList } from "react-native";
// import DayListItem from "../component/core/DayListItem";
import DayListItem from "./src/component/core/DayListItem";
export default function App() {
  const days = [...Array(24).keys()].map((day) => day + 1);

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={days}
        columnWrapperStyle={styles.column}
        numColumns={2}
        renderItem={({ item }) => <DayListItem item={item} />}
        keyExtractor={(item) => item.toString()}
      />

      <StatusBar style="auto" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 10,
  },
  content: {
    gap: 10,
    padding: 10,
  },
  column: {
    gap: 10,
  },
  box: {
    backgroundColor: "#f9ede3",
    alignItems: "center",
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#9b4521",
    borderRadius: 20,
  },
  text: {
    color: "#9b4521",
    fontSize: 70,
  },
});
