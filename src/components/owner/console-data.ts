// Shared, client-only loader for the owner finance console.
// Reading localStorage is only safe after mount, so the console page calls this
// from a memo gated on its "mounted" flag.

import {
  getInvoices,
  getLeaveRequests,
  getPayables,
  getPayroll,
  getShareLinks,
  getStaffRoster,
  getTodayWeekMonth,
  totalDue,
  totalPayroll,
  type Invoice,
  type LeaveRequest,
  type Payable,
  type PayrollRow,
  type ShareLink,
  type StaffMember,
} from "@/lib/finance";
import { getOpenTabs, lowStockProducts, type MemberTab, type Product } from "@/lib/orders";

export type OwnerTab = "overview" | "zreport" | "gst" | "payables" | "payroll" | "invoices" | "share";

export interface ConsoleData {
  todayWeekMonth: ReturnType<typeof getTodayWeekMonth>;
  payables: Payable[];
  payablesDue: number;
  staff: StaffMember[];
  leave: LeaveRequest[];
  payroll: PayrollRow[];
  payrollTotal: number;
  invoices: Invoice[];
  shareLinks: ShareLink[];
  openTabs: MemberTab[];
  lowStock: Product[];
}

export function loadConsoleData(): ConsoleData {
  return {
    todayWeekMonth: getTodayWeekMonth(),
    payables: getPayables(),
    payablesDue: totalDue(),
    staff: getStaffRoster(),
    leave: getLeaveRequests(),
    payroll: getPayroll(),
    payrollTotal: totalPayroll(),
    invoices: getInvoices(),
    shareLinks: getShareLinks(),
    openTabs: getOpenTabs(),
    lowStock: lowStockProducts(),
  };
}
