import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';
import { useThemeMode } from '@/presentation/hooks/useThemeMode';
import { Icon } from './Icon';

interface NavLink {
  label: string;
  route: '/' | '/coulomb' | null;
  disabled?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Inicio', route: '/' },
  { label: 'Coulomb', route: '/coulomb' },
  { label: 'Campo E', route: null, disabled: true },
  { label: 'Potencial', route: null, disabled: true },
];

const MOBILE_BREAKPOINT = 768;

export function TopNavBar() {
  const theme = usePhysicsTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= MOBILE_BREAKPOINT;
  const { mode: themeMode, toggle: toggleTheme } = useThemeMode();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  const navLink = (link: NavLink) => {
    if (link.disabled) {
      return (
        <Text key={link.label} style={[styles.navLink, styles.navDisabled, { color: theme.textTertiary }]}>
          {link.label}
        </Text>
      );
    }
    return (
      <Pressable
        key={link.label}
        onPress={() => { router.push(link.route!); setMobileOpen(false); }}
        style={({ pressed }) => [
          styles.navLink,
          isActive(link.route!) && { backgroundColor: theme.surfaceHover },
          pressed && { opacity: 0.7 },
        ]}>
        <Text style={[styles.navText, { color: isActive(link.route!) ? theme.text : theme.textSecondary }]}>
          {link.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={[styles.inner, { height: desktop ? 56 : 50 }]}>
        <Pressable onPress={() => { router.push('/'); setMobileOpen(false); }} style={styles.logo}>
          <Icon name="atom" size={desktop ? 28 : 24} color={theme.accent} />
          <Text style={[styles.logoText, { fontSize: desktop ? 20 : 18, color: theme.text }]}>PhysicaLab</Text>
        </Pressable>

        {desktop ? (
          <View style={styles.nav}>
            {NAV_LINKS.map(navLink)}
            <Pressable
              onPress={() => { router.push({ pathname: '/', params: { page: 'about' } }); setMobileOpen(false); }}
              style={({ pressed }) => [styles.navLink, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.navText, { color: theme.textSecondary }]}>Acerca de</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={styles.actions}>
          <Pressable onPress={toggleTheme} style={styles.themeBtn} hitSlop={6}>
            <Icon name={themeMode === 'light' ? 'moon' : 'sun'} size={desktop ? 20 : 18} color={theme.textSecondary} />
          </Pressable>
          {!desktop && (
            <Pressable onPress={() => setMobileOpen(o => !o)} style={styles.menuBtn} hitSlop={6}>
              <Icon name="menu" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {!desktop && mobileOpen && (
        <View style={[styles.mobileMenu, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          {NAV_LINKS.filter(l => !l.disabled).map(link => (
            <Pressable
              key={link.label}
              onPress={() => { router.push(link.route!); setMobileOpen(false); }}
              style={({ pressed }) => [
                styles.mobileLink,
                isActive(link.route!) && { backgroundColor: theme.surfaceHover },
                pressed && { opacity: 0.7 },
              ]}>
              <Text style={[styles.mobileText, { color: isActive(link.route!) ? theme.text : theme.textSecondary }]}>
                {link.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => { router.push({ pathname: '/', params: { page: 'about' } }); setMobileOpen(false); }}
            style={styles.mobileLink}>
            <Text style={[styles.mobileText, { color: theme.textSecondary }]}>Acerca de</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    zIndex: 50,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 16,
    flex: 1,
  },
  navLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navDisabled: {
    opacity: 0.5,
    fontSize: 14,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    borderTopWidth: 1,
    padding: 16,
    gap: 4,
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  mobileLink: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mobileText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
