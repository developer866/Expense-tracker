import { Link } from "expo-router";
import { Text, View, StyleSheet} from "react-native";


interface DayListItemProps {
    item: number;
}
export default function DayListItem({ item }: DayListItemProps) {

  return (
    <View style={styles.box} key={item}>
      <Text style={styles.text}>{item}</Text>
      <Link href={`/days/${item}`} style={{ position: "absolute", width: "100%", height: "100%" }} />
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#9b4521",
    borderRadius: 20,
  },
  text: {
    color: "#9b4521",
    fontSize: 70,
    fontFamily: "Inter",
  },
});
