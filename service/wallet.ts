import Defaults from "@/app/default/default";
import { IMarket, ITransaction } from "@/interface/interface";
import logger from "@/logger/logger";
import sessionManager from "@/session/session";
import { router } from "expo-router";

type WalletEventType = 'dataUpdated' | 'loading' | 'error' | 'dataCleared' | 'hideBalanceChanged';

export interface IWalletData {
    markets: IMarket[];
    totalBalanceUsd: number;
    totalBalanceNgn: number;
    transactions: ITransaction[];
    isLoading: boolean;
    error: string | null;
    hideBalance: boolean;
}

class WalletService {
    private markets: IMarket[] = [];
    private totalBalanceUsd: number = 0;
    private totalBalanceNgn: number = 0;
    private transactions: ITransaction[] = [];
    private isLoading: boolean = false;
    private isFetching: boolean = false;
    private lastFetchTime: number | null = null;
    private error: string | null = null;
    private hideBalance: boolean = false;

    private dataSubscribers: Array<(data: IWalletData) => void> = [];
    private loadingSubscribers: Array<(loading: boolean) => void> = [];
    private errorSubscribers: Array<(error: any) => void> = [];
    private hideBalanceSubscribers: Array<(hideBalance: boolean) => void> = [];

    private readonly CACHE_DURATION = 30000;

    constructor() { }

    private emit(event: WalletEventType, data: any) {
        switch (event) {
            case 'dataUpdated':
                this.dataSubscribers.forEach(callback => callback(data));
                break;
            case 'loading':
                this.loadingSubscribers.forEach(callback => callback(data));
                break;
            case 'error':
                this.errorSubscribers.forEach(callback => callback(data));
                break;
            case 'dataCleared':
                this.dataSubscribers.forEach(callback => callback(this.getWalletData()));
                break;
            case 'hideBalanceChanged':
                this.hideBalanceSubscribers.forEach(callback => callback(data));
                break;
        }
    }

    private on(event: WalletEventType, callback: (data: any) => void) {
        switch (event) {
            case 'dataUpdated':
                this.dataSubscribers.push(callback);
                break;
            case 'loading':
                this.loadingSubscribers.push(callback);
                break;
            case 'error':
                this.errorSubscribers.push(callback);
                break;
            case 'hideBalanceChanged':
                this.hideBalanceSubscribers.push(callback);
                break;
        }
    }

    private off(event: WalletEventType, callback: (data: any) => void) {
        switch (event) {
            case 'dataUpdated':
                this.dataSubscribers = this.dataSubscribers.filter(cb => cb !== callback);
                break;
            case 'loading':
                this.loadingSubscribers = this.loadingSubscribers.filter(cb => cb !== callback);
                break;
            case 'error':
                this.errorSubscribers = this.errorSubscribers.filter(cb => cb !== callback);
                break;
            case 'hideBalanceChanged':
                this.hideBalanceSubscribers = this.hideBalanceSubscribers.filter(cb => cb !== callback);
                break;
        }
    }

    public getWalletData(): IWalletData {
        return {
            markets: this.markets,
            totalBalanceUsd: this.totalBalanceUsd,
            totalBalanceNgn: this.totalBalanceNgn,
            transactions: this.transactions,
            isLoading: this.isLoading,
            error: this.error,
            hideBalance: this.hideBalance,
        };
    }

    public toggleHideBalance() {
        this.hideBalance = !this.hideBalance;
        this.emit('hideBalanceChanged', this.hideBalance);
    }

    public getHideBalance() {
        return this.hideBalance;
    }

    public isCacheFresh() {
        if (!this.lastFetchTime) return false;
        const timeSinceLastFetch = Date.now() - this.lastFetchTime;
        return timeSinceLastFetch < this.CACHE_DURATION;
    }

    public async fetchWalletData(options: { showLoading?: boolean; force?: boolean } = {}) {
        const { showLoading = this.markets.length === 0, force = false } = options;
        const session = sessionManager.getUserData();

        if (this.isFetching) {
            return this.getWalletData();
        }

        if (!force && this.isCacheFresh()) {
            return this.getWalletData();
        }

        try {
            this.isFetching = true;

            if (showLoading) {
                this.isLoading = true;
                this.emit('loading', true);
            } else {
                // If not showing loading, ensure isLoading is false so UI doesn't block
                this.isLoading = false;
            }

            await Defaults.IS_NETWORK_AVAILABLE();

            const login = Defaults.LOGIN_STATUS();
            if (!login) {
                if (session.user?.passkeyEnabled) {
                    router.replace("/passkey");
                } else {
                    router.replace("/onboarding/login");
                }
                throw new Error("Not logged in");
            }

            const res = await fetch(`${Defaults.API}/wallet`, {
                method: 'GET',
                headers: {
                    ...Defaults.HEADERS,
                    'x-wealthx-version': '0.2.0',
                    'x-wealthx-handshake': session.client?.publicKey || "",
                    'x-wealthx-deviceid': session.deviceid || "",
                    Authorization: `Bearer ${session.authorization}`,
                },
            });

            const data = await res.json();

            if (data.status === "error") throw new Error(data.message || data.error);
            if (data.status === "success") {
                if (!data.handshake) throw new Error('Unable to process response right now, please try again.');

                const parseData = Defaults.PARSE_DATA(data.data, session.client?.privateKey || "", data.handshake);

                this.markets = parseData.markets;
                this.totalBalanceUsd = parseData.totalBalanceUsd;
                this.totalBalanceNgn = parseData.totalBalanceNgn;
                this.transactions = parseData.transactions || [];
                this.error = null;
                this.lastFetchTime = Date.now();

                await sessionManager.updateSession({
                    ...session,
                    markets: parseData.markets,
                    totalBalanceUsd: parseData.totalBalanceUsd,
                    totalBalanceNgn: parseData.totalBalanceNgn,
                    transactions: parseData.transactions,
                });

                this.emit('dataUpdated', this.getWalletData());
            }

        } catch (error: any) {
            const errMsg: string = (error as Error).message || "An error occurred while fetching transactions.";
            if (errMsg.trim() === "Session expired, please login") {
                router.replace(session.user?.passkeyEnabled === true ? "/passkey" : '/onboarding/login');
            } else {
                logger.error("Error fetching transactions:", errMsg);
            }
            this.error = error.message;
            this.emit('error', error);
        } finally {
            this.isLoading = false;
            this.isFetching = false;
            this.emit('loading', false);
        }
        return this.getWalletData();
    }

    public async refreshWalletData() {
        return this.fetchWalletData({ showLoading: false, force: true });
    }

    public clearCache() {
        this.markets = [];
        this.totalBalanceUsd = 0;
        this.totalBalanceNgn = 0;
        this.transactions = [];
        this.isLoading = false;
        this.isFetching = false;
        this.lastFetchTime = null;
        this.error = null;
        this.emit('dataCleared', null);
    }

    public subscribe(callback: (data: IWalletData) => void) {
        this.on('dataUpdated', callback);
        return () => this.off('dataUpdated', callback);
    }

    public subscribeToLoading(callback: (loading: boolean) => void) {
        this.on('loading', callback);
        return () => this.off('loading', callback);
    }

    public subscribeToErrors(callback: (error: any) => void) {
        this.on('error', callback);
        return () => this.off('error', callback);
    }

    public subscribeToHideBalance(callback: (hideBalance: boolean) => void) {
        this.on('hideBalanceChanged', callback);
        callback(this.hideBalance);
        return () => this.off('hideBalanceChanged', callback);
    }

    public getUniqueMarkets(): IMarket[] {
        const uniqueMarketsMap = new Map<string, IMarket>();
        this.markets.forEach((market) => {
            const existing = uniqueMarketsMap.get(market.currency);
            if (!existing) {
                uniqueMarketsMap.set(market.currency, market);
            } else if (market.network === 'BSC') {
                uniqueMarketsMap.set(market.currency, market);
            }
        });
        return Array.from(uniqueMarketsMap.values());
    }
}

export default new WalletService();
