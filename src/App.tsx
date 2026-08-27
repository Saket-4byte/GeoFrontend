import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import AIVerification from "./pages/AIVerification";
import SatelliteAnalysis from "./pages/SatelliteAnalysis";
import ImpactAnalysis from "./pages/ImpactAnalysis";
import FieldEvidence from "./pages/FieldEvidence";
import ReportsAndAlerts from "./pages/ReportsAndAlerts";
import ExportData from "./pages/ExportData";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Watershed Intelligence Pages */}
        <Route
          path="/projects"
          element={<ProjectDetails />}
        />
        <Route
          path="/projects/:id"
          element={<ProjectDetails />}
        />
        <Route
          path="/watersheds"
          element={<ProjectDetails />}
        />

        <Route
          path="/field-evidence"
          element={<FieldEvidence />}
        />

        <Route
          path="/ai-verification"
          element={<AIVerification />}
        />

        <Route
          path="/satellite-analysis"
          element={<SatelliteAnalysis />}
        />

        <Route
          path="/impact-analysis"
          element={<ImpactAnalysis />}
        />
        <Route
          path="/impact-reports"
          element={<ImpactAnalysis />}
        />

        <Route
          path="/reports"
          element={<ReportsAndAlerts />}
        />
        <Route
          path="/alerts"
          element={<ReportsAndAlerts />}
        />

        <Route
          path="/export-data"
          element={<ExportData />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App; 