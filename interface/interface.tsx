// This file is part of the Wealthx project.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import mongoose from "mongoose";
import {
    AccountTier,
    BiometricType,
    BlockchainNetwork,
    Coin,
    CryptoType,
    Engine,
    Fiat,
    IdentityType,
    NotificationCategory,
    NotificationPiority,
    NotificationType,
    Status,
    TransactionStatus,
    TransactionType,
    UserType,
    WalletType,
    WhichAction,
} from "@/enums/enums";

export interface IResponse<Data = any, Error = any> {
    code: number;
    status: Status;
    message: string;
    data?: Data;
    error?: Error;
    pargination?: IPargination;
    timestamp: string;
    requestId: string;
    copyright: ICopyright;
    help: Array<string>;
    docs: string;
    version: string;
    handshake?: string;
}

export interface IPargination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ICopyright {
    year: string;
    holder: string;
    license: string;
    licenseUrl: string;
}

export interface IHKeys {
    privateKey: string;
    publicKey: string;
}

export interface IUser {
    _id: string;
    username: string;
    tagName: string;
    fullName: string;
    email: string;
    isEmailVerified: boolean;
    key: string;
    country: string;
    phoneNumber: string;
    isPhoneNumberVerified: boolean;
    dateOfBirth: string;
    pin: string;
    address: string;
    mnemonic: string;
    referralCode: string;
    password: string;
    identityType: IdentityType;
    isIdentityVerified: boolean;
    identityVerifiedAt: Date;
    biometricType: BiometricType;
    biometric: string;
    biometricVerified: boolean;
    biometricVerifiedAt: Date;
    biometricEnabled: boolean;
    isVerificationComplete: boolean;
    loginCount: number;
    loginLastAt: Date;
    loginLastIp: string;
    loginLastDevice: string;
    twoFactorSecret: string;
    twoFactorURL: string;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    twoFactorVerifiedAt: Date;
    isSuspecious: boolean;
    isActive: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    userType: UserType;
    refreshToken: string;
    deviceToken: string;
    createdAt: Date;
    updatedAt: Date;
    passkey: string;
    passkeyEnabled: boolean;
    passkeyVerified: boolean;
    passkeyVerifiedAt: Date;
    tier: AccountTier;
    firstDepositConfirmed: boolean;
    deleted: boolean;
    deletedAt: Date;
    deletedBy: mongoose.Types.ObjectId;
    comparePassword(password: string): Promise<boolean>;
    comparePin(pin: string): Promise<boolean>;
    comparePasskey(passkey: string): Promise<boolean>;
    compareBiometric(biometric: string): Promise<boolean>;
    compareDeviceToken(deviceToken: string): Promise<boolean>;
}

export interface IAuth {
    fullName: string;
    email: string;
    password: string;
    otp?: string;
}

export interface IUserGlobal {
    id: string;
    email: string;
    userType: UserType;
}

export interface ILogin extends IAuth {
    loginLastIp: string;
    loginLastDevice: string;
    method: "email" | "sms" | "2FA";
    code: string;
}

export interface IWallet extends mongoose.Document {
    address: string;
    privateKey: string;
    publicKey: string;
    currency: Coin;
    network: BlockchainNetwork;
    userId: mongoose.Types.ObjectId;
    balance: number;
    type: WalletType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProvider extends IWallet {
    wxfee: number;
    cryptofee: number;
    sellrate: number;
    buyrate: number;
    active: boolean;
    price: number;
    mnemonic: string;
    engine: Engine
    threshold: number;
    tier0: number;
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
}

export interface IAction extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    which: WhichAction;
    reason: string;
    resolved: boolean;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IKeys {
    address: string;
    privateKey: string;
    publicKey: string;
}

export interface ITransaction extends mongoose.Document {
    from: string;
    to: string;
    fromCurrency: Coin;
    toCurrency: Coin;
    userId: mongoose.Types.ObjectId;
    amount: number;
    status: TransactionStatus;
    hash: string;
    fees: number;
    reference: string;
    type: TransactionType;
    nonce: string;
    confirmations: string;
    blockNumber: string;
    timestamp: string;
    network: BlockchainNetwork;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    providerId: mongoose.Types.ObjectId;
    to: string;
    walletId: mongoose.Types.ObjectId;
    amount: number;
    currency: Coin | Fiat;
    reference: string;
    status: TransactionStatus;
}

export interface IChat extends mongoose.Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    message: string;
    reactions: Array<string>;
}

export interface INotification extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    body: string;
    type: NotificationType;
    isRead: boolean;
    link: string;
    category: NotificationCategory;
    priority: NotificationPiority;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBank extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    accountNumber: string;
    bankName: string;
    accountName: string;
    bankCode: string;
    recipientCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBankList {
    name: string;
    code: string;
    slug: string;
    icon: string;
}

export interface IMarket {
    currency: Coin | Fiat;
    name: string;
    categorie: WalletType;
    network: BlockchainNetwork;
    address: string;
    price: number;
    balance: number;
    balanceUsd: number;
    icon: string;
    percent_change_24h: number;
    volume_change_24h: number;
    market_cap: number;
    active: boolean;
}

export interface IProviderMarket extends IMarket {
    wxfee: number;
    cryptofee: number;
    sellrate: number;
    buyrate: number;
    active: boolean;
    price: number;
    mnemonic: string;
    engine: Engine;
    threshold: number;
}

export interface ITransfer {
    to: string;
    name: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    currency: Coin;
    network: BlockchainNetwork;
    reference: string;
    privateKey: string
};

export interface ICoinBalances {
    btc: string;
    eth: string;
    bnb: string;
    tron: string;
    usdc_bsc: string;
    usdt_bsc: string;
    usdc_tron: string;
    usdt_tron: string;
}

export interface IBlockchain extends mongoose.Document {
    currency: Coin;
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
    network: BlockchainNetwork;
    type: CryptoType;
    blockHash?: string;
    raw?: any;
}

export interface IStatistics {
    totalUsers: number;
    totalUserBalanceUsd: number;
    totalUserBalanceNgn: number;
    totalTransactionUsd: number;
    totalTransactionNgn: number;
    totalBitcoinBalanceUsd: number;
    totalEthereumBalanceUsd: number;
    totalBnbBalanceUsd: number;
    totalUsdtBalanceUsd: number;
    totalUsdcBalanceUsd: number;
    totalNairaBalanceUsd: number;
    totalTransactionProcessed: number;
    totalBankAccountAdded: number;
    totalPendingOrder: number;
    totalCompletedOrder: number;
    totalSuccessOrder: number;
    totalPendingTransaction: number;
    totalSuccessfulTransaction: number;
    totalSuspendedUser: number;
    totalActiveUser: number;
    totalAdmin: number;
}

export interface UserData {
    user?: IUser,
    isLoggedIn: boolean,
    isRegistred: boolean,
    isVerified: boolean,
    client: {
        privateKey: string;
        publicKey: string;
    },
    deviceid: string,
    devicename: string,
    registration: IRegistration;
    authorization: string;
    deviceId: string;
    location: string;
    markets: Array<IMarket>;
    transactions: Array<ITransaction>;
    hideBalance: boolean;
    totalBalanceNgn: number;
    totalBalanceUsd: number;
    passkey: string;
    params: IParams;
    // [key: string]: any;
}

export interface DecodedToken {
    isLoggedIn: boolean;
    userData: UserData;
    exp?: number;
}

export interface IList {
    name: string;
    description: string;
    icon: string;
}

export interface IRegistration {
    email: string;
    password: string;
    confirmPassword?: string;
    termsAndConditions?: boolean;
    username?: string;
    country?: string;
    referralCode?: string;
    fullName?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    pin?: string;
    tagName?: string
    countryCode: string;
    // [key: string]: any;
}

export interface IParams {
    currency: Coin | Fiat;
    network: BlockchainNetwork;
    toaddress?: string;
    amount?: string;
    swap?: ISwap;
}

export interface ILocation {
    ip: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    org: string;
    network: string;
    version: string;
    region_code: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: any,
    latitude: number;
    longitude: number;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
}

export interface ISwap {
    fromValue: number;
    toValue: number;
    fromCurrency: Coin | Fiat;
    toCurrency: Coin | Fiat;
}