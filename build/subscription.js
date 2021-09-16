"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deployed_1 = __importDefault(require("./abstracts/deployed"));
const constants_1 = require("./constants");
const errors_1 = require("./errors");
class default_1 extends deployed_1.default {
    constructor(vendor) {
        super(vendor, constants_1.PAYMENT_ABI, constants_1.ERC20_ABI, constants_1.SUBSCRIPTION_PAYMENT_ABI, constants_1.SUBSCRIPTION_DATA_ABI);
    }
    updateUnderlyingToken(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateUnderlyingToken(a));
        });
    }
    updateEscrow(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateEscrow(a));
        });
    }
    updateFeederAddress(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateFeederAddress(a));
        });
    }
    updateStakedToken(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateStakedToken(a));
        });
    }
    updateToken(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateUnderlyingToken(a));
        });
    }
    updateDiscountSlabs(d, p) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const discountSlabs = this.vendor.convertStringArrayToBigNumberArray(d);
            const percents = this.vendor.convertStringArrayToBigNumberArray(p);
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateDiscountSlabs(discountSlabs, percents));
        });
    }
    enableDiscounts(h) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.enableDiscounts(h));
        });
    }
    disableDiscounts() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.disableDiscounts());
        });
    }
    setGovernanceAddress(h) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.setGovernanceAddress(h));
        });
    }
    setDataContract(h) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionPaymentContract) === null || _a === void 0 ? void 0 : _a.functions.updateDataContract(h));
        });
    }
    setManagers(h) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.setManagers(h));
        });
    }
    setNewApprovals(a) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const wei = this.vendor.convertToWei(a);
            return yield ((_a = this.erc20Contract) === null || _a === void 0 ? void 0 : _a.functions.approve((_b = this.subscriptionPaymentContract) === null || _b === void 0 ? void 0 : _b.address, wei));
        });
    }
    gasslessApproval(a, c) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.vendor.biconomy)
                throw new Error(errors_1.INVALID_BICONOMY_KEY);
            const wei = this.vendor.convertToWei(a);
            const abiEncodedApprove = this.vendor.abiEncodeErc20Functions('approve', [
                (_a = this.subscriptionPaymentContract) === null || _a === void 0 ? void 0 : _a.address,
                wei,
            ]);
            const userAddress = yield this.vendor.signer.getAddress();
            const nonce = yield this.getNonceForGaslessERC20(userAddress);
            const signedMessage = yield this.vendor.signedMessageForTx(userAddress, nonce, abiEncodedApprove, this.erc20Contract.address, c);
            const rsv = this.vendor.getSignatureParameters(signedMessage);
            return yield this.sendRawBiconomyERC20Transaction(userAddress, abiEncodedApprove, rsv);
        });
    }
    sendRawBiconomyERC20Transaction(u, f, rsv) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.vendor.biconomy.status === this.vendor.biconomy.READY) {
                const tx = yield ((_a = this.biconomyERC20Contract) === null || _a === void 0 ? void 0 : _a.functions.executeMetaTransaction(u, f, rsv.r, rsv.s, rsv.v));
                return tx;
            }
            else {
                return new Promise((resolve, reject) => {
                    this.vendor.biconomy
                        .onEvent(this.vendor.biconomy.READY, () => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const tx = yield ((_a = this.biconomyERC20Contract) === null || _a === void 0 ? void 0 : _a.functions.executeMetaTransaction(u, f, rsv.r, rsv.s, rsv.v));
                        resolve(tx);
                    }))
                        .onEvent(this.vendor.biconomy.ERROR, (error) => {
                        console.log(error);
                        reject(error);
                    });
                });
            }
        });
    }
    getApprovalAmount(a) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const wei = yield ((_a = this.erc20Contract) === null || _a === void 0 ? void 0 : _a.functions.allowance(a, (_b = this.subscriptionPaymentContract) === null || _b === void 0 ? void 0 : _b.address));
            return this.vendor.convertWeiToEth(wei);
        });
    }
    getNonceForGaslessERC20(u) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const nonce = (yield ((_a = this.erc20Contract) === null || _a === void 0 ? void 0 : _a.functions.getNonce(u)))[0].toNumber();
            return nonce;
        });
    }
    getUserBalance(a) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const wei = yield ((_a = this.erc20Contract) === null || _a === void 0 ? void 0 : _a.functions.balanceOf(a));
            return this.vendor.convertWeiToEth(wei);
        });
    }
    getManagers() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.getManagers());
        });
    }
    getGovernanceAddress() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.governanceAddress());
        });
    }
    getToken() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.underlying());
        });
    }
    getEscrow() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.escrow());
        });
    }
    checkIfDiscountsEnabled() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.discountsEnabled());
        });
    }
    getStakingManagerAddress() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.stakingManager());
        });
    }
    getStakedTokenAddress() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.stakedToken());
        });
    }
    getDiscountSlabs() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const slabs = yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.discountSlabs());
            return this.vendor.parseDiscountSlabs(slabs);
        });
    }
    getDataContract() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const slabs = yield ((_a = this.subscriptionPaymentContract) === null || _a === void 0 ? void 0 : _a.functions.subscriptionData());
            return this.vendor.parseDiscountSlabs(slabs);
        });
    }
    chargeUser(u, d) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const paramArray = [];
            const paramValue = [];
            for (let i = 0; i < d.length; i++) {
                paramArray.push(d[i].param);
                paramValue.push(this.vendor.convertToBN(d[i].value.toString()));
            }
            return yield ((_a = this.subscriptionPaymentContract) === null || _a === void 0 ? void 0 : _a.functions.chargeUser(u, paramArray, paramValue));
        });
    }
    upadteParams(p) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const paramArray = [];
            const paramValue = [];
            for (let i = 0; i < p.length; i++) {
                paramArray.push(p[i].param);
                paramValue.push(this.vendor.convertToBN(p[i].value.toString()));
            }
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.updateParams(paramArray, paramValue));
        });
    }
    deleteParams(d) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = this.subscriptionDataContract) === null || _a === void 0 ? void 0 : _a.functions.deleteParams(d));
        });
    }
}
exports.default = default_1;
