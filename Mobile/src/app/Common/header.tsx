import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function Header() {
	return (
		<View style={styles.header}>
			<View style={styles.brandBlock}>
				<Text style={styles.brand}>
					<MaterialCommunityIcons name="dumbbell" size={24} color="white" />QA-GYM<Text style={styles.brandDot}>.</Text>
				</Text>
				<Text style={styles.location}>
					<FontAwesome name="map-marker" size={12} color="#7b7c7d" />  Khoái Châu, Hưng Yên
				</Text>
			</View>
			<View style={styles.headerActions}>
				<FontAwesome name="bell" size={24} color="#cfcfcf" />
				<View style={styles.shoppingCart}>
					<FontAwesome name="shopping-cart" size={24} color="#f5f9ed" />
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
	brandBlock: { flexShrink: 1, paddingRight: 76 },
	brand: { color: '#f3f5ec', fontSize: 21, fontWeight: '900', letterSpacing: 1.2 },
	brandDot: { color: '#d9ff00' },
	location: { color: '#899083', fontSize: 10, marginTop: 5 },
	headerActions: { position: 'absolute', top: 20.5, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
	shoppingCart: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
