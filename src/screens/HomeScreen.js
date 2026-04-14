// @ts-nocheck
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import HOME_BACKGROUND from '../../Fondo.png';
import LOGO_IMAGE from '../../logo.png';
import BOARD_COLLAPSED_IMAGE from '../../assets/tablon-cerrado.jpg';
import {
  EMAIL_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LIVE_BADGE_TEXT,
  STATION_NAME,
  STATION_SUBTITLE,
  WHATSAPP_URL,
} from '../config/radioConfig.js';
import { useRadioPlayer } from '../player/RadioPlayerContext.js';

const EVENTS_URL = 'https://centaurusfm.com/eventos/';
const BOARD_COLLAPSED_IMAGE_SOURCE = Image.resolveAssetSource(BOARD_COLLAPSED_IMAGE);
const EVENTS_CLEANUP_SCRIPT = `
  (function() {
    const selectors = [
      'header',
      'footer',
      '#header',
      '#footer',
      '.site-header',
      '.site-footer',
      '.wp-site-blocks > header.wp-block-template-part',
      '.wp-site-blocks > footer.wp-block-template-part',
      '.menu-header',
      '#btnRadio',
      '.audioigniter-root',
      '#audioigniter-33',
      '#cookie-notice',
      '.cookie-notice',
      '.cn-notice',
      '.tribe-events-c-events-bar',
      '.tribe-events-header__events-bar',
      '.tribe-events-header__messages',
      '.tribe-events-c-top-bar__nav',
      '.tribe-events-c-top-bar__today-button',
      '.tribe-events-c-top-bar__datepicker-button'
    ];

    const hideNode = (node) => {
      if (!node || !node.style) return;
      node.style.display = 'none';
      node.style.visibility = 'hidden';
      node.style.height = '0';
      node.style.minHeight = '0';
      node.style.padding = '0';
      node.style.margin = '0';
      node.style.overflow = 'hidden';
      node.style.maxHeight = '0';
      node.setAttribute('aria-hidden', 'true');
    };

    const apply = () => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          hideNode(node);
        });
      });

      document.querySelectorAll('body, html').forEach((node) => {
        node.style.background = '#ffffff';
        node.style.color = '#111111';
        node.style.margin = '0';
        node.style.padding = '0';
      });

      // Fit full events area in view while keeping a finer appearance.
      const scale = 0.78;
      document.documentElement.style.zoom = '1';
      document.body.style.zoom = '1';
      const scaleRoot = document.querySelector('.wp-site-blocks') || document.body;
      scaleRoot.style.transform = 'scale(' + scale + ')';
      scaleRoot.style.transformOrigin = 'top left';
      scaleRoot.style.width = (100 / scale) + '%';

      const appRoot = document.querySelector('.wp-site-blocks');
      if (appRoot) {
        appRoot.style.background = '#ffffff';
        appRoot.style.color = '#111111';
        appRoot.style.margin = '0';
        appRoot.style.padding = '0';
      }

      let styleTag = document.getElementById('cfm-events-light');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'cfm-events-light';
        styleTag.innerHTML = [
          'html, body, .wp-site-blocks, .tribe-common, .tribe-events, .tribe-block, .tribe-events-view, .tribe-events-l-container { background:#ffffff !important; color:#111111 !important; }',
          '.tribe-events-view h1, .tribe-events-view h2, .tribe-events-view h3, .tribe-events-view h4, .tribe-events-view p, .tribe-events-view span, .tribe-events-view div { color:#111111 !important; }',
          '.tribe-events-c-messages, .tribe-events-c-messages__message, .tribe-events-notices, .tribe-events-notices li, .tribe-events-header__messages, .tribe-events-header__messages * { color:#000000 !important; }',
          '.tribe-events a { color:#7f2969 !important; }',
          '.tribe-events-c-top-bar, .tribe-events-header__top-bar { background:#ffffff !important; border-color:#e6e6e6 !important; }',
          'header, footer, #header, #footer, .site-header, .site-footer, .wp-site-blocks > header.wp-block-template-part, .wp-site-blocks > footer.wp-block-template-part { display:none !important; visibility:hidden !important; height:0 !important; min-height:0 !important; margin:0 !important; padding:0 !important; overflow:hidden !important; max-height:0 !important; }'
        ].join('');
        document.head.appendChild(styleTag);
      }
    };

    apply();
    setTimeout(apply, 250);
    setTimeout(apply, 1000);
    setTimeout(apply, 2200);

    // iOS sometimes hydrates/updates this page late; keep cleanup active briefly.
    let observer = null;
    if (window.MutationObserver) {
      observer = new MutationObserver(apply);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => observer && observer.disconnect(), 12000);
    }

    let runs = 0;
    const intervalId = setInterval(() => {
      apply();
      runs += 1;
      if (runs >= 20) clearInterval(intervalId);
    }, 600);
    return true;
  })();
`;

function SocialButton({ color, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.socialButton,
        hovered && styles.socialButtonHovered,
        pressed && styles.socialButtonPressed,
      ]}
    >
      <MaterialCommunityIcons color={color} name={icon} size={22} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { errorMessage, isBuffering, isPlaying, togglePlayback } = useRadioPlayer();
  const [boardCollapsed, setBoardCollapsed] = useState(true);
  const [boardInfoVisible, setBoardInfoVisible] = useState(false);
  const [boardError, setBoardError] = useState(false);
  const [boardLoading, setBoardLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const boardWebviewRef = useRef(null);
  const boardCleanupTimerRef = useRef(null);

  const openExternal = useCallback((url) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const reloadBoard = useCallback(() => {
    setBoardError(false);
    setBoardLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  const toggleBoardCollapsed = useCallback(() => {
    setBoardCollapsed((prev) => !prev);
  }, []);

  const clearBoardCleanupTimer = useCallback(() => {
    if (boardCleanupTimerRef.current) {
      clearInterval(boardCleanupTimerRef.current);
      boardCleanupTimerRef.current = null;
    }
  }, []);

  const reinforceBoardCleanup = useCallback(() => {
    const webview = boardWebviewRef.current;
    if (!webview?.injectJavaScript) return;
    webview.injectJavaScript(EVENTS_CLEANUP_SCRIPT);
  }, []);

  useEffect(() => {
    return () => {
      clearBoardCleanupTimer();
    };
  }, [clearBoardCleanupTimer]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={HOME_BACKGROUND} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
        <Pressable
          hitSlop={10}
          onPress={() => setBoardInfoVisible(true)}
          style={styles.screenInfoButton}
        >
          <MaterialCommunityIcons color="#ffffff" name="information-outline" size={18} />
        </Pressable>
        <View style={styles.fixedContent}>
          <View style={styles.centerBlock}>
            <Image source={LOGO_IMAGE} style={styles.logo} />
            <Text style={styles.stationName}>{STATION_NAME}</Text>
            <Text style={styles.subtitle}>{STATION_SUBTITLE}</Text>

            <View style={styles.livePill}>
              <View style={[styles.dot, { opacity: isPlaying ? 1 : 0.5 }]} />
              <Text style={styles.livePillText}>{LIVE_BADGE_TEXT}</Text>
            </View>

            <Pressable onPress={togglePlayback} style={styles.playButton}>
              <MaterialCommunityIcons
                color="#ffffff"
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                style={isPlaying ? undefined : styles.playIconShift}
              />
              <Text style={styles.playButtonText}>
                {isBuffering ? 'Conectando...' : isPlaying ? 'Pausar' : 'Reproducir'}
              </Text>
            </Pressable>

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <View style={styles.socialRow}>
              <SocialButton
                color="#0866ff"
                icon="facebook"
                onPress={() => openExternal(FACEBOOK_URL)}
              />
              <SocialButton
                color="#f00075"
                icon="instagram"
                onPress={() => openExternal(INSTAGRAM_URL)}
              />
              <SocialButton
                color="#25d366"
                icon="whatsapp"
                onPress={() => openExternal(WHATSAPP_URL)}
              />
              <SocialButton
                color="#ffffff"
                icon="email-outline"
                onPress={() => openExternal(EMAIL_URL)}
              />
            </View>

            <View style={styles.boardCard}>
              <View style={styles.boardHeader}>
                <View style={styles.boardTitleRow}>
                  <MaterialCommunityIcons color="#FFD200" name="bullhorn-outline" size={18} />
                  <Text style={styles.boardTitle}>Tablón de Anuncios</Text>
                </View>
                <View style={styles.boardHeaderActions}>
                  <Pressable
                    onPress={() => openExternal(EVENTS_URL)}
                    style={styles.boardOpenButton}
                  >
                    <Text style={styles.boardOpenText}>Abrir</Text>
                  </Pressable>
                  <Pressable onPress={toggleBoardCollapsed} style={styles.boardToggleButton}>
                    <MaterialCommunityIcons
                      color="#000000"
                      name={boardCollapsed ? 'chevron-up' : 'chevron-down'}
                      size={16}
                    />
                    <Text style={styles.boardToggleText}>
                      {boardCollapsed ? 'Mostrar' : 'Minimizar'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {boardCollapsed ? (
                <>
                  <Pressable onPress={toggleBoardCollapsed} style={styles.boardCollapsedBar}>
                    <MaterialCommunityIcons color="#FFD200" name="gesture-tap" size={16} />
                    <Text style={styles.boardCollapsedText}>
                      Toca para mostrar eventos.
                    </Text>
                  </Pressable>
                  <Pressable onPress={toggleBoardCollapsed} style={styles.boardCollapsedImageWrap}>
                    <Image
                      resizeMode="contain"
                      source={BOARD_COLLAPSED_IMAGE}
                      style={styles.boardCollapsedImage}
                    />
                  </Pressable>
                </>
              ) : (
                <View style={styles.boardContent}>
                  <WebView
                    ref={boardWebviewRef}
                    key={reloadKey}
                    injectedJavaScript={EVENTS_CLEANUP_SCRIPT}
                    injectedJavaScriptBeforeContentLoaded={EVENTS_CLEANUP_SCRIPT}
                    nestedScrollEnabled
                    onError={() => {
                      setBoardError(true);
                      setBoardLoading(false);
                    }}
                    onHttpError={() => {
                      setBoardError(true);
                      setBoardLoading(false);
                    }}
                    onLoadEnd={() => {
                      setBoardLoading(false);
                      reinforceBoardCleanup();
                      clearBoardCleanupTimer();
                      let runs = 0;
                      boardCleanupTimerRef.current = setInterval(() => {
                        reinforceBoardCleanup();
                        runs += 1;
                        if (runs >= 15) clearBoardCleanupTimer();
                      }, 500);
                    }}
                    onLoadProgress={() => reinforceBoardCleanup()}
                    onLoadStart={() => {
                      clearBoardCleanupTimer();
                      setBoardError(false);
                      setBoardLoading(true);
                    }}
                    source={{ uri: EVENTS_URL }}
                    style={styles.boardWebview}
                    startInLoadingState={false}
                    showsVerticalScrollIndicator
                  />

                  {boardLoading && !boardError && (
                    <View style={styles.boardOverlay}>
                      <ActivityIndicator color="#FFD200" size="small" />
                      <Text style={styles.boardOverlayText}>Cargando eventos...</Text>
                    </View>
                  )}

                  {boardError && (
                    <View style={styles.boardOverlay}>
                      <Text style={styles.boardErrorTitle}>No se pudo cargar el tablón</Text>
                      <View style={styles.boardErrorActions}>
                        <Pressable onPress={reloadBoard} style={styles.boardRetryButton}>
                          <Text style={styles.boardRetryText}>Reintentar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => openExternal(EVENTS_URL)}
                          style={styles.boardRetryButtonGhost}
                        >
                          <Text style={styles.boardRetryTextGhost}>Abrir en navegador</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
        <Modal
          animationType="fade"
          onRequestClose={() => setBoardInfoVisible(false)}
          transparent
          visible={boardInfoVisible}
        >
          <Pressable onPress={() => setBoardInfoVisible(false)} style={styles.boardInfoBackdrop}>
            <Pressable onPress={() => {}} style={styles.boardInfoModal}>
              <Pressable
                hitSlop={10}
                onPress={() => setBoardInfoVisible(false)}
                style={styles.boardInfoCloseButton}
              >
                <MaterialCommunityIcons color="#ffffff" name="close" size={18} />
              </Pressable>
              <Text style={styles.boardInfoText}>
                {'Desarrollado por:\n\nTODO FM S.L.\ninfo@todofm.com\nApasionados por la radio 📻'}
              </Text>
            </Pressable>
          </Pressable>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#000',
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  fixedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 190,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  logo: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 62,
    borderWidth: 2,
    height: 124,
    marginBottom: 2,
    width: 124,
  },
  stationName: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1.6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.92,
  },
  livePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dot: {
    backgroundColor: '#f43856',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  livePillText: {
    color: '#f3f7ff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#7f2969',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
    minWidth: 180,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  playIconShift: {
    marginLeft: 2,
  },
  errorText: {
    color: '#ffd3db',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginTop: 14,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  socialButtonHovered: {
    backgroundColor: 'rgba(255, 210, 0, 0.14)',
    borderColor: '#FFD200',
  },
  socialButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  boardCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: 'rgba(255, 210, 0, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  boardHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(127, 41, 105, 0.28)',
    borderBottomColor: 'rgba(255, 210, 0, 0.35)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  boardHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  boardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  boardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  boardOpenButton: {
    backgroundColor: '#FFD200',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  boardOpenText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  boardToggleButton: {
    alignItems: 'center',
    backgroundColor: '#FFD200',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  boardToggleText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  boardCollapsedBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  boardCollapsedText: {
    color: '#f2f2f2',
    fontSize: 12,
    fontWeight: '600',
  },
  boardCollapsedImageWrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    padding: 12,
    width: '100%',
  },
  boardCollapsedImage: {
    aspectRatio:
      BOARD_COLLAPSED_IMAGE_SOURCE.width / BOARD_COLLAPSED_IMAGE_SOURCE.height,
    borderRadius: 18,
    alignSelf: 'center',
    maxWidth: '100%',
    width: '100%',
  },
  screenInfoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: 18,
    width: 28,
    zIndex: 5,
  },
  boardInfoBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  boardInfoModal: {
    backgroundColor: '#121212',
    borderColor: 'rgba(255, 210, 0, 0.45)',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 340,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 38,
    width: '100%',
  },
  boardInfoCloseButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  boardInfoText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  boardContent: {
    height: 300,
    position: 'relative',
    width: '100%',
  },
  boardWebview: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  boardOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  boardOverlayText: {
    color: '#f3f3f3',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  boardErrorTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  boardErrorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  boardRetryButton: {
    backgroundColor: '#FFD200',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  boardRetryText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  boardRetryButtonGhost: {
    borderColor: '#FFD200',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  boardRetryTextGhost: {
    color: '#FFD200',
    fontSize: 12,
    fontWeight: '800',
  },
});
