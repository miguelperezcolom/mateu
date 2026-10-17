// Test-only: lets a unit test import a module whose platform edges are react-native / expo packages
// without installing them (CI runs the suite before `npm ci`). Every bare specifier listed below
// resolves to an empty placeholder module, which the test then replaces with `mock.module(...)`.
import { register } from 'node:module';

export function stubNativePackages(packages) {
  register(new URL('./native-packages-hooks.mjs', import.meta.url), { data: { packages } });
}
