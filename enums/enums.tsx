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

export enum ACCESSPOINTS {
    ios = "ios.wealthx.app",
    android = "android.wealthx.app",
    web = "web.wealthx.app",
}

export enum HTTP_METHODS {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD",
    CONNECT = "CONNECT",
    TRACE = "TRACE",
}

export enum CONTENT_TYPE {
    JSON = "application/json",
    FORM_URLENCODED = "application/x-www-form-urlencoded",
    MULTIPART_FORM_DATA = "multipart/form-data",
    TEXT_PLAIN = "text/plain",
    TEXT_HTML = "text/html",
    APPLICATION_XML = "application/xml",
    APPLICATION_OCTET_STREAM = "application/octet-stream",
    APPLICATION_GRAPHQL = "application/graphql",
    APPLICATION_YAML = "application/x-yaml",
    APPLICATION_PROTOBUF = "application/x-protobuf",
    APPLICATION_ZIP = "application/zip",
    APPLICATION_GZIP = "application/gzip",
    APPLICATION_PDF = "application/pdf",
    APPLICATION_CSV = "text/csv",
    APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF8 = "application/x-www-form-urlencoded; charset=UTF-8",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF16 = "application/x-www-form-urlencoded; charset=UTF-16",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF32 = "application/x-www-form-urlencoded; charset=UTF-32",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF7 = "application/x-www-form-urlencoded; charset=UTF-7",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF8_BOM = "application/x-www-form-urlencoded; charset=UTF-8-BOM",
    APPLICATION_X_WWW_FORM_URLENCODED_UTF16_BOM = "application/x-www-form-urlencoded; charset=UTF-16-BOM",
}

export enum Status {
    SUCCESS = "success",
    ERROR = "error",
    PENDING = "pending",
    FAILED = "failed",
    NOT_FOUND = "not_found",
    UNAUTHORIZED = "unauthorized",
    FORBIDDEN = "forbidden",
    BAD_REQUEST = "bad_request",
    INTERNAL_SERVER_ERROR = "internal_server_error",
    SERVICE_UNAVAILABLE = "service_unavailable",
}

export enum HTTP_STATUS {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
}
export enum Browser {
    CHROME = "chrome",
    FIREFOX = "firefox",
    SAFARI = "safari",
    EDGE = "edge",
    OPERA = "opera",
    INTERNET_EXPLORER = "internet_explorer",
    BRAVE = "brave",
    VIVALDI = "vivaldi",
    TOR = "tor",
    YANDEX = "yandex",
    SAMSUNG = "samsung",
    UC_BROWSER = "uc_browser",
    MIUI = "miui",
    QQ_BROWSER = "qq_browser",
    MAXTHON = "maxthon",
    BAIDU = "baidu",
    LYNX = "lynx",
    KONQUER = "konqueror",
    OPERA_MINI = "opera_mini",
}

export enum OS {
    WINDOWS = "windows",
    MACOS = "macos",
    LINUX = "linux",
    ANDROID = "android",
    IOS = "ios",
    CHROME_OS = "chrome_os",
    UBUNTU = "ubuntu",
    FEDORA = "fedora",
    DEBIAN = "debian",
    REDHAT = "redhat",
    CENTOS = "centos",
    SOLARIS = "solaris",
    FREEBSD = "freebsd",
    OPENBSD = "openbsd",
    NETBSD = "netbsd",
    KALI_LINUX = "kali_linux",
    ARCH_LINUX = "arch_linux",
    MINT = "mint",
    POP_OS = "pop_os",
    MANJARO = "manjaro",
    ZORIN_OS = "zorin_os",
    ELEMENTARY_OS = "elementary_os",
    TAILS = "tails",
    RASPBIAN = "raspbian",
    CHROMEOS = "chromeos",
    HARMONYOS = "harmonyos",
    WINDOWS_PHONE = "windows_phone",
    BLACKBERRY = "blackberry",
    SYMBIAN = "symbian",
    FIREFOX_OS = "firefox_os",
    TVOS = "tvos",
    WATCHOS = "watchos",
    LINUX_MINT = "linux_mint",
    SOLUS = "solus",
    WEB = "web"
}

export enum RedisPrefix {
    SESSION = "session",
    HANDSHAKE = "handshake",
    SECRET = "secret",
    USER = "user",
    CACHE = "cache",
    TEMP = "temp",
    CONFIG = "config",
    LOG = "log",
    NOTIFICATION = "notification",
    QUEUE = "queue",
    JOB = "job",
    RATE_LIMIT = "rate_limit",
    API_KEY = "api_key",
    AUTH_TOKEN = "auth_token",
    OAUTH_TOKEN = "oauth_token",
    WEBHOOK = "webhook",
    ANALYTICS = "analytics",
    SEARCH = "search",
    FILE = "file",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    DOCUMENT = "document",
    BLACKLIST = "blacklist",
    WHITELIST = "whitelist",
    SETTINGS = "settings",
    PREFERENCES = "preferences",
    SUBSCRIPTION = "subscription",
    PAYMENT = "payment",
    TRANSACTION = "transaction",
    OTP = "otp",
    EMAIL_VERIFICATION = "email_verification",
    PHONE_VERIFICATION = "phone_verification",
    FORGET_ACCOUNT = "forget_account",
    ACCOUNT_MODIFICATION = "account_modification",
    IDENTITY_VERIFICATION = "identity_verification",
    SECURITY = "security",
}

export enum TTL {
    ONE_MINUTE = 60,
    THREE_MINUTES = 180,
    FIVE_MINUTES = 300,
    TEN_MINUTES = 600,
    THIRTY_MINUTES = 1800,
    ONE_HOUR = 3600,
    SIX_HOURS = 21600,
    TWELVE_HOURS = 43200,
    ONE_DAY = 86400,
    THREE_DAYS = 259200,
    SEVEN_DAYS = 604800,
    FOURTEEN_DAYS = 1209600,
    THIRTY_DAYS = 2592000,
    SIXTY_DAYS = 5184000,
    NINETY_DAYS = 7776000,
    SIX_MONTHS = 15552000,
}

export enum UserType {
    USER = "USER",
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
    SUPPORT = "SUPPORT",
}

export enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
}

export enum BiometricType {
    FACE_ID = "FACE_ID",
    TOUCH_ID = "TOUCH_ID",
    FINGERPRINT = "FINGERPRINT",
    IRIS_SCAN = "IRIS_SCAN",
    VOICE_RECOGNITION = "VOICE_RECOGNITION",
    PALM_RECOGNITION = "PALM_RECOGNITION",
    VEIN_RECOGNITION = "VEIN_RECOGNITION",
    RETINA_SCAN = "RETINA_SCAN",
    NONE = "NONE",
}

export enum DeviceType {
    MOBILE = "MOBILE",
    TABLET = "TABLET",
    DESKTOP = "DESKTOP",
    SMART_TV = "SMART_TV",
    WEARABLE = "WEARABLE",
    IOT_DEVICE = "IOT_DEVICE",
    EMBEDDED_SYSTEM = "EMBEDDED_SYSTEM",
    SERVER = "SERVER",
    VIRTUAL_MACHINE = "VIRTUAL_MACHINE",
    CLOUD_INSTANCE = "CLOUD_INSTANCE",
}

export enum IdentityType {
    PASSPORT = "PASSPORT",
    NATIONAL_ID = "NATIONAL_ID",
    DRIVER_LICENSE = "DRIVER_LICENSE",
    SOCIAL_SECURITY_NUMBER = "SOCIAL_SECURITY_NUMBER",
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
    VOTER_ID = "VOTER_ID",
    RESIDENCE_PERMIT = "RESIDENCE_PERMIT",
    WORK_PERMIT = "WORK_PERMIT",
    STUDENT_ID = "STUDENT_ID",
    MILITARY_ID = "MILITARY_ID",
    HEALTH_INSURANCE_CARD = "HEALTH_INSURANCE_CARD",
    TAX_ID = "TAX_ID",
    NONE = "NONE",
};

export enum AccountTier {
    TIER0 = "TIER0",
    TIER1 = "TIER1",
    TIER2 = "TIER2",
    TIER3 = "TIER3",
    TIER4 = "TIER4",
}

export enum CryptoTierLimits {
    TIER0 = 0,
    TIER1 = 500,
    TIER2 = 1_000,
    TIER3 = 10_000,
    TIER4 = 100_000_000,
}

export enum FiatTierLimits {
    TIER0 = 0,
    TIER1 = 10,
    TIER2 = 50_000,
    TIER3 = 1_000_000,
    TIER4 = 1_000_000_000,
}

export enum Coin {
    BTC = "BTC",
    ETH = "ETH",
    USDT = "USDT",
    USDC = "USDC",
    NGN = "NGN",
    WBTC = "WBTC",
    DAI = "DAI",
    USD = "USD",
    BCH = "BCH",
    LTC = "LTC",
    XRP = "XRP",
    BSV = "BSV",
    ZEC = "ZEC",
    ADA = "ADA",
    DOT = "DOT",
    SOL = "SOL",
    KSM = "KSM",
    XLM = "XLM",
    BNB = "BNB",
    ONT = "ONT",
    HT = "HT",
    BTS = "BTS",
    XTZ = "XTZ",
    WETH = "WETH",
    TRON = "TRON"
}

export enum BlockchainNetwork {
    ETHEREUM = "ETHEREUM",
    POLYGON = "POLYGON",
    BSC = "BSC",
    AVALANCHE = "AVALANCHE",
    FANTOM = "FANTOM",
    TRON = "TRON",
    ARBITRUM = "ARBITRUM",
    OPTIMISM = "OPTIMISM",
    CELO = "CELO",
    CELO_ALFAJORES = "CELO_ALFAJORES",
    BTC = "BTC",
    LTC = "LTC",
    XRP = "XRP",
    NONE = "NONE",
}

export enum Fiat {
    NGN = "NGN",
    USD = "USD",
    GHS = "GHS",
    GBP = "GBP",
    EUR = "EUR",
    JPY = "JPY",
    AUD = "AUD",
    CAD = "CAD",
    CHF = "CHF",
}

export enum WalletType {
    CRYPTO = "CRYPTO",
    FIAT = "FIAT",
}

export enum TransactionVerification {
    BIOMETRIC = "BIOMETRIC",
    PIN = "PIN",
    OTP = "OTP",
    TWO_FACTOR_AUTH = "TWO_FACTOR_AUTH",
}

export enum WhichAction {
    SUSPENSION = "suspension",
    BANNED = "banned",
}

export enum CryptoType {
    COIN = "coin",
    TOKEN = "token"
}

export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "send",
    SWAP = "swap",
    BILLS = "bills",
}

export enum NotificationCategory {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TRANSFER = "send",
    SWAP = "swap",
    BILLS = "bills",
    GENERAL = "general",
}

export enum NotificationPiority {
    HIGH = "high",
    LOW = "low",
    MEDIUM = "medium",
}

export enum NotificationType {
    NORMAL = "normal",
    PUSH = "push",
}

export enum Order {
    ASCENDING = "ascending",
    DESCENDING = "descending",
    NONE = 'none'
}

export enum Engine {
    AUTOMATIC = "automatic",
    MANUAL = "manual",
}

export enum WhichModification {
    EMAIL = "email",
    PHONE = "phone",
    PASSWORD = "password",
    PIN = "pin",
    BIOMETRIC = "biometric",
    TWO_FACTOR_AUTH = "two_factor_auth",
    IDENTITY_VERIFICATION = "identity_verification",
    ACCOUNT_SETTINGS = "account_settings",
    NOTIFICATIONS = "notifications",
    SECURITY = "security",
    PRIVACY = "privacy",
    LANGUAGE = "language",
    THEME = "theme",
    WALLET = "wallet",
    ACCOUNT = "account",
    API_KEYS = "api_keys",
    SUBSCRIPTION = "subscription",
    PAYMENT_METHODS = "payment_methods",
    TRANSACTION_HISTORY = "transaction_history",
    REFERRAL_PROGRAM = "referral_program",
    SUPPORT = "support",
    LEGAL = "legal",
    FEEDBACK = "feedback",
    OTHER = "other",
    NONE = "none",
    VERIFICATION = "verification",
}

export enum SMS_CHANNEL {
    WHATSAPP = "whatsapp",
    SMS = "sms",
    DND = "dnd",
    GENERIC = "generic"
}