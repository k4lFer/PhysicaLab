import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/presentation/components/ui/Icon';

interface Module {
  id: string; icon: string; title: string; sub: string;
  available: boolean; route?: '/coulomb';
}

const REGISTRY: Module[] = [
  { id: 'coulomb', icon: '⚡', title: 'Ley de Coulomb', sub: 'Fuerza electrostática entre cargas puntuales · Superposición vectorial 2D y 3D', available: true, route: '/coulomb' },
];

const MOBILE_BREAKPOINT = 768;

export function HomeScreen() {
  const theme = usePhysicsTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= MOBILE_BREAKPOINT;
  const params = useLocalSearchParams<{ page?: string }>();
  const [page, setPage] = useState<'home' | 'about'>(
    params.page === 'about' ? 'about' : 'home'
  );

  useEffect(() => {
    if (params.page === 'about') setPage('about');
  }, [params.page]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scroll}>
      {page === 'home' ? (
        <HomePage theme={theme} desktop={desktop} />
      ) : (
        <AboutPage theme={theme} desktop={desktop} />
      )}

      {!desktop && (
        <View style={[styles.tabBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <Pressable
            onPress={() => setPage('home')}
            style={[styles.tabItem, { borderTopColor: page === 'home' ? theme.accent : 'transparent' }]}>
            <Icon name="home" size={18} color={page === 'home' ? theme.accent : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: page === 'home' ? theme.accent : theme.textSecondary }]}>Inicio</Text>
          </Pressable>
          <Pressable
            onPress={() => setPage('about')}
            style={[styles.tabItem, { borderTopColor: page === 'about' ? theme.accent : 'transparent' }]}>
            <Icon name="info" size={18} color={page === 'about' ? theme.accent : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: page === 'about' ? theme.accent : theme.textSecondary }]}>Acerca de</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function HomePage({ theme, desktop }: { theme: ReturnType<typeof usePhysicsTheme>; desktop: boolean }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  return (
    <View style={[styles.pageWrap, { maxWidth: desktop ? 800 : undefined }]}>
      <View style={[styles.hero, { paddingVertical: desktop ? 40 : 28 }]}>
        <Text style={[styles.heroTitle, { fontSize: desktop ? 36 : 26, color: theme.text, lineHeight: desktop ? 46 : 34 }]}>
          Laboratorio de Física{'\n'}
          <Text style={{ color: theme.accent }}>Interactivo</Text>
        </Text>
        <Text style={[styles.heroSub, { fontSize: desktop ? 16 : 14, color: theme.textSecondary }]}>
          Calcula, visualiza y comprende conceptos de electrostática con gráficos en 2D y 3D, paso a paso detallado.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>DISponible</Text>
        <Pressable
          onPress={() => router.push('/coulomb')}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.accent + '33' },
            pressed && { opacity: 0.85 },
          ]}>
          <View style={[styles.cardIconWrap, { backgroundColor: theme.accent + '1a' }]}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Ley de Coulomb</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{REGISTRY[0].sub}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Historia & Referencias</Text>
        <View style={[styles.refGrid, isWide && styles.refGridWide]}>
          <RefCard
            icon="book" color={theme.violet} label="Charles-Augustin de Coulomb"
            text="Físico e ingeniero militar francés (1736–1806). Pionero en la teoría de la electricidad y el magnetismo. Su balanza de torsión permitió establecer la ley fundamental de la electrostática en 1785."
            theme={theme} wide={isWide}
          />
          <RefCard
            icon="layers" color={theme.gold} label="Texto Base"
            text="Sears, Zemansky, Young & Freedman — Física Universitaria Vol. 2, 12.ª ed. Pearson Educación. Capítulo 21: Carga eléctrica y campo eléctrico."
            theme={theme} wide={isWide}
          />
          <RefCard
            icon="compass" color={theme.accent} label="Constante de Coulomb"
            text="k = 8.9875517923 × 10⁹ N·m²/C². La fuerza entre dos cargas es inversamente proporcional al cuadrado de la distancia que las separa."
            theme={theme} wide={isWide}
          />
          <RefCard
            icon="graph" color={theme.positive} label="Visualización"
            text="Las fuerzas se representan como vectores en 2D (SVG interactivo) y 3D (Three.js). La superposición se calcula numéricamente con precisión de doble precisión."
            theme={theme} wide={isWide}
          />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textTertiary }]}>
          Ponce Robles Kaled Al Fernando · Ingeniería Informática y Sistemas · 2025
        </Text>
      </View>
    </View>
  );
}

function RefCard({ icon, color, label, text, theme, wide }: {
  icon: 'book' | 'layers' | 'compass' | 'graph';
  color: string;
  label: string;
  text: string;
  theme: ReturnType<typeof usePhysicsTheme>;
  wide?: boolean;
}) {
  return (
    <View style={[styles.refCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, wide && styles.refCardWide]}>
      <View style={styles.refHeader}>
        <View style={[styles.refIcon, { backgroundColor: color + '1a' }]}>
          <Icon name={icon} size={16} color={color} />
        </View>
        <Text style={[styles.refLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Text style={[styles.refText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

function AboutPage({ theme, desktop }: { theme: ReturnType<typeof usePhysicsTheme>; desktop: boolean }) {
  return (
    <View style={[styles.pageWrap, styles.aboutSection, { maxWidth: desktop ? 600 : undefined }]}>
      <View style={[styles.aboutHero, { paddingVertical: desktop ? 32 : 20 }]}>
        <View style={[styles.aboutIconWrap, { backgroundColor: theme.accent + '1a' }]}>
          <Icon name="atom" size={desktop ? 32 : 26} color={theme.accent} />
        </View>
        <Text style={[styles.aboutTitle, { fontSize: desktop ? 32 : 24, color: theme.text }]}>PhysicaLab</Text>
        <Text style={[styles.aboutVersion, { fontSize: desktop ? 15 : 13, color: theme.textSecondary }]}>v1.0.0</Text>
      </View>

      <View style={[styles.aboutCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Text style={[styles.aboutHeading, { color: theme.text }]}>Acerca de</Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
          Calculadora de física interactiva para estudiantes de ingeniería. Resuelve problemas de electrostática con visualización vectorial y desglose paso a paso, basado en la metodología de Sears-Zemansky.
        </Text>
      </View>

      <View style={[styles.aboutCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Text style={[styles.aboutHeading, { color: theme.text }]}>Desarrollador</Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>Ponce Robles Kaled Al Fernando</Text>
        <Text style={[styles.aboutText, { color: theme.textTertiary, marginTop: 4 }]}>Ingeniería Informática y Sistemas</Text>
        <Pressable onPress={() => Linking.openURL('https://github.com/k4lFer')} style={styles.githubLink}>
          <Icon name="github" size={18} color={theme.accent} />
          <Text style={[styles.githubText, { color: theme.accent }]}> github.com/k4lFer</Text>
        </Pressable>
      </View>

      <View style={[styles.aboutCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Text style={[styles.aboutHeading, { color: theme.text }]}>Tecnologías</Text>
        <View style={styles.techRow}>
          {['Expo SDK 56', 'React Native', 'Three.js', 'TypeScript'].map(t => (
            <View key={t} style={[styles.techChip, { backgroundColor: theme.surfaceHover, borderColor: theme.border }]}>
              <Text style={[styles.techText, { color: theme.textSecondary }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20, minHeight: '100%' },
  pageWrap: { paddingHorizontal: 16, alignSelf: 'center', width: '100%' },
  hero: { alignItems: 'center' },
  heroTitle: { fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { textAlign: 'center', marginTop: 10, maxWidth: 500 },
  section: { paddingBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderRadius: 12, borderWidth: 1,
  },
  cardIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardSub: { fontSize: 12, lineHeight: 16 },

  // Reference grid
  refGrid: { gap: 10 },
  refGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  refCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  refCardWide: { width: '48.5%', flexGrow: 1 },
  refHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  refIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  refLabel: { fontSize: 13, fontWeight: '600' },
  refText: { fontSize: 12, lineHeight: 17 },
  footer: { borderTopWidth: 1, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  footerText: { fontSize: 12 },

  // Bottom tab bar — mobile only
  tabBar: { flexDirection: 'row', borderTopWidth: 1, marginTop: 'auto' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderTopWidth: 2, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },

  // About
  aboutSection: { gap: 12, paddingBottom: 30 },
  aboutHero: { alignItems: 'center', gap: 8 },
  aboutIconWrap: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontWeight: '800' },
  aboutVersion: {},
  aboutCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  aboutHeading: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  aboutText: { fontSize: 13, lineHeight: 18 },
  githubLink: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  githubText: { fontSize: 13, fontWeight: '600' },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techChip: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 9999, borderWidth: 1 },
  techText: { fontSize: 12, fontWeight: '500' },
});
