import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

interface PageContainerProps extends ViewProps {
  wide?: boolean;
}

export function PageContainer({ style, children, wide, ...rest }: PageContainerProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={[styles.inner, wide && styles.innerWide]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 0,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 720 : undefined,
  },
  innerWide: {
    maxWidth: Platform.OS === 'web' ? 1280 : undefined,
  },
});
