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
  table: { borderWidth: 1, borderColor: "#000", marginBottom: 15 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", backgroundColor: "#fff" },
  tableHeaderCell: { padding: 4, fontSize: 9, fontFamily: "Helvetica-Bold", borderRightWidth: 1, borderRightColor: "#000", textAlign: "center", color: "#000" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", minHeight: 30 },
  tableCell: { padding: 4, fontSize: 9, borderRightWidth: 1, borderRightColor: "#000", color: "#000" },
  
  // Column Widths
  colNo: { width: "10%" },
  colDesc: { width: "60%" },
  colQty: { width: "15%", textAlign: "center" },
  colUnit: { width: "15%", textAlign: "center", borderRightWidth: 0 },

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

interface DOItem {
  description: string;
  quantity: number;
  unit: string;
}

interface Company {
  name: string;
  shortCode?: string | null;
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

interface DeliveryOrderPDFData {
  doNumber: string;
  deliveryDate?: string | null;
  company: Company;
  customer: Customer;
  items: DOItem[];
  quotationNumber?: string | null;
  quotationTitle?: string | null;
  poNumber?: string | null;
  footer?: string | null;
}

export function DeliveryOrderPDF({ data }: { data: DeliveryOrderPDFData }) {
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
              <Text style={[styles.label, { width: 60 }]}>DELIVER TO:</Text>
              <View>
                {data.customer.contactPerson && <Text style={styles.addressText}>{data.customer.contactPerson}</Text>}
                {data.customer.name && <Text style={styles.addressText}>{data.customer.name}</Text>}
                {data.customer.address && <Text style={styles.addressText}>{data.customer.address}</Text>}
              </View>
            </View>
            
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <Text style={[styles.label, { width: 60 }]}>ATTN:</Text>
              <View>
                {data.customer.contactPerson && <Text style={styles.addressText}>{data.customer.contactPerson}</Text>}
                {data.customer.email && <Text style={styles.addressText}>{data.customer.email}</Text>}
                {data.customer.phone && <Text style={styles.addressText}>{data.customer.phone}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Text style={styles.infoBoxTitle}>Delivery Order</Text>
            </View>
            <View style={styles.infoBoxContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DO NO:</Text>
                <Text style={styles.infoValue}>{data.doNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>DATE:</Text>
                <Text style={styles.infoValue}>{data.deliveryDate || "-"}</Text>
              </View>
              {data.quotationNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>QUOTATION REF:</Text>
                  <Text style={styles.infoValue}>{data.quotationNumber}</Text>
                </View>
              )}
              {data.poNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>PO REF:</Text>
                  <Text style={styles.infoValue}>{data.poNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Document Title */}
        <View style={styles.docTitleSection}>
          <Text style={styles.docTitle}>DELIVERY ORDER</Text>
          {data.quotationTitle && (
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 2 }}>
              ({data.quotationTitle})
            </Text>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>UNIT</Text>
          </View>
          
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo, { textAlign: "center" }]}>{i + 1}</Text>
              <View style={[styles.tableCell, styles.colDesc]}>
                <Text style={{ fontFamily: "Helvetica-Bold", textTransform: "uppercase" }}>
                  {item.description || "-"}
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
            </View>
          ))}
        </View>

        {data.footer && (
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 9 }}>{data.footer}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>RECEIVED BY:</Text>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>NAME/SIGNATURE/STAMP</Text>
            </View>
          </View>

          <View style={{ width: "45%", minHeight: 100 }}>
            <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 10 }}>
              <View style={styles.authSignatureLine} />
              <Text style={styles.authSignatureLabel}>Authorised Signature</Text>
              <Text style={styles.authSignatureCompany}>(FOR {data.company.name})</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#666" }}>
            This is a computer generated copy. No signature required.
          </Text>
        </View>

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
