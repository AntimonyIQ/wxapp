export interface IAsset {
    id: string;
    name: string;
    symbol: string;
    logoURI: string;
    networkLogoURI: string;
    isToken: boolean;
    network: string;
    disabled: boolean;
    contractAddress?: string;
    decimals?: number;
}

const assetsList: IAsset[] = [
    {
        id: "94e322e2-ede6-44d3-a86c-f27616d86787",
        name: "Bitcoin",
        symbol: "BTC",
        logoURI: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
        networkLogoURI: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
        isToken: false,
        network: "BTC",
        disabled: false
    },
    {
        id: "af1120b7-6730-4f0f-a21f-d743021c7fe7",
        name: "Ethereum",
        symbol: "ETH",
        logoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        networkLogoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        isToken: false,
        network: "ETHEREUM",
        disabled: false
    },
    {
        id: "b693843f-7318-4df2-bf90-28989e24109f",
        name: "Tether USD",
        symbol: "USDT",
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
        logoURI: "https://img.icons8.com/color/96/tether--v2.png",
        networkLogoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        isToken: true,
        network: "ETHEREUM",
        disabled: false
    },
    {
        id: "0a90404c-46c8-49f2-b7b5-6a49cfbe9e5e",
        name: "USD Coin",
        symbol: "USDC",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
        networkLogoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        isToken: true,
        network: "ETHEREUM",
        disabled: false
    },
    {
        id: "915a6cf5-1c02-4923-8d2c-b9e4f5fb45dd",
        name: "Binance Coin",
        symbol: "BNB",
        logoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: false,
        network: "BINANCE",
        disabled: false
    },
    {
        id: "ac8c7d86-49af-44ca-a880-8283117c1ae7",
        name: "Binance Smart Chain",
        symbol: "BNB",
        logoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: false,
        network: "BSC",
        disabled: true
    },
    {
        id: "8f95b1ac-353f-455f-b86b-f1d707c3c617",
        name: "Tether USD",
        symbol: "USDT",
        contractAddress: "0x55d398326f99059fF775485246999027B3197955",
        decimals: 6,
        logoURI: "https://img.icons8.com/color/96/tether--v2.png",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "7cf819e6-62ad-4137-bd3e-cbe66b3ef0af",
        name: "BUSD",
        symbol: "BUSD",
        contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/31273/standard/new_binance-peg-busd.png?1696530096",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "cd5e3a51-7181-4455-89a2-5eaf8fbd1586",
        name: "BUSD",
        symbol: "BUSD",
        contractAddress: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/31273/standard/new_binance-peg-busd.png?1696530096",
        networkLogoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
        isToken: true,
        network: "ETHEREUM",
        disabled: false
    },
    {
        id: "c5e3a7f2-8d4b-4a1c-9e6f-3b2d8c7a1f5e",
        name: "USD Coin",
        symbol: "USDC",
        contractAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "75ee16b3-14fd-4dc6-8b09-e368a1734966",
        name: "Tron",
        symbol: "TRX",
        logoURI: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png?1547035066",
        networkLogoURI: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png?1547035066",
        isToken: false,
        network: "TRON",
        disabled: false
    },
    {
        id: "a68a971d-160c-491f-82bb-d42cef6e851b",
        name: "Tether USD",
        symbol: "USDT",
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        decimals: 6,
        logoURI: "https://img.icons8.com/color/96/tether--v2.png",
        networkLogoURI: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png?1547035066",
        isToken: true,
        network: "TRON",
        disabled: false
    },
    {
        id: "aababa17-52a0-4b05-9216-4b20362f171e",
        name: "Dogecoin",
        symbol: "DOGE",
        logoURI: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256",
        networkLogoURI: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256",
        isToken: false,
        network: "DOGECOIN",
        disabled: false
    },
    {
        id: "b54faa47-041c-439e-a847-d7f06bd032dd",
        name: "Solana",
        symbol: "SOL",
        logoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
        networkLogoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
        isToken: false,
        network: "SOLANA",
        disabled: false
    },
    {
        id: "001647a2-edd9-4018-b0ae-abddfe3b73f2",
        name: "USD Coin",
        symbol: "USDC",
        contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
        networkLogoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
        isToken: true,
        network: "SOLANA",
        disabled: false
    },
    {
        id: "5d6ad8bc-6ef1-4717-ace6-de0f3a52351f",
        name: "Tether USD",
        symbol: "USDT",
        contractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        decimals: 6,
        logoURI: "https://img.icons8.com/color/96/tether--v2.png",
        networkLogoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
        isToken: true,
        network: "SOLANA",
        disabled: false
    },
    {
        id: "a9c8f3e2-7d5b-4a1e-9f6c-8b2e3d7f1c4a",
        name: "BUSD",
        symbol: "BUSD",
        contractAddress: "33fsBLA8djQm82RpHmE3SuVrPGtZBWNYExsEUeKX1HXX",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/31273/standard/new_binance-peg-busd.png?1696530096",
        networkLogoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422",
        isToken: true,
        network: "SOLANA",
        disabled: false
    },
    {
        id: "669f7b0e-dbd7-49c2-b947-aeb8f73cf05a",
        name: "Bitcoin Cash",
        symbol: "BCH",
        logoURI: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1594689492",
        networkLogoURI: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1594689492",
        isToken: false,
        network: "BITCOIN_CASH",
        disabled: false
    },
    {
        id: "e8b5c2d4-9f3a-4e1b-8c7d-5a2e9f4b6c1a",
        name: "Dogecoin",
        symbol: "DOGE",
        contractAddress: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
        decimals: 8,
        logoURI: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "7d4f8e2a-1c5b-4a9e-b6d3-8f2e4c7a1b9d",
        name: "Bitcoin Cash",
        symbol: "BCH",
        contractAddress: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png?1594689492",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "3c9d5e7f-2b8a-4f1c-a6e4-9d7b2f8c3e1a",
        name: "XRP",
        symbol: "XRP",
        logoURI: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1605778731",
        networkLogoURI: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1605778731",
        isToken: false,
        network: "XRP",
        disabled: false
    },
    {
        id: "6f8a3e2d-4b9c-4e7a-b5d1-7c3f9e1a6b8d",
        name: "XRP",
        symbol: "XRP",
        contractAddress: "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",
        decimals: 18,
        logoURI: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1605778731",
        networkLogoURI: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970",
        isToken: true,
        network: "BSC",
        disabled: false
    },
    {
        id: "ngn-naira",
        name: "Nigerian Naira",
        symbol: "NGN",
        logoURI: "https://img.icons8.com/color/48/nigeria-circular.png",
        networkLogoURI: "https://img.icons8.com/color/48/nigeria-circular.png",
        isToken: false,
        network: "FIAT",
        disabled: false
    }
];

// Helper function to get asset by symbol
export const getAssetBySymbol = (symbol: string): IAsset | undefined => {
    if (!symbol) return undefined;
    return assetsList.find(asset => asset.symbol.toUpperCase() === symbol.toUpperCase());
};

// Helper function to get asset by symbol and network
export const getAssetBySymbolAndNetwork = (symbol: string, network: string): IAsset | undefined => {
    if (!symbol || !network) return undefined;
    return assetsList.find(
        asset => asset.symbol.toUpperCase() === symbol.toUpperCase() &&
            asset.network.toUpperCase() === network.toUpperCase()
    );
};

// Helper function to get asset logo URI
export const getAssetLogoURI = (symbol: string): string | null => {
    const asset = getAssetBySymbol(symbol);
    return asset?.logoURI || null;
};

export default assetsList;
