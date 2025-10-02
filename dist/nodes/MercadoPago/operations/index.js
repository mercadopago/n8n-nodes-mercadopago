"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.operations = void 0;
const createPaymentLink_1 = __importDefault(require("./createPaymentLink"));
const listReleaseReports_1 = __importDefault(require("./listReleaseReports"));
const configureReleaseReport_1 = __importDefault(require("./configureReleaseReport"));
const editReleaseReportConfig_1 = __importDefault(require("./editReleaseReportConfig"));
const getReleaseReportConfig_1 = __importDefault(require("./getReleaseReportConfig"));
const downloadReleaseReport_1 = __importDefault(require("./downloadReleaseReport"));
const listSettlementReports_1 = __importDefault(require("./listSettlementReports"));
const downloadSettlementReport_1 = __importDefault(require("./downloadSettlementReport"));
const getSettlementReportConfig_1 = __importDefault(require("./getSettlementReportConfig"));
const configureSettlementReport_1 = __importDefault(require("./configureSettlementReport"));
const editSettlementReport_1 = __importDefault(require("./editSettlementReport"));
/**
 * Registry mapping operation keys (selected in the node UI) to their concrete
 * handler implementation.
 */
exports.operations = {
    createPaymentLink: createPaymentLink_1.default,
    listReleaseReports: listReleaseReports_1.default,
    configureReleaseReport: configureReleaseReport_1.default,
    editReleaseReportConfig: editReleaseReportConfig_1.default,
    getReleaseReportConfig: getReleaseReportConfig_1.default,
    downloadReleaseReport: downloadReleaseReport_1.default,
    listSettlementReports: listSettlementReports_1.default,
    downloadSettlementReport: downloadSettlementReport_1.default,
    getSettlementReportConfig: getSettlementReportConfig_1.default,
    configureSettlementReport: configureSettlementReport_1.default,
    editSettlementReport: editSettlementReport_1.default,
};
//# sourceMappingURL=index.js.map