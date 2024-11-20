# Base Nuxt Layer

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
type QueryArgs = { login: string, paaword: string }
export default defineEventHandler(async (event) => {
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
//or
const info = api().auth.signup({ login, password });
// info is of type AsyncData<{ name: string; role: string; privileges: number[] }, Error>
```

### useExtendedFetch Composable

The `useExtendedFetch` composable extends Nuxt's native useFetch capabilities with advanced features for API calls.

#### Key Features
- **Method Selection**: Supports all HTTP methods, adjusting query or body automatically.
- **Parameter Handling**: Accepts parameters as either Ref or direct values.
- **Array Parameter Support**: Automatically transforms array parameters into correct format.
- **Caching**: Optional caching with `withCache` option.
- **Lazy Loading**: Supports lazy loading by default.

#### Usage Example
```typescript
const response = useExtendedFetch('/api/auth/login', 'post', { login, password }, { withCache: true });
```

### Theme Module
The theme directory in this Nuxt 3 layer provides a flexible and organized approach for managing themes. It includes two files:
 - `theme.colors.css`: Defines color variables organized by themes (e.g., light and dark).
 - `theme.scss`: Contains SCSS utilities for working with theme colors.

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
#### SCSS Utilities (theme.scss)
Offers SCSS utilities to help apply themes conditionally and structure theme-specific styles.

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

#### Tailwind Configuration:
The **Tailwind** configuration in this layer is linked to the **theme.colors.css** file, enabling the usage of theme-specific colors directly within Tailwind utility classes. This setup allows dynamic color adjustments based on the active theme (e.g., light or dark mode) by leveraging CSS variables.

**tailwind.config.ts file**
In the extend section color names are mapped to the CSS variables defined in theme.colors.css:

```javascript
theme: {
  extend: {
    colors: {
      'background-color': 'var(--background-color)',
      'text-color': 'var(--text-color)',
      'main-brand': 'var(--main-brand)',
      // Add more custom colors as needed
    },
  },
},
```
#### How It Works
 - Each color key (e.g., 'background-color', 'text-color') points to a corresponding CSS variable in theme.colors.css.
 - When the theme changes (e.g., from light to dark), the values in **theme.colors.css** adjust automatically, and Tailwind utility classes using these colors (e.g., bg-background-color, text-text-color) will reflect the active theme's colors without manual updates.

#### Usage in Components
With this setup, you can use Tailwind classes for colors that adapt to the active theme:

```html
<div class="bg-background-color text-text-color">
  This div background and text color change based on the active theme.
</div>
```

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
