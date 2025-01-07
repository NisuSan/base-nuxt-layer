# Base Nuxt Layer
[![E2E Tests](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml/badge.svg)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/code_quality.js.yml)

This Nuxt Layer enhances development efficiency with structured modules, custom components, shared utilities, and themes. The setup includes an API generation module, a comprehensive theme system, an icons engine, and custom form components to streamline your project.

## Installation

Setting up this layer is straightforward — simply connect it directly from the Git repository.

1. **Add the Layer**: In nuxt.config.ts, extend the layer by adding it from GitHub:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    ['github:nisusan/base-nuxt-layer', { install: true }]
  ]
});
```

2. **Install Sass-Embedded**: This is required for the project's styling.

```bash
pnpm add -D sass-embedded
```

3. **Prepare the Nuxt Layer**: Run the following command to set up the layer in your project.

```bash
nuxt prepare
```

4. **Configure app.vue**: Wrap your application in the NaiveUIWrapper component:

```vue
<template>
  <NaiveUIWrapper>
    <NuxtPage />
  </NaiveUIWrapper>
</template>
```

## Modules

### API Generation Module
The API Generation Module simplifies API calls by generating composables from files in the server/api directory. Instead of using useFetch with string routes, developers can use a generated composable like `api().auth.login({login, password})`. It ensures type safety by using ts-morph to infer input and output types.

**API File Requirements:**
- All API endpoint files should be in the server/api directory.
- Filenames should be in snake_case or a single word to represent the HTTP method (e.g., login.post.ts for POST, users.get.ts for GET).
- Each file should include a QueryArgs type representing the input. If omitted, an empty object `{}` is assumed.
- The api folder can contain nested folders, and the generated composable will represent them as nested objects.

### Usage Example

**API Directory Structure:**
```bash
/server
 └── /api
      └── /auth
          └── login.get.ts
          └── signup.post.ts
```

**Sample API File Content (login.post.ts):**
```typescript
// We specify the generics types and use 2nd type as query/params type for autocomplite/intellisense
// The first type '_' hides 'undefined' under the hood and uses just for skiping position
export default defineEventHandler<_, { login: string, paaword: string }>(async (event) => {
  return {
    name: 'User 1',
    role: 'admin',
    privileges: [1, 2, 3, 4, 5, 6],
  }
})
```

**Usage in Vue Component:**
```typescript
const info = api().auth.login({ login, password });
// info is type AsyncData<{ name: string; role: string; privileges: number[] }, Error>
//or
const info = api().auth.loginAsync({ login, password });
// info is type { name: string; role: string; privileges: number[] }
```
> [!TIP]
> Use ```async``` if you need to await for response, otherwise use common method(without async)

### Theme Module
The theme directory in this Nuxt 3 layer provides a flexible and organized approach for managing themes. It includes next iles:
 - `theme.colors.css`: Defines color variables organized by themes (e.g., light and dark).
 - `theme.utils.scss`: Contains SCSS utilities such a mixins, function, etc.
 - `tw.base.css`: Contains setup for the tailwind.
 - `theme.scss`: Contains styles of the theme.

> [!IMPORTANT]
> In this layer we are using the [Tailwind 4](https://tailwindcss.com/docs/v4-beta).
> Place your CSS-first configuration to the `tw.base.css` file

#### colors.theme.css
This file declares CSS variables for each theme, defining colors for elements like backgrounds, text, buttons, and other UI components. Each theme (e.g., *light*, *dark*) is wrapped in a CSS attribute selector:

```css
/* Light Theme */
[theme='light'] {
  --background-color: #ffffff;
  --text-color: #000000;
  --main-brand: #3498db;
  /* additional color variables */
}

/* Dark Theme */
[theme='dark'] {
  --background-color: #1e1e1e;
  --text-color: #f0f0f0;
  --main-brand: #2980b9;
  /* additional color variables */
}
```
#### SCSS Utilities (theme.utils.scss)
- `themed` **Mixin**: Simplifies applying theme-specific styles to a selector.

```scss
@mixin themed($selector: '', $theme: null) { }

// Usage Example:
@include themed('.n-button', 'light') {
  background-color: var(--main-brand);
}

@include themed('.n-button', 'dark') {
  background-color: var(--main-brand);
  font-weight: 600; // also make text bolder in dark theme
}
```
- `ch` **Function**: A utility for conditional color values based on the active theme.

```scss
@function ch($light, $dark, ...) { }

// Usage Example:
.button {
  color: ch(#000000, #ffffff); // Black in light theme, white in dark theme
  margin: 3px; // the same value for all themes
}
```
#### theme.scss
This file contains styles for the global entities like buttons, inputs, etc. 

#### useTheme Composable
A composable for managing and toggling themes, specifically designed to integrate with Naive UI for theme-based styling overrides. It offers a flexible setup for controlling themes within a Nuxt 3 application, with built-in support for dark and light modes. 

Parameters:
 - `options` (Optional): An object containing:
   - `naiveUIStyles`: An object of type GlobalThemeOverrides for custom Naive UI style overrides.

Returns:
- `toggleTheme`: Toggles between light and dark themes
- `setTheme`: Sets specific theme by name
- `themeName`: Current theme name
- `nextThemeName`: Next theme name
- `themeUI`: Computed object of predefined + custom styles for NaiveUI

```vue
<template>
  <n-config-provider :theme-overrides="themeUI">
    <!-- app content -->
  </n-config-provider>
</template>

<script setup lang="ts">
const styles = {};
const { themeUI } = useTheme({ naiveUIStyles: styles });
</script>
```

#### useColorChooser Composable
A utility composable for dynamically choosing colors based on the active theme. Designed to work seamlessly with applications that use multiple themes (e.g., light, dark) and provides a flexible setup for resolving theme-specific colors.
This composable returns a function that computes the appropriate color based on the current theme.

Parameters:
The returned function accepts:

 - light (string | Layer.Color): The color to use in the light theme.
 - dark (string | Layer.Color): The color to use in the dark theme.
 - <some_theme> (string | Layer.Color): The color to use in the <some_theme>.

Returns:
A function with the following signature:
 - (light: Layer.Color, dark: Layer.Color) => ComputedRef<string>
 - (light: string, dark: Layer.Color) => ComputedRef<string>
 - (light: Layer.Color, dark: string) => ComputedRef<string>
 - (light: string, dark: string) => ComputedRef<string>
 - etc.

```vue
  <template>
    <div :style="{ color: textColor.value }">Dynamic Theme Color</div>
  </template>
  
  <script setup lang="ts"> 
  const chooseColor = useColorChooser();
  
  // Example with string values
  const textColor = chooseColor('#ffffff', '#000000');
  
  // Example with Layer.Color values
  const backgroundColor = chooseColor('placeholder', 'placeholder-disabled');
  </script>
```

#### Creating a New Theme
 - **Define Colors**: Add a new theme block in **theme.colors.css** with color variables tailored to your theme.
 - **Update CSS Selectors**: Wrap all color variables within [theme='new-theme-name'].
 - **Use SCSS Utilities**: Leverage **ch** for conditional colors and themed to apply styles based on the theme state.

### Icons Engine
Provides streamlined icon usage with **[Iconify](https://icon-sets.iconify.design/ "Iconify")** and *unplugin-icons*, automatically downloading and importing icons based on usage.

#### Usage Example
```vue
<template>
  <i-mdi-home />
</template>
```

#### Icon naming convention:
For auto installing and importing *unplugin-icons* requires prefix `i` for every icon name.
- **mdi-home** becomes `<i-mdi-home />` or `<IMdiHome />`.
- **fa-solid:star** becomes `<i-fa-solid-star />` or  `<IFaSolidStar />`.

## Components

### c-form Component
Wrapper for organizing input elements and managing validation details.

#### Key Features
- **Validation Feedback**: Exposes `formErrors` and `status` through **v-slot**.
- Centralizes error handling and validation state.

#### Usage Example
```vue
<c-form v-slot="{ formErrors, status }">
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
</c-form>
```

### c-input Component
Versatile input component supporting various types and validation.

#### Supported Types
- string
- number
- checkbox
- dropdown
- date
- datetime

#### Supported Validators
- string
- number
- string-cyrillic
- string-latin
- number-positive
- Custom **[Joi](https://joi.dev/api/ "Joi")** validation rule

#### Usage Example
```vue
<c-input type="string" validation="string-cyrillic" />
<c-input type="number" validation="number-positive" />
<c-input type="date" />
```

### NaiveUIWrapper Component
Serves as a wrapper for the n-config-provider from Naive UI, providing a centralized setup for localization, theme overrides, and dialog management. It also includes a loading spinner for SSR (Server-Side Rendering) that displays until the component is fully loaded.

#### Component Structure
- **Naive UI Config Provide**r: Wraps the main content in n-config-provider, applying global settings like locale, date locale, and theme overrides.
- **Dialog Provider**: Uses n-dialog-provider to handle dialogs within this wrapper.
- **Loader: Displays** a circular loading spinner until the component finishes mounting, suitable for SSR.

#### Props
- **locale** (optional): Locale settings for Naive UI, defaulting to **ukUA** for Ukrainian locale.
- **dateLocale** (optional): Date locale settings for date-related components, also defaulting to **ukUA**.
- **theme** (optional): Theme overrides for Naive UI components, expected as a `ComputedRef<GlobalThemeOverrides>`. Defaults to themeUI from useTheme.
- **srrLoadingBarColor** (optional): Color for the loading spinner during SSR, defaulting to `#6067B1`.

#### Usage Example
In this example, CustomConfigWrapper will display a loading spinner with the specified color until it finishes loading. After loading, it will apply the locale, date locale, and theme overrides to its children.
```vue
<NaiveUIWrapper :locale="locale" :date-locale="dateLocale" :theme="customTheme" :srrLoadingBarColor="'#FF5733'">
  <YourComponent />
</NaiveUIWrapper>
```

### See example in .playground folder for more details
