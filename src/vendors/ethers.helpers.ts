import { BigNumber } from 'ethers'

/**
   * @remarks
   * Convert any number to big number.
   *
   * @param string - string of the required big number

   *
   * @returns BigNumber
   */
export const convertToBN = (amount: string): any => {
  return BigNumber.from(amount)
}
/**
 * @remarks
 * Get 10**18 multiplied number for values in wei.
 *
 * @param string - string of the required non-wei amount

 *
 * @returns BigNumber
 */
export const convertToWei = (amount: string) => {
  return BigNumber.from(amount).mul(BigNumber.from(`10`).pow(18))
}

/**
 * @remarks
 * Convert wei value(10**18) to eth value
 *
 * @param string - value in eth.

 *
 * @returns Array<BigNumber>
 */
export const convertWeiToEth = (wei: BigNumber) => {
  const eth = wei.div(BigNumber.from(10).pow(18))
  return eth
}
