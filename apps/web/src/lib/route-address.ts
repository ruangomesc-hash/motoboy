export function validateRouteAddressInput(raw: string): string | null {
  const address = raw.trim();
  if (address.length < 8) {
    return "Endereço muito curto. Use rua, número, bairro e cidade.";
  }
  if (/^\d{5,8}$/.test(address)) {
    return "CEP sozinho não basta — inclua rua e cidade.";
  }
  if (/^[a-zA-Z0-9]+$/i.test(address) && !/\d/.test(address) && address.length < 12) {
    return "Endereço inválido. Informe rua, número e cidade.";
  }
  if (!/[,\s]/.test(address) && address.length < 15 && !/\d/.test(address)) {
    return "Endereço incompleto. Ex.: Rua das Flores, 120, São Paulo";
  }
  return null;
}
