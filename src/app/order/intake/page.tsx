import { Suspense } from "react";
import IntakeForm from "./IntakeForm";

export const metadata = { title: "Project intake — Web Design Squad" };

export default function IntakePage() {
  return (
    <Suspense>
      <IntakeForm />
    </Suspense>
  );
}
