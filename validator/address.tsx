export default class AddressValidator {
    private prefixes: { BTC: RegExp; ETH: RegExp; LTC: RegExp; XRP: RegExp; BCH: RegExp; ADA: RegExp; DOT: RegExp; XLM: RegExp; LINK: RegExp; BNB: RegExp; USDC: RegExp; USDT: RegExp; SOL: RegExp; };
    constructor() {
        this.prefixes = {
            BTC: /^[13mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            ETH: /^(?:0x)?[a-fA-F0-9]{40}$/,
            LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
            XRP: /^r[0-9a-zA-Z]{24,34}$/,
            BCH: /^((bitcoincash:)?(q|p)[a-z0-9]{41})$/,
            ADA: /^addr1[0-9a-zA-Z]{38}$/,
            DOT: /^1[a-zA-Z0-9]{47}$/,
            XLM: /^G[A-Z2-7]{55}$/,
            LINK: /^(?:0x)?[a-fA-F0-9]{40}$/,
            BNB: /^(bnb1)[0-9a-z]{38}$/,
            USDC: /^(?:0x)?[a-fA-F0-9]{40}$/,
            USDT: /^(?:0x)?[a-fA-F0-9]{40}$/,
            SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        };
    }

    address(symbol: string, publicKey: string): boolean {
        switch (symbol.toUpperCase()) {
            case 'BTC':
                return this.validateBTCAddress(publicKey);
            case 'ETH':
            case 'USDC':
            case 'USDT':
                return this.validateETHAddress(publicKey);
            case 'LTC':
                return this.validateLTCAddress(publicKey);
            case 'XRP':
                return this.validateXRPAddress(publicKey);
            case 'BCH':
                return this.validateBCHAddress(publicKey);
            case 'ADA':
                return this.validateADAAddress(publicKey);
            case 'DOT':
                return this.validateDOTAddress(publicKey);
            case 'XLM':
                return this.validateXLMAddress(publicKey);
            case 'LINK':
                return this.validateLINKAddress(publicKey);
            case 'BNB':
                return this.validateBNBAddress(publicKey);
            case 'SOL':
                return this.validateSOLAddress(publicKey);
            default:
                throw new Error(`Unsupported blockchain symbol: ${symbol}`);
        }
    }

    validateBTCAddressLegacy(address: string): boolean {
        return this.prefixes.BTC.test(address);
    }

    validateBTCAddress(address: string) {
        if (address.startsWith('bc1')) {
            return /^bc1[a-zA-HJ-NP-Z0-9]{8,87}$/.test(address);
        }
        return this.prefixes.BTC.test(address);
    }

    validateETHAddress(address: string): boolean {
        return this.prefixes.ETH.test(address);
    }

    validateLTCAddress(address: string): boolean {
        return this.prefixes.LTC.test(address);
    }

    validateXRPAddress(address: string): boolean {
        return this.prefixes.XRP.test(address);
    }

    validateBCHAddress(address: string): boolean {
        return this.prefixes.BCH.test(address);
    }

    validateADAAddress(address: string): boolean {
        return this.prefixes.ADA.test(address);
    }

    validateDOTAddress(address: string): boolean {
        return this.prefixes.DOT.test(address);
    }

    validateXLMAddress(address: string): boolean {
        return this.prefixes.XLM.test(address);
    }

    validateLINKAddress(address: string): boolean {
        return this.prefixes.LINK.test(address);
    }

    validateBNBAddress(address: string): boolean {
        return this.prefixes.BNB.test(address);
    }

    validateSOLAddress(address: string): boolean {
        return this.prefixes.SOL.test(address);
    }

    isSymbolSupported(symbol: string): boolean {
        return Object.keys(this.prefixes).includes(symbol.toUpperCase());
    }
}
