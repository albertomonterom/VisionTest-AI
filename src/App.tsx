import { Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Calibration from "./pages/Calibration";
import Test from "./pages/Test";
import LifestyleQuestionnaire from "./pages/LifestyleQuestionnaire";
//import AIPrediction from "./pages/AIPrediction";
//import FinalResults from "./pages/FinalResults";
//import End from "./pages/End";
//import NotFound from "./pages/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/welcome" element={<Welcome />} />
    <Route path="/calibration" element={<Calibration />} />
    <Route path="/test" element={<Test />} />
    <Route path="/lifestyle-questionnaire" element={<LifestyleQuestionnaire />} />
    {/* <Route path="/ai-prediction" element={<AIPrediction />} /> */}
    {/* <Route path="/final-results" element={<FinalResults />} />
    {/* <Route path="/end" element={<End />} /> */}
    {/* <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default App;