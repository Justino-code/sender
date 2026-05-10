export { OmbalaProvider } from "./ombala/index.js";
export { KambaSmsProvider } from "./kambasms/index.js";

// Registrar providers automaticamente
import { registerProviders } from "../core/registry.js";
import { OmbalaProvider } from "./ombala/index.js";
import { KambaSmsProvider } from "./kambasms/index.js";

registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
});