import { registerProviders } from "../core/registry.js";
import { OmbalaProvider } from "./ombala.provider.js";
import { KambaSmsProvider } from "./kambasms.provider.js";

// Registra todos os providers built-in
registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
});

export { OmbalaProvider } from "./ombala.provider.js";
export { KambaSmsProvider } from "./kambasms.provider.js";