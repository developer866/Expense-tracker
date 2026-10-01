import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function DayItemScreen() {
	const { item } = useLocalSearchParams<{ item: string | string[] }>();
	const itemValue = Array.isArray(item) ? item[0] : item;

	return (
		<View style={styles.container}>
			<Text>{itemValue ?? 'No item provided'}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
