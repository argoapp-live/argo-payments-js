// NOTE this is currently a shell for where we will encapsulate ethers.js

import { SIGNER_OR_PROVIDER_REQUIRED, SIGNER_REQUIRED } from '../errors'
import { Contract } from '../interfaces'
import Vendor from '../abstracts/vendor'
import { Signer } from '@ethersproject/abstract-signer'
import { Contract as EthersContract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import { Abi } from '../@types'
import { BigNumber, ethers } from 'ethers'
import { DiscountDataClass } from './discount-data'
import { Discount } from '../interfaces/discount'
import { SignatureParams } from '../interfaces'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Biconomy } from '@biconomy/mexa'

import { helpers } from '..'
import { ERC20Interface, SubscriptionDePayInterface, metaTransactionType } from '../constants/payment'

export default class extends Vendor {
  /**
   * @remarks
   * Given an ethers specific provider and optionally a signer return a Vendor.
   *
   * @param p - An Ethers Provider
   * @param s - Optional Ethers Signer
   * @param b - biconomy api key
   */
  constructor(p: Provider, s?: Signer, b?: string) {
    super()
    this.provider = p
    this.signer = s
    if (b) {
      this.biconomy = new Biconomy(p, { apiKey: b, debug: false })
    }
  }

  /**
   * @remarks
   * The Ethers.js specific implementation of a .contract method.
   *
   * @param address - Address a target contract has been deployed to
   * @param abi - Compiled abi of the deployed target contract
   *
   * @returns Contract
   */
  contract(address: string, abi: Abi, p?: any): Contract {
    this.requireSignerOrProvider()
    if (p) {
      return new EthersContract(address, abi, p)
    }
    return new EthersContract(address, abi, this.signer)
  }

  /**
   * @remarks
   * Convert array of string to Array of BigNumber
   *
   * @param array - Array of string to be converted to Array of Big Number

   *
   * @returns Array<BigNumber>
   */
  convertStringArrayToBigNumberArray(array: Array<string>): Array<any> {
    const bnArray = Array<BigNumber>(array.length)
    for (let i = 0; i < array.length; i++) {
      bnArray[i] = BigNumber.from(array[i])
    }
    return bnArray
  }
  /**
   * @remarks
   * Parse discount slabs data to DiscountDataClass
   *
   * @param data - data coming from contract.

   *
   * @returns Discount slabs
   */
  parseDiscountSlabs(data: Array<any>): Array<Discount> {
    const slabs = data.map((a) => new DiscountDataClass(a.amount, a.percent))
    return slabs.map((a) => a.toString())
  }
  /**
   * @remarks
   * Convert any number to big number.
   *
   * @param amount - string of the required big number

   *
   * @returns BigNumber
   */
  convertToBN(amount: string) {
    return helpers.ethers.convertToBN(amount)
  }
  /**
   * @remarks
   * Convert wei value(10**18) to eth value
   *
   * @param amount - value in eth.
   * @param precision - precision of the amount

  *
  * @returns Array<BigNumber>
  */

  convertToWei(amount: string, precision: number): BigNumber {
    return helpers.ethers.convertToWei(amount, precision)
  }
  /**
   * @remarks
   * Get 10**18 multiplied number for values in wei.
   *
   * @param wei - string of the required non-wei amount
   * @param precision - precision of the amount

  *
  * @returns BigNumber
  */
  convertWeiToEth(wei: any, precision: number): number {
    return helpers.ethers.convertWeiToEth(wei, precision)
  }

  /**
   * @remarks
   * Sign the message with users private key.
   *
   * @param m - message that is to be signed

  *
  * @returns Signed message
  */
  async signMessage(m: string): Promise<string> {
    this.requireSigner()
    const signedMessage = await this.signer.signMessage(m)
    return signedMessage
  }

  /**
   * @remarks
   * get address from signed message
   * @param m - unsigned message
   * @param s - signed message
   *
   * @returns address
   */
  verifySignedMessage(m: string, s: string): string {
    const address = ethers.utils.verifyMessage(m, s)
    return address
  }
  /**
   *
   * @remarks
   * returns abi enocoded erc20 function
   * @param f - name of function
   * @param p - function parameters
   */
  abiEncodeErc20Functions(f: string, p: Array<any>): string {
    const iface = new ethers.utils.Interface(ERC20Interface)
    const data = iface.encodeFunctionData(f, p)
    return data
  }
  /**
   * @remarks
   * returns abi enocoded erc20 function
   * @param f - name of function
   * @param p - function parameters
   */
  abiEncodeSubDepayFunctions(f: string, p: Array<any>): string {
    const iface = new ethers.utils.Interface(SubscriptionDePayInterface)
    const data = iface.encodeFunctionData(f, p)
    return data
  }
  /**
   *
   * @remarks
   * returns abi enocoded erc20 function
   * @param u - user address
   * @param n - nonce
   * @param f - abi encoded function data
   * @param a - token address
   * @param c - chain id
   */
  async signedMessageForTx(u: string, n: number, f: string, a: string, c: number): Promise<string> {
    const domainData = {
      name: 'Test ArGo',
      version: '1',
      verifyingContract: a,
      salt: '0x' + c.toString(16).padStart(64, '0'),
    }
    const message = {
      nonce: n,
      from: u,
      functionSignature: f,
    }
    const types = {
      MetaTransaction: metaTransactionType,
    }

    const signature = await this.signer._signTypedData(domainData, types, message)
    return signature
  }

  /**
   *
   * @remarks
   * returns abi enocoded erc20 function
   * @param u - user address
   * @param n - nonce
   * @param f - abi encoded function data
   * @param tokenAddress - token address
   * @param tokenName - token name
   * @param c - chain id
   */
  async signedMessageForMultiTokenTx(
    u: string,
    n: number,
    f: string,
    tokenAddress: string,
    tokenName: string,
    c: number,
  ): Promise<string> {
    const domainData = {
      name: tokenName,
      version: '1',
      verifyingContract: tokenAddress,
      salt: '0x' + c.toString(16).padStart(64, '0'),
    }
    const message = {
      nonce: n,
      from: u,
      functionSignature: f,
    }
    const types = {
      MetaTransaction: metaTransactionType,
    }

    const signature = await this.signer._signTypedData(domainData, types, message)
    return signature
  }

  /**
   *
   * @remarks
   * Returns signature parameters when provided with valid signature hex
   * @param signature - signature hex
   */
  getSignatureParameters(signature: string): SignatureParams {
    if (!ethers.utils.isHexString(signature)) {
      throw new Error('Given value "'.concat(signature, '" is not a valid hex string.'))
    }
    const r = signature.slice(0, 66)
    const s = '0x'.concat(signature.slice(66, 130))
    const v = '0x'.concat(signature.slice(130, 132))
    let _v = BigNumber.from(v).toNumber()
    if (![27, 28].includes(_v)) _v += 27
    return {
      r: r,
      s: s,
      v: _v,
    }
  }
  /**
   *
   * @remarks
   * Convenience methods which abstracts repetitive checking for the presence of a signer || provider
   * @private
   */
  private requireSignerOrProvider() {
    if (!this.signer && !this.provider) throw new ReferenceError(SIGNER_OR_PROVIDER_REQUIRED)
  }
  /**
   *
   * @remarks
   * Convenience methods which abstracts repetitive checking for the presence of a signer || provider
   * @private
   */
  private requireSigner() {
    if (!this.signer) throw new ReferenceError(SIGNER_REQUIRED)
  }
}
