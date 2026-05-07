import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: "Helvetica", color: "#000" },
  
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 },
  logoContainer: { width: 80 },
  logo: { width: 60, height: 60 },
  companyHeader: { flex: 1, alignItems: "center", justifyContent: "center" },
  companyNameHeader: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#000" },
  companyDetailHeader: { fontSize: 10, color: "#000", marginTop: 2 },
  regNoContainer: { width: 120, alignItems: "flex-end" },
  regNoText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#000" },
  
  headerLine: { borderBottomWidth: 1.5, borderBottomColor: "#000", marginBottom: 15 },

  // To & Info Section
  topSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  addressSection: { width: "55%" },
  label: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 2, color: "#000" },
  addressBox: { marginLeft: 40, marginBottom: 15 },
  addressText: { fontSize: 10, color: "#000", marginBottom: 1 },
  
  infoBox: { width: "40%", borderWidth: 1.5, borderColor: "#000" },
  infoBoxHeader: { borderBottomWidth: 1.5, borderBottomColor: "#000", padding: 4, alignItems: "center" },
  infoBoxTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#000" },
  infoBoxContent: { padding: 4 },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { width: "40%", fontSize: 8, fontFamily: "Helvetica-Bold", color: "#000" },
  infoValue: { width: "60%", fontSize: 8, color: "#000" },

  // Document Title
  docTitleSection: { alignItems: "center", marginBottom: 20 },
  docTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", textTransform: "uppercase", textDecoration: "underline", color: "#000" },

  // Table
  table: { borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", backgroundColor: "#fff" },
  tableHeaderCell: { padding: 4, fontSize: 9, fontFamily: "Helvetica-Bold", borderRightWidth: 1, borderRightColor: "#000", textAlign: "center", color: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", minHeight: 30 },
  tableCell: { padding: 4, fontSize: 9, borderRightWidth: 1, borderRightColor: "#000", color: "#000" },
  
  // Column Widths
  colNo: { width: "8%" },
  colMerged: { width: "57%" },
  colPrice: { width: "12%", textAlign: "right" },
  colQty: { width: "8%", textAlign: "center" },
  colTotal: { width: "15%", textAlign: "right", borderRightWidth: 0 },

  // Table Footer
  tableFooter: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" },
  tableFooterLabel: { width: "85%", padding: 4, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", borderRightWidth: 1, borderRightColor: "#000", color: "#000" },
  tableFooterValue: { width: "15%", padding: 4, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right", color: "#000" },

  // Notes
  notesSection: { borderBottomWidth: 1, borderBottomColor: "#000", padding: 4 },
  noteText: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#000" },

  // Signatures
  signatureSection: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signatureBox: { width: "45%", borderWidth: 1.5, borderColor: "#000", padding: 10, minHeight: 100 },
  signatureTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 40, textAlign: "center", color: "#000" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", borderTopStyle: "dashed", marginTop: 5, alignItems: "center" },
  signatureName: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 4, color: "#000" },
  
  authSignatureBox: { width: "45%", padding: 10, alignItems: "center", justifyContent: "flex-end" },
  authSignatureLine: { borderTopWidth: 1, borderTopColor: "#000", borderTopStyle: "dashed", width: "100%", marginBottom: 5 },
  authSignatureLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#000" },
  authSignatureCompany: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#000" },

  // Footer
  pageFooter: { position: "absolute", bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 10, alignItems: "center" },
  pageFooterText: { fontSize: 10, color: "#000" },
});

interface QuotationItem {
  description: string;
  details?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Company {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  taxId?: string | null;
}

interface Customer {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface QuotationPDFData {
  quotationNumber: string;
  title?: string | null;
  date: string;
  company: Company;
  customer: Customer;
  items: QuotationItem[];
  currency?: string | null;
  isComputerGenerated?: boolean;
  validity?: string | null;
  salesPerson?: string | null;
  salesPhone?: string | null;
  salesEmail?: string | null;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  terms?: string | null;
  warranty?: string | null;
  footer?: string | null;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuotationPDF({ data, hidePrices }: { data: QuotationPDFData, hidePrices?: boolean }) {
  // Use company specific logo or default
  const logoPath = data.company.logoUrl || "public/logo.jpeg";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoPath} style={styles.logo} />
          </View>
          <View style={styles.companyHeader}>
            <Text style={styles.companyNameHeader}>{data.company.name}</Text>
            {data.company.address && <Text style={styles.companyDetailHeader}>{data.company.address}</Text>}
            <Text style={styles.companyDetailHeader}>
              {data.company.email || "company mail"} | {data.company.website || "website"}
            </Text>
          </View>
          <View style={styles.regNoContainer}>
            <Text style={styles.regNoText}>REG NO: {data.company.taxId || "202102151N"}</Text>
          </View>
        </View>
        
        <View style={styles.headerLine} />

        {/* To & Info Section */}
        <View style={styles.topSection}>
          <View style={styles.addressSection}>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.label, { width: 40 }]}>TO:</Text>
              <View>
                {data.customer.contactPerson && <Text style={styles.addressText}>{data.customer.contactPerson}</Text>}
                {data.customer.name && <Text style={styles.addressText}>{data.customer.name}</Text>}
                {data.customer.address && <Text style={styles.addressText}>{data.customer.address}</Text>}
              </View>
            </View>
            
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <Text style={[styles.label, { width: 40 }]}>ATTN:</Text>
              <View>
                {data.customer.contactPerson && <Text style={styles.addressText}>{data.customer.contactPerson}</Text>}
                {data.customer.email && <Text style={styles.addressText}>{data.customer.email}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Text style={styles.infoBoxTitle}>Quotation</Text>
            </View>
            <View style={styles.infoBoxContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>QUOTATION NO:</Text>
                <Text style={styles.infoValue}>{data.quotationNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DATE:</Text>
                <Text style={styles.infoValue}>{data.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>VALIDITY:</Text>
                <Text style={styles.infoValue}>{data.validity || "30 DAYS"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SALES:</Text>
                <Text style={styles.infoValue}>{data.salesPerson || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TEL:</Text>
                <Text style={styles.infoValue}>{data.salesPhone || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMAIL:</Text>
                <Text style={styles.infoValue}>{data.salesEmail || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Title */}
        {data.title ? (
          <View style={styles.docTitleSection}>
            <Text style={styles.docTitle}>QUOTATION FOR {data.title}</Text>
          </View>
        ) : null}

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
            <Text style={[styles.tableHeaderCell, hidePrices ? { width: "84%" } : styles.colMerged]}>ITEM/COMPONENTS</Text>
            {!hidePrices && <Text style={[styles.tableHeaderCell, styles.colPrice]}>UNIT PRICE</Text>}
            <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
            {!hidePrices && <Text style={[styles.tableHeaderCell, styles.colTotal]}>SUB TOTAL</Text>}
          </View>
          
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo, { textAlign: "center" }]}>{i + 1}</Text>
              <View style={[styles.tableCell, hidePrices ? { width: "84%" } : styles.colMerged]}>
                <Text style={{ fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 2 }}>
                  {item.description}
                </Text>
                {item.details && (
                  <View style={{ marginTop: 2 }}>
                    {item.details.split('\n').map((line, idx) => (
                      <View key={idx} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 10 }}>
                        <Text style={{ width: 8, fontSize: 8 }}>•</Text>
                        <Text style={{ flex: 1, fontSize: 9 }}>{line}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              {!hidePrices && <Text style={[styles.tableCell, styles.colPrice]}>{fmt(item.unitPrice)}</Text>}
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity} {item.unit}</Text>
              {!hidePrices && <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total)}</Text>}
            </View>
          ))}
          
          {!hidePrices && (data.discount > 0 || data.taxRate > 0) && (
            <>
              <View style={styles.tableFooter}>
                <Text style={styles.tableFooterLabel}>SUBTOTAL</Text>
                <Text style={styles.tableFooterValue}>{fmt(data.subtotal)}</Text>
              </View>
              {data.discount > 0 && (
                <View style={styles.tableFooter}>
                  <Text style={[styles.tableFooterLabel, { color: "#d00" }]}>LESS: DISCOUNT</Text>
                  <Text style={[styles.tableFooterValue, { color: "#d00" }]}>({fmt(data.discount)})</Text>
                </View>
              )}
              {data.taxRate > 0 && (
                <View style={styles.tableFooter}>
                  <Text style={styles.tableFooterLabel}>TAX ({data.taxRate}%)</Text>
                  <Text style={styles.tableFooterValue}>{fmt(data.taxAmount)}</Text>
                </View>
              )}
            </>
          )}
          
          {!hidePrices && (
            <View style={[styles.tableFooter, { backgroundColor: "#f9f9f9" }]}>
              <Text style={styles.tableFooterLabel}>GRAND TOTAL ({data.currency || "LKR"})</Text>
              <Text style={styles.tableFooterValue}>{fmt(data.grandTotal)}</Text>
            </View>
          )}
        </View>

        {/* Notes section */}
        {(data.terms || data.warranty || data.footer) && (
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            {data.terms && (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", textDecoration: "underline", marginBottom: 2 }}>Terms & Conditions:</Text>
                <Text style={{ fontSize: 9 }}>{data.terms}</Text>
              </View>
            )}
            {data.warranty && (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", textDecoration: "underline", marginBottom: 2 }}>Warranty:</Text>
                <Text style={{ fontSize: 9 }}>{data.warranty}</Text>
              </View>
            )}
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          {/* Left: Always show acceptance box */}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>QUOTATION ACCEPTED BY:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>NAME/SIGNATURE</Text>
            </View>
          </View>

          {/* Right: Toggle between signature box and computer notice */}
          <View style={{ width: "45%", minHeight: 100 }}>
            {data.isComputerGenerated ? (
              <View style={{ flex: 1, borderWidth: 1.5, borderColor: "#000", borderStyle: "dashed", alignItems: "center", justifyContent: "center", padding: 5 }}>
                <Text style={{ fontSize: 9, fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}>
                  This is a computer generated copy.{"\n"}No signature required.
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 10 }}>
                <View style={styles.authSignatureLine} />
                <Text style={styles.authSignatureLabel}>Authorised Signature</Text>
                <Text style={styles.authSignatureCompany}>(FOR {data.company.name})</Text>
              </View>
            )}
          </View>
        </View>

        {data.footer && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", fontStyle: "italic" }}>{data.footer}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>
            {data.company.name} || {data.company.website || "website"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
