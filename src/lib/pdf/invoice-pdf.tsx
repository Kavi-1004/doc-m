import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#000" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 },
  logoContainer: { width: 60 },
  logo: { width: 50, height: 50, objectFit: "contain" },
  companyInfo: { flex: 1, alignItems: "center" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  companyDetails: { fontSize: 8, marginTop: 2, textAlign: "center" },
  regNoContainer: { width: 100, alignItems: "flex-end" },
  regNo: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  divider: { borderBottomWidth: 2, borderBottomColor: "#000", marginBottom: 20 },
  infoSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "flex-start" },
  leftInfo: { width: "55%" },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 70, fontFamily: "Helvetica-Bold", fontSize: 9 },
  infoValue: { flex: 1, fontSize: 10, color: "#000", marginBottom: 1 },
  rightInfoBox: { width: "40%", borderWidth: 2, borderColor: "#000" },
  rightInfoHeader: { backgroundColor: "#fff", borderBottomWidth: 2, borderBottomColor: "#000", padding: 4, alignItems: "center" },
  rightInfoHeaderText: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  rightInfoBody: { padding: 6 },
  rightInfoRow: { flexDirection: "row", marginBottom: 3 },
  rightInfoRowLabel: { width: "50%", fontFamily: "Helvetica-Bold", fontSize: 8 },
  rightInfoRowValue: { width: "50%", fontSize: 8 },
  docTitleSection: { alignItems: "center", marginBottom: 15 },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", textDecoration: "underline", textTransform: "uppercase" },
  table: { borderWidth: 1, borderColor: "#000", marginBottom: 10 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", backgroundColor: "#fff" },
  tableHeaderCell: { padding: 4, fontFamily: "Helvetica-Bold", fontSize: 8, textAlign: "center", borderRightWidth: 1, borderRightColor: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", minHeight: 25 },
  tableCell: { padding: 4, fontSize: 8 },
  tableCellCenter: { padding: 4, fontSize: 8, textAlign: "center" },
  tableCellRight: { padding: 4, fontSize: 8, textAlign: "right" },
  colNo: { width: "8%", borderRightWidth: 1, borderRightColor: "#000" },
  colDesc: { width: "42%", borderRightWidth: 1, borderRightColor: "#000", fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  colQty: { width: "12%", borderRightWidth: 1, borderRightColor: "#000" },
  colUnit: { width: "12%", borderRightWidth: 1, borderRightColor: "#000" },
  colPrice: { width: "13%", borderRightWidth: 1, borderRightColor: "#000" },
  colTotal: { width: "13%" },
  totalsContainer: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 20 },
  totalsBox: { width: "40%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 9 },
  discountValue: { fontSize: 9, color: "#dc2626" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 2, borderTopColor: "#000", marginTop: 2 },
  grandTotalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  grandTotalValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  paymentSection: { borderWidth: 1, borderColor: "#000", padding: 10, backgroundColor: "#f9fafb", marginBottom: 20 },
  paymentTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 6 },
  paymentGrid: { flexDirection: "row", flexWrap: "wrap" },
  paymentItem: { width: "50%", flexDirection: "row", marginBottom: 4 },
  paymentLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 60 },
  paymentValue: { fontSize: 8, flex: 1 },
  notesSection: { marginBottom: 30 },
  notesText: { fontSize: 8 },
  signatureSection: { flexDirection: "row", justifyContent: "flex-end", marginTop: 30, marginBottom: 40 },
  signatureBox: { width: "50%", alignItems: "center" },
  signatureLine: { width: "100%", borderTopWidth: 1, borderTopColor: "#000", borderTopStyle: "dashed", marginBottom: 4 },
  signatureText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  signatureCompany: { fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  computerGenerated: { textAlign: "center", fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 },
  footer: { borderTopWidth: 1, borderTopColor: "#000", paddingTop: 10, alignItems: "center" },
  footerText: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Company {
  name: string;
  shortCode?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  taxId?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankBranch?: string | null;
  swiftCode?: string | null;
}

interface Customer {
  name: string;
  contactPerson?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface InvoicePDFData {
  invoiceNumber: string;
  date: string;
  dueDate?: string | null;
  company: Company;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  quotationNumber?: string | null;
  doNumber?: string | null;
  footer?: string | null;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  // Use a fallback logic similar to the preview
  // In react-pdf, we can't easily resolve absolute URLs if they're dynamic without a full path,
  // but if the logoUrl is an absolute http URL, it works. If it's a relative public path like "/logo.jpeg",
  // next.js backend might need the absolute URL. We assume `data.company.logoUrl` is fully qualified
  // or that react-pdf handles the relative path correctly depending on the setup.
  const logoSrc = data.company.logoUrl || "http://localhost:3000/logo.jpeg";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {/* The user's system originally used a relative path, but for server side PDF it's tricky.
                We'll try the absolute local URL for dev or just rely on what was working before. */}
            <Image src="http://localhost:3000/logo.jpeg" style={styles.logo} />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            {data.company.address && <Text style={styles.companyDetails}>{data.company.address}</Text>}
            <Text style={styles.companyDetails}>
              {data.company.email || "email"} | {data.company.shortCode ? `${data.company.shortCode}.com` : "website"}
            </Text>
          </View>
          <View style={styles.regNoContainer}>
            <Text style={styles.regNo}>REG NO: {data.company.taxId || "202102151N"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* To & Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.leftInfo}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.infoLabel}>BILL TO:</Text>
              <View style={{ flex: 1 }}>
                {data.customer.contactPerson && <Text style={styles.infoValue}>{data.customer.contactPerson}</Text>}
                {data.customer.name && <Text style={styles.infoValue}>{data.customer.name}</Text>}
                {data.customer.address && <Text style={styles.infoValue}>{data.customer.address}</Text>}
              </View>
            </View>
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <Text style={styles.infoLabel}>ATTN:</Text>
              <View style={{ flex: 1 }}>
                {data.customer.contactPerson && <Text style={styles.infoValue}>{data.customer.contactPerson}</Text>}
                {data.customer.email && <Text style={styles.infoValue}>{data.customer.email}</Text>}
                {data.customer.phone && <Text style={styles.infoValue}>{data.customer.phone}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.rightInfoBox}>
            <View style={styles.rightInfoHeader}>
              <Text style={styles.rightInfoHeaderText}>Invoice</Text>
            </View>
            <View style={styles.rightInfoBody}>
              <View style={styles.rightInfoRow}>
                <Text style={styles.rightInfoRowLabel}>INVOICE NO:</Text>
                <Text style={styles.rightInfoRowValue}>{data.invoiceNumber}</Text>
              </View>
              <View style={styles.rightInfoRow}>
                <Text style={styles.rightInfoRowLabel}>DATE:</Text>
                <Text style={styles.rightInfoRowValue}>{data.date}</Text>
              </View>
              {data.dueDate && (
                <View style={styles.rightInfoRow}>
                  <Text style={styles.rightInfoRowLabel}>DUE DATE:</Text>
                  <Text style={styles.rightInfoRowValue}>{data.dueDate}</Text>
                </View>
              )}
              {data.quotationNumber && (
                <View style={styles.rightInfoRow}>
                  <Text style={styles.rightInfoRowLabel}>QUOTE REF:</Text>
                  <Text style={styles.rightInfoRowValue}>{data.quotationNumber}</Text>
                </View>
              )}
              {data.doNumber && (
                <View style={styles.rightInfoRow}>
                  <Text style={styles.rightInfoRowLabel}>DO REF:</Text>
                  <Text style={styles.rightInfoRowValue}>{data.doNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Document Title */}
        <View style={styles.docTitleSection}>
          <Text style={styles.docTitle}>INVOICE</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>UNIT</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>U. PRICE</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal, { borderRightWidth: 0 }]}>TOTAL</Text>
          </View>
          {data.items.map((item, i) => {
            const isLast = i === data.items.length - 1;
            return (
              <View key={i} style={[styles.tableRow, isLast ? { borderBottomWidth: 0 } : {}]}>
                <Text style={[styles.tableCellCenter, styles.colNo]}>{i + 1}</Text>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description || "-"}</Text>
                <Text style={[styles.tableCellCenter, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCellCenter, styles.colUnit]}>{item.unit}</Text>
                <Text style={[styles.tableCellRight, styles.colPrice]}>{fmt(item.unitPrice)}</Text>
                <Text style={[styles.tableCellRight, styles.colTotal]}>{fmt(item.total)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SUBTOTAL</Text>
              <Text style={styles.totalValue}>{fmt(data.subtotal)}</Text>
            </View>
            {data.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>DISCOUNT</Text>
                <Text style={styles.discountValue}>-{fmt(data.discount)}</Text>
              </View>
            )}
            {data.taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TAX ({data.taxRate}%)</Text>
                <Text style={styles.totalValue}>{fmt(data.taxAmount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>{fmt(data.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        {(data.company.bankName || data.company.bankAccount) && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Details</Text>
            <View style={styles.paymentGrid}>
              {data.company.bankName && (
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Bank Name:</Text>
                  <Text style={styles.paymentValue}>{data.company.bankName}</Text>
                </View>
              )}
              {data.company.bankAccount && (
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Account No:</Text>
                  <Text style={styles.paymentValue}>{data.company.bankAccount}</Text>
                </View>
              )}
              {data.company.bankBranch && (
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Branch:</Text>
                  <Text style={styles.paymentValue}>{data.company.bankBranch}</Text>
                </View>
              )}
              {data.company.swiftCode && (
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Swift Code:</Text>
                  <Text style={styles.paymentValue}>{data.company.swiftCode}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer Notes */}
        {data.footer && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText}>{data.footer}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorised Signature</Text>
            <Text style={styles.signatureCompany}>(FOR {data.company.name || "COMPANY"})</Text>
          </View>
        </View>

        <Text style={styles.computerGenerated}>This is a computer generated copy. No signature required.</Text>

        {/* Page Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.company.name || "company name"} || {data.company.shortCode ? `${data.company.shortCode}.com` : "website"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
