import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "Expense App",
        // backgroundColor: "#f9ede3",
        headerStyle: { backgroundColor: "#f9ede3" },
        headerTitleStyle: { color: "#9b4521" },
      }}
    > 
        <Stack.Screen name="index" options={{ title: "Expense App" }} />
        <Stack.Screen name="days/[item]" options={{ title: "Day Item" }} />
    </Stack>
  );
}
