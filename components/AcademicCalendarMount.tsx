"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AcademicCalendar from "./AcademicCalendar";

export default function AcademicCalendarMount() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById("calendar"));
  }, []);

  return container ? createPortal(<AcademicCalendar />, container) : null;
}
