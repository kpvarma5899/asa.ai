import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DirectoryPage } from "./pages/Directory";
import { DoctorPage } from "./pages/Doctor";
import { EmergencyPage } from "./pages/Emergency";
import { HospitalPage } from "./pages/Hospital";
import { ReviewStore } from "./store";
import { Shell } from "./ui";

export function App() {
  return (
    <ReviewStore>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
        <Shell>
          <Routes>
            <Route path="/" element={<DirectoryPage />} />
            <Route path="/doctors/:id" element={<DoctorPage />} />
            <Route path="/hospitals/:id" element={<HospitalPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </ReviewStore>
  );
}
