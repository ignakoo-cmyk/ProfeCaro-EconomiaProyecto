import { redirect } from "next/navigation";

// Redirect /dashboard/student to the correct route /dashboard/estudiante
export default function StudentRedirect() {
  redirect("/dashboard/estudiante");
}
