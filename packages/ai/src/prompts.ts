export function buildExtractionPrompt(input: string): string {
  return `Você é um sistema que extrai dados estruturados de mensagens de motoboys brasileiros.

A mensagem pode ser:
- Registro de entrega ("entrega da farmácia 25 reais")
- Abastecimento ("abasteci 30 reais 5 litros", "coloquei 20 pila 3 litro de gasolina")
- Hodômetro ("painel 45820 km", "to com 45.820 na moto")
- Múltiplos endereços para rota
- Comando ("começar turno", "quanto ganhei hoje")
- Configuração ("meta de hoje 250")

Responda APENAS com JSON válido seguindo um dos schemas abaixo.

## Schema 1: Entrega
{
  "type": "delivery",
  "source": "PARTICULAR" | "IFOOD" | "NINETY_NINE" | "RAPPI" | "OTHER",
  "grossValue": number,
  "originName": string | null,
  "destinationAddr": string | null,
  "distanceKm": number | null,
  "confidence": 0-1
}

## Schema 2: Abastecimento (gasolina do dia — valor REAL pago)
{
  "type": "fuel_refuel",
  "totalAmount": number (reais pagos no posto),
  "liters": number (litros abastecidos),
  "confidence": 0-1
}

## Schema 3: Hodômetro / KM do painel
{
  "type": "odometer",
  "odometerKm": number (km total do painel, ex: 45820.5),
  "confidence": 0-1
}

## Schema 4: Múltiplos endereços (rota)
{
  "type": "route_request",
  "addresses": string[]
}

## Schema 5: Comando
{
  "type": "command",
  "action": "start_shift" | "end_shift" | "today_summary" | "week_summary" | "delete_last"
}

## Schema 6: Configuração
{
  "type": "config",
  "key": "fuel_price" | "daily_goal" | "weekly_goal",
  "value": number
}

## Schema 7: Não entendi
{
  "type": "unknown",
  "originalText": string
}

REGRAS:
- "abasteci", "enchi o tanque", "gasolina" com valor E litros → fuel_refuel.
- Só valor sem litros: estime litros = totalAmount / 6.0 e confidence baixa.
- "painel", "hodômetro", "km na moto", número grande tipo 45000 → odometer.
- "25 conto" = R$ 25. Motoboy fala informal.

Mensagem do motoboy: """${input}"""
JSON:`;
}

export const VISION_PROMPT = `Classifique a imagem e extraia dados. Responda APENAS com JSON.

## 1. Cupom/nota de abastecimento (posto, combustível)
{
  "type": "fuel_receipt",
  "totalAmount": number (valor total em reais),
  "liters": number (litros, ex: 4.523)
}

## 2. Painel/hodômetro da moto (mostra KM total)
{
  "type": "dashboard_odometer",
  "odometerKm": number (quilometragem visível, ex: 45820)
}

## 3. Comanda/bilhete de entrega
{
  "type": "delivery_data",
  "grossValue": number,
  "originName": string|null,
  "destinationAddr": string|null
}

## 4. Foto de entrega concluída (pacote na porta)
{
  "type": "delivery_proof",
  "description": "breve descrição"
}

## 5. Não reconhecido
{ "type": "unknown" }

Prioridade: se vir litros + valor de posto → fuel_receipt. Se vir display de KM → dashboard_odometer.`;
