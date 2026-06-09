import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { router } from 'expo-router';
import { PageContainer } from '@/presentation/components/ui/PageContainer';

interface Module {
  id: string; icon: string; title: string; sub: string;
  available: boolean; route?: '/coulomb';
}

const REGISTRY: Module[] = [
  { id: 'coulomb', icon: '⚡', title: 'Ley de Coulomb', sub: 'Fuerza entre n cargas · 2D y 3D', available: true, route: '/coulomb' },
  { id: 'efield', icon: '🔭', title: 'Campo Eléctrico', sub: 'Intensidad E y líneas', available: false },
  { id: 'potential', icon: '🌐', title: 'Potencial Eléctrico', sub: 'V y superficies equipotenciales', available: false },
  { id: 'gauss', icon: '🔮', title: 'Ley de Gauss', sub: 'Flujo eléctrico y simetría', available: false },
  { id: 'capacitor', icon: '🧲', title: 'Capacitancia', sub: 'Capacitores y dieléctricos', available: false },
  { id: 'circuits', icon: '⚙️', title: 'Circuitos DC', sub: 'Kirchhoff · Thévenin', available: false },
];

export function HomeScreen() {
  const theme = usePhysicsTheme();
  const [tab, setTab] = useState<'modules' | 'about'>('modules');

  const isDark = theme.text === '#ffffff';

  return (
    <PageContainer style={{ backgroundColor: theme.background }}>
      {tab === 'modules' ? <ModulesView theme={theme} /> : <AboutView theme={theme} />}
      <View style={[styles.tabBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Pressable
          onPress={() => setTab('modules')}
          style={[styles.tabItem, tab === 'modules' && { borderTopColor: theme.accent }]}>
          <Text style={[styles.tabText, { color: tab === 'modules' ? theme.accent : theme.textSecondary }]}>
            Módulos
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('about')}
          style={[styles.tabItem, tab === 'about' && { borderTopColor: theme.accent }]}>
          <Text style={[styles.tabText, { color: tab === 'about' ? theme.accent : theme.textSecondary }]}>
            Acerca de
          </Text>
        </Pressable>
      </View>
    </PageContainer>
  );
}

function ModulesView({ theme }: { theme: ReturnType<typeof usePhysicsTheme> }) {
  const available = REGISTRY.filter(m => m.available);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.hero, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>PhysicaLab</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Calculadora de Física II
        </Text>
        <View style={[styles.badge, { borderColor: theme.border }]}>
          <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
            Sears-Zemansky 12.ª ed.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DISPONIBLE</Text>
        {available.map(m => (
          <Pressable
            key={m.id}
            onPress={() => m.available && m.route && router.push(m.route)}
            style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={styles.cardIcon}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{m.title}</Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{m.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* PRÓXIMAMENTE — sección oculta temporalmente
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PRÓXIMAMENTE</Text>
        <View style={styles.grid2}>
          {soon.map(m => (
            <Pressable
              key={m.id}
              style={[styles.cardCompact, { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: 0.45 }]}>
              <Text style={styles.cardIconSm}>{m.icon}</Text>
              <Text style={[styles.cardTitleSm, { color: theme.text }]}>{m.title}</Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{m.sub}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      */}

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Ponce Robles Kaled Al Fernando · 2025
        </Text>
      </View>
    </ScrollView>
  );
}

function AboutView({ theme }: { theme: ReturnType<typeof usePhysicsTheme> }) {

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.aboutSection}>
        <Text style={[styles.aboutTitle, { color: theme.text }]}>PhysicaLab</Text>
        <Text style={[styles.aboutVersion, { color: theme.textSecondary }]}>v1.0.0</Text>

        <View style={[styles.aboutCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.aboutHeading, { color: theme.text }]}>Acerca de</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Calculadora de física para estudiantes de ingeniería.
          </Text>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.aboutHeading, { color: theme.text }]}>Desarrollador</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Ponce Robles Kaled Al Fernando
          </Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary, marginTop: 4 }]}>
            Ingeniería Informática y Sistemas
          </Text>
          <Pressable onPress={() => Linking.openURL('https://github.com/k4lFer')} style={styles.githubLink}>
            <Text style={[styles.githubText, { color: theme.accent }]}>
              {'🐙 '}github.com/k4lFer
            </Text>
          </Pressable>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.aboutHeading, { color: theme.text }]}>Tecnologías</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Expo · React Native · Three.js · TypeScript
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 20 },
  hero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, borderBottomWidth: 1, marginHorizontal: 16 },
  title: { fontSize: Platform.OS === 'web' ? 30 : 26, fontWeight: '700' },
  sub: { fontSize: Platform.OS === 'web' ? 16 : 14, marginTop: 4, textAlign: 'center' },
  badge: { borderWidth: 1, borderRadius: 9999, paddingVertical: 5, paddingHorizontal: 14, marginTop: 10 },
  badgeText: { fontSize: Platform.OS === 'web' ? 13 : 11 },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontSize: Platform.OS === 'web' ? 14 : 12, fontWeight: '600', letterSpacing: 0.5, paddingBottom: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    borderRadius: 10, borderWidth: 1, marginBottom: 7,
  },
  cardCompact: {
    width: '48%', padding: 12, borderRadius: 10, borderWidth: 1, gap: 4, flexGrow: 1,
  },
  cardIcon: { fontSize: Platform.OS === 'web' ? 32 : 28, flexShrink: 0 },
  cardIconSm: { fontSize: Platform.OS === 'web' ? 24 : 20 },
  cardTitle: { fontSize: Platform.OS === 'web' ? 17 : 15, fontWeight: '600', marginBottom: 2 },
  cardTitleSm: { fontSize: Platform.OS === 'web' ? 14 : 12, fontWeight: '600', marginBottom: 2 },
  cardSub: { fontSize: Platform.OS === 'web' ? 14 : 12, lineHeight: Platform.OS === 'web' ? 19 : 16 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { padding: 14, borderTopWidth: 1, alignItems: 'center', marginTop: 24, marginHorizontal: 16 },
  footerText: { fontSize: Platform.OS === 'web' ? 13 : 11 },

  // Tab bar
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1, paddingBottom: Platform.OS === 'web' ? 8 : 20,
  },
  tabItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderTopWidth: 2, borderTopColor: 'transparent',
  },
  tabText: { fontSize: Platform.OS === 'web' ? 15 : 13, fontWeight: '500' },

  // About
  aboutSection: { padding: 16, gap: 12 },
  aboutTitle: { fontSize: Platform.OS === 'web' ? 30 : 24, fontWeight: '700', textAlign: 'center' },
  aboutVersion: { fontSize: Platform.OS === 'web' ? 15 : 13, textAlign: 'center', marginBottom: 8 },
  aboutCard: { borderRadius: 10, borderWidth: 1, padding: 16 },
  aboutHeading: { fontSize: Platform.OS === 'web' ? 17 : 15, fontWeight: '600', marginBottom: 6 },
  aboutText: { fontSize: Platform.OS === 'web' ? 15 : 13, lineHeight: Platform.OS === 'web' ? 21 : 18 },
  githubLink: { marginTop: 10, alignSelf: 'flex-start' },
  githubText: { fontSize: Platform.OS === 'web' ? 15 : 13, fontWeight: '600' },
});
