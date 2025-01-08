# Base Nuxt Layer
[![E2E Tests](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml/badge.svg)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/e2e.js.yml)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://github.com/NisuSan/base-nuxt-layer/actions/workflows/code_quality.js.yml)

The **Base Nuxt Layer** is a foundational setup designed to enhance development efficiency for Nuxt.js applications. It provides a structured architecture, pre-configured modules, and utilities to streamline common development tasks, making it easier to focus on building features rather than setting up boilerplate code.

## Key Features

- **Modular Design**: Includes pre-built modules for API generation, theme management, and icons integration.
- **Custom Components**: Provides reusable components like `c-form` and `c-input` with built-in validation.
- **Theme System**: Supports light and dark themes with customizable styles via SCSS and Tailwind CSS.
- **API Generation**: Automates the creation of composables for server-side endpoints, ensuring type-safe API calls.
- **Icons Engine**: Simplifies icon usage with Iconify and `unplugin-icons` for dynamic imports.
- **Testing Ready**: Integrated with Cypress for end-to-end testing.

## Ideal Use Cases

This layer is best suited for developers who:

- Want a robust starting point for Nuxt.js projects.
- Need type-safe and automated API integration.
- Require consistent theming across light and dark modes.
- Seek a pre-configured testing environment.
- Prefer modular and scalable project setups.

By leveraging this base layer, developers can save time and reduce the complexity of initial project setup, focusing on delivering high-quality features efficiently.


## Installation

Setting up this layer is straightforward by connecting it directly from the Git repository.

1. **Add the Layer**: Extend the layer in `nuxt.config.ts` by adding it from GitHub:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    ['github:nisusan/base-nuxt-layer', { install: true }]
  ]
});
```

2. **Install Sass-Embedded**: Required for project styling.

```css
pnpm add -D sass-embedded
```

3. **Prepare the Nuxt Layer**: Set up the layer with the following command:

```css
nuxt prepare
```

4. **Configure app.vue**: Wrap your application with the `NaiveUIWrapper` component:

```vue
<template>
  <NaiveUIWrapper>
    <NuxtPage />
  </NaiveUIWrapper>
</template>
```

## Modules

### API Generation Module

The API Generation Module simplifies API calls by automatically generating composables from files in the `server/api` directory. Instead of using `useFetch` with string routes, you can use a generated composable like `api().auth.login({ login, password })`. It ensures type safety through `ts-morph`, which infers input and output types.

#### API File Requirements:
- Place all API endpoint files in the `server/api` directory.
- Use snake_case or a single word to represent HTTP methods in filenames (e.g., `login.post.ts` for POST, `users.get.ts` for GET).
- Include a `QueryArgs` type in each file to define input. If omitted, an empty object `{}` is assumed.
- Nested folders in the `api` directory are supported and will map to nested objects in the generated composable.

#### Usage Example:

**API Directory Structure:**
```css
/server
 └── /api
      └── /auth
          └── login.get.ts
          └── signup.post.ts
```

**Sample API File Content (login.post.ts):**
```typescript
export default defineEventHandler<_, { login: string, password: string }>(async (event) => {
  return {
    name: 'User 1',
    role: 'admin',
    privileges: [1, 2, 3, 4, 5, 6],
  };
});
```

**Usage in a Vue Component:**
```typescript
const info = api().auth.login({ login, password });
// info is type AsyncData<{ name: string; role: string; privileges: number[] }, Error>

// or
const info = api().auth.loginAsync({ login, password });
// info is type { name: string; role: string; privileges: number[] }
```

> [!TIP]
>  Use `async` if you need to await the response; otherwise, use the synchronous method.

---

#### useNonSSRFetch Composable

The composable is a utility designed to facilitate client-side-only data fetching. It ensures that fetch operations are executed exclusively in the browser, avoiding potential conflicts with server-side rendering (SSR). This composable supports various configurations, enabling flexibility for dynamic data retrieval through reactive inputs and customizable options.

**Parameters:**
- `input (string | Ref<string> | () => string)`:  
  Specifies the endpoint for the fetch request. Accepted formats include:
  - A static string representing the URL (e.g., `"https://example.com"`).
  - A reactive `Ref` object containing the URL as its value.
  - A function that dynamically generates and returns the URL as a string.

- `options (UseNonSSRFetchOptions<T>)`:  
  An optional configuration object that includes:
  - `query (Record<string, unknown>)`: An object defining query parameters to append to the URL.
  - `body (Record<string, unknown> | BodyInit | null)`: The request payload, suitable for methods like `POST` or `PUT`.
  - `headers (Record<string, string>)`: Custom HTTP headers to include in the request.
  - `method (string)`: The HTTP method to use (default: `"GET"`).
  - `transform ((input: unknown) => T`): A function to process and transform the response data before storing it in the `data` property.
  - `default (() => T)`: A function providing default data to initialize the `data` property while awaiting a response.
  - `immediate (boolean)`: Determines whether the fetch operation should execute immediately upon initialization (default: `true`).
  - `watch** (WatchSource<unknown> | WatchSource<unknown>[])`: A reactive dependency or array of dependencies that trigger the fetch operation when they change.

**Returns:**
An object containing the following reactive properties and methods:
- `data (Ref<T | null>)`: A reactive reference to the fetched data or the default value.
- `error (Ref<Error | null>)`: A reactive reference to an error object if the fetch operation fails.
- `isFetching (Ref<boolean>)`: A reactive boolean indicating whether the fetch operation is currently in progress.
- `execute (() => Promise<void>)`: A method to manually trigger the fetch operation.
- `refresh (() => Promise<void>)`: An alias for `execute`, providing semantic clarity for refreshing the data.

```vue
<template>
  <div>
    <p v-if="isFetching">Fetching data...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <p v-else>Data: {{ data }}</p>
    <button @click="refresh">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { useNonSSRFetch } from '@/composables';

const { data, error, isFetching, refresh } = useNonSSRFetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
  transform: (response) => response.items,
  default: () => [],
});
</script>
```

### Theme Module

The theme module provides a flexible, organized approach to managing application themes. It includes the following files:
- `theme.colors.css`: Defines CSS variables for themes (e.g., light and dark).
- `theme.utils.scss`: Contains SCSS utilities such as mixins and functions.
- `tw.base.css`: Configures TailwindCSS.
- `theme.scss`: Defines global styles for buttons, inputs, and other UI components.

> [!IMPORTANT]
> Tailwind 4 is using inside the projet

#### CSS Themes (theme.colors.css)
Define color variables for themes. For example:

```css
/* Light Theme */
[theme='light'] {
  --background-color: #ffffff;
  --text-color: #000000;
  --main-brand: #3498db;
}

/* Dark Theme */
[theme='dark'] {
  --background-color: #1e1e1e;
  --text-color: #f0f0f0;
  --main-brand: #2980b9;
}
```

#### SCSS Utilities (theme.utils.scss)
- **`themed` Mixin**: Apply theme-specific styles to selectors.

```scss
@mixin themed($selector, $theme) { }

// Example:
@include themed('.button', 'light') {
  background-color: var(--main-brand);
}
```

- **`ch` Function**: Conditional color values based on active themes.

```scss
@function ch($light, $dark) { }

// Example:
.button {
  color: ch(#000000, #ffffff);
}
```

#### theme.scss
This file contains global styles for reusable UI components such as buttons, inputs, and other elements.

#### useTheme Composable

A composable for managing and toggling themes, specifically designed to integrate with Naive UI for theme-based styling overrides. It offers a flexible setup for controlling themes within a Nuxt 3 application, with built-in support for dark and light modes.

**Parameters:**
- `options (ptional)`: An object containing:
  - `naiveUIStyles`: An object of type `GlobalThemeOverrides` for custom Naive UI style overrides.

**Returns:**
- `toggleTheme`: Toggles between light and dark themes.
- `setTheme`: Sets a specific theme by name.
- `themeName`: Current theme name.
- `nextThemeName`: Next theme name.
- `themeUI`: Computed object of predefined and custom styles for Naive UI.

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

---

#### useColorChooser Composable

A utility composable for dynamically selecting colors based on the active theme. Designed to support applications with multiple themes (e.g., light, dark) and provides a reactive way to resolve theme-specific colors.

**Parameters:**
The returned function accepts:
- `light (string | Layer.Color)`: The color to use in the light theme.
- `dark (string | Layer.Color)`: The color to use in the dark theme.
- `<some_theme> (string | Layer.Color)`: The color to use in a custom theme.

**Returns:**
A function with the following signature:
- `(light: Layer.Color, dark: Layer.Color) => ComputedRef<string>`
- `(light: string, dark: Layer.Color) => ComputedRef<string>`
- `(light: Layer.Color, dark: string) => ComputedRef<string>`
- `(light: string, dark: string) => ComputedRef<string>`

```vue
<template>
  <div :style="{ color: textColor.value }">Dynamic Theme Color</div>
</template>

<script setup lang="ts">
const chooseColor = useColorChooser();

// Example with string values
const textColor = chooseColor('#ffffff', '#000000');

// Example with Layer.Color values
const backgroundColor = chooseColor('primary', 'primary-disabled');
</script>
```

---

#### colors Utility Function

A utility function to dynamically resolve color values based on either direct color codes (e.g., `#hex`, `rgb(...)`) or CSS custom properties (e.g., `--variable-name`).

**Parameters:**
- `name`: The name of the color. This can either be:
  - A valid CSS color value (e.g., `#ffffff`, `rgb(255, 255, 255)`).
  - A string referring to a CSS custom property (e.g., `primary`, `secondary`).

**Returns:**
- `string`: The resolved color value as a valid CSS color string. Throws an error if the color is not found.

```typescript
import { colors } from '@/utils';
import { Layer } from '@/constants';

// Example 1: Resolving a direct color code
const whiteColor = colors('#ffffff');
console.log(whiteColor); // Output: '#ffffff'

// Example 2: Resolving a color from CSS custom properties
document.documentElement.style.setProperty('--primary', '#505690');
const primaryColor = colors('primary');
console.log(primaryColor); // Output: '#505690'
```

> [!CAUTION]
> An error is thrown if the color is not found.

---

#### useThemeNames Composable

A simple composable that returns an array of available theme names for the application. Useful for dynamically managing or displaying theme options.

**Returns:**
- `string[]`: An array of theme names as strings.

```typescript
const themeNames = useThemeNames();

console.log(themeNames); 
// Output: ["light", "dark"]
```

### Auth Module

Provides a comprehensive solution for managing authentication in the application. It includes client-side utilities, server-side middleware, and API endpoints to handle common authentication tasks such as login, signup, signout, and session validation.

## Components and Files

#### `/app/pages/auth.vue`
This page handles the user interface for authentication, such as login and signup forms. It is the primary entry point for user interactions related to authentication.

- **Key Features**:
  - Displays forms for user login and signup.
  - Validates user input before submission.
  - Integrates with the `useAuth` composable for API calls.

#### `/app/composables/useAuth.ts`
A composable that manages authentication logic on the client side, providing reactive methods and properties for seamless integration into components.

- **Key Features**:
  - `login(credentials: Layer.SignIn)`: Handles user login and manages session storage.
  - `signup(userInfo: Layer.SignUp)`: Calls the signup API to create a new user.
  - `logout()`: Clears user session and redirects to the login page.
  - Reactive properties like `isAuthenticated` and `user` for tracking authentication state.

#### `/app/middleware/auth.global.ts`
A global middleware file that ensures authentication is enforced for protected routes.

- **Key Features**:
  - Redirects unauthenticated users to the login page.
  - Validates the user session before allowing access to protected pages.

#### `/server/api/auth/signup.post.ts`
An API endpoint for user signup, designed to handle new user registration.

- **Key Features**:
  - Accepts a `POST` request with `Layer.SignUp` payload.
  - Validates input and stores hashed passwords in the database.
  - Returns a success message or an error response.

```typescript
const result = await api().auth.signupAsync({
  login: 'john',
  password: 'securepassword',
  repeatedPassword: 'securepassword',
  mail: 'john@example.com'
});
```

#### `/server/api/auth/signin.post.ts`
An API endpoint for user login, designed to authenticate existing users.

- **Key Features**:
  - Accepts a `POST` request with `Layer.SignIn` payload.
  - Validates user credentials and returns a session token on success.

```typescript
fetch('/api/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ login: 'john', password: 'securepassword' }),
});
```

#### `/server/api/auth/signout.post.ts`
An API endpoint for user logout, designed to invalidate user sessions.

- **Key Features**:
  - Accepts a `POST` request to log out the user.
  - Clears session tokens and returns a confirmation message.

```typescript
fetch('/api/auth/signout', {
  method: 'POST',
});
```

#### `/server/api/auth/session.get.ts`
An API endpoint for validating user sessions.

- **Key Features**:
  - Accepts a `GET` request to check the validity of a session token.
  - Returns user information if the session is valid.

- **Example Request**:
  ```typescript
  fetch('/api/auth/session', {
    method: 'GET',
    headers: { Authorization: 'Bearer <token>' },
  });
  ```

#### `/server/middleware/authServer.ts`
Server-side middleware for validating user sessions and handling authentication logic.

- **Key Features**:
  - Checks for valid session tokens in incoming requests.
  - Attaches user information to the request object for use in downstream handlers.
  - Returns a `401 Unauthorized` response if the session is invalid.

#### `/server/utils/auth.ts`
Utility functions for server-side authentication tasks, such as token generation and validation.

- **Key Functions**:
  - `generateToken(user: Layer.User)`: Creates a secure token for the user session.
  - `validateToken(token: string)`: Verifies the authenticity and validity of a session token.
  - `hashPassword(password: string)`: Hashes passwords for secure storage.
  - `comparePasswords(inputPassword: string, hashedPassword: string)`: Compares user input with the stored hash.

## Workflow

1. **Signup**:
   - User fills out the signup form in `/app/pages/auth.vue`.
   - The `signup` method in `useAuth` sends a `POST` request to `/server/api/auth/signup.post.ts`.
   - The API endpoint validates the input, hashes the password, and stores user data.

2. **Login**:
   - User enters credentials on the login form.
   - The `login` method in `useAuth` sends a request to `/server/api/auth/signin.post.ts`.
   - On success, a token is stored in the client session.

3. **Signout**:
   - The `logout` method in `useAuth` sends a request to `/server/api/auth/signout.post.ts`.
   - The session token is invalidated.

4. **Protected Routes**:
   - `auth.global.ts` middleware ensures the user is authenticated before accessing protected pages.
   - `authServer.ts` middleware validates session tokens on server-side requests.

5. **Session Validation**:
   - The client or server can call `/server/api/auth/session.get.ts` to validate the session and retrieve user details.

## Usage Example

**Client-side Login**:
```typescript
import { useAuth } from '@/composables/useAuth';

const { login, isAuthenticated, user } = useAuth();

await login({ login: 'john', password: 'password123' });

if (isAuthenticated.value) {
  console.log(`Welcome, ${user.value.name}`);
}
```

**Server-side Token Validation**:
```typescript
import { validateToken } from '@/server/utils/auth';

export default defineEventHandler(async (event) => {
  const token = event.req.headers['authorization'];

  if (!validateToken(token)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  // Proceed with authenticated request
});
```


### Icons Engine

Provides streamlined icon usage with **[Iconify](https://icon-sets.iconify.design/)** and `unplugin-icons`, automatically downloading and importing icons based on usage.

```vue
<template>
  <i-mdi-home />
</template>
```

#### Icon Naming Convention:
For auto-installing and importing, `unplugin-icons` requires a prefix `i` for every icon name:
- `mdi-home` becomes `<i-mdi-home />` or `<IMdiHome />`.
- `fa-solid:star` becomes `<i-fa-solid-star />` or `<IFaSolidStar />`.

---

### Components

#### c-form Component

A wrapper for organizing input elements and managing validation details.

**Key Features:**
- Validation Feedback: Exposes `formErrors` and `status` through `v-slot`.
- Centralizes error handling and validation state.

```vue
<c-form v-slot="{ formErrors, status }">
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
    <c-input type="string" validation="string-cyrillic"/>
</c-form>
```

---

#### c-input Component

A versatile input component supporting multiple types and validation rules.

**Supported Types:**
- `string`
- `number`
- `checkbox`
- `dropdown`
- `date`
- `datetime`

**Supported Validators:**
- `string`
- `number`
- `string-cyrillic`
- `string-latin`
- `number-positive`
- `Custom` **[Joi](https://joi.dev/api/)** validation rules.

```vue
<c-input type="string" validation="string-cyrillic" />
<c-input type="number" validation="number-positive" />
<c-input type="date" />
```

---

#### NaiveUIWrapper Component

A wrapper for the `n-config-provider` from Naive UI. Provides centralized setup for localization, theme overrides, and dialog management.

**Props:**
- `locale (optional)`: Locale settings, defaulting to `ukUA`.
- `dateLocale (optional)`: Date locale settings, defaulting to `ukUA`.
- `theme (optional)`: Theme overrides, defaulting to the theme from `useTheme`.
- `ssrLoadingBarColor (optional)`: Color for the SSR loading spinner, defaulting to `#6067B1`.

```vue
<NaiveUIWrapper :locale="locale" :date-locale="dateLocale" :theme="customTheme" :ssrLoadingBarColor="'#FF5733'">
  <YourComponent />
</NaiveUIWrapper>
```
