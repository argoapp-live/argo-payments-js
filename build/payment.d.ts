import Deployed from './abstracts/deployed';
import Vendor from './abstracts/vendor';
import { TxResponse } from './interfaces';
export default class extends Deployed {
    coinMarketCapKey?: string;
    constructor(vendor: Vendor, coinMarketCapKey?: string);
    updateEscrow(a: string): Promise<TxResponse>;
    updateStakedToken(a: string): Promise<TxResponse>;
    updateDiscountSlabs(d: Array<string>, p: Array<string>): Promise<TxResponse>;
    enableDiscounts(h: string): Promise<TxResponse>;
    disableDiscounts(): Promise<TxResponse>;
    setGovernanceAddress(h: string): Promise<TxResponse>;
    setManagers(h: Array<string>): Promise<TxResponse>;
    setNewApprovals(a: string): Promise<TxResponse>;
    gasslessApproval(a: string, c: number): Promise<TxResponse>;
    sendRawBiconomyERC20Transaction(u: string, f: string, rsv: any): Promise<any>;
    getApprovalAmount(a: string): Promise<any>;
    getNonceForGaslessERC20(u: string): Promise<number>;
    getManagers(): Promise<Array<string>>;
    getGovernanceAddress(): Promise<string>;
    getToken(): Promise<string>;
    getEscrow(): Promise<string>;
    checkIfDiscountsEnabled(): Promise<boolean>;
    getStakingManagerAddress(): Promise<string>;
    getStakedTokenAddress(): Promise<string>;
    getDiscountSlabs(): Promise<any>;
    getArweaveConvertedUsd(a: string): Promise<number>;
    getArweaveQuote(): Promise<number>;
    getAkashConvertedUsd(a: string): Promise<number>;
    getAkashQuote(): Promise<number>;
}
