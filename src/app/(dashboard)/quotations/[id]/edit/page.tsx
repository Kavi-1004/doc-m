"use client";

import { use } from "react";
import QuotationEditor from "@/components/quotations/QuotationEditor";

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <QuotationEditor key={id} quotationId={id} />;
}
