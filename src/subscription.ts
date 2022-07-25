import { Vendor } from '.'
import Deployed from './abstracts/deployed'
import { PAYMENT_ABI, ERC20_ABI, SUBSCRIPTION_PAYMENT_ABI, SUBSCRIPTION_DATA_ABI } from './constants'
import { INVALID_BICONOMY_KEY } from './errors'
import { SubscriptionParameters, TokenData, TxResponse } from './interfaces'

export default class extends Deployed {
  /**
   * @param vendor - Instance of a Vendor class
   */
  constructor(vendor: Vendor) {
    super(vendor, PAYMENT_ABI, ERC20_ABI, SUBSCRIPTION_PAYMENT_ABI, SUBSCRIPTION_DATA_ABI)
  }

  /**
   * @remarks
   * This method can be used to updated address of vault/escrow account
   *
   * @param a - address of escrow contract(vault)
   */
  async updateEscrow(a: string): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.updateEscrow(a)
  }

  /**
   * @remarks
   * This method can be used to updated address of staked token
   *
   * @param a - address of escrow contract(vault)
   */
  async updateStakedToken(a: string): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.updateStakedToken(a)
  }

  /**
   * @remarks
   * This method can only be called by governance account and can be called to updated discount slabs.
   *
   * @param d - array of prices for discount slabs
   * @param p - array of percent of each slab
   */
  async updateDiscountSlabs(d: Array<string>, p: Array<string>): Promise<TxResponse> {
    const discountSlabs = this.vendor.convertStringArrayToBigNumberArray(d)
    const percents = this.vendor.convertStringArrayToBigNumberArray(p)
    return await this.subscriptionDataContract?.functions.updateDiscountSlabs(discountSlabs, percents)
  }
  /**
   * @remarks
   * This method can only be called by owner, to give enable discount.
   *
   * @param h - address of staking manager.
   */
  async enableDiscounts(h: string): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.enableDiscounts(h)
  }

  /**
   * @remarks
   * This method can only be called by owner, to give disable discount.
   *
   */
  async disableDiscounts(): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.disableDiscounts()
  }

  /**
   * @remarks
   * This method can only be called by owner, to update governance contract address.
   *
   * @param h - address of governance contract.
   */
  async setGovernanceAddress(h: string): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.setGovernanceAddress(h)
  }

  /**
   * @remarks
   * This method can only be called by owner, to update data contract address.
   *
   * @param h - address of data contract.
   */
  async setDataContract(h: string): Promise<TxResponse> {
    return await this.subscriptionPaymentContract?.functions.updateDataContract(h)
  }

  /**
   * @remarks
   * This method can only be called by owner, to set new  owners.
   *
   * @param h - array of addresses of new oweners.
   */
  async setManagers(h: Array<string>): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.setManagers(h)
  }

  /**
   * @remarks
   * Update approval for ERC-20 token
   * Dont use this function without frontend
   *
   * @param a - new approval amount.
   */
  async setNewApprovals(a: string): Promise<TxResponse> {
    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    return await this.erc20Contract?.functions.approve(this.subscriptionPaymentContract?.address, wei)
  }
  /**
   * @remarks
   * Update approval for ERC-20 token
   * Dont use this function without frontend
   *
   * @param a - new approval amount.
   * @param c - chain Id
   */
  async gasslessApproval(a: string, c: number): Promise<TxResponse> {
    if (!this.vendor.biconomy) throw new Error(INVALID_BICONOMY_KEY)

    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    const abiEncodedApprove = this.vendor.abiEncodeErc20Functions('approve', [
      this.subscriptionPaymentContract?.address,
      wei,
    ])
    const userAddress = await this.vendor.signer.getAddress()
    const nonce = await this.getNonceForGaslessERC20(userAddress)
    const signedMessage = await this.vendor.signedMessageForTx(
      userAddress,
      nonce,
      abiEncodedApprove,
      this.erc20Contract?.address || '',
      c,
    )
    const rsv = this.vendor.getSignatureParameters(signedMessage)
    return await this.sendRawBiconomyERC20Transaction(userAddress, abiEncodedApprove, rsv)
  }
  /**
   * @remarks
   * Gaslles user deposit 
   * Dont use this function without frontend
   *
   * @param a - deposit amount.
   * @param t - token address.
   * @param c - chain Id
   */
   async gasLessUserDeposit(a: string, t: string, c: number): Promise<TxResponse> {
    if (!this.vendor.biconomy) throw new Error(INVALID_BICONOMY_KEY)

    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    const abiEncodedDeposit = this.vendor.abiEncodeSubDepayFunctions('userDeposit', [
      t,
      wei,
    ])
    const userAddress = await this.vendor.signer.getAddress()
    const nonce = await this.getNonceForGaslessERC20(userAddress)
    const signedMessage = await this.vendor.signedMessageForTx(
      userAddress,
      nonce,
      abiEncodedDeposit,
      this.subscriptionPaymentContract?.address || '',
      c,
    )
    const rsv = this.vendor.getSignatureParameters(signedMessage)
    return await this.sendRawBiconomyERC20Transaction(userAddress, abiEncodedDeposit, rsv)
  }
  /**
   * @remarks
   * Gaslles user deposit 
   * Dont use this function without frontend
   *
   * @param a - withdrawal amount.
   * @param t - token address.
   * @param c - chain Id
   */
   async gasLessUserWithdraw(a: string, t: string, c: number): Promise<TxResponse> {
    if (!this.vendor.biconomy) throw new Error(INVALID_BICONOMY_KEY)

    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    const abiEncodedWithdraw = this.vendor.abiEncodeSubDepayFunctions('userWithdraw', [
      t,
      wei,
    ])
    const userAddress = await this.vendor.signer.getAddress()
    const nonce = await this.getNonceForGaslessERC20(userAddress)
    const signedMessage = await this.vendor.signedMessageForTx(
      userAddress,
      nonce,
      abiEncodedWithdraw,
      this.subscriptionPaymentContract?.address || '',
      c,
    )
    const rsv = this.vendor.getSignatureParameters(signedMessage)
    return await this.sendRawBiconomyERC20Transaction(userAddress, abiEncodedWithdraw, rsv)
  }

  /**
   * @remarks
   * Update approval for ERC-20 token
   * Dont use this function without frontend
   *
   * @param a - new approval amount.
   * @param n - token name.
   * @param c - chain Id
   */
  async gasslessMultiTokenApproval(a: string, n: string, c: number): Promise<TxResponse> {
    if (!this.vendor.biconomy) throw new Error(INVALID_BICONOMY_KEY)

    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    const abiEncodedApprove = this.vendor.abiEncodeErc20Functions('approve', [
      this.subscriptionPaymentContract?.address,
      wei,
    ])
    const userAddress = await this.vendor.signer.getAddress()
    const nonce = await this.getNonceForGaslessERC20(userAddress)
    const signedMessage = await this.vendor.signedMessageForMultiTokenTx(
      userAddress,
      nonce,
      abiEncodedApprove,
      this.erc20Contract?.address || '',
      n,
      c,
    )
    const rsv = this.vendor.getSignatureParameters(signedMessage)
    return await this.sendRawBiconomyERC20Transaction(userAddress, abiEncodedApprove, rsv)
  }
  
  /**
   *
   * @remarks
   * returns abi enocoded erc20 function
   *
   * @param u - user address
   * @param f - abi encoded function
   * @param rsv - rsv values
   */
  async sendRawBiconomyERC20Transaction(u: string, f: string, rsv: any): Promise<any> {
    if (this.vendor.biconomy.status === this.vendor.biconomy.READY) {
      const tx = await this.biconomyERC20Contract?.functions.executeMetaTransaction(u, f, rsv.r, rsv.s, rsv.v)
      return tx
    } else {
      return new Promise((resolve, reject) => {
        this.vendor.biconomy
          .onEvent(this.vendor.biconomy.READY, async () => {
            const tx = await this.biconomyERC20Contract?.functions.executeMetaTransaction(u, f, rsv.r, rsv.s, rsv.v)
            resolve(tx)
          })
          .onEvent(this.vendor.biconomy.ERROR, (error: string) => {
            console.log(error)
            reject(error)
          })
      })
    }
  }
  /**
   * @remarks
   * Get nonce for gassless transaction on erc20
   *
   * @param u user address
   */
  async getNonceForGaslessERC20(u: string): Promise<number> {
    const nonce = (await this.erc20Contract?.functions.getNonce(u))[0].toNumber()
    return nonce
  }

  /**
   * @remarks
   * Get given User balance.
   * @param u - user address
   * @param t - token address
   */
   async getUserTokenBalance(u: string, t: string): Promise<any> {
    const wei = await this.subscriptionPaymentContract?.functions.getUserData(u, t)
    return this.vendor.convertWeiToEth(wei.balance, this.tokenPrecision || 18)
  }

  /**
   * @remarks
   * User deposit to Spheron
   * @param t - token address
   * @param a - amount
  */
  async userDeposit(t: string, a: string): Promise<TxResponse> {
    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    return await this.subscriptionPaymentContract?.functions.userDeposit(t, wei)
  }

  /**
    * @remarks
    * User withdraw from Spheron
    * @param t - token address
    * @param a - amount
    */

  async userWithdraw(t: string, a: string): Promise<TxResponse> {
    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    return await this.subscriptionPaymentContract?.functions.userWithdraw(t, wei)
  }
  /**
   * @remarks
   * Get given Allowance amount.
   *
   */
  async getUsdPricePrecision(): Promise<any> {
    const bn = await this.subscriptionDataContract?.functions.usdPricePrecision()
    return bn
  }

  /**
   * @remarks
   * Get owners list.
   *
   */
  async getManagers(): Promise<Array<string>> {
    return await this.subscriptionDataContract?.functions.getManagers()
  }

  /**
   * @remarks
   * Get govornance address.
   *
   */
  async getGovernanceAddress(): Promise<string> {
    return await this.subscriptionDataContract?.functions.governanceAddress()
  }

  /**
   * @remarks
   * Get escrow address.
   *
   */
  async getEscrow(): Promise<string> {
    return await this.subscriptionDataContract?.functions.escrow()
  }

  /**
   * @remarks
   * Get discount status.
   *
   */
  async checkIfDiscountsEnabled(): Promise<boolean> {
    return await this.subscriptionDataContract?.functions.discountsEnabled()
  }

  /**
   * @remarks
   * Get staking manager  address.
   *
   */
  async getStakingManagerAddress(): Promise<string> {
    return await this.subscriptionDataContract?.functions.stakingManager()
  }
  /**
   * @remarks
   * Get staking manager  address.
   *
   */
  async getStakedTokenAddress(): Promise<string> {
    return await this.subscriptionDataContract?.functions.stakedToken()
  }
  /**
   * @remarks
   * Get discount slabs.
   *
   */
  async getDiscountSlabs(): Promise<any> {
    const slabs = await this.subscriptionDataContract?.functions.discountSlabs()
    return this.vendor.parseDiscountSlabs(slabs)
  }
  /**
   * @remarks
   * Get discount slabs.
   *
   */
  async getDataContract(): Promise<any> {
    const slabs = await this.subscriptionPaymentContract?.functions.subscriptionData()
    return this.vendor.parseDiscountSlabs(slabs)
  }

  /**
   * @remarks
   * this method is used when we want to charge user for the subscrption he will be buying.
   * @param u - address of user
   * @param d - array of parameters and their values
   * @param t - token address
   */
  async makeCharge(u: string, d: Array<SubscriptionParameters>, t: string): Promise<TxResponse> {
    const paramArray: Array<string> = []
    const paramValue: Array<number> = []
    for (let i = 0; i < d.length; i++) {
      paramArray.push(d[i].param)
      paramValue.push(this.vendor.convertToBN(d[i].value.toString()))
    }
    return await this.subscriptionPaymentContract?.functions.chargeUser(u, paramArray, paramValue, t)
  }
  /**
   * @remarks
   * this method is used to add new tokens to the subscription contract
   * @param d - array of token data
   */
  async addTokens(d: Array<TokenData>): Promise<TxResponse> {
    const symbols: Array<string> = []
    const tokenAddresses: Array<string> = []
    const tokenDecimals: Array<any> = []
    const chainLinkBools: Array<boolean> = []
    const priceFeedAddresses: Array<string> = []
    const priceFeedPrecisions: Array<any> = []

    for (let i = 0; i < d.length; i++) {
      symbols.push(d[i].symobl)
      tokenAddresses.push(d[i].address)
      priceFeedAddresses.push(d[i].priceFeedAddress)
      chainLinkBools.push(d[i].isChainLinkFeed)
      tokenDecimals.push(this.vendor.convertToBN(d[i].decimals.toString()))
      priceFeedPrecisions.push(this.vendor.convertToBN(d[i].priceFeedPrecision.toString()))
    }
    return await this.subscriptionDataContract?.functions.addNewTokens(
      symbols,
      tokenAddresses,
      tokenDecimals,
      chainLinkBools,
      priceFeedAddresses,
      priceFeedPrecisions,
    )
  }
  /**
   * @remarks
   * this method is used to remove tokens from accepted tokens list
   * @param d - array of tokens to remove
   */
  async removeTokens(d: Array<string>): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.removeTokens(d)
  }
  /**
   * @remarks
   * change precision of all the USD values being passed
   * @param n - prcision number
   */
  async changeUsdPrecision(n: number): Promise<TxResponse> {
    const bn = this.vendor.convertToBN(n.toString())
    return await this.subscriptionDataContract?.functions.changeUsdPrecision(bn)
  }

  /**
   * @remarks
   * This method is used when we want to update contract parameters
   * @param p - array of parameters and their values
   */
  async upadteParams(p: Array<SubscriptionParameters>): Promise<TxResponse> {
    const paramArray: Array<string> = []
    const paramValue: Array<number> = []
    for (let i = 0; i < p.length; i++) {
      paramArray.push(p[i].param)
      paramValue.push(this.vendor.convertToBN(p[i].value.toString()))
    }
    return await this.subscriptionDataContract?.functions.updateParams(paramArray, paramValue)
  }
  /**
   * @remarks
   * This method is when we want to delete some parameter
   * @param d - array of params to delete
   */
  async deleteParams(d: Array<string>): Promise<TxResponse> {
    return await this.subscriptionDataContract?.functions.deleteParams(d)
  }
  // Admin Functions
  /**
   * @remarks
   * Admin function to get total balances of a particular token
   * @param t - token address
   */
   async getTotalTokenBalance(t: string): Promise<any> {
    const wei = await this.subscriptionPaymentContract?.functions.getTotalDeposit(t)
    return this.vendor.convertWeiToEth(wei, this.tokenPrecision || 18)
  }

  /**
   * @remarks
   * Admin function to get the cummulative total of all charges
   * @param t - token address
   */
  async getTotalTokenCharges(t: string): Promise<any> {
    const wei = await this.subscriptionPaymentContract?.functions.getTotalCharges(t)
    return this.vendor.convertWeiToEth(wei, this.tokenPrecision || 18)
  }

  /**
   * @remarks
   * Admin function to get the cummulative total of all withdraws made by users
   * @param t - token address
   */
  async getTotalTokenWithdraws(t: string): Promise<any> {
    const wei = await this.subscriptionPaymentContract?.functions.getTotalWithdraws(t)
    return this.vendor.convertWeiToEth(wei, this.tokenPrecision || 18)
  }

  /**
   * @remarks
   * Set treasury address to SubscriptionDepay Contract which receives all deposits to the contract
   * @param t - treasury address
   */
  async setTreasury(t: string): Promise<TxResponse> {
    return await this.subscriptionPaymentContract?.functions.setTreasury(t)
  }

  /**
   * @remarks
   * Set company address to SubscriptionDepay Contract which receives company earnings from user charges
   * Limited to Admin
   * @param c - company address
   */
  async setCompany(c: string): Promise<TxResponse> {
    return await this.subscriptionPaymentContract?.functions.setCompany(c)
  }
  /**
    * @remarks
    * Move company earnings from Treasury to company address
    * @param t - token address
    * @param a - amount
    */

   async companyWithdraw(t: string, a: string): Promise<TxResponse> {
    const wei = this.vendor.convertToWei(a, this.tokenPrecision || 18)
    return await this.subscriptionPaymentContract?.functions.companyWithdraw(t, wei)
  }
}
