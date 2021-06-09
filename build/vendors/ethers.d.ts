import { Contract } from '../interfaces';
import Vendor from '../abstracts/vendor';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider, TransactionResponse } from '@ethersproject/providers';
import { Abi } from '../@types';
import { BigNumber } from 'ethers';
import { Discount } from '../interfaces/discount';
import { SignatureParams } from '../interfaces';
export default class extends Vendor {
    constructor(p: Provider, s?: Signer);
    contract(address: string, abi: Abi): Contract;
    convertStringArrayToBigNumberArray(array: Array<string>): Array<any>;
    parseDiscountSlabs(data: Array<any>): Array<Discount>;
    convertToBN(amount: string): any;
    convertToWei(amount: string): BigNumber;
    convertWeiToEth(wei: any): number;
    signMessage(m: string): Promise<string>;
    verifySignedMessage(m: string, s: string): string;
    abiEncodeErc20Functions(f: string, p: Array<any>): string;
    signedMessageForTx(u: string, n: number, f: string, a: string, c: number): Promise<string>;
    sendRawBiconomyTransaction(u: string, f: string, rsv: SignatureParams, contractAddress: string, abi: any): Promise<TransactionResponse>;
    getSignatureParameters(signature: string): SignatureParams;
    private requireSignerOrProvider;
    private requireSigner;
}
