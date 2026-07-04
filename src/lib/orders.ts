import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Tier } from "@/lib/offer";

export type OrderStatus =
  | "order_placed"
  | "intake_submitted"
  | "in_progress"
  | "draft_submitted"
  | "revision_requested"
  | "approved"
  | "delivered";

export type Order = {
  id: string;
  clientUid: string;
  clientEmail: string;
  tier: Tier;
  price: number;
  status: OrderStatus;
  termsAcceptedAt: Timestamp | null;
  termsVersion: string;
  intakeFormData: Record<string, string> | null;
  draftUrl: string | null;
  revisionUsed: boolean;
  revisionNotes: string | null;
  maintenanceRequested: boolean;
  approvedAt: Timestamp | null;
  deliveredAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

// Visual tracker steps. "revision_requested" doesn't get its own column -
// it's shown as a variant of the "draft_submitted" step (see getStepIndex).
export const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "order_placed", label: "Order placed" },
  { status: "intake_submitted", label: "Intake submitted" },
  { status: "in_progress", label: "In progress" },
  { status: "draft_submitted", label: "Draft submitted" },
  { status: "approved", label: "Approved" },
  { status: "delivered", label: "Delivered" },
];

export function getStepIndex(status: OrderStatus): number {
  if (status === "revision_requested") {
    return STATUS_STEPS.findIndex((s) => s.status === "draft_submitted");
  }
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

export async function createOrder(params: {
  clientUid: string;
  clientEmail: string;
  tier: Tier;
  price: number;
  termsAcceptedAt: string | null;
  termsVersion: string;
  maintenanceRequested: boolean;
}): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, "orders"), {
    clientUid: params.clientUid,
    clientEmail: params.clientEmail,
    tier: params.tier,
    price: params.price,
    status: "order_placed" satisfies OrderStatus,
    termsAcceptedAt: params.termsAcceptedAt,
    termsVersion: params.termsVersion,
    intakeFormData: null,
    draftUrl: null,
    revisionUsed: false,
    revisionNotes: null,
    maintenanceRequested: params.maintenanceRequested,
    approvedAt: null,
    deliveredAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function submitIntake(
  orderId: string,
  intakeFormData: Record<string, string>
) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "orders", orderId), {
    status: "intake_submitted" satisfies OrderStatus,
    intakeFormData,
    updatedAt: serverTimestamp(),
  });
}

export async function approveOrder(orderId: string) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "orders", orderId), {
    status: "approved" satisfies OrderStatus,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function requestRevision(orderId: string, revisionNotes: string) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "orders", orderId), {
    status: "revision_requested" satisfies OrderStatus,
    revisionUsed: true,
    revisionNotes,
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrderByStaff(
  orderId: string,
  fields: Partial<
    Pick<Order, "status" | "draftUrl" | "revisionUsed" | "deliveredAt">
  >
) {
  const db = getFirebaseDb();
  const payload: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };
  if (fields.status === "delivered") {
    payload.deliveredAt = serverTimestamp();
  }
  await updateDoc(doc(db, "orders", orderId), payload);
}
