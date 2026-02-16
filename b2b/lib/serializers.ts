import { Decimal } from "@prisma/client/runtime/library";

/**
 * Converte campos Decimal de um objeto para string (serialização JSON segura).
 * Útil para evitar erros de serialização do Prisma Decimal ao retornar respostas de API.
 */
export function serializeProduto<T extends Record<string, unknown>>(produto: T): T {
    const result = { ...produto } as Record<string, unknown>;

    if (result.precoBase instanceof Decimal) {
        result.precoBase = result.precoBase.toString();
    }
    if (result.peso instanceof Decimal) {
        result.peso = result.peso.toString();
    }

    return result as T;
}

/**
 * Serializa campos Decimal de um pedido e seus itens
 */
export function serializePedido<T extends Record<string, unknown>>(pedido: T): T {
    const result = { ...pedido } as Record<string, unknown>;

    const decimalFields = ["subtotal", "desconto", "frete", "total"];
    for (const field of decimalFields) {
        if (result[field] instanceof Decimal) {
            result[field] = result[field].toString();
        }
    }

    // Serializar itens do pedido se existirem
    if (Array.isArray(result.itens)) {
        result.itens = result.itens.map((item: Record<string, unknown>) => {
            const serialized = { ...item };
            if (serialized.precoUnitario instanceof Decimal) {
                serialized.precoUnitario = serialized.precoUnitario.toString();
            }
            if (serialized.precoTotal instanceof Decimal) {
                serialized.precoTotal = serialized.precoTotal.toString();
            }
            if (serialized.produto && typeof serialized.produto === "object") {
                serialized.produto = serializeProduto(serialized.produto as Record<string, unknown>);
            }
            return serialized;
        });
    }

    return result as T;
}

/**
 * Serializa campos Decimal genéricos de qualquer objeto
 */
export function serializeDecimals<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const result = { ...obj } as Record<string, unknown>;
    for (const field of fields) {
        const key = field as string;
        if (result[key] instanceof Decimal) {
            result[key] = result[key].toString();
        }
    }
    return result as T;
}
