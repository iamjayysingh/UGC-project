import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SoftBackdrop from "./components/SoftBackdrop";
import Footer from "./components/Footer";
import LenisScroll from "./components/lenis";
import { Route, Routes } from "react-router-dom";
import Results from "./pages/Results";
import Plans from "./pages/Plans";
import MyGenerations from "./pages/MyGenerations";
import Loading from "./pages/Loading";
import Community from "./pages/Community";
import Generate from "./pages/Generate";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        toastOptions={{ style: { background: "#333", color: "white" } }}
      />
      <SoftBackdrop />
      <LenisScroll />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/community" element={<Community />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/my-generations" element={<MyGenerations />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/result/:projectId" element={<Results />} />
      </Routes>

      <Footer />
    </>
  );
}
export default App;
