import { prisma } from "@/lib/prisma";
import {
  FileText,
  Upload,
  Truck,
  Receipt,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

async function getMetrics() {
  const [
    totalQuotations,
    approvedQuotations,
    totalPOs,
    totalDOs,
    totalInvoices,
    paidInvoices,
  ] = await Promise.all([
    prisma.quotation.count(),
    prisma.quotation.count({ where: { status: "APPROVED" } }),
    prisma.purchaseOrder.count(),
    prisma.deliveryOrder.count(),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PAID" } }),
  ]);

  const invoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    select: { grandTotal: true },
  });
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return {
    totalQuotations,
    approvedQuotations,
    totalPOs,
    totalDOs,
    totalInvoices,
    paidInvoices,
    totalRevenue,
  };
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    {
      title: "Total Quotations",
      value: metrics.totalQuotations,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      href: "/quotations",
    },
    {
      title: "Approved Quotations",
      value: metrics.approvedQuotations,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      href: "/quotations",
    },
    {
      title: "PO Received",
      value: metrics.totalPOs,
      icon: Upload,
      color: "bg-purple-50 text-purple-600",
      href: "/purchase-orders",
    },
    {
      title: "DO Generated",
      value: metrics.totalDOs,
      icon: Truck,
      color: "bg-orange-50 text-orange-600",
      href: "/delivery-orders",
    },
    {
      title: "Invoices Issued",
      value: metrics.totalInvoices,
      icon: Receipt,
      color: "bg-indigo-50 text-indigo-600",
      href: "/invoices",
    },
    {
      title: "Paid Invoices",
      value: metrics.paidInvoices,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      href: "/invoices",
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-yellow-50 text-yellow-600",
      href: "/invoices",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your business documents</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/quotations/new"
              className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600 transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium text-gray-700">New Quotation</p>
            </Link>
            <Link
              href="/companies"
              className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-center group"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-purple-600 transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium text-gray-700">Manage Companies</p>
            </Link>
            <Link
              href="/delivery-orders/new"
              className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-center group"
            >
              <Truck className="w-8 h-8 mx-auto mb-2 text-orange-600 transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium text-gray-700">New Delivery Order</p>
            </Link>
            <Link
              href="/invoices/new"
              className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group"
            >
              <Receipt className="w-8 h-8 mx-auto mb-2 text-indigo-600 transition-transform group-hover:scale-110" />
              <p className="text-sm font-medium text-gray-700">New Invoice</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Workflow</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Create Quotation</p>
                <p className="text-sm text-gray-500">Generate and send quotes to customers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Receive PO</p>
                <p className="text-sm text-gray-500">Upload customer purchase orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">Create Delivery Order</p>
                <p className="text-sm text-gray-500">Generate DO from approved quotation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium text-gray-900">Issue Invoice</p>
                <p className="text-sm text-gray-500">Generate invoice and track payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
