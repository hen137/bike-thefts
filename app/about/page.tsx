import { ViewTransition } from "react";
import { NavBar } from "@/components/ui/NavBar";

export default function About() {
  return (
    <div>
      <ViewTransition name="page">
        <NavBar />
        <div>about page</div>
      </ViewTransition>
    </div>
  );
}
