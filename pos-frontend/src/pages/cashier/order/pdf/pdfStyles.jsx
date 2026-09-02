import { StyleSheet } from "@react-pdf/renderer";

// Create PDF styles for POS Invoices
export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#262422",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#262422",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 5,
  },
  infoGrid: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    color: "#78716c",
    fontWeight: "bold",
  },
  infoValue: {
    color: "#262422",
  },
  totalAmount: {
    color: "#262422",
    fontWeight: "bold",
  },
  statusBadge: {
    backgroundColor: "#262422",
    color: "#ffffff",
    padding: "3px 10px",
    borderRadius: 8,
    fontSize: 9,
    textTransform: "uppercase",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 32,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f5f5f4",
    fontWeight: "bold",
    color: "#262422",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    textAlign: "left",
  },
  tableCellCenter: {
    flex: 1,
    padding: 6,
    textAlign: "center",
  },
  tableCellRight: {
    flex: 1,
    padding: 6,
    textAlign: "right",
  },
  tableCellImage: {
    flex: 0.5,
    padding: 6,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 28,
    height: 28,
    objectFit: "cover",
    borderRadius: 4,
  },
  imagePlaceholder: {
    width: 28,
    height: 28,
    backgroundColor: "#f5f5f4",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#78716c",
  },
  productName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#262422",
    marginBottom: 2,
  },
  productSku: {
    fontSize: 9,
    color: "#78716c",
  },
});
