export { OmbalaProvider } from "./ombala/index.js";
export { KambaSmsProvider } from "./kambasms/index.js";
export { TelcoSmsProvider } from "./telcosms/index.js";

// Registrar providers automaticamente
import { registerProviders } from "../core/index.js";
import { OmbalaProvider } from "./ombala/index.js";
import { KambaSmsProvider } from "./kambasms/index.js";
import { TelcoSmsProvider } from "./telcosms/telcosms.provider.js";

registerProviders({
  ombala: OmbalaProvider,
  kambasms: KambaSmsProvider,
  telcosms: TelcoSmsProvider,
});