import { Suspense } from "react";
import OrderForm from "./OrderForm";

export const metadata = {
  title: "Order — Web Design Squad",
};

export default function OrderPage() {
  return (
    <Suspense>
      <OrderForm />
    </Suspense>
  );
}
