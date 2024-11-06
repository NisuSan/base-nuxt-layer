import type { GlobalThemeOverrides } from 'naive-ui'
import colors from '#tw/theme/colors'
import { useColorMode, useDark, useToggle } from '@vueuse/core'

type Options = {
  naiveUIStyles: GlobalThemeOverrides
}

export function useTheme(options?: Options) {
  const defaultOptions = { naiveUIStyles: {} }
  options = Object.assign(options || {}, { ...defaultOptions, ...options })

  const themes = useThemeNames()
  const isDark = useDark({ attribute: 'theme', valueDark: 'dark', valueLight: 'light' })
  const toggleTheme = useToggle(isDark)

  const themeName = useColorMode({ attribute: 'theme', modes: Object.fromEntries(themes.map(n => [n, n])) })
  const nextThemeName = computed(() => isDark.value ? 'light' : 'dark')

  const setTheme = ((theme: typeof themes[number]) => themeName.value = theme ) as { (theme: typeof themes[number] | string): void }
  const themeUI = naiveUiOverrides(options.naiveUIStyles)

  return { toggleTheme, setTheme, themeName, nextThemeName, themeUI }
}

function naiveUiOverrides(customStyles: GlobalThemeOverrides) {
  const ch = useColorChooser()
  const buttonColorMap = (prop: string) => [prop, colors['text']]

  const createPressedColors = () => {
    const kind = ['Primary', 'Info', 'Success', 'Warning'] as const
    // @ts-expect-error value from colors array getting in runtime
    return Object.fromEntries(['color', 'border'].map(p => kind.map(k => [`${p}Pressed${k}`, colors[`${k === 'Primary' ? 'main-brand' : k.toLowerCase()}-hover`]])).flat())
  }

  return computed<GlobalThemeOverrides>(() => ({
    common: {
      textColor2: ch('text', 'card-text').value,
      textColor3: ch('text', 'card-text').value,
      baseColor: colors['background'],
      primaryColor: colors['main-brand'],
      primaryColorHover: colors['main-brand-hover'],
      primaryColorSuppl: colors['main-brand-hover'],
      infoColor: colors['info'],
      infoColorHover: colors['info-hover'],
      successColor: colors['success'],
      successColorHover: colors['success-hover'],
      warningColor: colors['warning'],
      warningColorHover: colors['warning-hover'],
      errorColor: colors['danger'],
      errorColorHover: colors['danger-hover'],
      textColorBase: colors['text'],
      placeholderColor: colors['placeholder'],
      placeholderColorDisabled: colors['placeholder-disabled'],
      textColorDisabled: colors['disabled-text'],
      inputColorDisabled: colors['disabled-background'],
      borderColor: colors['border'],
      dividerColor: colors['border'],
      inputColor: colors['background'],
      tableColor: colors['background'],
      cardColor: colors['background'],
      modalColor: colors['background'],
      bodyColor: colors['background'],
      popoverColor: colors['background'],
      tagColor: colors['border'],
      hoverColor: colors['main-brand'],
      opacityDisabled: '0.5',
      boxShadow1: '0 1px 2px rgba(0, 0, 0, .08)',
      boxShadow2: '0 3px 6px rgba(0, 0, 0, .12)',
      scrollbarColor: colors['border'],
      scrollbarColorHover: colors['border'],
      scrollbarColorTrack: colors['border'],
      scrollbarColorTrackHover: colors['border'],
      scrollbarColorThumb: colors['border'],
    },
    Button: {
      ...Object.fromEntries(['textColorPrimary', 'textColorInfo', 'textColorSuccess', 'textColorWarning', 'textColorError'].map(buttonColorMap)),
      ...Object.fromEntries(['textColorHoverPrimary', 'textColorHoverInfo', 'textColorHoverSuccess', 'textColorHoverWarning', 'textColorHoverError'].map(buttonColorMap)),
      color: ch('background', 'card-background').value,
      colorHover: ch('background', 'card-background').value,
      textColor: ch('text', 'card-text').value,
      textColorHover: ch('main-brand-hover', 'card-text').value,
      colorTertiary: colors['translucent'],
      textColorTertiary: ch('main-brand', 'dark-accent').value,
      textColorTertiaryHover: ch('main-brand', 'dark-accent').value,
      textColorPressed: ch('main-brand', 'light-accent').value,
      colorPressed: colors['translucent'],
      border: '1px solid ' + colors['border'],
      ...createPressedColors(),
      borderPressed: '1px solid ' + colors[`main-brand`],
      colorPressedError: colors[`danger-hover`],
      borderPressedError: colors[`danger-hover`],
    },
    Card: {
      color: ch('transparent', 'card-background').value,
      borderColor: 'none',
      paddingMedium: '10px',
      borderRadius: '5px',
      titleFontSizeMedium: '1rem',
      titleTextColor: colors['text'],
    },
    Checkbox: {
      checkMarkColor: colors['text'],
    },
    Switch: {
      railColor: ch('rgba(0, 0, 0, .14)',  'border').value,
    },
    Collapse: {
      arrowColor: ch('main-brand', 'light-accent').value,
      titleTextColor: colors['text'],
      dividerColor: colors['light-accent'] + 42,
      itemMargin: '10px 0 0 0',
      titlePadding: '10px 0 0 0',
    },
    DatePicker: {
      calendarTitleColorHover: colors['translucent'],
      calendarTitleTextColor: colors[`main-brand`],
    },
    Tabs: {
      tabFontWeightActive: '500',
      tabTextColorLine: colors['text'],
      tabTextColorBar: colors['text'],
    },
    Dialog: {
      titleFontSize: '1rem',
      titleTextColor: colors['text'],
      textColor: colors['text'],
      color: colors['modal-background'],
      iconMargin: '0 7px 0 0',
      closeIconColorHover: colors['danger-hover'],
    },
    ...customStyles
  }))
}
