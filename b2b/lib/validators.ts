/**
 * Validador de CNPJ com verificação de dígitos
 * Verifica formato e calcula dígitos verificadores
 */
export function isValidCNPJ(cnpj: string): boolean {
    // Remover caracteres não numéricos
    const cleaned = cnpj.replace(/\D/g, "");

    // Verificar tamanho
    if (cleaned.length !== 14) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    // Validar dígitos verificadores
    const calcDigit = (digits: string, weights: number[]): number => {
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += parseInt(digits.charAt(i)) * weights[i];
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const digit1 = calcDigit(cleaned, weights1);
    const digit2 = calcDigit(cleaned, weights2);

    return (
        parseInt(cleaned.charAt(12)) === digit1 &&
        parseInt(cleaned.charAt(13)) === digit2
    );
}

/**
 * Validador de CPF com verificação de dígitos
 */
export function isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    const calcDigit = (digits: string, factor: number): number => {
        let sum = 0;
        for (let i = 0; i < factor - 1; i++) {
            sum += parseInt(digits.charAt(i)) * (factor - i);
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    const digit1 = calcDigit(cleaned, 10);
    const digit2 = calcDigit(cleaned, 11);

    return (
        parseInt(cleaned.charAt(9)) === digit1 &&
        parseInt(cleaned.charAt(10)) === digit2
    );
}

/**
 * Validador de CEP (formato: 00000-000 ou 00000000)
 */
export function isValidCEP(cep: string): boolean {
    const cleaned = cep.replace(/\D/g, "");
    return /^\d{8}$/.test(cleaned);
}

/**
 * Validador de telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return /^\d{10,11}$/.test(cleaned);
}
